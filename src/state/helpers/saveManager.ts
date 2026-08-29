import { PlayerStats, GameItem, ConsumableItem, DungeonInfo, AchievementStats, TownUpgrades, DEFAULT_TOWN_UPGRADES } from '../../types/game';

export const SAVE_KEY = 'DARK_FANTASY_SAVE_V1';

export function calculateMaxExp(level: number): number {
  if (level <= 1) return 180;
  if (level <= 15) {
    return Math.floor(180 * Math.pow(1.14, level - 1) + 35 * (level - 1));
  }
  const baseAt15 = 180 * Math.pow(1.14, 14) + 35 * 14;
  return Math.floor(baseAt15 * Math.pow(1.115, level - 15) + 110 * (level - 15));
}

export const DEFAULT_RUNES_VAULT: Record<string, number> = {
  El: 3, Eld: 2, Tir: 2, Nef: 1, Eth: 2, Ith: 1, Tal: 3, Ral: 2, Ort: 2, Thul: 1
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  exp: 0,
  maxExp: 180,
  hp: 120,
  maxHp: 120,
  rage: 0,
  maxRage: 100,
  mana: 40,
  maxMana: 40,
  gold: 300,
  shards: 5,
  statPoints: 0,
  skillPoints: 1,
  str: 15,
  dex: 10,
  con: 15,
  int: 5,
  wis: 5,
  cha: 5
};

export interface SaveDataPayload {
  playerStats: PlayerStats;
  equipment: Record<string, GameItem>;
  inventory: GameItem[];
  itemStash?: GameItem[];
  runesVault: Record<string, number>;
  skillLevels?: Record<string, number>;
  passiveLevels?: Record<string, number>;
  skillRunes?: Record<string, string>;
  equippedSkillSlots?: Record<string, string>;
  consumables?: ConsumableItem[];
  currentDungeonId?: string;
  currentRoomId?: number;
  currentDifficulty?: number;
  maxUnlockedDifficulty?: number;
  achievementStats?: AchievementStats;
  claimedAchievements?: string[];
  hasSeenTutorial?: boolean;
  townUpgrades?: TownUpgrades;
  endlessRiftTier?: number;
  timestamp?: number;
}

export const getInitialSave = (): SaveDataPayload | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveDataPayload;
      // Migrate legacy endlessRiftTier stored under separate key
      if (parsed.endlessRiftTier === undefined) {
        try {
          const legacy = localStorage.getItem('d2_endless_rift_tier');
          if (legacy) {
            const tier = parseInt(legacy, 10);
            if (!isNaN(tier) && tier > 1) parsed.endlessRiftTier = Math.max(1, tier);
          }
        } catch {}
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load save from localStorage', e);
  }
  return null;
};

export const encodeSaveData = (data: SaveDataPayload): string => {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to export save data', e);
    return '';
  }
};

export const decodeSaveData = (encodedData: string): SaveDataPayload | null => {
  try {
    const json = decodeURIComponent(atob(encodedData.trim()));
    const data = JSON.parse(json);
    if (!data || !data.playerStats) return null;
    return data;
  } catch (e) {
    console.error('Failed to decode save data', e);
    return null;
  }
};
