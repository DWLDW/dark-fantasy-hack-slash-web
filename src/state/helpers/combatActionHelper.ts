import { Monster, Skill, ConsumableItem } from '../../types/game';
import { AttackResolution } from '../../combat/combatEngine';

export interface AttackGainsResult {
  gainedGold: number;
  actionExp: number;
  totalRageGained: number;
  hitRage: number;
  voidKillRage: number;
  totalHpHealed: number;
  skillHeal: number;
  voidHeal: number;
  bossKillsThisHit: number;
  primaryTargetCount: number;
  shieldGained?: number;
}

export function calculateAttackGains(
  result: AttackResolution,
  effectiveSkill: Skill,
  monsters: Monster[],
  playerMaxHp: number = 120,
  totalDefense: number = 0,
  itemLifeSteal: number = 0
): AttackGainsResult {
  const primaryTargets = result.targetsHit.filter(t => !t.isOverkillHit);
  const rageHitCap = effectiveSkill.id === 'war_cry' ? 3 : primaryTargets.length;
  const hitRage = Math.min(primaryTargets.length, rageHitCap) * (effectiveSkill.rageGainPerHit || 0);
  const voidKillRage = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 2 : 0;
  const rawRageGained = hitRage + voidKillRage;

  const totalRageGained = effectiveSkill.activeRuneId === 'rune_void'
    ? Math.ceil(rawRageGained * 1.20)
    : rawRageGained;

  const effectiveDamageForHeal = Math.max(result.appliedDamage, Math.min(result.totalDamage, result.appliedDamage * 1.5));
  const skillHeal = effectiveSkill.lifeStealPercent
    ? Math.floor(effectiveDamageForHeal * (effectiveSkill.lifeStealPercent / 100))
    : 0;
  const itemHeal = itemLifeSteal > 0
    ? Math.floor(effectiveDamageForHeal * (itemLifeSteal / 100))
    : 0;
  const voidHeal = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 25 : 0;
  const totalHpHealed = skillHeal + itemHeal + voidHeal;

  // Shield Bash generated shield (25% max HP + 60% defense)
  const shieldGained = effectiveSkill.id === 'shield_bash'
    ? Math.floor(playerMaxHp * 0.25 + totalDefense * 0.6)
    : 0;

  const gainedGold = result.chainCount * 25 + (result.stopperId ? 100 : 0);

  let actionExp = 0;
  result.kills.forEach(kId => {
    const m = monsters.find(mon => mon.id === kId);
    if (m) {
      const isElite = m.rank === 'elite';
      const baseMExp = Math.max(1, Math.floor(m.maxHp * 0.08));
      actionExp += isElite ? baseMExp * 4 : baseMExp;
    }
  });

  const bossKillsThisHit = monsters.filter(m => result.kills.includes(m.id) && m.rank === 'boss').length;

  return {
    gainedGold,
    actionExp,
    totalRageGained,
    hitRage,
    voidKillRage,
    totalHpHealed,
    skillHeal,
    voidHeal,
    bossKillsThisHit,
    primaryTargetCount: primaryTargets.length,
    shieldGained
  };
}

export function compressLaneSurvivors(newMonsters: Monster[]): Monster[] {
  const survivors: Monster[] = [];
  for (let l = 0; l < 5; l++) {
    const laneSurvivors = newMonsters
      .filter(m => m.lane === l && m.hp > 0)
      .sort((a, b) => a.depth - b.depth);

    laneSurvivors.forEach((m, idx) => {
      survivors.push({ ...m, depth: idx });
    });
  }
  return survivors;
}

export interface HordeAttackResult {
  totalEnemyDamage: number;
  absorbedDamage: number;
  nextShield: number;
  nextShieldLayers: { amount: number; turns: number }[];
  dodgedCount: number;
  frozenCount: number;
  activeAttackerCount: number;
  nextHp: number;
  rageGainOnHit: number;
  potionUsed: boolean;
  autoResurrected: boolean;
  isDead: boolean;
  newConsumables: ConsumableItem[];
  chargedSurvivors: Monster[];
  chargedStrikes: number;
}

