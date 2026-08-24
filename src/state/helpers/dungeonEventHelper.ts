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

import { DungeonInfo, DungeonBuff, GameItem, DungeonRoom, RoomType } from '../../types/game';
import { DUNGEONS_DATA } from '../../data/dungeons';
import { GAME_ITEMS_POOL } from '../../data/items';
import { identifyItemHelper } from './itemGenerator';

export const DUNGEON_RUNE_TIERS: Record<string, string[]> = {
  act1: ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort'],
  act2: ['Tal', 'Ral', 'Ort', 'Thul', 'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io'],
  act3: ['Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem', 'Pul', 'Um', 'Mal'],
  act4: ['Lem', 'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur'],
  act5: ['Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod']
};

export function getRunePoolForDungeon(dungeonId: string): string[] {
  if (DUNGEON_RUNE_TIERS[dungeonId]) return DUNGEON_RUNE_TIERS[dungeonId];
  if (dungeonId.startsWith('act5')) return DUNGEON_RUNE_TIERS.act5;
  if (dungeonId.startsWith('act4')) return DUNGEON_RUNE_TIERS.act4;
  if (dungeonId.startsWith('act3')) return DUNGEON_RUNE_TIERS.act3;
  if (dungeonId.startsWith('act2')) return DUNGEON_RUNE_TIERS.act2;
  return DUNGEON_RUNE_TIERS.act1;
}

export interface TreasureReward {
  gold: number;
  shards: number;
  items: GameItem[];
}

