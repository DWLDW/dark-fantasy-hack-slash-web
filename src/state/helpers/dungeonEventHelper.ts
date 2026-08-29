import { DungeonInfo, DungeonBuff, GameItem, DungeonRoom, RoomType } from '../../types/game';
import { DUNGEONS_DATA } from '../../data/dungeons';
import { GAME_ITEMS_POOL, getActDropPool } from '../../data/items';
import { identifyItemHelper } from './itemGenerator';

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

export const DUNGEON_RUNE_TIERS: Record<string, string[]> = {
  act1: ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort'],
  act2: ['Tal', 'Ral', 'Ort', 'Thul', 'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io'],
  act3: ['Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem', 'Pul', 'Um', 'Mal'],
  act4: ['Lem', 'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur'],
  act5: ['Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod']
};

export function getRunePoolForDungeon(dungeonId: string, riftTier?: number): string[] {
  if (dungeonId.startsWith('endless_rift_')) {
    const tier = riftTier || parseInt(dungeonId.replace('endless_rift_t', '')) || 1;
    if (tier >= 18) return DUNGEON_RUNE_TIERS.act5;
    if (tier >= 12) return DUNGEON_RUNE_TIERS.act4;
    if (tier >= 6) return DUNGEON_RUNE_TIERS.act3;
    if (tier >= 3) return DUNGEON_RUNE_TIERS.act2;
    return DUNGEON_RUNE_TIERS.act1;
  }
  if (DUNGEON_RUNE_TIERS[dungeonId]) return DUNGEON_RUNE_TIERS[dungeonId];
  if (dungeonId.startsWith('act5')) return DUNGEON_RUNE_TIERS.act5;
  if (dungeonId.startsWith('act4')) return DUNGEON_RUNE_TIERS.act4;
  if (dungeonId.startsWith('act3')) return DUNGEON_RUNE_TIERS.act3;
  if (dungeonId.startsWith('act2')) return DUNGEON_RUNE_TIERS.act2;
  return DUNGEON_RUNE_TIERS.act1;
}

/**
 * 가중 룬 추첨 — 저렙룬은 쌓이고 고렙룬은 희귀
 * pool[0]=최저룬, pool[N-1]=최고룬 일 때 지수 감쇠 가중치
 * - 기본 decay 0.84(Act1 평탄) → 0.66(Act5/Rift 가파름): Act가 높을수록 고렙룬 더 희귀
 * - Fortune(MF)과 난이도가 높을수록 곡선이 살짝 평탄해져 고렙룬 확률이 소폭 상승
 * - 결과: El/Tal/Gul 등은 20~25%, Ber/Jah/Zod 등은 1.5~4%로 유지
 */
