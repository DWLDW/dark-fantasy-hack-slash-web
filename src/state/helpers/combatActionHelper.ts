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
  totalDefense: number = 0
): AttackGainsResult {
  const primaryTargets = result.targetsHit.filter(t => !t.isOverkillHit);
  const hitRage = primaryTargets.length * (effectiveSkill.rageGainPerHit || 0);
  const voidKillRage = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 2 : 0;
  const rawRageGained = hitRage + voidKillRage;

  const totalRageGained = effectiveSkill.activeRuneId === 'rune_void'
    ? Math.ceil(rawRageGained * 1.20)
    : rawRageGained;

  const skillHeal = effectiveSkill.lifeStealPercent
    ? Math.floor(result.totalDamage * (effectiveSkill.lifeStealPercent / 100))
    : 0;
  const voidHeal = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 25 : 0;
  const totalHpHealed = skillHeal + voidHeal;

  // Shield Bash generated shield
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
  dodgedCount: number;
  frozenCount: number;
  activeAttackerCount: number;
  nextHp: number;
  rageGainOnHit: number;
  potionUsed: boolean;
  autoResurrected: boolean;
  isDead: boolean;
  newConsumables: ConsumableItem[];
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
  consumables: ConsumableItem[],
  playerShield: number = 0
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

  activeAttackers.forEach(m => {
    const isDodged = Math.random() * 100 < (evasion || 0);
    if (isDodged) {
      dodgedCount++;
      return;
    }

    const isElite = m.rank === 'elite' || m.rank === 'boss';
    let rawDmg = m.intent.damage || (isElite ? 8 : 3);
    if (m.rank === 'boss' && m.maxHp > 0 && m.hp / m.maxHp <= 0.3) {
      rawDmg = Math.floor(rawDmg * 1.5);
    }
    const k = 100 + playerLevel * 10;
    const defMult = k / (k + Math.max(0, defense));
    const drMult = (100 - (damageReduction || 0)) / 100;
    totalEnemyDamage += Math.max(1, Math.floor(rawDmg * defMult * drMult));
  });

  // Shield damage absorption
  let absorbedDamage = 0;
  let nextShield = Math.max(0, playerShield || 0);
  let dmgToHp = totalEnemyDamage;

  if (nextShield > 0 && totalEnemyDamage > 0) {
    absorbedDamage = Math.min(nextShield, totalEnemyDamage);
    nextShield -= absorbedDamage;
    dmgToHp = totalEnemyDamage - absorbedDamage;
  }

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

  return {
    totalEnemyDamage,
    absorbedDamage,
    nextShield,
    dodgedCount,
    frozenCount,
    activeAttackerCount: activeAttackers.length,
    nextHp: isDead ? 0 : nextHp,
    rageGainOnHit,
    potionUsed,
    autoResurrected,
    isDead,
    newConsumables
  };
}
