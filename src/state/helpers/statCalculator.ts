import { PlayerStats, GameItem, DungeonBuff, ItemStats } from '../../types/game';
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
  activeSetBonuses: { setName: string; count: number; description: string }[];
}

export function calculateTotalStats(
  playerStats: PlayerStats,
  equipment: Record<string, GameItem>,
  tempBuffs: TempBuffs,
  dungeonBuffs: DungeonBuff[]
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
          if (bonus.fortune) fortune += bonus.fortune;
        }
      });
    }

    if (item.subAffixes) {
      item.subAffixes.forEach(affix => {
        if (affix.id.includes('crit')) critChance += affix.value;
        if (affix.id.includes('overkill')) overkillEfficiency += affix.value;
        if (affix.id.includes('str')) str += affix.value;
        if (affix.id.includes('dex')) dex += affix.value;
        if (affix.id.includes('life')) lifeSteal += affix.value;
        if (affix.id.includes('fortune')) fortune += affix.value;
        if (affix.id.includes('atk_spd') || affix.id.includes('speed')) attackSpeed += affix.value;
        if (affix.id.includes('allResist') || affix.id.includes('resist')) allResist += affix.value;
      });
    }
  });

  const equippedSetCounts: Record<string, number> = {};
  Object.values(equipment).forEach(item => {
    if (item && item.setName) {
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

  const speedAtbBonus = Math.floor(attackSpeed * 0.25);
  const finalAtb = Math.min(85, Math.max(baseAtbPercent, baseAtbPercent + speedAtbBonus));

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
    critChance: Math.min(100, Math.floor(critChance)),
    critDamage: Math.floor(critDamage),
    overkillEfficiency: Math.floor(overkillEfficiency),
    fortune: Math.floor(fortune),
    allResist: Math.min(75, Math.floor(allResist)),
    lifeSteal: Math.floor(lifeSteal),
    attackSpeed: Math.floor(attackSpeed),
    turnRageRegen,
    rageCostReduction,
    baseAtbPercent: finalAtb,
    activeSetBonuses
  };
}