export function pickWeightedRune(
  pool: string[],
  opts: { fortune?: number; difficultyLevel?: number; dungeonIdx?: number } = {}
): string {
  if (pool.length === 0) return 'El';
  if (pool.length === 1) return pool[0];
  const fortune = Math.max(0, opts.fortune || 0);
  const difficultyLevel = Math.max(1, opts.difficultyLevel || 1);
  const dungeonIdx = Math.max(0, opts.dungeonIdx || 0);
  // Act가 높을수록 가파름 (고렙룬 더 희귀)
  const baseDecay = Math.max(0.62, 0.84 - dungeonIdx * 0.012);
  // Fortune/난이도는 곡선을 살짝 평탄화 (고렙룬 소폭 상향)
  const fortuneBonus = Math.min(0.07, fortune * 0.00055);
  const diffBonus = Math.min(0.05, (difficultyLevel - 1) * 0.006);
  const decay = Math.min(0.88, baseDecay + fortuneBonus + diffBonus);
  const weights = pool.map((_, i) => Math.pow(decay, i));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export interface TreasureReward {
  gold: number;
  shards: number;
  items: GameItem[];
}

/**
 * 🚀 [Diablo 2 Socket Matrix]:
 * - 노멀(Normal): 디아블로2 기준 부위별/티어별 최대 소켓 (무기 1~6, 갑옷 1~4, 방패 1~4, 투구 1~3, 기타 0)
 * - 매직(Magic) / 레어(Rare): 최대 소켓 2개 (1~2개)
 * - 유니크(Unique) / 세트(Set): 최대 소켓 1개 (0~1개)
 */
export function rollDynamicSockets(
  baseItem: GameItem,
  playerFortune: number = 0,
  difficultyLevel: number = 1,
  targetRarity?: GameItem['rarity']
): number | undefined {
  const slot = baseItem.slot;
  if (slot !== 'weapon' && slot !== 'armor' && slot !== 'shield' && slot !== 'helm') {
    return undefined;
  }

  const effectiveRarity = targetRarity || baseItem.rarity;

  // 1. 유니크 / 세트 / 레전더리 -> 최대 1소켓
  if (effectiveRarity === 'unique' || effectiveRarity === 'set' || effectiveRarity === 'legendary') {
    const defaultSockets = baseItem.sockets ? Math.min(1, baseItem.sockets) : 0;
    if (defaultSockets > 0) return 1;
    // 25% 확률로 1소켓 드랍
    return Math.random() < 0.25 ? 1 : undefined;
  }

  // 2. 매직 / 레어 -> 최대 2소켓
  if (effectiveRarity === 'magic' || effectiveRarity === 'rare') {
    // 35% 확률로 소켓 부여 (50% 확률로 2소켓, 50% 확률로 1소켓)
    if (Math.random() < 0.35) {
      return Math.random() < 0.50 ? 2 : 1;
    }
    return baseItem.sockets ? Math.min(2, baseItem.sockets) : undefined;
  }

  // 3. 노멀(Normal) -> 디아블로2 원작 최대 소켓 매트릭스
  const maxSocketsForSlot: Record<string, number> = {
    weapon: baseItem.tier === 'elite' ? 6 : baseItem.tier === 'exceptional' ? 5 : 4,
    armor: baseItem.tier === 'normal' ? 3 : 4,
    shield: baseItem.tier === 'normal' ? 3 : 4,
    helm: baseItem.tier === 'normal' ? 2 : 3
  };
  const maxS = maxSocketsForSlot[slot] || 4;

  // Fortune (MF) & 난이도 보너스
  const mfBonus = Math.min(0.60, Math.max(0, playerFortune * 0.0015));
  const diffBonus = Math.min(0.30, Math.max(0, (difficultyLevel - 1) * 0.05));
  const highSocketChance = mfBonus + diffBonus;

  const roll = Math.random();
  // 6소켓 롤 (엘리트 무기)
  if (maxS >= 6 && roll < 0.12 + highSocketChance * 0.35) return 6;
  // 5소켓 롤 (무기)
  if (maxS >= 5 && roll < 0.25 + highSocketChance * 0.40) return 5;
  // 4소켓 롤 (무기, 갑옷, 방패)
  if (maxS >= 4 && roll < 0.50 + highSocketChance * 0.45) return 4;
  // 3소켓 롤 (무기, 갑옷, 방패, 투구)
  if (maxS >= 3 && roll < 0.75 + highSocketChance * 0.30) return 3;
  // 2소켓 롤
  if (maxS >= 2 && roll < 0.90) return 2;

  return Math.max(baseItem.sockets || 1, 1);
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
    sockets: baseItem.sockets,
    subAffixes: scaledAffixes,
    requiredLevel: baseItem.requiredLevel ?? undefined,
    value: Math.floor((baseItem.value || 50) * mult)
  };
}

// MF (Magic Find) — rebalance: cap 32→38%, progressive to MF 110
// - 8% base, Act5/Rift up to +6%p, high MF keeps climbing to 38%
function rollSpecialDrop(baseFortune: number, dungeonIdx: number): boolean {
  const fortune = Math.max(0, baseFortune || 0);
  const actIdx = Math.min(5, Math.floor(Math.max(0, dungeonIdx) / 4));
  const actBonus = actIdx * 1.5;
  const specialChance = Math.min(0.38, 0.08 + fortune * 0.0022 + actBonus * 0.01 + Math.min(0.04, fortune * 0.00035));
  return Math.random() < specialChance;
}

interface DropContext {
  difficultyLevel: number;
  playerFortune: number;
  dungeonIdx: number;
}

/**
 * 9대 모든 장비 슬롯(무기, 갑옷, 투구, 방패, 장갑, 신발, 반지, 목걸이)이
 * 골고루 드랍되도록 1차 슬롯 추첨 후 아이템을 생성합니다.
 */
