import { PlayerStats, GameItem, DungeonBuff } from '../../types/game';
import { D2_RUNES } from '../../data/runes';
import { SET_DEFINITIONS } from '../../data/setItems';

export interface TempBuffs {
  defenseBonus: number;
  overkillBonus: number;
}

export interface CalculatedTotalStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  minDmg: number;
  maxDmg: number;
  defense: number;
  evasion: number;
  damageReduction: number;
  critChance: number;
  critDamage: number;
  overkillEfficiency: number;
  fortune: number;
  allResist: number;
  lifeSteal: number;
  attackSpeed: number;
  turnRageRegen: number;
  rageCostReduction: number;
  baseAtbPercent: number;
  runeBonusHp: number;
  totalBonusHp: number;
  activeSetBonuses: { setName: string; count: number; description: string }[];
}

export function calculateTotalStats(
  playerStats: PlayerStats,
  equipment: Record<string, GameItem>,
  tempBuffs: TempBuffs,
  dungeonBuffs: DungeonBuff[],
  passiveLevels: Record<string, number> = {}
): CalculatedTotalStats {
  let str = playerStats.str;
  let dex = playerStats.dex;
  let con = playerStats.con;
  let int = playerStats.int;
  let wis = playerStats.wis;
  let cha = playerStats.cha;

  let minDmg = 5;
  let maxDmg = 10;
  let defense = con * 1.5 + tempBuffs.defenseBonus;
  let evasion = Math.min(75, Math.floor(dex * 0.25));
  let damageReduction = 0;
  let critChance = 10 + dex * 0.25;
  let critDamage = 150;
  let overkillEfficiency = 100 + tempBuffs.overkillBonus;
  let fortune = cha * 1.2;
  let lifeSteal = 0;
  let attackSpeed = 0;
  let turnRageRegen = 0;
  let rageCostReduction = 0;
  let baseAtbPercent = 50;
  let allResist = 0;
  let runeBonusHp = 0;
  let totalBonusHp = 0;

  const equippedSetCounts: Record<string, number> = {};

  Object.values(equipment).forEach(item => {
    if (!item) return;
    if (item.stats.str) str += item.stats.str;
    if (item.stats.dex) dex += item.stats.dex;
    if (item.stats.con) con += item.stats.con;
    if (item.stats.int) int += item.stats.int;
    if (item.stats.wis) wis += item.stats.wis;
    if (item.stats.cha) cha += item.stats.cha;
    if (item.stats.minDmg) minDmg += item.stats.minDmg;
    if (item.stats.maxDmg) maxDmg += item.stats.maxDmg;
    if (item.stats.defense) defense += item.stats.defense;
    if (item.stats.evasion) evasion = Math.min(75, evasion + item.stats.evasion);
    if (item.stats.damageReduction) damageReduction = Math.min(50, damageReduction + item.stats.damageReduction);
    if (item.stats.critChance) critChance += item.stats.critChance;
    if (item.stats.critDamage) critDamage += item.stats.critDamage;
    if (item.stats.overkillEfficiency) overkillEfficiency += item.stats.overkillEfficiency;
    if (item.stats.fortune) fortune += item.stats.fortune;
    if (item.stats.lifeSteal) lifeSteal += item.stats.lifeSteal;
    if (item.stats.attackSpeed) attackSpeed += item.stats.attackSpeed;
    if (item.stats.allResist) allResist += item.stats.allResist;
    if (item.stats.hp) totalBonusHp += item.stats.hp;
    if (item.stats.shield) defense += Math.floor(item.stats.shield * 0.5);

    if (item.slot === 'weapon' && item.baseAtbPercent) {
      baseAtbPercent = item.baseAtbPercent;
    }

    if (item.isRuneWord && item.specialEffect) {
      if (item.specialEffect.includes('명상 오라') || item.specialEffect.includes('분노 +20')) {
        turnRageRegen += 20;
        rageCostReduction += 25;
      }
      if (item.specialEffect.includes('분노 재생 +15%')) {
        turnRageRegen += 5;
      }
    }

    if (item.socketedRunes && !item.isRuneWord) {
      item.socketedRunes.forEach(runeKey => {
        const rDef = D2_RUNES[runeKey];
        if (rDef) {
          const isWpn = item.slot === 'weapon';
          const bonus = isWpn ? rDef.statsWeapon : rDef.statsArmor;
          if (bonus.minDmg) minDmg += bonus.minDmg;
          if (bonus.maxDmg) maxDmg += bonus.maxDmg;
          if (bonus.defense) defense += bonus.defense;
          if (bonus.lifeSteal) lifeSteal += bonus.lifeSteal;
          if (bonus.overkillEfficiency) overkillEfficiency += bonus.overkillEfficiency;
          if (bonus.attackSpeed) attackSpeed += bonus.attackSpeed;
          if (bonus.dex) dex += bonus.dex;
          if (bonus.str) str += bonus.str;
          if (bonus.con) con += bonus.con;
          if (bonus.int) int += bonus.int;
          if (bonus.wis) wis += bonus.wis;
          if (bonus.hp) { runeBonusHp += bonus.hp; totalBonusHp += bonus.hp; }
          if (bonus.fortune) fortune += bonus.fortune;
          if (bonus.allResist) allResist += bonus.allResist;
          if (bonus.critChance) critChance += bonus.critChance;
          if (bonus.critDamage) critDamage += bonus.critDamage;
          if (bonus.evasion) evasion = Math.min(75, evasion + bonus.evasion);
        }
      });
    }

    if (item.setName) {
      equippedSetCounts[item.setName] = (equippedSetCounts[item.setName] || 0) + 1;
    }
  });

  const activeSetBonuses: { setName: string; count: number; description: string }[] = [];
  Object.entries(equippedSetCounts).forEach(([setName, count]) => {
    const setDef = SET_DEFINITIONS[setName];
    if (!setDef) return;

    setDef.bonuses.forEach(b => {
      if (count >= b.piecesRequired) {
        activeSetBonuses.push({
          setName,
          count,
          description: '(' + b.piecesRequired + '세트) ' + b.description
        });
        if (b.stats.str) str += b.stats.str;
        if (b.stats.dex) dex += b.stats.dex;
        if (b.stats.con) con += b.stats.con;
        if (b.stats.defense) defense += b.stats.defense;
        if (b.stats.attackSpeed) attackSpeed += b.stats.attackSpeed;
        if (b.stats.lifeSteal) lifeSteal += b.stats.lifeSteal;
        if (b.stats.allResist) allResist += b.stats.allResist;
        if (b.stats.evasion) evasion = Math.min(75, evasion + b.stats.evasion);
        if (b.stats.damageReduction) damageReduction = Math.min(50, damageReduction + b.stats.damageReduction);
        if (b.stats.critChance) critChance += b.stats.critChance;
        if (b.stats.hp) totalBonusHp += b.stats.hp;
        if (b.stats.overkillEfficiency) overkillEfficiency += b.stats.overkillEfficiency;
      }
    });
  });

  dungeonBuffs.forEach(b => {
    if (b.type === 'fortune') fortune += b.value;
    if (b.type === 'crit') critChance += b.value;
    if (b.type === 'defense') {
      defense += b.value;
      damageReduction = Math.min(50, damageReduction + 10);
    }
    if (b.type === 'damage') {
      minDmg += b.value;
      maxDmg += b.value * 1.5;
    }
  });

  minDmg += Math.floor(str * 1.5);
  maxDmg += Math.floor(str * 2.0);

  // 🧬 WARRIOR PASSIVE SKILLS BONUSES
  const wmLevel = passiveLevels['weapon_mastery'] || 0;
  if (wmLevel > 0) {
    const wmMult = 1 + wmLevel * 0.04;
    minDmg = Math.floor(minDmg * wmMult);
    maxDmg = Math.floor(maxDmg * wmMult);
  }

  const isLevel = passiveLevels['iron_skin'] || 0;
  if (isLevel > 0) {
    defense = Math.floor(defense * (1 + isLevel * 0.05));
    damageReduction = Math.min(50, damageReduction + isLevel * 1);
  }

  const dsLevel = passiveLevels['deadly_strike'] || 0;
  if (dsLevel > 0) {
    critChance += dsLevel * 1.5;
    critDamage += dsLevel * 5;
  }

  const btLevel = passiveLevels['bloodthirst'] || 0;
  if (btLevel > 0) {
    lifeSteal += btLevel * 1;
  }

  const brLevel = passiveLevels['berserker_rage'] || 0;
  if (brLevel > 0) {
    turnRageRegen += brLevel * 2;
  }

  const ocLevel = passiveLevels['overkill_crusher'] || 0;
  if (ocLevel > 0) {
    overkillEfficiency += ocLevel * 4;
    const ocMult = 1 + ocLevel * 0.03;
    minDmg = Math.floor(minDmg * ocMult);
    maxDmg = Math.floor(maxDmg * ocMult);
  }

  const eaLevel = passiveLevels['elemental_attunement'] || 0;
  if (eaLevel > 0) {
    allResist += eaLevel * 2;
  }

  const tjLevel = passiveLevels['titan_juggernaut'] || 0;
  if (tjLevel > 0) {
    runeBonusHp += Math.floor((playerStats.maxHp || 100) * (tjLevel * 0.05));
  }

  // Attack Speed = Cast Rate: reduces skill Rage cost by up to 35%
  const speedRageReduction = Math.min(35, Math.floor(attackSpeed * 0.30));
  const finalRageCostReduction = Math.min(60, rageCostReduction + speedRageReduction);

  const speedAtbBonus = Math.floor(attackSpeed * 0.25);
  const finalAtb = Math.min(85, Math.max(baseAtbPercent, baseAtbPercent + speedAtbBonus));

  allResist = Math.min(75, allResist + Math.floor((int + wis) * 0.35));

  return {
    str,
    dex,
    con,
    int,
    wis,
    cha,
    minDmg,
    maxDmg,
    defense: Math.floor(defense),
    evasion,
    damageReduction,
    critChance: Number(critChance.toFixed(1)),
    critDamage: Math.floor(critDamage),
    overkillEfficiency: Math.floor(overkillEfficiency),
    fortune: Math.floor(fortune),
    allResist: Math.floor(allResist),
    lifeSteal: Math.floor(lifeSteal),
    attackSpeed: Math.floor(attackSpeed),
    turnRageRegen: Math.floor(turnRageRegen),
    rageCostReduction: Math.floor(finalRageCostReduction),
    baseAtbPercent: finalAtb,
    runeBonusHp: Math.floor(runeBonusHp),
    totalBonusHp,
    activeSetBonuses
  };
}
