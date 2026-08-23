function getSlotBaseName(slot: string, baseItemName?: string): string {
  if (baseItemName) {
    const cleaned = baseItemName.replace(/\s*\(.*?\)/, '').trim();
    if (cleaned) return cleaned;
  }
  if (slot === 'ring' || slot === 'ring1' || slot === 'ring2') return '반지';
  if (slot === 'amulet') return '목걸이';
  if (slot === 'weapon') return '도검';
  if (slot === 'armor') return '갑옷';
  if (slot === 'shield') return '방패';
  if (slot === 'helm') return '투구';
  if (slot === 'gloves') return '장갑';
  if (slot === 'boots') return '신발';
  return '장비';
}

import { DungeonInfo, DungeonBuff, GameItem } from '../../types/game';
import { DUNGEONS_DATA } from '../../data/dungeons';
import { GAME_ITEMS_POOL } from '../../data/items';

export const DUNGEON_RUNE_TIERS: Record<string, string[]> = {
  act1_crypt: ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort'],
  act2_tomb: ['Tal', 'Ral', 'Ort', 'Thul', 'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io'],
  act3_jungle: ['Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem', 'Pul', 'Um', 'Mal'],
  act4_chaos: ['Lem', 'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur'],
  act5_worldstone: ['Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod']
};

export interface TreasureReward {
  gold: number;
  shards: number;
  items: GameItem[];
}

export function scaleItemForDifficulty(baseItem: GameItem, difficultyLevel: number = 1): GameItem {
  const mult = 1 + (difficultyLevel - 1) * 0.15;
  const scaledStats = { ...baseItem.stats };
  const statScale = 1 + (difficultyLevel - 1) * 0.10;

  if (scaledStats.minDmg) scaledStats.minDmg = Math.floor(scaledStats.minDmg * mult);
  if (scaledStats.maxDmg) scaledStats.maxDmg = Math.floor(scaledStats.maxDmg * mult);
  if (scaledStats.defense) scaledStats.defense = Math.floor(scaledStats.defense * mult);
  if (scaledStats.hp) scaledStats.hp = Math.floor(scaledStats.hp * mult);
  if (scaledStats.mana) scaledStats.mana = Math.floor(scaledStats.mana * mult);
  if (scaledStats.damageReduction) scaledStats.damageReduction = Math.min(60, scaledStats.damageReduction + Math.floor((difficultyLevel - 1) / 3));
  if (scaledStats.allResist) scaledStats.allResist = scaledStats.allResist + (difficultyLevel - 1) * 2;
  if (scaledStats.evasion) scaledStats.evasion = scaledStats.evasion + (difficultyLevel - 1);
  if (scaledStats.fortune) scaledStats.fortune = scaledStats.fortune + Math.floor((difficultyLevel - 1) * 0.5);
  if (scaledStats.critChance) scaledStats.critChance = scaledStats.critChance + Math.floor((difficultyLevel - 1) / 2);
  if (scaledStats.overkillEfficiency) scaledStats.overkillEfficiency = scaledStats.overkillEfficiency + Math.floor((difficultyLevel - 1) / 2);
  if (scaledStats.attackSpeed) scaledStats.attackSpeed = Math.min(75, scaledStats.attackSpeed + Math.floor((difficultyLevel - 1) / 4));
  if (scaledStats.lifeSteal) scaledStats.lifeSteal = scaledStats.lifeSteal + Math.floor((difficultyLevel - 1) / 5);
  if (scaledStats.str) scaledStats.str = Math.floor(scaledStats.str * statScale);
  if (scaledStats.dex) scaledStats.dex = Math.floor(scaledStats.dex * statScale);
  if (scaledStats.con) scaledStats.con = Math.floor(scaledStats.con * statScale);
  if (scaledStats.int) scaledStats.int = Math.floor(scaledStats.int * statScale);
  if (scaledStats.wis) scaledStats.wis = Math.floor(scaledStats.wis * statScale);

  // High difficulties can add bonus sockets on socketed bases (cap 6).
  const bonusSocketChance = difficultyLevel >= 5 ? Math.min(0.5, 0.05 * (difficultyLevel - 4)) : 0;
  const scaledSockets = baseItem.sockets && baseItem.sockets > 0 && Math.random() < bonusSocketChance
    ? Math.min(6, baseItem.sockets + 1)
    : baseItem.sockets;

  const scaledAffixes = baseItem.subAffixes
    ? baseItem.subAffixes.map(aff => ({
        ...aff,
        value: Math.floor(aff.value * statScale)
      }))
    : undefined;

  return {
    ...baseItem,
    tier: difficultyLevel > 1 ? `T${difficultyLevel}` : (baseItem.tier || 'NORMAL'),
    stats: scaledStats,
    sockets: scaledSockets,
    subAffixes: scaledAffixes,
    requiredLevel: baseItem.requiredLevel ?? undefined,
    value: Math.floor((baseItem.value || 50) * mult)
  };
}