export function scaleItemForDifficulty(baseItem: GameItem, difficultyLevel: number = 1): GameItem {
  const mult = 1 + (difficultyLevel - 1) * 0.15;
  const scaledStats = { ...baseItem.stats };
  const statScale = 1 + (difficultyLevel - 1) * 0.10;

  if (scaledStats.minDmg !== undefined) scaledStats.minDmg = Math.floor(scaledStats.minDmg * mult);
  if (scaledStats.maxDmg !== undefined) scaledStats.maxDmg = Math.floor(scaledStats.maxDmg * mult);
  if (scaledStats.defense !== undefined) scaledStats.defense = Math.floor(scaledStats.defense * mult);
  if (scaledStats.hp !== undefined) scaledStats.hp = Math.floor(scaledStats.hp * mult);
  if (scaledStats.mana !== undefined) scaledStats.mana = Math.floor(scaledStats.mana * mult);
  if (scaledStats.damageReduction !== undefined) scaledStats.damageReduction = Math.min(60, scaledStats.damageReduction + Math.floor((difficultyLevel - 1) / 3));
  if (scaledStats.allResist !== undefined) scaledStats.allResist = scaledStats.allResist + (difficultyLevel - 1) * 2;
  if (scaledStats.evasion !== undefined) scaledStats.evasion = scaledStats.evasion + (difficultyLevel - 1);
  if (scaledStats.fortune !== undefined) scaledStats.fortune = scaledStats.fortune + Math.floor((difficultyLevel - 1) * 0.5);
  if (scaledStats.critChance !== undefined) scaledStats.critChance = scaledStats.critChance + Math.floor((difficultyLevel - 1) / 2);
  if (scaledStats.overkillEfficiency !== undefined) scaledStats.overkillEfficiency = scaledStats.overkillEfficiency + Math.floor((difficultyLevel - 1) / 2);
  if (scaledStats.attackSpeed !== undefined) scaledStats.attackSpeed = Math.min(75, scaledStats.attackSpeed + Math.floor((difficultyLevel - 1) / 4));
  if (scaledStats.lifeSteal !== undefined) scaledStats.lifeSteal = scaledStats.lifeSteal + Math.floor((difficultyLevel - 1) / 5);
  if (scaledStats.str !== undefined) scaledStats.str = Math.floor(scaledStats.str * statScale);
  if (scaledStats.dex !== undefined) scaledStats.dex = Math.floor(scaledStats.dex * statScale);
  if (scaledStats.con !== undefined) scaledStats.con = Math.floor(scaledStats.con * statScale);
  if (scaledStats.int !== undefined) scaledStats.int = Math.floor(scaledStats.int * statScale);
  if (scaledStats.wis !== undefined) scaledStats.wis = Math.floor(scaledStats.wis * statScale);

  // High difficulties can add bonus sockets (cap 6).
  const bonusSocketChance = difficultyLevel >= 5 ? Math.min(0.5, 0.05 * (difficultyLevel - 4)) : 0;
  const currentSockets = baseItem.sockets ?? 0;
  const scaledSockets = (currentSockets > 0 || (baseItem.slot === 'weapon' || baseItem.slot === 'armor' || baseItem.slot === 'shield' || baseItem.slot === 'helm')) && Math.random() < bonusSocketChance
    ? Math.min(6, Math.max(1, currentSockets + 1))
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
  const wantSpecial = rollSpecialDrop(playerFortune, dungeonIdx);

  const specialPool = pool.filter(p => p.rarity === 'unique' || p.rarity === 'set' || p.rarity === 'legendary');
  const normalPool = pool.filter(p => p.rarity !== 'unique' && p.rarity !== 'set' && p.rarity !== 'legendary');
  const effectiveNormalPool = normalPool.length > 0 ? normalPool : pool;

  let droppedBase: GameItem;
  if (wantSpecial && specialPool.length > 0) {
    droppedBase = specialPool[Math.floor(Math.random() * specialPool.length)];
  } else {
    droppedBase = effectiveNormalPool[Math.floor(Math.random() * effectiveNormalPool.length)];
  }

  const scaled = scaleItemForDifficulty(droppedBase, difficultyLevel);
  const isSpecialDrop = droppedBase.rarity === 'unique' || droppedBase.rarity === 'set' || droppedBase.rarity === 'legendary';

  if (isSpecialDrop && wantSpecial) {
    return {
      ...scaled,
      id: `${idPrefix}_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      name: `미확인 [${getSlotBaseName(droppedBase.slot, droppedBase.baseItemName)}]`,
      baseItemName: droppedBase.baseItemName || getSlotBaseName(droppedBase.slot),
      rarity: droppedBase.rarity,
      sockets: scaled.sockets,
      socketedRunes: [],
      realUniqueName: droppedBase.name,
      isIdentified: false
    };
  }

  const roll = Math.random() * 100;
  const magicBoost = Math.min(18, playerFortune * 0.06);
  let rarity: GameItem['rarity'] = 'normal';
  if (roll < 7 + magicBoost * 0.25) rarity = 'rare';
  else if (roll < 30 + magicBoost) rarity = 'magic';

  const stub: GameItem = {
    ...scaled,
    id: `${idPrefix}_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    name: `미확인 [${getSlotBaseName(droppedBase.slot, droppedBase.baseItemName)}]`,
    baseItemName: droppedBase.baseItemName || getSlotBaseName(droppedBase.slot),
    rarity,
    sockets: scaled.sockets,
    socketedRunes: [],
    isIdentified: false
  };

  if (rarity === 'normal') {
    return {
      ...stub,
      name: droppedBase.name,
      rarity: 'normal',
      isIdentified: true,
      description: droppedBase.description
    };
  }

  return stub;
}

export function claimTreasureHelper(
  currentDungeon: DungeonInfo,
  difficultyLevel: number = 1,
  playerFortune: number = 0
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
    droppedItems.push(makeDungeonDrop(pool, { difficultyLevel, playerFortune, dungeonIdx }, 'treasure', i));
  }

  return {
    gold: goldReward,
    shards: shardReward,
    items: droppedItems
  };
}