export function resolveHordeCounterAttack(
  survivors: Monster[],
  playerLevel: number,
  playerHp: number,
  playerMaxHp: number,
  playerRage: number,
  playerMaxRage: number,
  evasion: number,
  defense: number,
  damageReduction: number,
  allResist: number = 0,
  consumables: ConsumableItem[],
  shieldLayers: { amount: number; turns: number }[] = []
): HordeAttackResult {
  const frontRowAttackers: Monster[] = [];
  for (let l = 0; l < 5; l++) {
    const laneAlive = survivors.filter(m => m.lane === l && m.hp > 0).sort((a, b) => a.depth - b.depth);
    if (laneAlive.length > 0) {
      frontRowAttackers.push(laneAlive[0]);
    }
  }

  const activeAttackers = frontRowAttackers.filter(m => !m.isFrozen);
  const frozenCount = frontRowAttackers.filter(m => m.isFrozen).length;

  let totalEnemyDamage = 0;
  let dodgedCount = 0;
  let chargedStrikes = 0;

  activeAttackers.forEach(m => {
    const isDodged = Math.random() * 100 < (evasion || 0);
    if (isDodged) {
      dodgedCount++;
      return;
    }

    const isElite = m.rank === 'elite' || m.rank === 'boss';
    let rawDmg = m.intent.damage || (isElite ? 8 : 3);
    // Fully charged monsters unleash a piercing strike
    const isCharged = (m.intent.chargePercent || 0) >= 100;
    if (m.rank === 'boss' && m.maxHp > 0 && m.hp / m.maxHp <= 0.3) {
      rawDmg = Math.floor(rawDmg * 1.5);
    }
    if (isCharged) {
      rawDmg = Math.floor(rawDmg * 2);
      chargedStrikes++;
    }
    const effectiveDefense = isCharged ? Math.floor(defense / 2) : defense;
    const k = 100 + playerLevel * 10;
    const defMult = k / (k + Math.max(0, effectiveDefense));
    const resistMult = 1 - Math.min(75, Math.max(0, allResist || 0)) / 100;
    const drMult = ((100 - (damageReduction || 0)) / 100) * resistMult;
    totalEnemyDamage += Math.max(1, Math.floor(rawDmg * defMult * drMult));
  });

  // Shield damage absorption (layered, oldest layer absorbs first)
  let absorbedDamage = 0;
  let dmgToHp = totalEnemyDamage;

  const layers = (shieldLayers || []).map(l => ({ ...l })).filter(l => l.amount > 0 && l.turns > 0);

  if (layers.length > 0 && totalEnemyDamage > 0) {
    let remaining = totalEnemyDamage;
    while (remaining > 0 && layers.length > 0) {
      const oldest = layers[0];
      const used = Math.min(oldest.amount, remaining);
      oldest.amount -= used;
      remaining -= used;
      if (oldest.amount <= 0) layers.shift();
    }
    absorbedDamage = totalEnemyDamage - remaining;
    dmgToHp = remaining;
  }

  // Duration ticks down AFTER this turn's absorption. A layer added during the player's turn
  // arrives with its full duration and only starts ticking after it has served its first defense.
  layers.forEach(l => { l.turns -= 1; });
  const survivingLayers = layers.filter(l => l.amount > 0 && l.turns > 0);
  const nextShield = survivingLayers.reduce((sum, l) => sum + l.amount, 0);

  let nextHp = playerHp - dmgToHp;
  const hpPotion = consumables.find(c => c.id === 'c_hp');
  let potionUsed = false;
  let autoResurrected = false;

  if (dmgToHp > 0) {
    if (nextHp <= 0) {
      if (hpPotion && hpPotion.count > 0) {
        potionUsed = true;
        autoResurrected = true;
        nextHp = Math.min(playerMaxHp, 80 + Math.floor(playerMaxHp * 0.3));
      }
    }
  }

  const newConsumables = potionUsed
    ? consumables.map(c => c.id === 'c_hp' ? { ...c, count: Math.max(0, c.count - 1) } : c)
    : consumables;

  const isDead = nextHp <= 0;
  const rageGainOnHit = isDead ? 0 : Math.min(15, Math.max(4, Math.floor(totalEnemyDamage * 0.8)));

  // Charge tick: surviving front-row monsters build toward their next strike (+25 per turn).
  const chargedSurvivors = survivors.map(m => {
    if (m.hp <= 0 || m.isFrozen) return { ...m, intent: { ...m.intent, chargePercent: 0 } };
    const laneAlive = survivors.filter(s => s.lane === m.lane && s.hp > 0).sort((a, b) => a.depth - b.depth);
    if (laneAlive[0]?.id !== m.id) return { ...m }; // only front-row charges
    const next = Math.min(100, (m.intent.chargePercent || 50) + 25);
    return { ...m, intent: { ...m.intent, chargePercent: next } };
  });

  return {
    totalEnemyDamage,
    absorbedDamage,
    nextShield,
    nextShieldLayers: survivingLayers,
    dodgedCount,
    frozenCount,
    activeAttackerCount: activeAttackers.length,
    nextHp: isDead ? 0 : nextHp,
    rageGainOnHit,
    potionUsed,
    autoResurrected,
    isDead,
    newConsumables,
    chargedSurvivors,
    chargedStrikes
  };
}
