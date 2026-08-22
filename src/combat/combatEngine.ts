import { Monster, Skill, GameItem } from '../types/game';

export interface CombatHitResult {
  monsterId: string;
  damage: number;
  isFatal: boolean;
  depth: number;
  lane: number;
  isOverkillHit?: boolean; // True if hit by overkill residual spillover
}

export interface AttackResolution {
  targetsHit: CombatHitResult[];
  primaryHits: CombatHitResult[]; // Base hits that generate rage/resources
  overkillHits: CombatHitResult[]; // Residual overkill hits that do NOT generate rage
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
  if (!monsters || monsters.length === 0) {
    return {
      targetsHit: [],
      primaryHits: [],
      overkillHits: [],
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

  // Chain Lightning Rune: Crit Rate +25%
  const effectiveCritRate = skill.activeRuneId === 'rune_lightning'
    ? totalStats.critChance + 25
    : totalStats.critChance;

  if (!forceDeterministic) {
    isCritical = Math.random() * 100 < effectiveCritRate;
    baseDamage = Math.floor(Math.random() * (totalStats.maxDmg - totalStats.minDmg + 1)) + totalStats.minDmg;
  } else {
    // Deterministic preview considers lightning rune crit bonus
    isCritical = effectiveCritRate >= 50;
  }

  // Skill Rune Modifiers
  let runeDmgBonus = 1.0;
  let runeOverkillBonus = 1.0;

  if (skill.activeRuneId === 'rune_fire') {
    runeDmgBonus = 1.25;
    runeOverkillBonus = 1.30;
  } else if (skill.activeRuneId === 'rune_frost') {
    runeDmgBonus = 1.15;
    runeOverkillBonus = 1.20;
  } else if (skill.activeRuneId === 'rune_lightning') {
    runeDmgBonus = 1.20;
    runeOverkillBonus = 1.20;
  } else if (skill.activeRuneId === 'rune_poison') {
    runeDmgBonus = 1.15;
    runeOverkillBonus = 1.25;
  } else if (skill.activeRuneId === 'rune_void') {
    runeDmgBonus = 1.20;
    runeOverkillBonus = 1.20;
  }

  const skillLevelMult = 1 + ((skill.level || 1) - 1) * 0.15;
  const critMultiplier = isCritical ? totalStats.critDamage / 100 : 1.0;
  const initialRawPayload = Math.floor(baseDamage * skill.damageMultiplier * skillLevelMult * runeDmgBonus * critMultiplier);

  const targetsHit: CombatHitResult[] = [];
  const kills: string[] = [];
  let stopperId: string | null = null;
  let accumulatedDamage = 0;

  // Helper for Venom Slaughter 50% defense shred
  const getEffectiveDefense = (def: number) => {
    return skill.activeRuneId === 'rune_poison' ? Math.floor(def * 0.5) : def;
  };

  // Helper for Frost Shatter 40% Freeze/Stun application
  const applyFrostFreeze = (m: Monster) => {
    if (skill.activeRuneId === 'rune_frost') {
      if (!forceDeterministic) {
        if (Math.random() < 0.40) m.isFrozen = true;
      } else {
        m.isFrozen = true; // Preview indicator
      }
    }
  };

  // Clone monsters for damage processing
  const monsterMap = new Map<string, Monster>(monsters.map(m => [m.id, { ...m }]));

  // Effective overkill efficiency (Base skill * Character bonus * Rune bonus)
  const effectiveOverkillEff = skill.overkillEfficiency * (totalStats.overkillEfficiency / 100) * runeOverkillBonus;

  // 2. Process Routes
  if (skill.route === 'line') {
    // Slash (가르기): Primary hit on the FIRST alive monster in playerLane -> Overkill cascades forward to back
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    let currentPayload = initialRawPayload;

    laneMonsters.forEach((m, idx) => {
      if (currentPayload <= 0) return;

      const isOverkillHit = idx > 0;
      const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(m.defense));
      const actualDmg = Math.floor(currentPayload * defMultiplier);
      const isFatal = actualDmg >= m.hp;

      targetsHit.push({
        monsterId: m.id,
        damage: actualDmg,
        isFatal,
        depth: m.depth,
        lane: m.lane,
        isOverkillHit
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(m.id)!;
      if (isFatal) {
        kills.push(m.id);
        updatedM.hp = 0;
        const rawOverkill = Math.max(0, actualDmg - m.hp);
        currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        applyFrostFreeze(updatedM);
        if (m.rank === 'elite' && !stopperId) stopperId = m.id;
        currentPayload = 0;
      }
    });
  } else if (skill.route === 'branch') {
    // Cleave (휩쓸기): Primary hits on the FIRST alive monster of [playerLane - 1, playerLane, playerLane + 1]
    const targetLanes = [playerLane - 1, playerLane, playerLane + 1].filter(l => l >= 0 && l <= 4);

    targetLanes.forEach(l => {
      const laneMonsters = monsters
        .filter(m => m.lane === l && m.hp > 0)
        .sort((a, b) => a.depth - b.depth);

      if (laneMonsters.length === 0) return;

      const isMainLane = l === playerLane;
      let currentPayload = isMainLane ? initialRawPayload : Math.floor(initialRawPayload * 0.75);

      laneMonsters.forEach((m, idx) => {
        if (currentPayload <= 0) return;

        const isOverkillHit = idx > 0;
        const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(m.defense));
        const actualDmg = Math.floor(currentPayload * defMultiplier);
        const isFatal = actualDmg >= m.hp;

        targetsHit.push({
          monsterId: m.id,
          damage: actualDmg,
          isFatal,
          depth: m.depth,
          lane: m.lane,
          isOverkillHit
        });

        accumulatedDamage += actualDmg;

        const updatedM = monsterMap.get(m.id)!;
        if (isFatal) {
          kills.push(m.id);
          updatedM.hp = 0;
          const rawOverkill = Math.max(0, actualDmg - m.hp);
          currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
          applyFrostFreeze(updatedM);
          if (m.rank === 'elite' && !stopperId) stopperId = m.id;
          currentPayload = 0;
        }
      });
    });
  } else if (skill.route === 'radius') {
    // Whirlwind (휠윈드): Primary hits on the FIRST TWO alive monsters across all 5 lanes (Depth index 0 and 1)
    for (let l = 0; l < 5; l++) {
      const laneMonsters = monsters
        .filter(m => m.lane === l && m.hp > 0)
        .sort((a, b) => a.depth - b.depth);

      if (laneMonsters.length === 0) continue;

      const isMainLane = l === playerLane || Math.abs(l - playerLane) === 1;
      let currentPayload = Math.floor(initialRawPayload * (isMainLane ? 0.90 : 0.70));

      laneMonsters.forEach((m, idx) => {
        if (currentPayload <= 0) return;

        // First 2 monsters in the lane are Primary hits (idx 0, 1); 3rd+ are Overkill hits (idx >= 2)
        const isOverkillHit = idx >= 2;
        const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(m.defense));
        const actualDmg = Math.floor(currentPayload * defMultiplier);
        const isFatal = actualDmg >= m.hp;

        targetsHit.push({
          monsterId: m.id,
          damage: actualDmg,
          isFatal,
          depth: m.depth,
          lane: m.lane,
          isOverkillHit
        });

        accumulatedDamage += actualDmg;

        const updatedM = monsterMap.get(m.id)!;
        if (isFatal) {
          kills.push(m.id);
          updatedM.hp = 0;
          const rawOverkill = Math.max(0, actualDmg - m.hp);
          currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
          applyFrostFreeze(updatedM);
          if (m.rank === 'elite' && !stopperId) stopperId = m.id;
          currentPayload = 0;
        }
      });
    }
  } else if (skill.route === 'single') {
  } else if (skill.route === 'single') {
    // Execute (처형): Massive primary strike on the FIRST alive monster in playerLane -> Overkill penetrates in a straight LINE through that lane's back rows!
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    if (laneMonsters.length > 0) {
      const frontTarget = laneMonsters[0];
      const executeBonus = frontTarget.hp < frontTarget.maxHp * 0.5 ? 1.6 : 1.0;
      const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(frontTarget.defense));
      const actualDmg = Math.floor(initialRawPayload * executeBonus * defMultiplier);
      const isFatal = actualDmg >= frontTarget.hp;

      targetsHit.push({
        monsterId: frontTarget.id,
        damage: actualDmg,
        isFatal,
        depth: frontTarget.depth,
        lane: frontTarget.lane,
        isOverkillHit: false // Primary single target!
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(frontTarget.id)!;
      if (isFatal) {
        kills.push(frontTarget.id);
        updatedM.hp = 0;

        // Line Penetration Overkill: Residual energy pierces straight through subsequent monsters in the SAME lane!
        const rawOverkill = Math.max(0, actualDmg - frontTarget.hp);
        let currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);

        // Pierce through behind monsters (idx 1, 2, 3, 4, 5)
        for (let idx = 1; idx < laneMonsters.length; idx++) {
          if (currentPayload <= 0) break;

          const sm = laneMonsters[idx];
          const smDefMult = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(sm.defense));
          const smDmg = Math.floor(currentPayload * smDefMult);
          if (smDmg <= 0) break;

          const isSmFatal = smDmg >= sm.hp;
          targetsHit.push({
            monsterId: sm.id,
            damage: smDmg,
            isFatal: isSmFatal,
            depth: sm.depth,
            lane: sm.lane,
            isOverkillHit: true // Line penetration overkill hit!
          });

          accumulatedDamage += smDmg;
          const smUpdated = monsterMap.get(sm.id)!;
          if (isSmFatal) {
            kills.push(sm.id);
            smUpdated.hp = 0;
            const smRawOverkill = Math.max(0, smDmg - sm.hp);
            currentPayload = Math.floor(smRawOverkill * effectiveOverkillEff);
          } else {
            smUpdated.hp = Math.max(1, smUpdated.hp - smDmg);
            applyFrostFreeze(smUpdated);
            if (sm.rank === 'elite' && !stopperId) stopperId = sm.id;
            currentPayload = 0;
            break;
          }
        }
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        applyFrostFreeze(updatedM);
        stopperId = frontTarget.id;
      }
    }
  }

  const primaryHits = targetsHit.filter(t => !t.isOverkillHit);
  const overkillHits = targetsHit.filter(t => t.isOverkillHit);

  return {
    targetsHit,
    primaryHits,
    overkillHits,
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