function makeDungeonDrop(
  pool: GameItem[],
  ctx: DropContext,
  idPrefix: string,
  index: number
): GameItem {
  const { difficultyLevel, playerFortune, dungeonIdx } = ctx;
  const wantSpecial = rollSpecialDrop(playerFortune, dungeonIdx);

  // 9대 장비 슬롯 목록
  const ALL_SLOTS = ['weapon', 'armor', 'helm', 'shield', 'gloves', 'boots', 'ring', 'amulet'];
  const targetSlot = ALL_SLOTS[Math.floor(Math.random() * ALL_SLOTS.length)];

  // 슬롯별 필터링 (반지의 경우 ring, ring1, ring2 모두 매칭)
  const slotPool = pool.filter(p => {
    if (targetSlot === 'ring') return p.slot === 'ring' || p.slot === 'ring1' || p.slot === 'ring2';
    return p.slot === targetSlot;
  });

  const effectivePool = slotPool.length > 0 ? slotPool : pool;
  const specialPool = effectivePool.filter(p => p.rarity === 'unique' || p.rarity === 'set' || p.rarity === 'legendary');
  const normalPool = effectivePool.filter(p => p.rarity !== 'unique' && p.rarity !== 'set' && p.rarity !== 'legendary');
  const effectiveNormalPool = normalPool.length > 0 ? normalPool : effectivePool;

  let droppedBase: GameItem;
  if (wantSpecial && specialPool.length > 0) {
    droppedBase = specialPool[Math.floor(Math.random() * specialPool.length)];
  } else {
    droppedBase = effectiveNormalPool[Math.floor(Math.random() * effectiveNormalPool.length)];
  }

  const scaled = scaleItemForDifficulty(droppedBase, difficultyLevel);
  const isSpecialDrop = droppedBase.rarity === 'unique' || droppedBase.rarity === 'set' || droppedBase.rarity === 'legendary';

  if (isSpecialDrop && wantSpecial) {
    const specialSockets = droppedBase.sockets ? Math.min(1, droppedBase.sockets) : (Math.random() < 0.20 ? 1 : undefined);
    return {
      ...scaled,
      id: `${idPrefix}_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      name: `미확인 [${getSlotBaseName(droppedBase.slot, droppedBase.baseItemName)}]`,
      baseItemName: droppedBase.baseItemName || getSlotBaseName(droppedBase.slot),
      rarity: droppedBase.rarity,
      sockets: specialSockets,
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

  // 🚀 D2 Socket Matrix: 노말 1~6소켓, 매직/레어 1~2소켓
  const rolledSockets = rollDynamicSockets(droppedBase, playerFortune, difficultyLevel, rarity);

  let displayName = droppedBase.name;
  if (rarity === 'normal' && rolledSockets && rolledSockets > 0) {
    const cleanBaseName = getSlotBaseName(droppedBase.slot, droppedBase.baseItemName || droppedBase.name);
    displayName = `${cleanBaseName} (${rolledSockets} 소켓)`;
  }

  const stub: GameItem = {
    ...scaled,
    id: `${idPrefix}_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    name: `미확인 [${getSlotBaseName(droppedBase.slot, droppedBase.baseItemName)}]`,
    baseItemName: droppedBase.baseItemName || getSlotBaseName(droppedBase.slot),
    rarity,
    sockets: rolledSockets,
    socketedRunes: [],
    isIdentified: false
  };

  if (rarity === 'normal') {
    return {
      ...stub,
      name: displayName,
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
  const isEndless = currentDungeon.isEndlessRift || currentDungeon.id.startsWith('endless_rift_');
  const dungeonIdx = isEndless
    ? Math.min(19, Math.max(8, (currentDungeon.riftTier || 1) + 7))
    : Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const actIndex = isEndless
    ? Math.min(4, Math.max(2, Math.floor(((currentDungeon.riftTier || 1) - 1) / 4) + 2))
    : Math.min(4, Math.floor(dungeonIdx / 4));
  const mult = (dungeonIdx + 1) * (1 + (difficultyLevel - 1) * 0.40);
  const goldReward = Math.floor((500 + Math.random() * 400) * mult);
  const shardReward = Math.floor(3 * (dungeonIdx + 1) * (1 + (difficultyLevel - 1) * 0.15));

  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : getActDropPool(actIndex + 1);

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

export function claimRuneAltarHelper(dungeonId: string, riftTier?: number): { runeName: string; count: number } {
  const runes = getRunePoolForDungeon(dungeonId, riftTier);
  // rune altar도 저렙 가중 — Act 기반 가중 (고렙룬 희귀 유지, ESM-safe)
  const actNum = dungeonId.startsWith('act5') ? 5 : dungeonId.startsWith('act4') ? 4 : dungeonId.startsWith('act3') ? 3 : dungeonId.startsWith('act2') ? 2 : 1;
  const riftIdx = riftTier ? Math.min(19, Math.max(8, riftTier + 7)) : 0;
  const dungeonIdx = dungeonId.startsWith('endless_rift_') ? riftIdx : (actNum - 1) * 4;
  const pickedRune = pickWeightedRune(runes, { dungeonIdx });
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
  const isEndless = currentDungeon.isEndlessRift || currentDungeon.id.startsWith('endless_rift_');
  const dungeonIndex = isEndless
    ? Math.min(19, Math.max(8, (currentDungeon.riftTier || 1) + 7))
    : Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const actIndex = isEndless
    ? Math.min(4, Math.max(2, Math.floor(((currentDungeon.riftTier || 1) - 1) / 4) + 2))
    : Math.min(4, Math.floor(dungeonIndex / 4));
  const actMultiplier = dungeonIndex + 1;
  const diffMultiplier = 1 + (difficultyLevel - 1) * 0.45;

  const dungeonWithinAct = dungeonIndex % 4;
  const victoryGold = Math.floor((3000 * actMultiplier + Math.random() * 1000) * diffMultiplier);
  const victoryShards = Math.floor((25 + actIndex * 35 + dungeonWithinAct * 10) * (1 + (difficultyLevel - 1) * 0.25));

  // Progressive base exp scale per Act: Act 1 (~350-900), Act 2 (~2000-4500), Act 3 (~8000-18000), Act 4 (~32000-70000), Act 5 (~120000-260000)
  const actBaseExps = [350, 2000, 8000, 32000, 120000];
  const baseExp = Math.floor(actBaseExps[actIndex] * (1 + dungeonWithinAct * 0.45));

  const victoryExp = Math.floor(baseExp * (1 + (difficultyLevel - 1) * 0.40));

  const availableRunes = getRunePoolForDungeon(currentDungeon.id, currentDungeon.riftTier);
  const droppedRunes: Record<string, number> = {};
  // Rune quantity: MF30→+1, Diff5→+1, Diff10→+1 추가 (초반 기근 완화, 고렙은 점진)
  const runeDropCount = Math.min(5, Math.floor(1 + Math.random() * 2 + (playerFortune > 30 ? 1 : 0) + (difficultyLevel >= 5 ? 1 : 0) + (difficultyLevel >= 10 ? 1 : 0)));

  for (let i = 0; i < runeDropCount; i++) {
    const picked = pickWeightedRune(availableRunes, { fortune: playerFortune, difficultyLevel, dungeonIdx: dungeonIndex });
    droppedRunes[picked] = (droppedRunes[picked] || 0) + 1;
  }

  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : getActDropPool(actIndex + 1);

  const itemDropCount = Math.min(4, Math.floor(1 + Math.random() * 2 + (difficultyLevel >= 5 ? 1 : 0)));
  const droppedItems: GameItem[] = [];

  for (let i = 0; i < itemDropCount; i++) {
    droppedItems.push(makeDungeonDrop(pool, { difficultyLevel, playerFortune, dungeonIdx: dungeonIndex }, `loot_${currentDungeon.id}`, i));
  }

  let advanceLevels = 1;
  let performanceGrade = 'B';
  if (playerHpPercent >= 90) {
    performanceGrade = 'S (압도적 승리! +3 난이도)';
    advanceLevels = 3;
  } else if (playerHpPercent >= 60) {
    performanceGrade = 'A (완벽한 제압! +2 난이도)';
    advanceLevels = 2;
  } else {
    performanceGrade = '⚔️ 클리어 (+1 난이도)';
    advanceLevels = 1;
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

export function prepareDungeonRun(dungeon: DungeonInfo): DungeonRoom[] {
  const rooms = dungeon.rooms.map(r => ({
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
  const isEndless = currentDungeon.isEndlessRift || currentDungeon.id.startsWith('endless_rift_');
  const dungeonIdx = isEndless
    ? Math.min(19, Math.max(8, (currentDungeon.riftTier || 1) + 7))
    : Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
  const actIndex = isEndless
    ? Math.min(4, Math.max(2, Math.floor(((currentDungeon.riftTier || 1) - 1) / 4) + 2))
    : Math.min(4, Math.floor(dungeonIdx / 4));
  const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
    ? currentDungeon.dropItems
    : getActDropPool(actIndex + 1);
  const ctx = { difficultyLevel, playerFortune, dungeonIdx };
  const items: GameItem[] = [];
  let gold = 0;
  let runeName: string | undefined;

  if (roomType === 'elite') {
    gold = Math.floor((80 + Math.random() * 60) * (dungeonIdx + 1));
    items.push(makeDungeonDrop(pool, ctx, 'elite', 0));
    // MF가 높을수록 두 번째 장비 확률 소폭 상승 (42%→~52%)
    const eliteSecondChance = Math.min(0.55, 0.40 + playerFortune * 0.0012);
    if (Math.random() < eliteSecondChance) items.push(makeDungeonDrop(pool, ctx, 'elite', 1));
    if (Math.random() < 0.35) {
      const runes = getRunePoolForDungeon(currentDungeon.id, currentDungeon.riftTier);
      runeName = pickWeightedRune(runes, { fortune: playerFortune, difficultyLevel, dungeonIdx });
    }
  } else if (roomType === 'normal') {
    gold = Math.floor((20 + Math.random() * 30) * (dungeonIdx + 1));
    // MF가 진행될수록 normal방도 소소하게 더 자주 드랍 (42%→~55%)
    const normalChance = Math.min(0.56, 0.42 + playerFortune * 0.0015);
    if (Math.random() < normalChance) {
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