export function claimRuneAltarHelper(dungeonId: string): { runeName: string; count: number } {
  const runes = getRunePoolForDungeon(dungeonId);
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
  const actIndex = Math.min(4, Math.floor(dungeonIndex / 4));
  const actMultiplier = dungeonIndex + 1;
  const diffMultiplier = 1 + (difficultyLevel - 1) * 0.45;

  const victoryGold = Math.floor((3000 * actMultiplier + Math.random() * 1000) * diffMultiplier);
  const victoryShards = Math.floor(10 * actMultiplier * (1 + (difficultyLevel - 1) * 0.15));

  // Progressive base exp scale per Act: Act 1 (~100-300), Act 2 (~800-1500), Act 3 (~3500-6000), Act 4 (~15000-25000), Act 5 (~60000-100000)
  const actBaseExps = [150, 900, 4000, 18000, 75000];
  const dungeonWithinAct = dungeonIndex % 4;
  const baseExp = Math.floor(actBaseExps[actIndex] * (1 + dungeonWithinAct * 0.35));

  const victoryExp = Math.floor(baseExp * (1 + (difficultyLevel - 1) * 0.40));

  const availableRunes = getRunePoolForDungeon(currentDungeon.id);
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
    advanceLevels = 2;
    performanceGrade = '🌟 무손실 대승 (+2 난이도)';
  } else if (playerHpPercent >= 70) {
    advanceLevels = 1;
    performanceGrade = '🔥 완벽한 승리 (+1 난이도)';
  } else {
    advanceLevels = 1;
    performanceGrade = '⚔️ 클리어 (+1 난이도)';
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

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

const ENCOUNTER_LABEL: Record<string, string> = {
  normal: '적 무리',
  elite: '강적',
  treasure: '보물'
};

export function prepareDungeonRun(dungeon: DungeonInfo): DungeonRoom[] {
  const rooms: DungeonRoom[] = dungeon.rooms.map(r => ({
    ...r,
    revealed: r.type === 'start',
    cleared: r.type === 'start',
    current: false
  }));

  return rooms;
}

export function generateRoomClearLoot(
  currentDungeon: DungeonInfo,
  difficultyLevel: number,
  playerFortune: number,
  roomType: RoomType
): { gold: number; items: GameItem[]; runeName?: string } {
  const dungeonIdx = Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : GAME_ITEMS_POOL.slice(0, 8);
  const ctx = { difficultyLevel, playerFortune, dungeonIdx };
  const items: GameItem[] = [];
  let gold = 0;
  let runeName: string | undefined;

  if (roomType === 'elite') {
    gold = Math.floor((80 + Math.random() * 60) * (dungeonIdx + 1));
    items.push(makeDungeonDrop(pool, ctx, 'elite', 0));
    if (Math.random() < 0.4) items.push(makeDungeonDrop(pool, ctx, 'elite', 1));
    if (Math.random() < 0.35) {
      const runes = getRunePoolForDungeon(currentDungeon.id);
      runeName = runes[Math.floor(Math.random() * Math.min(runes.length, 6))];
    }
  } else if (roomType === 'normal') {
    gold = Math.floor((20 + Math.random() * 30) * (dungeonIdx + 1));
    if (Math.random() < 0.42) {
      items.push(makeDungeonDrop(pool, ctx, 'wave', 0));
    }
  }

  return { gold, items, runeName };
}

export function equippedCompareHint(
  item: GameItem,
  equipment: Record<string, GameItem>
): string {
  const slotKey = item.slot === 'ring' ? 'ring1' : item.slot;
  if (slotKey === 'rune' || slotKey === 'gem' || slotKey === 'material' || slotKey === 'consumable') return '';
  const eq = equipment[slotKey as string];
  if (!eq) return '빈 슬롯';
  if (item.stats.minDmg != null && eq.stats.minDmg != null) {
    const d = (item.stats.minDmg + (item.stats.maxDmg || 0)) - (eq.stats.minDmg + (eq.stats.maxDmg || 0));
    if (d >= 3) return `공격 ↑${d}`;
    if (d <= -3) return `공격 ↓${-d}`;
    return '공격 비슷';
  }
  if (item.stats.defense != null && eq.stats.defense != null) {
    const d = (item.stats.defense || 0) - (eq.stats.defense || 0);
    if (d >= 3) return `방어 ↑${d}`;
    if (d <= -3) return `방어 ↓${-d}`;
    return '방어 비슷';
  }
  return '';
}

export function makeFirstClearSteelBase(): GameItem {
  const base = GAME_ITEMS_POOL.find(i => i.id === 'e_short_sword_2s') || GAME_ITEMS_POOL[0];
  return {
    ...base,
    id: `firstclear_steel_${Date.now()}`,
    name: '숏소드 (2 소켓)',
    isIdentified: true,
    sockets: 2,
    socketedRunes: [],
    description: '[첫 원정 보상] 빈 소켓 2개. 룬 보관함의 Tir + El 순서로 박으면 강철(Steel) 룬워드가 됩니다.'
  };
}

