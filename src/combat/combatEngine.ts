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
  appliedDamage: number;
  isCritical: boolean;
  isExtraStrike?: boolean;
  isBossBreak?: boolean;
  isWeakSpotHit?: boolean;
  newMonsters: Monster[];
}

export function calculateDamageMultiplier(attackerLevel: number, targetDefense: number): number {
  const K = 100 + attackerLevel * 10;
  const rawMult = K / (K + Math.max(0, targetDefense));
  return Math.max(0.05, Math.min(1.0, rawMult));
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
    allSkills?: number;
    crushingBlow?: number;
    openWounds?: number;
    ignoreTargetDefense?: boolean;
    targetDefenseReduction?: number;
    convictionAura?: boolean;
    redemptionOnKill?: boolean;
    mightAura?: boolean;
    chillingArmor?: boolean;
    staticFieldChance?: number;
    amplifyDamageChance?: number;
    lifeTapChance?: number;
    cannotBeFrozen?: boolean;
    damageToDemons?: number;
    knockback?: boolean;
  },
  skill: Skill,
  playerLane: number,
  monsters: Monster[],
  forceDeterministic = false,
  passiveLevels: Record<string, number> = {}
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
      appliedDamage: 0,
      isCritical: false,
      isExtraStrike: false,
      isBossBreak: false,
      isWeakSpotHit: false,
      newMonsters: []
    };
  }

  let isCritical = false;
  let isExtraStrike = false;
  const effectiveMin = Math.min(totalStats.minDmg, totalStats.maxDmg);
  const effectiveMax = Math.max(totalStats.minDmg, totalStats.maxDmg);
  let baseDamage = Math.floor((effectiveMin + effectiveMax) / 2);

  const effectiveCritRate = skill.activeRuneId === 'rune_lightning'
    ? totalStats.critChance + 25
    : totalStats.critChance;

  const flurryChance = Math.min(75, Math.floor((totalStats.attackSpeed || 0) * 0.60));
  const critMultiplier = totalStats.critDamage / 100;

  if (!forceDeterministic) {
    isCritical = Math.random() * 100 < effectiveCritRate;
    isExtraStrike = Math.random() * 100 < flurryChance;
    baseDamage = Math.floor(effectiveMin + Math.random() * (effectiveMax - effectiveMin + 1));
  } else {
    // Deterministic preview: use expected-value approximation instead of 50% threshold.
    // Showing crit only when >=50% wildly misrepresents 30-49% builds.
    // For preview scoring, treat damage as expected value blended by proc rates.
    const expectedCritMult = 1 + (effectiveCritRate / 100) * (critMultiplier - 1);
    const expectedFlurryMult = 1 + (flurryChance / 100) * 0.35;
    // Keep isCritical/isExtraStrike false in deterministic mode; bake expectation into baseDamage
    isCritical = false;
    isExtraStrike = false;
    // Adjust baseDamage to expected value so score reflects true average
    const avgBase = Math.floor((effectiveMin + effectiveMax) / 2);
    baseDamage = Math.floor(avgBase * expectedCritMult * expectedFlurryMult);
  }

  // Passive: Elemental Attunement (+5% elemental rune damage per level)
  const eaLevel = Math.min(10, passiveLevels['elemental_attunement'] || 0);
  const elementalAffinityBonus = 1 + eaLevel * 0.05;

  let runeDmgBonus = 1.0;
  let runeOverkillBonus = 1.0;

  if (skill.activeRuneId === 'rune_fire') {
    runeDmgBonus = 1.25 * elementalAffinityBonus;
    runeOverkillBonus = 1.30;
  } else if (skill.activeRuneId === 'rune_frost') {
    runeDmgBonus = 1.15 * elementalAffinityBonus;
    runeOverkillBonus = 1.20;
  } else if (skill.activeRuneId === 'rune_lightning') {
    runeDmgBonus = 1.20 * elementalAffinityBonus;
    runeOverkillBonus = 1.20;
  } else if (skill.activeRuneId === 'rune_poison') {
    runeDmgBonus = 1.15 * elementalAffinityBonus;
    runeOverkillBonus = 1.25;
  } else if (skill.activeRuneId === 'rune_void') {
    runeDmgBonus = 1.10 * elementalAffinityBonus;
    runeOverkillBonus = 1.15;
  }

  const effectiveSkillLevel = Math.max(1, (skill.level || 1) + (totalStats.allSkills || 0));
  const skillLevelBonus = 1 + (effectiveSkillLevel - 1) * 0.15;
  const initialRawPayload = Math.floor(
    baseDamage * (skill.damageMultiplier || 1.0) * skillLevelBonus * runeDmgBonus * (isCritical ? critMultiplier : 1.0) * (isExtraStrike ? 1.35 : 1.0)
  );

  const targetsHit: CombatHitResult[] = [];
  const kills: string[] = [];
  let stopperId: string | null = null;
  let accumulatedDamage = 0;
  let accumulatedAppliedDamage = 0;
  let bossBreakTriggered = false;
  let weakSpotHitTriggered = false;

  const monsterMap = new Map<string, Monster>(monsters.map(m => [m.id, { ...m }]));

  // ⚡ Static Field Proc (Crescent Moon: 10% chance to cut all alive monsters HP by 25%)
  if (!forceDeterministic && totalStats.staticFieldChance && Math.random() * 100 < totalStats.staticFieldChance) {
    monsterMap.forEach(mon => {
      if (mon.hp > 0) {
        const hpCut = Math.floor(mon.hp * 0.25);
        if (hpCut > 0) {
          mon.hp = Math.max(1, mon.hp - hpCut);
          accumulatedDamage += hpCut;
        }
      }
    });
  }

  const getEffectiveDefense = (def: number) => {
    if (totalStats.ignoreTargetDefense) return 0;
    let effective = def;
    if (totalStats.convictionAura) {
      effective = Math.floor(effective * 0.15); // Infinity: -85% Defense
    }
    if (totalStats.targetDefenseReduction) {
      effective = Math.floor(effective * (1 - totalStats.targetDefenseReduction / 100));
    }
    if (!forceDeterministic && totalStats.amplifyDamageChance && Math.random() * 100 < totalStats.amplifyDamageChance) {
      effective = 0; // Amplify Damage: 100% Armor Shred
    }
    if (skill.activeRuneId === 'rune_poison') {
      effective = Math.floor(effective * 0.5);
    }
    return Math.max(0, effective);
  };

  const applyFrostFreeze = (m: Monster) => {
    if (skill.activeRuneId === 'rune_frost') {
      if (!forceDeterministic) {
        if (Math.random() < 0.40) m.isFrozen = true;
      }
    }
  };

  const effectiveOverkillEff = skill.overkillEfficiency * (totalStats.overkillEfficiency / 100) * runeOverkillBonus;

  // Boss Interactive Mechanics: Stagger Break & Weak Spot & Guard
  const tjLevel = Math.min(10, passiveLevels['titan_juggernaut'] || 0);
  const titanStaggerBonus = 1 + tjLevel * 0.15;

  const applyBossMechanics = (m: Monster, rawDmg: number): number => {
    let dmg = rawDmg;
    if (m.rank === 'boss') {
      if (m.isGroggy) {
        dmg = Math.floor(dmg * 1.5);
      }
      // 🛡️ Boss Guard / Barrier Gimmick (70% damage reduction without mutating defense stat)
      if (m.isGuarding) {
        dmg = Math.max(1, Math.floor(dmg * 0.30));
      }
      if (m.bossWeakLane !== undefined && m.bossWeakLane === playerLane) {
        dmg = Math.floor(dmg * 2.5);
        weakSpotHitTriggered = true;
      }
      if (m.isChargingUltimate && (m.bossStaggerHp || 0) > 0) {
        const baseStagger = skill.id === 'shield_bash' ? Math.floor(dmg * 2.5) : dmg;
        const staggerPower = Math.floor(baseStagger * titanStaggerBonus);
        m.bossStaggerHp = Math.max(0, (m.bossStaggerHp || 0) - staggerPower);
        if (m.bossStaggerHp <= 0) {
          m.isChargingUltimate = false;
          m.isGroggy = true;
          m.bossStaggerHp = 0;
          bossBreakTriggered = true;
        }
      }
    }
    return Math.max(1, dmg);
  };

  const calculateHitDamage = (m: Monster, currentPayload: number): { actualDmg: number; defMultiplier: number } => {
    const effectiveDef = getEffectiveDefense(m.defense);
    const defMultiplier = calculateDamageMultiplier(attackerLevel, effectiveDef);
    
    // Demon / Elite / Boss Damage Multiplier (Laying of Hands +350% etc.)
    let demonMultiplier = 1.0;
    if (totalStats.damageToDemons && (m.rank === 'boss' || m.rank === 'elite')) {
      demonMultiplier += totalStats.damageToDemons / 100;
    }

    let rawHit = Math.floor(currentPayload * defMultiplier * demonMultiplier);

    // Crushing Blow (Guillaume, Gore Rider, Ber, Infinity, Last Wish, Death)
    if (!forceDeterministic && totalStats.crushingBlow && Math.random() * 100 < totalStats.crushingBlow) {
      const cbPercent = m.rank === 'boss' ? 0.10 : 0.25;
      const cbDamage = Math.max(1, Math.floor(m.hp * cbPercent));
      rawHit += cbDamage;
    }

    const actualDmg = applyBossMechanics(monsterMap.get(m.id)!, rawHit);
    return { actualDmg, defMultiplier };
  };

  if (skill.route === 'line') {
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    let currentPayload = initialRawPayload;

    laneMonsters.forEach((m, idx) => {
      if (currentPayload <= 0) return;

      const isOverkillHit = idx > 0;
      const { actualDmg, defMultiplier } = calculateHitDamage(m, currentPayload);
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
      accumulatedAppliedDamage += Math.min(actualDmg, m.hp);

      const updatedM = monsterMap.get(m.id)!;
      if (isFatal) {
        kills.push(m.id);
        updatedM.hp = 0;
        const requiredRawToKill = Math.ceil(m.hp / Math.max(0.01, defMultiplier));
        const rawOverkill = Math.max(0, currentPayload - requiredRawToKill);
        currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        applyFrostFreeze(updatedM);
        if (totalStats.knockback && updatedM.depth < 4 && updatedM.rank !== 'boss') {
          updatedM.depth += 1;
        }
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
        const { actualDmg, defMultiplier } = calculateHitDamage(m, currentPayload);
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
        accumulatedAppliedDamage += Math.min(actualDmg, m.hp);

        const updatedM = monsterMap.get(m.id)!;
        if (isFatal) {
          kills.push(m.id);
          updatedM.hp = 0;
          const requiredRawToKill = Math.ceil(m.hp / Math.max(0.01, defMultiplier));
          const rawOverkill = Math.max(0, currentPayload - requiredRawToKill);
          currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
          applyFrostFreeze(updatedM);
          if (totalStats.knockback && updatedM.depth < 4 && updatedM.rank !== 'boss') {
            updatedM.depth += 1;
          }
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
      let overkillCarryRaw = 0;

      if (laneMonsters.length > 0) {
        const m0 = laneMonsters[0];
        const { actualDmg, defMultiplier } = calculateHitDamage(m0, baseLanePayload);
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
        accumulatedAppliedDamage += Math.min(actualDmg, m0.hp);
        const updatedM0 = monsterMap.get(m0.id)!;
        if (isFatal) {
          kills.push(m0.id);
          updatedM0.hp = 0;
          const requiredRaw = Math.ceil(m0.hp / Math.max(0.01, defMultiplier));
          const rawOverkill = Math.max(0, baseLanePayload - requiredRaw);
          overkillCarryRaw = Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM0.hp = Math.max(1, updatedM0.hp - actualDmg);
          applyFrostFreeze(updatedM0);
          if (totalStats.knockback && updatedM0.depth < 4 && updatedM0.rank !== 'boss') {
            updatedM0.depth += 1;
          }
          if (m0.rank === 'elite' && !stopperId) stopperId = m0.id;
        }
      }

      if (laneMonsters.length > 1) {
        const m1 = laneMonsters[1];
        // FIX: second target in lane uses base + overkill carry intentionally (AoE splash + overflow).
        // Keep as designed but document: this is intentional unlike line/branch which use pure overkill.
        const payload1 = baseLanePayload + overkillCarryRaw;
        const { actualDmg, defMultiplier } = calculateHitDamage(m1, payload1);
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
        accumulatedAppliedDamage += Math.min(actualDmg, m1.hp);
        const updatedM1 = monsterMap.get(m1.id)!;
        if (isFatal) {
          kills.push(m1.id);
          updatedM1.hp = 0;
          const requiredRaw = Math.ceil(m1.hp / Math.max(0.01, defMultiplier));
          const rawOverkill = Math.max(0, payload1 - requiredRaw);
          overkillCarryRaw = Math.floor(rawOverkill * effectiveOverkillEff);
        } else {
          updatedM1.hp = Math.max(1, updatedM1.hp - actualDmg);
          applyFrostFreeze(updatedM1);
          if (totalStats.knockback && updatedM1.depth < 4 && updatedM1.rank !== 'boss') {
            updatedM1.depth += 1;
          }
          if (m1.rank === 'elite' && !stopperId) stopperId = m1.id;
          overkillCarryRaw = 0;
        }
      }

      if (overkillCarryRaw > 0 && laneMonsters.length > 2) {
        for (let idx = 2; idx < laneMonsters.length; idx++) {
          if (overkillCarryRaw <= 0) break;

          const mb = laneMonsters[idx];
          const { actualDmg, defMultiplier } = calculateHitDamage(mb, overkillCarryRaw);
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
          accumulatedAppliedDamage += Math.min(actualDmg, mb.hp);
          const updatedMb = monsterMap.get(mb.id)!;
          if (isFatal) {
            kills.push(mb.id);
            updatedMb.hp = 0;
            const requiredRaw = Math.ceil(mb.hp / Math.max(0.01, defMultiplier));
            const rawOverkill = Math.max(0, overkillCarryRaw - requiredRaw);
            overkillCarryRaw = Math.floor(rawOverkill * effectiveOverkillEff);
          } else {
            updatedMb.hp = Math.max(1, updatedMb.hp - actualDmg);
            applyFrostFreeze(updatedMb);
            if (totalStats.knockback && updatedMb.depth < 4 && updatedMb.rank !== 'boss') {
              updatedMb.depth += 1;
            }
            if (mb.rank === 'elite' && !stopperId) stopperId = mb.id;
            overkillCarryRaw = 0;
            break;
          }
        }
      }
    }
  } else if (skill.id === 'berserk') {
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    let targetIdx = 0;
    for (let hit = 0; hit < 3; hit++) {
      if (targetIdx >= laneMonsters.length) break;
      const target = laneMonsters[targetIdx];
      const updatedM = monsterMap.get(target.id)!;
      if (updatedM.hp <= 0) {
        targetIdx++;
        if (targetIdx >= laneMonsters.length) break;
      }

      const currentTarget = laneMonsters[targetIdx];
      const { actualDmg } = calculateHitDamage(currentTarget, initialRawPayload);
      const targetState = monsterMap.get(currentTarget.id)!;
      const isFatal = actualDmg >= targetState.hp;

      targetsHit.push({
        monsterId: currentTarget.id,
        damage: actualDmg,
        isFatal,
        depth: currentTarget.depth,
        lane: currentTarget.lane,
        isOverkillHit: false
      });

      accumulatedDamage += actualDmg;
      const damageToApply = Math.min(actualDmg, targetState.hp);
      accumulatedAppliedDamage += damageToApply;
      if (isFatal) {
        kills.push(currentTarget.id);
        targetState.hp = 0;
        targetIdx++;
      } else {
        targetState.hp = Math.max(1, targetState.hp - actualDmg);
        applyFrostFreeze(targetState);
        if (totalStats.knockback && targetState.depth < 4 && targetState.rank !== 'boss') {
          targetState.depth += 1;
        }
        if (currentTarget.rank === 'elite' && !stopperId) stopperId = currentTarget.id;
      }
    }
  } else if (skill.route === 'single') {
    const laneMonsters = monsters
      .filter(m => m.lane === playerLane && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    if (laneMonsters.length > 0) {
      const frontTarget = laneMonsters[0];
      const executeBonus = skill.id === 'execute' && frontTarget.hp < frontTarget.maxHp * 0.5 ? 1.6 : 1.0;
      const singlePayload = Math.floor(initialRawPayload * executeBonus);
      const { actualDmg, defMultiplier } = calculateHitDamage(frontTarget, singlePayload);
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
      accumulatedAppliedDamage += Math.min(actualDmg, frontTarget.hp);

      const updatedM = monsterMap.get(frontTarget.id)!;
      if (isFatal) {
        kills.push(frontTarget.id);
        updatedM.hp = 0;

        const requiredRawToKill = Math.ceil(frontTarget.hp / Math.max(0.01, defMultiplier));
        const rawOverkill = Math.max(0, singlePayload - requiredRawToKill);
        let currentPayload = Math.floor(rawOverkill * effectiveOverkillEff);

        for (let idx = 1; idx < laneMonsters.length; idx++) {
          if (currentPayload <= 0) break;

          const sm = laneMonsters[idx];
          const { actualDmg: smDmg, defMultiplier: smDefMult } = calculateHitDamage(sm, currentPayload);
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
          accumulatedAppliedDamage += Math.min(smDmg, sm.hp);
          const smUpdated = monsterMap.get(sm.id)!;
          if (isSmFatal) {
            kills.push(sm.id);
            smUpdated.hp = 0;
            const smRequiredRaw = Math.ceil(sm.hp / Math.max(0.01, smDefMult));
            const smRawOverkill = Math.max(0, currentPayload - smRequiredRaw);
            currentPayload = Math.floor(smRawOverkill * effectiveOverkillEff);
          } else {
            smUpdated.hp = Math.max(1, smUpdated.hp - smDmg);
            applyFrostFreeze(smUpdated);
            if (totalStats.knockback && smUpdated.depth < 4 && smUpdated.rank !== 'boss') {
              smUpdated.depth += 1;
            }
            if (sm.rank === 'elite' && !stopperId) stopperId = sm.id;
            currentPayload = 0;
            break;
          }
        }
      } else {
        updatedM.hp = Math.max(1, updatedM.hp - actualDmg);
        applyFrostFreeze(updatedM);
        if (totalStats.knockback && updatedM.depth < 4 && updatedM.rank !== 'boss') {
          updatedM.depth += 1;
        }
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
    appliedDamage: accumulatedAppliedDamage,
    isCritical,
    isExtraStrike,
    isBossBreak: bossBreakTriggered,
    isWeakSpotHit: weakSpotHitTriggered,
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
      ? activeMonsters.some(m => Math.abs(m.lane - lane) <= 2 && m.depth <= 1)
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

export { createDungeonFormation } from '../data/dungeons';
