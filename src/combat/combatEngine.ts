import { Monster, Skill, GameItem } from '../types/game';

export interface CombatHitResult {
  monsterId: string;
  damage: number;
  isFatal: boolean;
  depth: number;
  lane: number;
  isOverkillHit?: boolean;
}

export interface AttackResolution {
  targetsHit: CombatHitResult[];
  primaryHits: CombatHitResult[];
  overkillHits: CombatHitResult[];
  kills: string[];
  chainCount: number;
  stopperId: string | null;
  totalDamage: number;
  isCritical: boolean;
  isExtraStrike?: boolean;
  newMonsters: Monster[];
}

export function calculateDamageMultiplier(attackerLevel: number, targetDefense: number): number {
  const K = 100 + attackerLevel * 10;
  return K / (K + Math.max(0, targetDefense));
}

export function resolveAttack(
  attackerLevel: number,
  totalStats: {
    minDmg: number;
    maxDmg: number;
    critChance: number;
    critDamage: number;
    overkillEfficiency: number;
    attackSpeed?: number;
  },
  skill: Skill,
  playerLane: number,
  monsters: Monster[],
  forceDeterministic = false
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
      isExtraStrike: false,
      newMonsters: []
    };
  }

  let isCritical = false;
  let isExtraStrike = false;
  let baseDamage = Math.floor((totalStats.minDmg + totalStats.maxDmg) / 2);

  const effectiveCritRate = skill.activeRuneId === 'rune_lightning'
    ? totalStats.critChance + 25
    : totalStats.critChance;

  const flurryChance = Math.min(75, Math.floor((totalStats.attackSpeed || 0) * 0.60));

  if (!forceDeterministic) {
    isCritical = Math.random() * 100 < effectiveCritRate;
    isExtraStrike = Math.random() * 100 < flurryChance;
    baseDamage = Math.floor(Math.random() * (totalStats.maxDmg - totalStats.minDmg + 1)) + totalStats.minDmg;
  } else {
    isCritical = false;
    isExtraStrike = false;
  }

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
  const flurryMultiplier = isExtraStrike ? 1.35 : 1.0;
  const initialRawPayload = Math.floor(baseDamage * skill.damageMultiplier * skillLevelMult * runeDmgBonus * critMultiplier * flurryMultiplier);

  const targetsHit: CombatHitResult[] = [];
  const kills: string[] = [];
  let stopperId: string | null = null;
  let accumulatedDamage = 0;

  const getEffectiveDefense = (def: number) => {
    return skill.activeRuneId === 'rune_poison' ? Math.floor(def * 0.5) : def;
  };

  const applyFrostFreeze = (m: Monster) => {
    if (skill.activeRuneId === 'rune_frost') {
      if (!forceDeterministic) {
        if (Math.random() < 0.40) m.isFrozen = true;
      } else {
        m.isFrozen = true;
      }
    }
  };

  const monsterMap = new Map<string, Monster>(monsters.map(m => [m.id, { ...m }]));
  const effectiveOverkillEff = skill.overkillEfficiency * (totalStats.overkillEfficiency / 100) * runeOverkillBonus;

  if (skill.route === 'line') {
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
    for (let l = 0; l < 5; l++) {
      const laneMonsters = monsters
        .filter(m => m.lane === l && m.hp > 0)
        .sort((a, b) => a.depth - b.depth);

      if (laneMonsters.length === 0) continue;

      const isCenterLane = l === playerLane;
      const isAdjacentLane = Math.abs(l - playerLane) === 1;
      const distanceMultiplier = isCenterLane ? 1.0 : isAdjacentLane ? 0.90 : 0.75;
      const baseLanePayload = Math.floor(initialRawPayload * distanceMultiplier);
      let overkillBudget = 0;

      if (laneMonsters.length > 0) {
        const m0 = laneMonsters[0];
        const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(m0.defense));
        const actualDmg = Math.floor(baseLanePayload * defMultiplier);
        const isFatal = actualDmg >= m0.hp;

        targetsHit.push({
          monsterId: m0.id,
          damage: actualDmg,
          isFatal,
          depth: m0.depth,
          lane: m0.lane,
          isOverkillHit: false
        });

        accumulatedDamage += actualDmg;
        const updatedM0 = monsterMap.get(m0.id)!;
        if (isFatal) {
          kills.push(m0.id);
          updatedM0.hp = 0;
          const rawOverkill = Math.max(0, actualDmg - m0.hp);
          overkillBudget += Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM0.hp = Math.max(1, updatedM0.hp - actualDmg);
          applyFrostFreeze(updatedM0);
          if (m0.rank === 'elite' && !stopperId) stopperId = m0.id;
        }
      }

      if (laneMonsters.length > 1) {
        const m1 = laneMonsters[1];
        const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(m1.defense));
        const actualDmg = Math.floor(baseLanePayload * defMultiplier);
        const isFatal = actualDmg >= m1.hp;

        targetsHit.push({
          monsterId: m1.id,
          damage: actualDmg,
          isFatal,
          depth: m1.depth,
          lane: m1.lane,
          isOverkillHit: false
        });

        accumulatedDamage += actualDmg;
        const updatedM1 = monsterMap.get(m1.id)!;
        if (isFatal) {
          kills.push(m1.id);
          updatedM1.hp = 0;
          const rawOverkill = Math.max(0, actualDmg - m1.hp);
          overkillBudget += Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM1.hp = Math.max(1, updatedM1.hp - actualDmg);
          applyFrostFreeze(updatedM1);
          if (m1.rank === 'elite' && !stopperId) stopperId = m1.id;
        }
      }

      if (overkillBudget > 0 && laneMonsters.length > 2) {
        for (let idx = 2; idx < laneMonsters.length; idx++) {
          if (overkillBudget <= 0) break;

          const mb = laneMonsters[idx];
          const defMultiplier = calculateDamageMultiplier(attackerLevel, getEffectiveDefense(mb.defense));
          const actualDmg = Math.floor(overkillBudget * defMultiplier);
          if (actualDmg <= 0) break;

          const isFatal = actualDmg >= mb.hp;
          targetsHit.push({
            monsterId: mb.id,
            damage: actualDmg,
            isFatal,
            depth: mb.depth,
            lane: mb.lane,
            isOverkillHit: true
          });

          accumulatedDamage += actualDmg;
          const updatedMb = monsterMap.get(mb.id)!;
          if (isFatal) {
            kills.push(mb.id);
            updatedMb.hp = 0;
            const rawOverkill = Math.max(0, actualDmg - mb.hp);
            overkillBudget = Math.floor(rawOverkill * effectiveOverkillEff);
          } else {
            updatedMb.hp = Math.max(1, updatedMb.hp - actualDmg);
            applyFrostFreeze(updatedMb);
            if (mb.rank === 'elite' && !stopperId) stopperId = mb.id;
            overkillBudget = 0;
            break;
          }
        }
      }
    }
  } else if (skill.route === 'single') {
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
        isOverkillHit: false
      });

      accumulatedDamage += actualDmg;

      const updatedM = monsterMap.get(frontTarget.id)!;
      if (isFatal) {
        kills.push(frontTarget.id);
        updatedM.hp = 0;

        const rawOverkill = Math.max(0, actualDmg - frontTarget.hp);
        let currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);

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
            isOverkillHit: true
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
    isExtraStrike,
    newMonsters: Array.from(monsterMap.values())
  };
}