// MF (Magic Find) grade weighting: fortune shifts the roll window toward special drops.
function rollSpecialDrop(baseFortune: number, dungeonIdx: number): boolean {
  const fortune = Math.max(0, baseFortune || 0);
  const actBonus = dungeonIdx * 2;
  // Base ~8%, up to ~28% at high MF. Roll under threshold => special drop.
  const specialChance = Math.min(0.28, 0.08 + fortune * 0.002 + actBonus * 0.01);
  return Math.random() < specialChance;
}

interface DropContext {
  difficultyLevel: number;
  playerFortune: number;
  dungeonIdx: number;
}

function makeDungeonDrop(
  pool: GameItem[],
  ctx: DropContext,
  idPrefix: string,
  index: number
): GameItem {
  const { difficultyLevel, playerFortune, dungeonIdx } = ctx;
  let droppedBase = pool[Math.floor(Math.random() * pool.length)];
  const wantSpecial = rollSpecialDrop(playerFortune, dungeonIdx);
  if (wantSpecial) {
    const specialPool = pool.filter(p => p.rarity === 'unique' || p.rarity === 'set' || p.rarity === 'legendary');
    if (specialPool.length > 0) droppedBase = specialPool[Math.floor(Math.random() * specialPool.length)];
  }
  const scaled = scaleItemForDifficulty(droppedBase, difficultyLevel);

  // Normal bases drop already-identified with their real name (no pointless gamble).
  // Unique/Set bases drop unidentified, masked by their true base item name, and reveal the locked unique on identify.
  const isSpecialDrop = droppedBase.rarity === 'unique' || droppedBase.rarity === 'set' || droppedBase.rarity === 'legendary';
  const maskedName = isSpecialDrop
    ? `미확인 [${getSlotBaseName(droppedBase.slot, droppedBase.baseItemName)}]`
    : droppedBase.name;

  return {
    ...scaled,
    id: `${idPrefix}_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    name: maskedName,
    baseItemName: droppedBase.baseItemName || getSlotBaseName(droppedBase.slot),
    rarity: isSpecialDrop ? droppedBase.rarity : 'normal',
    sockets: scaled.sockets,
    socketedRunes: [],
    realUniqueName: isSpecialDrop ? droppedBase.name : undefined,
    isIdentified: !isSpecialDrop
  };
}

export function claimTreasureHelper(
  currentDungeon: DungeonInfo,
  difficultyLevel: number = 1
): TreasureReward {
  const dungeonIdx = Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const mult = (dungeonIdx + 1) * (1 + (difficultyLevel - 1) * 0.40);
  const goldReward = Math.floor((500 + Math.random() * 400) * mult);
  const shardReward = Math.floor(3 * (dungeonIdx + 1) * (1 + (difficultyLevel - 1) * 0.15));

  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : GAME_ITEMS_POOL.slice(0, 8);

  const dropCount = Math.min(3, Math.floor(1 + Math.random() * (difficultyLevel >= 5 ? 2 : 1)));
  const droppedItems: GameItem[] = [];

  for (let i = 0; i < dropCount; i++) {
    droppedItems.push(makeDungeonDrop(pool, { difficultyLevel, playerFortune: 0, dungeonIdx }, 'treasure', i));
  }

  return {
    gold: goldReward,
    shards: shardReward,
    items: droppedItems
  };
}

export function claimRuneAltarHelper(dungeonId: string): { runeName: string; count: number } {
  const runes = DUNGEON_RUNE_TIERS[dungeonId] || DUNGEON_RUNE_TIERS['act1_crypt'];
  const pickedRune = runes[Math.floor(Math.random() * runes.length)];
  return { runeName: pickedRune, count: 1 };
}

export function createShrineBuff(buffType: 'fortune' | 'crit' | 'defense', difficultyLevel: number = 1): DungeonBuff {
  const diffBonus = Math.floor((difficultyLevel - 1) * 2);
  if (buffType === 'fortune') {
    return {
      id: `buff_sun_${Date.now()}`,
      name: '태양의 축복',
      type: 'fortune',
      value: 35 + diffBonus,
      description: `매직 아이템 발견 확률(MF) +${35 + diffBonus}%`,
      icon: '☀️'
    };
  } else if (buffType === 'crit') {
    return {
      id: `buff_blood_${Date.now()}`,
      name: '피의 축복',
      type: 'crit',
      value: 15 + Math.floor(diffBonus / 2),
      description: `체력 100% 즉시 완충 & 치명타율 +${15 + Math.floor(diffBonus / 2)}%`,
      icon: '🩸'
    };
  } else {
    return {
      id: `buff_iron_${Date.now()}`,
      name: '강철의 축복',
      type: 'defense',
      value: 50 + diffBonus * 2,
      description: `방어력 +${50 + diffBonus * 2} & 물리 피해 감소 +10%`,
      icon: '🛡️'
    };
  }
}

export interface VictoryLootResult {
  gold: number;
  shards: number;
  exp: number;
  items: GameItem[];
  runes: Record<string, number>;
  advanceLevels: number;
  nextDifficulty: number;
  performanceGrade: string;
}

export function generateVictoryLoot(
  currentDungeon: DungeonInfo,
  playerFortune: number,
  difficultyLevel: number = 1,
  playerHpPercent: number = 100
): VictoryLootResult {
  const dungeonIndex = Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const actMultiplier = dungeonIndex + 1;
  const diffMultiplier = 1 + (difficultyLevel - 1) * 0.45;

  const victoryGold = Math.floor((3000 * actMultiplier + Math.random() * 1000) * diffMultiplier);
  const victoryShards = Math.floor(10 * actMultiplier * (1 + (difficultyLevel - 1) * 0.15));

  const baseExp = currentDungeon.id === 'act1_crypt' ? 100
    : currentDungeon.id === 'act2_tomb' ? 600
    : currentDungeon.id === 'act3_jungle' ? 3000
    : currentDungeon.id === 'act4_chaos' ? 14000
    : 70000;

  const victoryExp = Math.floor(baseExp * (1 + (difficultyLevel - 1) * 0.40));

  const availableRunes = DUNGEON_RUNE_TIERS[currentDungeon.id] || DUNGEON_RUNE_TIERS['act1_crypt'];
  const droppedRunes: Record<string, number> = {};
  const runeDropCount = Math.min(5, Math.floor(1 + Math.random() * 2 + (playerFortune > 30 ? 1 : 0) + (difficultyLevel >= 10 ? 1 : 0)));

  for (let i = 0; i < runeDropCount; i++) {
    const randomRune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
    droppedRunes[randomRune] = (droppedRunes[randomRune] || 0) + 1;
  }

  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : GAME_ITEMS_POOL.slice(0, 8);

  const itemDropCount = Math.min(4, Math.floor(1 + Math.random() * 2 + (difficultyLevel >= 5 ? 1 : 0)));
  const droppedItems: GameItem[] = [];

  for (let i = 0; i < itemDropCount; i++) {
    droppedItems.push(makeDungeonDrop(pool, { difficultyLevel, playerFortune, dungeonIdx: dungeonIndex }, `loot_${currentDungeon.id}`, i));
  }

  let advanceLevels = 1;
  let performanceGrade = '🛡️ 클리어 승리 (+1 난이도)';

  if (playerHpPercent >= 90) {
    advanceLevels = 5;
    performanceGrade = '🌟 압도적인 무손실 대승 (+5 난이도 돌파!)';
  } else if (playerHpPercent >= 70) {
    advanceLevels = 3;
    performanceGrade = '🔥 완벽한 전술 승리 (+3 난이도 돌파!)';
  } else if (playerHpPercent >= 50) {
    advanceLevels = 2;
    performanceGrade = '⚔️ 훌륭한 승리 (+2 난이도 돌파!)';
  }

  const nextDifficulty = difficultyLevel + advanceLevels;

  return {
    gold: victoryGold,
    shards: victoryShards,
    exp: victoryExp,
    items: droppedItems,
    runes: droppedRunes,
    advanceLevels,
    nextDifficulty,
    performanceGrade
  };
}
