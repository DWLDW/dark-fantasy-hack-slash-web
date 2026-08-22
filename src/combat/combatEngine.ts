import { Monster, Skill, GameItem } from '../types/game';

export interface CombatHitResult {
  monsterId: string;
  damage: number;
  isFatal: boolean;
  depth: number;
  lane: number;
}

export interface AttackResolution {
  targetsHit: CombatHitResult[];
  kills: string[]; // Monster IDs killed in sequential order
  chainCount: number; // Kills strictly from this 1 action
  stopperId: string | null; // Monster that stopped the overkill chain
  totalDamage: number;
  isCritical: boolean;
  newMonsters: Monster[]; // Monster states after damage (HP=0 for dead)
}

/**
 * GDD Section 14: Defense & Damage Multiplier Formula
 * K = 100 + attackerLevel * 10
 * Multiplier = K / (K + targetDefense)
 */
export function calculateDamageMultiplier(attackerLevel: number, targetDefense: number): number {
  const K = 100 + attackerLevel * 10;
  return K / (K + Math.max(0, targetDefense));
}

/**
 * GDD Section 13 & 14: Pure deterministic attack resolution engine
 * Used identically for BOTH real-time Preview and actual Attack Execution.
 */
export function resolveAttack(
  attackerLevel: number,
  totalStats: {
    minDmg: number;
    maxDmg: number;
    critChance: number;
    critDamage: number;
    overkillEfficiency: number;
  },
  skill: Skill,
  playerLane: number,
  monsters: Monster[],
  forceDeterministic = false // True for preview (use avg), False for real action roll
): AttackResolution {
  if (monsters.length === 0) {
    return {
      targetsHit: [],
      kills: [],
      chainCount: 0,
      stopperId: null,
      totalDamage: 0,
      isCritical: false,
      newMonsters: []
    };
  }

  // 1. Roll or Compute Base Raw Damage & Critical
  let isCritical = false;
  let baseDamage = Math.floor((totalStats.minDmg + totalStats.maxDmg) / 2);

  if (!forceDeterministic) {
    isCritical = Math.random() * 100 < totalStats.critChance;
    baseDamage = Math.floor(Math.random() * (totalStats.maxDmg - totalStats.minDmg + 1)) + totalStats.minDmg;
  }

  // Skill Rune Modifiers
  let runeDmgBonus = 1.0;
  let runeOverkillBonus = 1.0;
  let armorPenetration = 0;

  if (skill.activeRuneId === 'rune_fire') {
    runeDmgBonus = 1.25;
    runeOverkillBonus = 1.30;
  } else if (skill.activeRuneId === 'rune_frost') {
    runeDmgBonus = 1.20;
    runeOverkillBonus = 1.45;
  } else if (skill.activeRuneId === 'rune_lightning') {
    runeDmgBonus = 1.35;
    runeOverkillBonus = 1.20;
  } else if (skill.activeRuneId === 'rune_poison') {
    runeDmgBonus = 1.20;
    runeOverkillBonus = 1.25;
    armorPenetration = 0.35; // Ignores 35% defense
  } else if (skill.activeRuneId === 'rune_void') {
    runeDmgBonus = 1.30;
    runeOverkillBonus = 1.25;
  }

  const critMultiplier = isCritical ? totalStats.critDamage / 100 : 1.0;
  const initialRawPayload = Math.floor(baseDamage * skill.damageMultiplier * runeDmgBonus * critMultiplier);

  const targetsHit: CombatHitResult[] = [];
  const kills: string[] = [];
  let stopperId: string | null = null;
  let accumulatedDamage = 0;

  // Clone monsters for damage processing
  const monsterMap = new Map<string, Monster>(monsters.map(m => [m.id, { ...m }]));

  // Effective overkill efficiency (Base skill * Character bonus * Rune bonus)
  const effectiveOverkillEff = skill.overkillEfficiency * (totalStats.overkillEfficiency / 100) * runeOverkillBonus;

  // 2. Process Routes
  if (skill.route === 'line') {
    // Penetrates forward to back in playerLane
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    let currentPayload = initialRawPayload;

    for (const m of laneMonsters) {
      const defMultiplier = calculateDamageMultiplier(attackerLevel, m.defense);
      const actualDmgToTarget = Math.floor(currentPayload * defMultiplier);
      const isFatal = actualDmgToTarget >= m.hp;

      targetsHit.push({
        monsterId: m.id,
        damage: actualDmgToTarget,
        isFatal,
        depth: m.depth,
        lane: m.lane
      });

      accumulatedDamage += actualDmgToTarget;

      if (isFatal) {
        kills.push(m.id);
        const updatedM = monsterMap.get(m.id)!;
        updatedM.hp = 0;

        // Raw overkill budget remaining
        const rawOverkill = Math.max(0, currentPayload - Math.floor(m.hp / defMultiplier));
        currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);

        if (currentPayload <= 5) break; // Payload extinguished
      } else {
        const updatedM = monsterMap.get(m.id)!;
        updatedM.hp = Math.max(1, updatedM.hp - actualDmgToTarget);
        stopperId = m.id;
        break; // Chain stopped by survivor (e.g. Elite Anchor)
      }
    }
  } else if (skill.route === 'branch') {
    // Cleave: Strikes Front Row (Depth 0) of playerLane, Lane - 1, Lane + 1
    const targetLanes = [playerLane - 1, playerLane, playerLane + 1];
    const frontMonsters = monsters
      .filter(m => targetLanes.includes(m.lane) && m.depth === 0 && m.hp > 0)
      .sort((a, b) => Math.abs(a.lane - playerLane) - Math.abs(b.lane - playerLane));

    for (const m of frontMonsters) {
      const isMainLane = m.lane === playerLane;
      const targetPayload = isMainLane ? initialRawPayload : Math.floor(initialRawPayload * 0.65);
      const defMultiplier = calculateDamageMultiplier(attackerLevel, m.defense);
      const actualDmg = Math.floor(targetPayload * defMultiplier);
      const isFatal = actualDmg >= m.hp;

      targetsHit.push({
        monsterId: m.id,
        damage: actualDmg,
        isFatal,
        depth: m.depth,
        lane: m.lane
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(m.id)!;
      if (isFatal) {
        kills.push(m.id);
        updatedM.hp = 0;
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        if (m.rank === 'elite' && !stopperId) stopperId = m.id;
      }
    }
  } else if (skill.route === 'radius') {
    // Whirlwind: Strikes Depth 0 and Depth 1 across all 5 lanes
    const nearby = monsters
      .filter(m => m.depth <= 1 && m.hp > 0)
      .sort((a, b) => a.depth - b.depth || Math.abs(a.lane - playerLane) - Math.abs(b.lane - playerLane));

    for (const m of nearby) {
      const targetPayload = Math.floor(initialRawPayload * (m.depth === 0 ? 0.75 : 0.5));
      const defMultiplier = calculateDamageMultiplier(attackerLevel, m.defense);
      const actualDmg = Math.floor(targetPayload * defMultiplier);
      const isFatal = actualDmg >= m.hp;

      targetsHit.push({
        monsterId: m.id,
        damage: actualDmg,
        isFatal,
        depth: m.depth,
        lane: m.lane
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(m.id)!;
      if (isFatal) {
        kills.push(m.id);
        updatedM.hp = 0;
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        if (m.rank === 'elite' && !stopperId) stopperId = m.id;
      }
    }
  } else if (skill.route === 'single') {
    // Execute: Massive single target damage with execute execute threshold
    const frontTarget = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth)[0];

    if (frontTarget) {
      const executeBonus = frontTarget.hp < frontTarget.maxHp * 0.5 ? 1.6 : 1.0;
      const defMultiplier = calculateDamageMultiplier(attackerLevel, frontTarget.defense);
      const actualDmg = Math.floor(initialRawPayload * executeBonus * defMultiplier);
      const isFatal = actualDmg >= frontTarget.hp;

      targetsHit.push({
        monsterId: frontTarget.id,
        damage: actualDmg,
        isFatal,
        depth: frontTarget.depth,
        lane: frontTarget.lane
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(frontTarget.id)!;
      if (isFatal) {
        kills.push(frontTarget.id);
        updatedM.hp = 0;
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        stopperId = frontTarget.id;
      }
    }
  }

  return {
    targetsHit,
    kills,
    chainCount: kills.length,
    stopperId,
    totalDamage: accumulatedDamage,
    isCritical,
    newMonsters: Array.from(monsterMap.values())
  };
}

/**
 * Smart Auto-Targeting Algorithm:
 * Evaluates all 5 lanes for the given skill and finds the lane that produces the maximum kills/damage.
 * Prevents wasting attacks on empty or suboptimal lanes.
 */
export function findBestLaneForSkill(
  attackerLevel: number,
  totalStats: {
    minDmg: number;
    maxDmg: number;
    critChance: number;
    critDamage: number;
    overkillEfficiency: number;
  },
  skill: Skill,
  monsters: Monster[]
): number {
  const activeMonsters = monsters.filter(m => m.hp > 0);
  if (activeMonsters.length === 0) return 2; // Default center

  let bestLane = 2;
  let bestScore = -1;

  for (let lane = 0; lane < 5; lane++) {
    // Check if this lane or affected area has any monsters
    const hasMonsters = skill.route === 'branch'
      ? activeMonsters.some(m => Math.abs(m.lane - lane) <= 1 && m.depth === 0)
      : skill.route === 'radius'
      ? activeMonsters.some(m => m.depth <= 1)
      : activeMonsters.some(m => m.lane === lane);

    if (!hasMonsters) continue;

    const res = resolveAttack(attackerLevel, totalStats, skill, lane, monsters, true);
    // Score heavily weights kills, then raw damage
    const score = res.chainCount * 10000 + res.totalDamage;

    if (score > bestScore) {
      bestScore = score;
      bestLane = lane;
    }
  }

  return bestLane;
}

/**
 * GDD Section 26 Benchmark: Fixed 30 Goblin Formation
 * 5 Lanes x 6 Depths = Exactly 30 Monsters
 * Designed specifically to test:
 * 1. Line Overkill through weak lane (Lane 0 / Lane 4 -> 6 kills in 1 hit!)
 * 2. Elite Anchor Chain Stopper at Lane 2 Depth 1 (Orc Enforcer stops the chain)
 * 3. Front Guard Shield Wall at Lane 1 & 3
 */
export function createGoblin30Formation(): Monster[] {
  const monsters: Monster[] = [];

  for (let lane = 0; lane < 5; lane++) {
    for (let depth = 0; depth < 6; depth++) {
      const isFront = depth === 0;
      const isCenterElite = lane === 2 && depth === 1;
      const isShieldGuard = isFront && (lane === 1 || lane === 3);
      const isShamanBack = depth >= 4 && (lane === 0 || lane === 4);

      let name = '고블린 정찰병';
      let hp = 40;
      let maxHp = 40;
      let defense = 3;
      let rank: Monster['rank'] = 'normal';

      if (isCenterElite) {
        name = '오크 집행관 [ELITE]';
        hp = 280;
        maxHp = 280;
        defense = 35; // High armor chain stopper
        rank = 'elite';
      } else if (isShieldGuard) {
        name = '고블린 방패병';
        hp = 80;
        maxHp = 80;
        defense = 22;
        rank = 'champion';
      } else if (isShamanBack) {
        name = '고블린 주술사';
        hp = 35;
        maxHp = 35;
        defense = 0;
        rank = 'normal';
      } else if (depth === 0) {
        name = '고블린 전사';
        hp = 50;
        maxHp = 50;
        defense = 5;
      } else {
        name = `고블린 잡병 #${depth + 1}`;
        hp = 30 + depth * 3;
        maxHp = 30 + depth * 3;
        defense = 2;
      }

      monsters.push({
        id: `g30_l${lane}_d${depth}`,
        name,
        hp,
        maxHp,
        defense,
        rank,
        lane,
        depth,
        intent: {
          type: isCenterElite ? 'attack' : isShieldGuard ? 'defend' : 'attack',
          damage: isCenterElite ? 48 : isShieldGuard ? 10 : 12 + depth * 2,
          targetLane: lane,
          chargePercent: isCenterElite ? 75 : 40 + depth * 10
        },
        icon: isCenterElite ? 'ELITE' : isShieldGuard ? 'GUARD' : 'NORMAL'
      });
    }
  }

  return monsters;
}
