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
  goldFind: number;
  allSkills: number;
  allResist: number;
  lifeSteal: number;
  attackSpeed: number;
  turnRageRegen: number;
  rageCostReduction: number;
  baseAtbPercent: number;
  runeBonusHp: number;
  totalBonusHp: number;
  activeSetBonuses: { setName: string; count: number; description: string }[];
  // 🌟 Special Mechanics
  enhancedDamage: number;
  crushingBlow: number;
  openWounds: number;
  ignoreTargetDefense: boolean;
  targetDefenseReduction: number;
  convictionAura: boolean;
  redemptionOnKill: boolean;
  mightAura: boolean;
  chillingArmor: boolean;
  staticFieldChance: number;
  amplifyDamageChance: number;
  lifeTapChance: number;
  cannotBeFrozen: boolean;
  damageToDemons: number;
  knockback: boolean;
}

export function calculateTotalStats(
  playerStats: PlayerStats,
  equipment: Record<string, GameItem>,
  tempBuffs: TempBuffs,
  dungeonBuffs: DungeonBuff[] = [],
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
  let goldFind = 0;
  let allSkills = 0;
  let lifeSteal = 0;
  let attackSpeed = 0;
  let turnRageRegen = 0;
  let rageCostReduction = 0;
  let baseAtbPercent = 50;
  let allResist = 0;
  let runeBonusHp = 0;
  let totalBonusHp = 0;

  // 🌟 Special Mechanics Accumulators
  let offWeaponEd = 0;
  let crushingBlow = 0;
  let openWounds = 0;
  let ignoreTargetDefense = false;
  let targetDefenseReduction = 0;
  let convictionAura = false;
  let redemptionOnKill = false;
  let mightAura = false;
  let chillingArmor = false;
  let staticFieldChance = 0;
  let amplifyDamageChance = 0;
  let lifeTapChance = 0;
  let cannotBeFrozen = false;
  let damageToDemons = 0;
  let knockback = false;

  const equippedSetCounts: Record<string, number> = {};

  Object.values(equipment).forEach(item => {
    if (!item) return;

    // 1. Direct Stats Object Accumulation
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
    if (item.stats.goldFind) goldFind += item.stats.goldFind;
    if (item.stats.allSkills) allSkills += item.stats.allSkills;
    if (item.stats.lifeSteal) lifeSteal += item.stats.lifeSteal;
    if (item.stats.attackSpeed) attackSpeed += item.stats.attackSpeed;
    if (item.stats.allResist) allResist += item.stats.allResist;
    if (item.stats.hp) totalBonusHp += item.stats.hp;
    if (item.stats.shield) defense += Math.floor(item.stats.shield * 0.5);

    // Special stats directly in item.stats
    if (item.stats.enhancedDamage && item.slot !== 'weapon') offWeaponEd += item.stats.enhancedDamage;
    if (item.stats.crushingBlow) crushingBlow += item.stats.crushingBlow;
    if (item.stats.openWounds) openWounds += item.stats.openWounds;
    if (item.stats.ignoreTargetDefense) ignoreTargetDefense = true;
    if (item.stats.targetDefenseReduction) targetDefenseReduction = Math.max(targetDefenseReduction, item.stats.targetDefenseReduction);
    if (item.stats.convictionAura) { convictionAura = true; targetDefenseReduction = Math.max(targetDefenseReduction, 85); }
    if (item.stats.redemptionOnKill) redemptionOnKill = true;
    if (item.stats.mightAura) { mightAura = true; offWeaponEd += 200; }
    if (item.stats.chillingArmor) chillingArmor = true;
    if (item.stats.staticFieldChance) staticFieldChance += item.stats.staticFieldChance;
    if (item.stats.amplifyDamageChance) amplifyDamageChance += item.stats.amplifyDamageChance;
    if (item.stats.lifeTapChance) lifeTapChance += item.stats.lifeTapChance;
    if (item.stats.cannotBeFrozen) cannotBeFrozen = true;
    if (item.stats.damageToDemons) damageToDemons += item.stats.damageToDemons;
    if (item.stats.knockback) knockback = true;

    if (item.slot === 'weapon' && item.baseAtbPercent) {
      baseAtbPercent = item.baseAtbPercent;
    }

    // 2. Special Effects Parsing (Unique & RuneWord Unified)
    const eff = item.specialEffect || '';
    if (eff) {
      if (eff.includes('명상 오라') || eff.includes('분노 +20')) {
        turnRageRegen += 20;
        rageCostReduction += 25;
      }
      if (eff.includes('분노 재생') || eff.includes('마나 재생')) {
        turnRageRegen += 5;
      }
      if (eff.includes('빙결되지 않음') || eff.includes('빙결 방지') || eff.includes('Cannot be Frozen')) {
        cannotBeFrozen = true;
      }
      if (eff.includes('적 방어력 완전 무시') || eff.includes('방어력 무시')) {
        ignoreTargetDefense = true;
      }
      if (eff.includes('구원의 오라')) redemptionOnKill = true;
      if (eff.includes('선고 오라')) { convictionAura = true; targetDefenseReduction = Math.max(targetDefenseReduction, 85); }
      if (eff.includes('위세 오라')) { mightAura = true; offWeaponEd += 200; }
      if (eff.includes('칠흑 갑주')) chillingArmor = true;
      if (eff.includes('스태틱 필드')) staticFieldChance = Math.max(staticFieldChance, 10);
      if (eff.includes('피해 증폭') || eff.includes('Amplify Damage')) amplifyDamageChance = Math.max(amplifyDamageChance, 5);
      if (eff.includes('생명력 추출') || eff.includes('Life Tap')) lifeTapChance = Math.max(lifeTapChance, 5);
      if (eff.includes('밀쳐내기') || eff.includes('Knockback')) knockback = true;

      // Regex matching for numeric values in specialEffect
      const cbMatch = eff.match(/강타\s*(\d+)%/);
      if (cbMatch) crushingBlow += parseInt(cbMatch[1]);

      const demonMatch = eff.match(/악마에\s*대한\s*피해\s*\+(\d+)%/);
      if (demonMatch) damageToDemons += parseInt(demonMatch[1]);

      const edMatch = eff.match(/물리\s*피해량?\s*\+(\d+)%\s*증폭/);
      if (edMatch && item.slot !== 'weapon') offWeaponEd += parseInt(edMatch[1]);

      // Level Scaling Stats
      if (eff.includes('레벨 비례 최대 공격력') || eff.includes('레벨 비례 극강 최대 피해량') || eff.includes('레벨 비례 치명적 공격')) {
        maxDmg += Math.floor(playerStats.level * 2.5);
        critChance += Math.min(25, playerStats.level * 0.3);
      }
      if (eff.includes('레벨 비례 최대 생명력') || eff.includes('레벨 비례 HP')) {
        totalBonusHp += Math.floor(playerStats.level * 2.0);
      }
    }

    // 3. Socketed Runes Processing (Non-RuneWord Only)
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
          if (bonus.goldFind) goldFind += bonus.goldFind;
          if (bonus.allSkills) allSkills += bonus.allSkills;
          if (bonus.allResist) allResist += bonus.allResist;
          if (bonus.critChance) critChance += bonus.critChance;
          if (bonus.critDamage) critDamage += bonus.critDamage;
          if (bonus.evasion) evasion = Math.min(75, evasion + bonus.evasion);
          if (bonus.damageReduction) damageReduction = Math.min(50, damageReduction + bonus.damageReduction);
          if (bonus.turnRageRegen) turnRageRegen += bonus.turnRageRegen;
          if (bonus.rageCostReduction) rageCostReduction += bonus.rageCostReduction;
          if (bonus.crushingBlow) crushingBlow += bonus.crushingBlow;
          if (bonus.openWounds) openWounds += bonus.openWounds;
          if (bonus.ignoreTargetDefense) ignoreTargetDefense = true;
          if (bonus.targetDefenseReduction) targetDefenseReduction = Math.max(targetDefenseReduction, bonus.targetDefenseReduction);
          if (bonus.cannotBeFrozen) cannotBeFrozen = true;
          if (bonus.damageToDemons) damageToDemons += bonus.damageToDemons;
        }
      });
    }

    if (item.setName) {
      equippedSetCounts[item.setName] = (equippedSetCounts[item.setName] || 0) + 1;
    }
  });

  // 4. Set Bonuses Accumulation
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
        if (b.stats.int) int += b.stats.int;
        if (b.stats.wis) wis += b.stats.wis;
        if (b.stats.cha) cha += b.stats.cha;
        if (b.stats.minDmg) minDmg += b.stats.minDmg;
        if (b.stats.maxDmg) maxDmg += b.stats.maxDmg;
        if (b.stats.defense) defense += b.stats.defense;
        if (b.stats.attackSpeed) attackSpeed += b.stats.attackSpeed;
        if (b.stats.lifeSteal) lifeSteal += b.stats.lifeSteal;
        if (b.stats.allResist) allResist += b.stats.allResist;
        if (b.stats.evasion) evasion = Math.min(75, evasion + b.stats.evasion);
        if (b.stats.damageReduction) damageReduction = Math.min(50, damageReduction + b.stats.damageReduction);
        if (b.stats.critChance) critChance += b.stats.critChance;
        if (b.stats.critDamage) critDamage += b.stats.critDamage;
        if (b.stats.fortune) fortune += b.stats.fortune;
        if (b.stats.goldFind) goldFind += b.stats.goldFind;
        if (b.stats.allSkills) allSkills += b.stats.allSkills;
        if (b.stats.hp) totalBonusHp += b.stats.hp;
        if (b.stats.overkillEfficiency) overkillEfficiency += b.stats.overkillEfficiency;
      }
    });
  });

  // 5. Dungeon Buffs
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

  // 6. Base Stat Scaling
  minDmg += Math.floor(str * 1.5);
  maxDmg += Math.floor(str * 2.0);

  // 7. Off-Weapon Enhanced Damage Amplification
  if (offWeaponEd > 0) {
    const edMult = 1 + offWeaponEd / 100;
    minDmg = Math.floor(minDmg * edMult);
    maxDmg = Math.floor(maxDmg * edMult);
  }

  // 8. Warrior Passive Skills Bonuses (Max Level 10)
  const wmLevel = Math.min(10, passiveLevels['weapon_mastery'] || 0);
  if (wmLevel > 0) {
    const wmMult = 1 + wmLevel * 0.06;
    minDmg = Math.floor(minDmg * wmMult);
    maxDmg = Math.floor(maxDmg * wmMult);
  }

  const isLevel = Math.min(10, passiveLevels['iron_skin'] || 0);
  if (isLevel > 0) {
    defense = Math.floor(defense * (1 + isLevel * 0.08));
    damageReduction = Math.min(50, damageReduction + isLevel * 1.5);
  }

  const dsLevel = Math.min(10, passiveLevels['deadly_strike'] || 0);
  if (dsLevel > 0) {
    critChance += dsLevel * 2.5;
    critDamage += dsLevel * 8;
  }

  const btLevel = Math.min(10, passiveLevels['bloodthirst'] || 0);
  if (btLevel > 0) {
    lifeSteal += btLevel * 0.6;
  }

  const brLevel = Math.min(10, passiveLevels['berserker_rage'] || 0);
  if (brLevel > 0) {
    turnRageRegen += brLevel * 1;
  }

  const ocLevel = Math.min(10, passiveLevels['overkill_crusher'] || 0);
  if (ocLevel > 0) {
    overkillEfficiency += ocLevel * 6;
    const ocMult = 1 + ocLevel * 0.05;
    minDmg = Math.floor(minDmg * ocMult);
    maxDmg = Math.floor(maxDmg * ocMult);
  }

  const eaLevel = Math.min(10, passiveLevels['elemental_attunement'] || 0);
  if (eaLevel > 0) {
    allResist += eaLevel * 3;
  }

  const tjLevel = Math.min(10, passiveLevels['titan_juggernaut'] || 0);
  if (tjLevel > 0) {
    runeBonusHp += Math.floor((playerStats.maxHp || 100) * (tjLevel * 0.08));
  }

  // Attack Speed = Cast Rate: reduces skill Rage cost by up to 35%
  const speedRageReduction = Math.min(35, Math.floor(attackSpeed * 0.30));
  const finalRageCostReduction = Math.min(60, rageCostReduction + speedRageReduction);

  const speedAtbBonus = Math.floor(attackSpeed * 0.25);
  const finalAtb = Math.min(85, baseAtbPercent + speedAtbBonus);

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
    goldFind: Math.floor(goldFind),
    allSkills: Math.floor(allSkills),
    allResist: Math.floor(allResist),
    lifeSteal: Math.floor(lifeSteal),
    attackSpeed: Math.floor(attackSpeed),
    turnRageRegen: Math.floor(turnRageRegen),
    rageCostReduction: Math.floor(finalRageCostReduction),
    baseAtbPercent: finalAtb,
    runeBonusHp: Math.floor(runeBonusHp),
    totalBonusHp,
    activeSetBonuses,
    // 🌟 Special Mechanics
    enhancedDamage: offWeaponEd,
    crushingBlow,
    openWounds,
    ignoreTargetDefense,
    targetDefenseReduction,
    convictionAura,
    redemptionOnKill,
    mightAura,
    chillingArmor,
    staticFieldChance,
    amplifyDamageChance,
    lifeTapChance,
    cannotBeFrozen,
    damageToDemons,
    knockback
  };
}