export function findBestLaneForSkill(
  attackerLevel: number,
  totalStats: {
    minDmg: number;
    maxDmg: number;
    critChance: number;
    critDamage: number;
    overkillEfficiency: number;
    attackSpeed?: number;
  },
  skill: Skill,
  monsters: Monster[]
): number {
  const activeMonsters = monsters.filter(m => m.hp > 0);
  if (activeMonsters.length === 0) return 2;

  let bestLane = 2;
  let bestScore = -1;

  for (let lane = 0; lane < 5; lane++) {
    const hasMonsters = skill.route === 'branch'
      ? activeMonsters.some(m => Math.abs(m.lane - lane) <= 1 && m.depth === 0)
      : skill.route === 'radius'
      ? activeMonsters.some(m => m.depth <= 1)
      : activeMonsters.some(m => m.lane === lane);

    if (!hasMonsters) continue;

    const res = resolveAttack(attackerLevel, totalStats, skill, lane, monsters, true);
    const score = res.chainCount * 10000 + res.totalDamage;

    if (score > bestScore) {
      bestScore = score;
      bestLane = lane;
    }
  }

  return bestLane;
}

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
        defense = 35;
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

export function createDungeonFormation(dungeonId: string, roomType: string, playerLevel: number, difficultyLevel: number = 1): Monster[] {
  const monsters: Monster[] = [];
  const diff = Math.max(1, difficultyLevel);
  const diffScale = 1 + (diff - 1) * 0.35 + Math.pow((diff - 1) * 0.04, 1.4);
  const dmgDiffScale = 1 + (diff - 1) * 0.18 + (diff - 1) * 0.05;
  const defDiffScale = 1 + (diff - 1) * 0.20;
  const scale = (1 + (playerLevel * 0.05)) * diffScale;
  const addMonster = (
    lane: number, depth: number, 
    name: string, hp: number, def: number, dmg: number, 
    rank: Monster['rank'] = 'normal', icon: string = 'NORMAL'
  ) => {
    const scaledHp = Math.floor(hp * scale);
    const scaledDmg = Math.floor(dmg * (1 + (playerLevel * 0.03)) * dmgDiffScale);
    const scaledDef = Math.floor(def * defDiffScale);
    monsters.push({
      id: `${dungeonId}_l${lane}_d${depth}_${Math.random().toString(36).substring(2,7)}`,
      name,
      hp: scaledHp,
      maxHp: scaledHp,
      defense: scaledDef,
      rank,
      lane,
      depth,
      intent: { type: 'attack', damage: scaledDmg, targetLane: lane, chargePercent: 50 },
      icon,
      isFrozen: false
    });
  };

  const laneDepthCounts = [0, 0, 0, 0, 0];
  const spawnToRandomLane = (name: string, hp: number, def: number, dmg: number, rank: Monster['rank'] = 'normal', icon: string = 'NORMAL') => {
    const minDepth = Math.min(...laneDepthCounts);
    const availableLanes = [0,1,2,3,4].filter(l => laneDepthCounts[l] === minDepth);
    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const depth = laneDepthCounts[lane]++;
    addMonster(lane, depth, name, hp, def, dmg, rank, icon);
  };

  if (roomType === 'treasure' || roomType === 'start') {
    return monsters;
  }

  if (dungeonId === 'act1_crypt') {
    const firstRun = difficultyLevel <= 1 && playerLevel <= 3;
    if (roomType === 'boss') {
      if (firstRun) {
        addMonster(2, 0, '고블린 족장', 130, 8, 4, 'boss', 'BOSS');
        spawnToRandomLane('호위 고블린', 20, 1, 2);
        spawnToRandomLane('호위 고블린', 20, 1, 2);
      } else {
        addMonster(2, 0, '고블린 정예 방패병', 80, 15, 5, 'champion', 'GUARD');
        addMonster(2, 1, '고블린 주술 대장', 70, 5, 8, 'champion', 'GUARD');
        addMonster(2, 2, '고블린 킹', 450, 25, 12, 'boss', 'BOSS');
        laneDepthCounts[2] = 3;
        for (let i = 0; i < 8; i++) spawnToRandomLane('호위 고블린', 50, 3, 4, 'normal', 'GUARD');
      }
    } else if (roomType === 'elite') {
      addMonster(2, 0, '오크 집행관', firstRun ? 75 : 180, firstRun ? 6 : 15, firstRun ? 4 : 7, 'elite', 'ELITE');
    } else {
      const count = firstRun ? 10 : Math.floor(Math.random() * 9) + 14;
      for (let i = 0; i < count; i++) {
        if (firstRun) spawnToRandomLane('고블린 정찰병', 22, 1, 2);
        else {
          const rand = Math.random();
          if (rand < 0.70) spawnToRandomLane('고블린 정찰병', 30 + Math.random() * 20, Math.floor(Math.random() * 4), 2 + Math.floor(Math.random() * 3));
          else if (rand < 0.90) spawnToRandomLane('고블린 궁수', 40, 1, 4);
          else spawnToRandomLane('고블린 주술사', 50, 0, 3);
        }
      }
    }
  } else if (dungeonId === 'act2_tomb') {
    if (roomType === 'boss') {
      addMonster(2, 0, '고대 무덤 수호병', 120, 20, 8, 'champion', 'GUARD');
      addMonster(2, 1, '미이라 고위 사제', 100, 10, 12, 'champion', 'GUARD');
      addMonster(2, 2, '본 킹 (두리엘)', 900, 35, 18, 'boss', 'BOSS');
      laneDepthCounts[2] = 3;
      for (let i = 0; i < 8; i++) spawnToRandomLane('해골 소환 가드', 90, 15, 6, 'normal', 'GUARD');
    } else if (roomType === 'elite') {
      addMonster(2, 0, '데스나이트', 280, 25, 10, 'elite', 'ELITE');
    } else if (roomType === 'treasure') {
      for (let i = 0; i < 12; i++) spawnToRandomLane('미이라 도굴꾼', 60, 8, 5, 'normal', 'NORMAL');
      for (let i = 0; i < 4; i++) spawnToRandomLane('고대 무덤 수호병', 140, 22, 8, 'champion', 'GUARD');
    } else if (roomType === 'rune') {
      for (let i = 0; i < 10; i++) spawnToRandomLane('사막 비전 사제', 65, 5, 9, 'normal', 'NORMAL');
      for (let i = 0; i < 3; i++) spawnToRandomLane('룬 결계 수호자', 160, 25, 10, 'champion', 'GUARD');
    } else if (roomType === 'shrine') {
      for (let i = 0; i < 10; i++) spawnToRandomLane('모래 메뚜기 떼', 45, 4, 4, 'normal', 'NORMAL');
      for (let i = 0; i < 4; i++) spawnToRandomLane('태양의 광신도', 85, 12, 7, 'champion', 'NORMAL');
    } else {
      const count = roomType === 'start' ? 10 : Math.floor(Math.random() * 7) + 12;
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        if (rand < 0.60) spawnToRandomLane('스켈레톤 전사', 60 + Math.random() * 30, 8 + Math.floor(Math.random() * 8), 4 + Math.floor(Math.random() * 3));
        else if (rand < 0.85) spawnToRandomLane('스켈레톤 궁수', 70, 8, 6);
        else if (rand < 0.95) spawnToRandomLane('스켈레톤 마법사', 60, 5, 8);
        else spawnToRandomLane('스켈레톤 방패병', 90, 30, 4, 'champion', 'GUARD');
      }
    }
  } else if (dungeonId === 'act3_jungle') {
    if (roomType === 'boss') {
      addMonster(2, 0, '마그마 골렘', 250, 30, 12, 'champion', 'GUARD');
      addMonster(2, 1, '지옥 기사', 200, 25, 15, 'champion', 'GUARD');
      addMonster(2, 2, '인페르노 골렘 (메피스토)', 1600, 45, 22, 'boss', 'BOSS');
      laneDepthCounts[2] = 3;
      for (let i = 0; i < 8; i++) spawnToRandomLane('용암 정령', 180, 25, 10, 'normal', 'GUARD');
    } else if (roomType === 'elite') {
      addMonster(2, 0, '인페르노 가디언', 450, 35, 15, 'elite', 'ELITE');
    } else if (roomType === 'treasure') {
      for (let i = 0; i < 12; i++) spawnToRandomLane('화염 보물 약탈자', 110, 15, 7, 'normal', 'NORMAL');
      for (let i = 0; i < 4; i++) spawnToRandomLane('마그마 골렘', 220, 30, 12, 'champion', 'GUARD');
    } else if (roomType === 'rune') {
      for (let i = 0; i < 10; i++) spawnToRandomLane('증오의 룬 주술사', 120, 10, 12, 'normal', 'NORMAL');
      for (let i = 0; i < 3; i++) spawnToRandomLane('지옥 불꽃 골렘', 250, 32, 14, 'champion', 'GUARD');
    } else {
      const count = roomType === 'start' ? 10 : Math.floor(Math.random() * 7) + 12;
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        if (rand < 0.50) spawnToRandomLane('화염 임프', 100 + Math.random() * 80, 15 + Math.floor(Math.random() * 11), 6 + Math.floor(Math.random() * 5));
        else if (rand < 0.80) spawnToRandomLane('용암 골렘', 180, 25, 8);
        else if (rand < 0.95) spawnToRandomLane('화염 정령', 120, 15, 10);
        else spawnToRandomLane('지옥 기사', 150, 30, 12, 'champion', 'ELITE');
      }
    }
  } else {
    if (roomType === 'elite') {
      addMonster(2, 0, '베놈 로드', 400, 40, 20, 'elite', 'ELITE');
    } else {
    const count = 15;
    for (let i = 0; i < count; i++) spawnToRandomLane('카오스 악마', 120, 15, 10);
    if (roomType === 'boss') {
      addMonster(2, 0, '망각의 기사', 300, 35, 15, 'champion', 'GUARD');
      addMonster(2, 1, '베놈 로드', 400, 40, 20, 'champion', 'GUARD');
      addMonster(2, 2, '지옥의 군주 (디아블로)', 2500, 50, 30, 'boss', 'BOSS');
      laneDepthCounts[2] = 3;
    }
    }
  }

  return monsters;
}
