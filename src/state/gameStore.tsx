import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ViewMode,
  ModalType,
  PlayerStats,
  GameItem,
  ItemStats,
  EquipSlot,
  ItemRarity,
  DungeonInfo,
  DungeonBuff,
  Monster,
  Skill,
  CombatLogEntry,
  ConsumableItem,
  RoomLootEvent
} from '../types/game';
import {
  INITIAL_EQUIPMENT,
  SAMPLE_INVENTORY,
  GAME_ITEMS_POOL,
  DUNGEONS_DATA,
  INITIAL_CONSUMABLES,
  D2_RUNES,
  RUNEWORD_RECIPES
} from '../data/gameData';
import { ACHIEVEMENTS, INITIAL_ACHIEVEMENT_STATS, AchievementStats } from '../data/achievements';
import { resolveAttack, createGoblin30Formation, findBestLaneForSkill, AttackResolution, CombatHitResult, createDungeonFormation } from '../combat/combatEngine';
import { calculateTotalStats, CalculatedTotalStats } from './helpers/statCalculator';
import { generateGambleItem, identifyItemHelper } from './helpers/itemGenerator';
import { calculateRuneWordItem, craftRuneWordHelper, craftRuneWordWithTransmuteHelper, transmuteRuneInVaultHelper } from './helpers/runeWordCalculator';
import { upgradeSkillHelper, resetSkillPointsHelper, getEffectiveSkill } from './helpers/skillManager';
import { getItemSellPrice, bulkSellHelper, socketRuneHelper, cubeTransmuteHelper } from './helpers/cubeCraftingHelper';
import { claimTreasureHelper, claimRuneAltarHelper, createShrineBuff, generateVictoryLoot, prepareDungeonRun, makeFirstClearSteelBase, generateRoomClearLoot } from './helpers/dungeonEventHelper';
import { isActUnlocked } from '../data/dungeons';
import { WARRIOR_SKILLS, ALL_AVAILABLE_SKILLS, DEFAULT_EQUIPPED_SLOTS, getSkillById, isSkillUnlocked } from '../data/skills';
import { calculateAttackGains, compressLaneSurvivors, resolveHordeCounterAttack } from './helpers/combatActionHelper';
import {
  SAVE_KEY,
  getInitialSave,
  DEFAULT_RUNES_VAULT,
  DEFAULT_PLAYER_STATS,
  calculateMaxExp,
  encodeSaveData,
  decodeSaveData,
  SaveDataPayload
} from './helpers/saveManager';
import {
  claimAchievementHelper,
  claimAllAchievementsHelper
} from './helpers/achievementManager';




import {
  setMasterVolume,
  getMasterVolume,
  setAudioMuted,
  getAudioMuted,
  playSlashSound,
  playHitSound,
  playKillSound,
  playExplosionSound,
  playHordeAttackSound,
  playRuneWordSound,
  playIdentifySound,
  playLegendaryDropSound,
  playDeathSound,
  playMilestoneSound,
  playPotionSound,
  startBGM
} from '../utils/audio';

interface FloatingDamageText {
  id: string;
  lane: number;
  depth: number;
  damage: number;
  isFatal: boolean;
  isCrit: boolean;
  isOverkill?: boolean;
}

interface GameContextType {
  currentDifficulty: number;
  maxUnlockedDifficulty: number;
  setCurrentDifficulty: (level: number) => void;
  latestRoomLootEvent: RoomLootEvent | null;
  clearLatestRoomLootEvent: () => void;
  viewMode: ViewMode;
  activeModal: ModalType;
  playerStats: PlayerStats;
  equipment: Record<string, GameItem>;
  inventory: GameItem[];
  consumables: ConsumableItem[];
  currentDungeon: DungeonInfo;
  currentRoomId: number;
  monsters: Monster[];
  playerLane: number;
  selectedSkill: Skill;
  combatLogs: CombatLogEntry[];
  chainCount: number; // Kills strictly from the LAST action
  maxChainThisRoom: number;
  isAttacking: boolean;
  isEnemyTurn: boolean;
  hordeTimelinePercent: number;
  floatingDamages: FloatingDamageText[];
  
  // Computed stats
  totalStats: CalculatedTotalStats;

  // Preview calculation (100% matched with resolveAttack)
  preview: AttackResolution;
  bestLaneHint: number;

  // Actions
  setViewMode: (view: ViewMode) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  equipItem: (item: GameItem, targetSlot?: EquipSlot) => void;
  unequipItem: (slot: EquipSlot) => void;
  upgradeStat: (stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', amount?: number) => void;
  resetStatPoints: () => void;
  setPlayerLane: (lane: number) => void;
  setSelectedSkill: (skill: Skill) => void;
  selectSkillOrExecute: (skill: Skill) => void;
  executeAttack: () => void;
  useConsumable: (hotkeyOrId: string) => void;
  enterDungeon: (dungeonId: string, difficulty?: number) => void;
  selectNextRoom: (roomId: number) => void;
  pendingExitRoomId: number | null;
  cyclePendingExit: (dir: number) => void;
  returnToTown: () => void;
  abandonDungeon: () => void;
  addLog: (text: string, type?: CombatLogEntry['type']) => void;
  resetBattleFormation: () => void;
  
  // Skill Slots & Runes & Point Upgrades
  equippedSkillSlots: Record<string, string>;
  equipSkillToSlot: (slot: 'Q' | 'W' | 'E' | 'R', skillId: string) => void;
  equippedSkills: Skill[];
  getSkillForSlot: (slot: 'Q' | 'W' | 'E' | 'R') => Skill;
  skillRunes: Record<string, string>;
  setSkillRune: (skillId: string, runeId: string | null) => void;
  skillLevels: Record<string, number>;
  upgradeSkill: (skillId: string, amount?: number) => void;
  resetSkillPoints: () => void;

  // Dedicated Rune Vault (El to Zod counts) & Smart Crafting
  runesVault: Record<string, number>;
  addRuneToVault: (runeKey: string, count?: number) => void;
  craftRuneWord: (targetItemId: string, recipeId: string) => boolean;
  craftRuneWordWithTransmute: (targetItemId: string, recipeId: string) => boolean;
  transmuteRunesInVault: (runeKey: string) => boolean;

  // Dungeon Victory Loot & Deckard Cain Instant Identify Modal
  isVictoryModalOpen: boolean;
  dungeonVictoryLoot: {
    gold: number;
    shards: number;
    exp: number;
    items: GameItem[];
    runes: Record<string, number>;
    advanceLevels?: number;
    nextDifficulty?: number;
    performanceGrade?: string;
  } | null;
  closeVictoryModal: () => void;
  identifyAllVictoryLoot: () => void;

  // Death & Resurrection Modal
  isDeathModalOpen: boolean;
  confirmDeathAndReturnToTown: () => void;
  isLevelUpAnimated: boolean;

  // Diablo 2 Crafting & Features
  socketRuneIntoItem: (targetItemId: string, runeId: string) => void;
  transmuteInCube: (itemIds: string[]) => void;
  gambleItem: (gambleType: 'weapon' | 'armor' | 'ring' | 'amulet') => { item: GameItem; isHighRarity: boolean } | null;
  identifyItem: (itemId: string) => void;
  identifyAllItems: () => GameItem[];
  sellItem: (itemId: string) => number;
  bulkSellItems: (rarities?: ItemRarity[]) => { count: number; gold: number };
  getItemSellPrice: (item: GameItem) => number;
  resetGameSave: () => void;

  // Settings, Audio & Save Backup
  soundVolume: number;
  setSoundVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  exportSaveData: () => string;
  importSaveData: (encodedData: string) => boolean;
  buyPotions: () => void;

  // Room Events & Dungeon Buffs
  dungeonBuffs: DungeonBuff[];
  roomEventClaimed: boolean;
  claimTreasure: () => { gold: number; items: GameItem[]; shards: number } | null;
  claimRuneAltar: () => { runeName: string; count: number } | null;
  claimShrine: (buffType: 'fortune' | 'crit' | 'defense') => void;

  // Interactive Onboarding Tutorial
  hasSeenTutorial: boolean;
  isTutorialOpen: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  completeTutorial: () => void;
  setTutorialStep: (step: number) => void;

  // Achievement System
  achievementStats: AchievementStats;
  claimedAchievements: string[];
  claimAchievementReward: (achievementId: string) => void;
  claimAllAchievementRewards: () => void;
}

const savedData = getInitialSave();

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('town');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => savedData?.playerStats || DEFAULT_PLAYER_STATS);
  const [equipment, setEquipment] = useState<Record<string, GameItem>>(() => savedData?.equipment || INITIAL_EQUIPMENT);
  const [runesVault, setRunesVault] = useState<Record<string, number>>(() => {
    const baseVault: Record<string, number> = { ...DEFAULT_RUNES_VAULT, ...(savedData?.runesVault || {}) };
    if (savedData?.inventory) {
      savedData.inventory.forEach((item: GameItem) => {
        if (item.slot === 'rune') {
          const matched = Object.keys(D2_RUNES).find(k => item.name.includes(k) || item.id.toLowerCase().includes(k.toLowerCase()));
          if (matched) {
            baseVault[matched] = (baseVault[matched] || 0) + 1;
          }
        }
      });
    }
    return baseVault;
  });

  const [inventory, setInventory] = useState<GameItem[]>(() => {
    if (savedData?.inventory) {
      const clean = savedData.inventory.filter((item: GameItem) => item.slot !== 'rune' && item.slot !== 'material');
      if (clean.length > 0) return clean;
    }
    return SAMPLE_INVENTORY;
  });
  const [consumables, setConsumables] = useState<ConsumableItem[]>(() => savedData?.consumables || INITIAL_CONSUMABLES);
  const [currentDungeon, setCurrentDungeon] = useState<DungeonInfo>(() => {
    if (savedData?.currentDungeonId) {
      return DUNGEONS_DATA.find(d => d.id === savedData.currentDungeonId) || DUNGEONS_DATA[0];
    }
    return DUNGEONS_DATA[0];
  });
  const [currentRoomId, setCurrentRoomId] = useState<number>(() => savedData?.currentRoomId || 2);
  const [pendingExitRoomId, setPendingExitRoomId] = useState<number | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(() => savedData?.currentDifficulty || 1);
  const [maxUnlockedDifficulty, setMaxUnlockedDifficulty] = useState<number>(() => savedData?.maxUnlockedDifficulty || 1);
  const [latestRoomLootEvent, setLatestRoomLootEvent] = useState<RoomLootEvent | null>(null);
  const clearLatestRoomLootEvent = () => setLatestRoomLootEvent(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(() => savedData?.hasSeenTutorial ?? false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => !(savedData?.hasSeenTutorial ?? false));
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [equippedSkillSlots, setEquippedSkillSlots] = useState<Record<string, string>>(() => ({
    ...DEFAULT_EQUIPPED_SLOTS,
    ...(savedData?.equippedSkillSlots || {})
  }));
  const [skillRunes, setSkillRunes] = useState<Record<string, string>>(() => savedData?.skillRunes || {
    slash: 'rune_fire'
  });
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>(() => savedData?.skillLevels || {
    slash: 1,
    execute: 1,
    cleave: 1,
    whirlwind: 1
  });

  // Achievement System States
  const [achievementStats, setAchievementStats] = useState<AchievementStats>(() => {
    if (savedData?.achievementStats) {
      return {
        ...INITIAL_ACHIEVEMENT_STATS,
        ...savedData.achievementStats,
        dungeonClears: savedData.achievementStats.dungeonClears || {}
      };
    }
    return INITIAL_ACHIEVEMENT_STATS;
  });
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => savedData?.claimedAchievements || []);

  // Sync player level to achievementStats
  useEffect(() => {
    setAchievementStats(prev => {
      if (playerStats.level > prev.playerLevel) {
        return { ...prev, playerLevel: playerStats.level };
      }
      return prev;
    });
  }, [playerStats.level]);
  
  const persistStateRef = useRef<SaveDataPayload | null>(null);
  persistStateRef.current = {
    playerStats,
    equipment,
    inventory,
    runesVault,
    consumables,
    currentDungeonId: currentDungeon.id,
    currentRoomId,
    currentDifficulty,
    maxUnlockedDifficulty,
    skillRunes,
    skillLevels,
    achievementStats,
    claimedAchievements,
    hasSeenTutorial
  };

  // Debounced autosave — HP/rage change every hit; writing JSON every frame stalls 1-core clients.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      try {
        const data = persistStateRef.current;
        if (data) localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to auto-save to localStorage', e);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [playerStats, equipment, inventory, runesVault, consumables, currentDungeon.id, currentRoomId, currentDifficulty, maxUnlockedDifficulty, equippedSkillSlots, skillRunes, skillLevels, achievementStats, claimedAchievements]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flush = () => {
      try {
        const data = persistStateRef.current;
        if (data) localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch { /* ignore */ }
    };
    const onVis = () => { if (document.hidden) flush(); };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Claim single achievement reward
  const claimAchievementReward = (achievementId: string) => {
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach || claimedAchievements.includes(achievementId)) return;
    if (!ach.condition(achievementStats)) {
      addLog('아직 달성하지 못한 업적입니다.', 'system');
      return;
    }

    setClaimedAchievements(prev => [...prev, achievementId]);
    const goldGain = ach.reward.gold || 0;
    const shardGain = ach.reward.shards || 0;

    if (goldGain > 0 || shardGain > 0) {
      setPlayerStats(prev => ({
        ...prev,
        gold: prev.gold + goldGain,
        shards: prev.shards + shardGain
      }));
    }

    playMilestoneSound(100);
    addLog(`🏆 [업적 달성] "${ach.name}" 보상 수령 완료! (${goldGain > 0 ? `+${goldGain}G ` : ''}${shardGain > 0 ? `+${shardGain} 샤드` : ''})`, 'loot');
  };

  // Claim all eligible unclaimed achievement rewards
  const claimAllAchievementRewards = () => {
    const eligible = ACHIEVEMENTS.filter(a => a.condition(achievementStats) && !claimedAchievements.includes(a.id));
    if (eligible.length === 0) return;

    let totalGold = 0;
    let totalShards = 0;
    const newlyClaimed: string[] = [];

    eligible.forEach(ach => {
      newlyClaimed.push(ach.id);
      totalGold += ach.reward.gold || 0;
      totalShards += ach.reward.shards || 0;
    });

    setClaimedAchievements(prev => [...prev, ...newlyClaimed]);
    setPlayerStats(prev => ({
      ...prev,
      gold: prev.gold + totalGold,
      shards: prev.shards + totalShards
    }));

    playMilestoneSound(100);
    addLog(`🏆 ${eligible.length}개의 업적 보상을 일괄 수령했습니다! (+${totalGold.toLocaleString()}G, +${totalShards} 샤드)`, 'loot');
  };

  const upgradeSkill = (skillId: string, amount: number = 1) => {
    if (!isSkillUnlocked(skillId, playerStats.level)) {
      addLog('아직 해금되지 않은 스킬입니다.', 'system');
      return;
    }
    const res = upgradeSkillHelper(skillId, skillLevels, playerStats.skillPoints, amount);
    if (!res.success) {
      addLog(res.message, 'system');
      return;
    }
    if (res.newLevels && res.newSkillPoints !== undefined) {
      setSkillLevels(res.newLevels);
      setPlayerStats(prev => ({ ...prev, skillPoints: res.newSkillPoints! }));
      playRuneWordSound();
      addLog(res.message, 'system');
    }
  };

  const resetSkillPoints = () => {
    const { newLevels, newSkillPoints, refundedPoints } = resetSkillPointsHelper(skillLevels, playerStats.skillPoints);
    setSkillLevels(newLevels);
    setPlayerStats(prev => ({ ...prev, skillPoints: newSkillPoints }));
    addLog(`🔄 모든 스킬 포인트(${refundedPoints}P)를 초기화하여 반환했습니다.`, "system");
  };

  const addRuneToVault = (runeKey: string, count = 1) => {
    setRunesVault(prev => ({
      ...prev,
      [runeKey]: (prev[runeKey] || 0) + count
    }));
    addLog(`💎 [${runeKey} 룬] x${count}개를 룬 보관함에 획득했습니다!`, 'loot');
  };

  const craftRuneWord = (targetItemId: string, recipeId: string): boolean => {
    const targetItem = inventory.find(i => i.id === targetItemId) || Object.values(equipment).find(i => i?.id === targetItemId);
    const res = craftRuneWordHelper(targetItem, recipeId, runesVault);
    if (!res.success || !res.updatedItem || !res.newVault) {
      addLog(res.message, 'system');
      return false;
    }

    setRunesVault(res.newVault);
    const equippedSlotKey = Object.keys(equipment).find(k => equipment[k as EquipSlot]?.id === targetItemId) as EquipSlot | undefined;
    if (equippedSlotKey) {
      setEquipment(prev => ({ ...prev, [equippedSlotKey]: res.updatedItem! }));
    } else {
      setInventory(prev => prev.map(i => i.id === targetItemId ? res.updatedItem! : i));
    }

    playRuneWordSound();
    setAchievementStats(prev => ({ ...prev, runeWordsCreated: prev.runeWordsCreated + 1 }));
    addLog(res.message, 'loot');
    return true;
  };

  const craftRuneWordWithTransmute = (targetItemId: string, recipeId: string): boolean => {
    const targetItem = inventory.find(i => i.id === targetItemId) || Object.values(equipment).find(i => i?.id === targetItemId);
    const res = craftRuneWordWithTransmuteHelper(targetItem, recipeId, runesVault);
    if (!res.success || !res.updatedItem || !res.newVault) {
      addLog(res.message, 'system');
      return false;
    }

    setRunesVault(res.newVault);
    const equippedSlotKey = Object.keys(equipment).find(k => equipment[k as EquipSlot]?.id === targetItemId) as EquipSlot | undefined;
    if (equippedSlotKey) {
      setEquipment(prev => ({ ...prev, [equippedSlotKey]: res.updatedItem! }));
    } else {
      setInventory(prev => prev.map(i => i.id === targetItemId ? res.updatedItem! : i));
    }

    playRuneWordSound();
    setAchievementStats(prev => ({ ...prev, runeWordsCreated: prev.runeWordsCreated + 1 }));
    addLog(res.message, 'loot');
    return true;
  };
  // Dungeon Victory Loot Modal State
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [dungeonVictoryLoot, setDungeonVictoryLoot] = useState<{
    gold: number;
    shards: number;
    exp: number;
    items: GameItem[];
    runes: Record<string, number>;
    advanceLevels?: number;
    nextDifficulty?: number;
    performanceGrade?: string;
  } | null>(null);

  const closeVictoryModal = () => {
    setIsVictoryModalOpen(false);
    setDungeonVictoryLoot(null);
    setViewMode('town');
  };

  const identifyAllVictoryLoot = () => {
    if (!dungeonVictoryLoot) return;

    let hasLegendary = false;
    const identifiedItems = dungeonVictoryLoot.items.map(item => {
      const identified = identifyItemHelper(item, playerStats.level);
      if (identified.rarity === 'unique' || identified.rarity === 'legendary' || identified.rarity === 'set') {
        hasLegendary = true;
      }
      return identified;
    });

    setDungeonVictoryLoot(prev => prev ? { ...prev, items: identifiedItems } : null);
    setInventory(prev => prev.map(i => {
      const found = identifiedItems.find(idItem => idItem.id === i.id);
      return found ? found : i;
    }));

    playIdentifySound();
    if (hasLegendary) {
      setTimeout(() => playLegendaryDropSound(), 300);
      addLog(`✨ 데커드 케인의 감정으로 전설/유니크 아이템의 숨겨진 힘이 깨어났습니다!`, 'loot');
    } else {
      addLog(`📜 데커드 케인이 모든 전리품을 감정했습니다.`, 'system');
    }
  };

  const transmuteRunesInVault = (runeKey: string): boolean => {
    const res = transmuteRuneInVaultHelper(runeKey, runesVault);
    if (!res.success || !res.newVault) {
      addLog(res.message, 'system');
      return false;
    }

    setRunesVault(res.newVault);
    playRuneWordSound();
    addLog(res.message, 'loot');
    return true;
  };
  const equipSkillToSlot = (slot: 'Q' | 'W' | 'E' | 'R', skillId: string) => {
    setEquippedSkillSlots(prev => ({ ...prev, [slot]: skillId }));
    const sk = getSkillById(skillId);
    if (sk) {
      addLog(`⚡ [${slot}] 슬롯에 '${sk.name}' 스킬이 장착되었습니다.`, 'system');
    }
  };

  const getSkillForSlot = useCallback((slot: 'Q' | 'W' | 'E' | 'R'): Skill => {
    const skillId = equippedSkillSlots[slot] || DEFAULT_EQUIPPED_SLOTS[slot];
    const base = getSkillById(skillId) || WARRIOR_SKILLS[0];
    return {
      ...base,
      hotkey: slot,
      activeRuneId: skillRunes[base.id] || base.activeRuneId || null,
      level: skillLevels[base.id] || 1
    };
  }, [equippedSkillSlots, skillRunes, skillLevels]);

  const equippedSkills = useMemo<Skill[]>(() => {
    const slots: ('Q' | 'W' | 'E' | 'R')[] = ['Q', 'W', 'E', 'R'];
    return slots.map(slot => getSkillForSlot(slot));
  }, [getSkillForSlot]);

  const setSkillRune = (skillId: string, runeId: string | null) => {
    setSkillRunes(prev => {
      const copy = { ...prev };
      if (runeId) {
        copy[skillId] = runeId;
      } else {
        delete copy[skillId];
      }
      return copy;
    });
    addLog(`스킬 룬 세팅이 업데이트되었습니다.`, 'system');
  };
  
  // Benchmark 30-Goblin formation from GDD Section 26
  const [monsters, setMonsters] = useState<Monster[]>(createGoblin30Formation());
  const [playerLane, setPlayerLane] = useState<number>(2);
  const [selectedSkill, setSelectedSkill] = useState<Skill>(WARRIOR_SKILLS[0]);
  const [chainCount, setChainCount] = useState<number>(0);
  const [maxChainThisRoom, setMaxChainThisRoom] = useState<number>(0);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [isEnemyTurn, setIsEnemyTurn] = useState<boolean>(false);
  const [hordeTimelinePercent, setHordeTimelinePercent] = useState<number>(30);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamageText[]>([]);
  
  const [tempBuffs, setTempBuffs] = useState<{ defenseBonus: number; overkillBonus: number }>({
    defenseBonus: 0,
    overkillBonus: 0
  });

  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [isLevelUpAnimated, setIsLevelUpAnimated] = useState(false);
  const [dungeonBuffs, setDungeonBuffs] = useState<DungeonBuff[]>([]);
  const [roomEventClaimed, setRoomEventClaimed] = useState<boolean>(false);


  // Sound volume & Mute settings
  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.8;
    const saved = localStorage.getItem('DARK_FANTASY_VOL');
    const val = saved ? parseFloat(saved) : 0.8;
    setMasterVolume(val);
    return val;
  });
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const muted = localStorage.getItem('DARK_FANTASY_MUTE') === 'true';
    setAudioMuted(muted);
    return muted;
  });

  const setSoundVolume = (v: number) => {
    setSoundVolumeState(v);
    setMasterVolume(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('DARK_FANTASY_VOL', v.toString());
    }
  };

  const setIsMuted = (muted: boolean) => {
    setIsMutedState(muted);
    setAudioMuted(muted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('DARK_FANTASY_MUTE', muted ? 'true' : 'false');
    }
  };

  const exportSaveData = (): string => {
    const data = {
      playerStats,
      equipment,
      inventory,
      runesVault,
      skillLevels,
      skillRunes,
      consumables,
      currentDungeonId: currentDungeon.id,
      currentRoomId,
      currentDifficulty,
      maxUnlockedDifficulty,
      achievementStats,
      claimedAchievements,
      hasSeenTutorial,
      timestamp: Date.now()
    };
    try {
      const json = JSON.stringify(data);
      return btoa(encodeURIComponent(json));
    } catch (e) {
      console.error('Failed to export save data', e);
      return '';
    }
  };

  const importSaveData = (encodedData: string): boolean => {
    try {
      const json = decodeURIComponent(atob(encodedData.trim()));
      const data = JSON.parse(json);
      if (!data || !data.playerStats) return false;

      if (data.playerStats) setPlayerStats(data.playerStats);
      if (data.equipment) setEquipment(data.equipment);
      if (data.inventory) setInventory(data.inventory);
      if (data.runesVault) setRunesVault(data.runesVault);
      if (data.equippedSkillSlots) setEquippedSkillSlots(data.equippedSkillSlots);
      if (data.skillLevels) setSkillLevels(data.skillLevels);
      if (data.skillRunes) setSkillRunes(data.skillRunes);
      if (data.consumables) setConsumables(data.consumables);
      if (data.achievementStats) setAchievementStats(data.achievementStats);
      if (data.claimedAchievements) setClaimedAchievements(data.claimedAchievements);
      if (data.hasSeenTutorial !== undefined) setHasSeenTutorial(data.hasSeenTutorial);
      if (data.currentDungeonId) {
        const d = DUNGEONS_DATA.find(x => x.id === data.currentDungeonId) || DUNGEONS_DATA[0];
        setCurrentDungeon(d);
      }
      if (data.currentRoomId) setCurrentRoomId(data.currentRoomId);
    if (data.currentDifficulty) setCurrentDifficulty(data.currentDifficulty);
    if (data.maxUnlockedDifficulty) setMaxUnlockedDifficulty(data.maxUnlockedDifficulty);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      }
      addLog('💾 세이브 데이터를 성공적으로 불러왔습니다!', 'system');
      playRuneWordSound();
      return true;
    } catch (e) {
      console.error('Failed to import save data', e);
      addLog('❌ 잘못된 세이브 데이터 형식입니다.', 'system');
      return false;
    }
  };


  const [dungeonSnapshot, setDungeonSnapshot] = useState<{
    inventory: GameItem[];
    runesVault: Record<string, number>;
    gold: number;
    exp: number;
    level: number;
    shards: number;
  } | null>(null);
  const runFortuneRef = useRef(0);

  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([
    { id: '1', timestamp: '12:00', text: '브라우저 로컬 자동 저장(Auto-Save) 활성화됨. [Space] 공격 / 빠른 파밍', type: 'system' }
  ]);

  const addLog = useCallback((text: string, type: CombatLogEntry['type'] = 'system') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCombatLogs(prev => [
      { id: Math.random().toString(36).substring(2, 9), timestamp: timeStr, text, type },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const addPlayerExp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setPlayerStats(prev => {
      let currentExp = prev.exp + amount;
      let currentLevel = prev.level;
      let currentMaxExp = prev.maxExp || calculateMaxExp(currentLevel);
      let statPointsGained = 0;
      let skillPointsGained = 0;
      let didLevelUp = false;

      while (currentExp >= currentMaxExp) {
        currentExp -= currentMaxExp;
        currentLevel += 1;
        currentMaxExp = calculateMaxExp(currentLevel);
        statPointsGained += 5;
        skillPointsGained += 1;
        didLevelUp = true;
      }

      if (didLevelUp) {
        playRuneWordSound();
        setIsLevelUpAnimated(true);
        setTimeout(() => setIsLevelUpAnimated(false), 4500);

        addLog(`🌟 LEVEL UP! 레벨 ${currentLevel} 달성! (스탯 포인트 +${statPointsGained}P, 스킬 포인트 +${skillPointsGained}P 획득 & HP/마나 완전 회복!)`, 'loot');
        const newMaxHp = 120 + (currentLevel - 1) * 25 + prev.con * 5;
        const newMaxMana = 40 + (currentLevel - 1) * 8 + prev.int * 3;
        return {
          ...prev,
          level: currentLevel,
          exp: currentExp,
          maxExp: currentMaxExp,
          statPoints: prev.statPoints + statPointsGained,
          skillPoints: prev.skillPoints + skillPointsGained,
          maxHp: newMaxHp,
          hp: newMaxHp,
          maxMana: newMaxMana,
          mana: newMaxMana
        };
      }

      return {
        ...prev,
        exp: currentExp,
        maxExp: currentMaxExp
      };
    });
  }, [addLog]);

  const resetStatPoints = useCallback(() => {
    const totalEarnedPoints = (playerStats.level - 1) * 5;
    setPlayerStats(prev => ({
      ...prev,
      str: 15,
      dex: 10,
      con: 15,
      int: 5,
      wis: 5,
      cha: 5,
      statPoints: totalEarnedPoints
    }));
    playRuneWordSound();
    addLog(`🔄 투자한 모든 스탯 포인트를 회수하여 ${totalEarnedPoints}P를 환급받았습니다.`, 'system');
  }, [playerStats.level, addLog]);

  // Compute Total Character Stats
  const totalStats = useMemo(() => {
    return calculateTotalStats(playerStats, equipment, tempBuffs, dungeonBuffs);
  }, [playerStats, equipment, tempBuffs, dungeonBuffs]);

  // Active Skill with equipped Skill Rune and invested Skill Level
  const effectiveSkill: Skill = useMemo(() => {
    const baseSkill = WARRIOR_SKILLS.find(s => s.id === selectedSkill.id) || selectedSkill;
    const currentLv = skillLevels[selectedSkill.id] || 1;
    return {
      ...baseSkill,
      level: currentLv,
      activeRuneId: skillRunes[selectedSkill.id] || selectedSkill.activeRuneId || null
    };
  }, [selectedSkill, skillRunes, skillLevels]);

  // Real-time Preview 100% matched with resolveAttack
  const preview = useMemo(() => {
    return resolveAttack(
      playerStats.level,
      totalStats,
      effectiveSkill,
      playerLane,
      monsters,
      true // Deterministic for preview
    );
  }, [playerStats.level, totalStats, effectiveSkill, playerLane, monsters]);

  const bestLaneHint = useMemo(() => {
    if (!monsters.length) return playerLane;
    return findBestLaneForSkill(playerStats.level, totalStats, effectiveSkill, monsters);
  }, [playerStats.level, totalStats, effectiveSkill, monsters, playerLane]);

  // ==============================================================
  // REAL HACK & SLASH SEQUENTIAL EXECUTION & HORDE COUNTER-ATTACK
  // ==============================================================
  const executeAttack = useCallback(() => {
    if (viewMode !== 'battle' || isAttacking || isEnemyTurn || monsters.length === 0) return;
    if (playerStats.hp <= 0) {
      addLog('플레이어가 쓰러졌습니다! 마을로 귀환해야 합니다.', 'system');
      return;
    }
    const rawRageCost = effectiveSkill.rageCost || 0;
    const discount = (totalStats.rageCostReduction || 0) / 100;
    const actualRageCost = Math.max(0, Math.floor(rawRageCost * (1 - discount)));

    if (playerStats.rage < actualRageCost) {
      addLog(`분노가 부족합니다! (필요: ${actualRageCost}, 현재: ${playerStats.rage})`, "system");
      return;
    }

    setIsAttacking(true);
    if (actualRageCost > 0) {
      setPlayerStats(prev => ({ ...prev, rage: Math.max(0, prev.rage - actualRageCost) }));
    }

    const result = resolveAttack(
      playerStats.level,
      totalStats,
      effectiveSkill,
      playerLane,
      monsters,
      false
    );

    playSlashSound();
    const critText = result.isCritical ? " ★ 치명타 폭발!" : "";
    const flurryText = result.isExtraStrike ? " ⚡ [신속 연격 (+35%)]" : "";
    addLog(
      `[${effectiveSkill.name} Lv.${effectiveSkill.level || 1}] 발동!${critText}${flurryText} (총 위력: ${result.totalDamage})`,
      'damage'
    );

    const targets = result.targetsHit;
    const kills = result.kills;
    const speedFactor = Math.max(0.4, 1 - Math.min(60, (totalStats.attackSpeed || 0)) * 0.008);
    const hitStepDuration = Math.max(25, Math.min(80, Math.floor((600 / Math.max(1, targets.length)) * speedFactor)));

    targets.forEach((hit, index) => {
      setTimeout(() => {
        playHitSound(hit.depth);
        if (hit.isFatal) {
          const killIndex = kills.indexOf(hit.monsterId) + 1;
          playKillSound(killIndex);
          const deadMonster = monsters.find(mon => mon.id === hit.monsterId);
          if (deadMonster) playDeathSound(deadMonster.rank || 'normal');
        }

        setFloatingDamages(prev => [
          ...prev,
          {
            id: `dmg_${hit.monsterId}_${Date.now()}_${index}`,
            lane: hit.lane,
            depth: hit.depth,
            damage: hit.damage,
            isFatal: hit.isFatal,
            isCrit: result.isCritical,
            isOverkill: hit.isOverkillHit || false
          }
        ]);

        setTimeout(() => {
          setFloatingDamages(prev => prev.slice(1));
        }, 800);
      }, index * hitStepDuration);
    });

    const totalHitTime = targets.length * hitStepDuration + 150;

    setTimeout(() => {
      if (kills.length >= 5) {
        playExplosionSound();
      }

      setChainCount(result.chainCount);
      if (result.chainCount > maxChainThisRoom) {
        setMaxChainThisRoom(result.chainCount);
      }

      const gains = calculateAttackGains(result, effectiveSkill, monsters, playerStats.maxHp, totalStats.defense);

      if (gains.actionExp > 0) {
        addPlayerExp(gains.actionExp);
      }

      const turnRage = totalStats.turnRageRegen || 0;
      setPlayerStats(prev => ({
        ...prev,
        gold: prev.gold + gains.gainedGold,
        rage: Math.min(prev.maxRage, prev.rage + gains.totalRageGained + turnRage),
        hp: Math.min(prev.maxHp, prev.hp + gains.totalHpHealed),
        shield: Math.min(prev.maxHp, (prev.shield || 0) + (gains.shieldGained || 0))
      }));

      if (gains.shieldGained && gains.shieldGained > 0) {
        addLog(`🛡️ [방패 강타] 생명력 보호막 +${gains.shieldGained} 생성! (현재 쉴드: ${Math.min(playerStats.maxHp, (playerStats.shield || 0) + gains.shieldGained)})`, "system");
      }
      if (turnRage > 0) {
        addLog(`🧘 [명상 오라] 매 턴 분노 +${turnRage} 자동 충전!`, "system");
      }

      setAchievementStats(prev => ({
        ...prev,
        maxChainEver: Math.max(prev.maxChainEver, result.chainCount),
        totalKills: prev.totalKills + result.kills.length,
        totalGoldEarned: prev.totalGoldEarned + gains.gainedGold,
        bossKills: prev.bossKills + gains.bossKillsThisHit
      }));

      if (gains.totalRageGained > 0) {
        const refundText = gains.voidKillRage > 0 ? ` + 공허 처치 환급 ${gains.voidKillRage}` : "";
        addLog(`⚡ 분노 +${gains.totalRageGained} 충전! (타격 ${gains.primaryTargetCount}명중 x${effectiveSkill.rageGainPerHit || 0}${refundText})`, "system");
      }

      if (gains.totalHpHealed > 0) {
        const skillHealText = gains.skillHeal > 0 ? `(처형 흡혈 ${gains.skillHeal})` : "";
        const voidHealText = gains.voidHeal > 0 ? `(공허 영혼 흡수 ${gains.voidHeal})` : "";
        addLog(`🩸 생명력 +${gains.totalHpHealed} 흡수 회복! ${skillHealText} ${voidHealText}`.trim(), "loot");
      }

      if (result.chainCount > 0) {
        addLog(`💥 [Chain x${result.chainCount}] ${result.chainCount}마리 몬스터 연쇄 처치! (+${gains.gainedGold}G)`, "chain");
        if (result.chainCount >= 100) playMilestoneSound(100);
        else if (result.chainCount >= 50) playMilestoneSound(50);
        else if (result.chainCount >= 25) playMilestoneSound(25);
        else if (result.chainCount >= 10) playMilestoneSound(10);
      }

      if (result.stopperId) {
        const stopperMonster = monsters.find(m => m.id === result.stopperId);
        addLog(`🛡️ ${stopperMonster?.name || "적"}의 견고한 방어에 오버킬 체인이 저지되었습니다!`, "system");
      }

      const survivors = compressLaneSurvivors(result.newMonsters);
      setMonsters(survivors);
      setIsAttacking(false);

      if (survivors.length === 0) {
        const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
        const isEventRewardRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');

        setCurrentDungeon(prevDungeon => ({
          ...prevDungeon,
          rooms: prevDungeon.rooms.map(r => r.id === currentRoomId ? { ...r, cleared: true } : r)
        }));

        playRuneWordSound();

        if (currentRoom?.type === 'boss') {
          addLog('👑 [보스 토벌 성공] 던전의 최종 보스를 쓰러뜨렸습니다! 승리의 전리품을 확인하세요!', 'loot');
          setTimeout(() => {
            const hpPercent = Math.max(1, Math.round((playerStats.hp / Math.max(1, playerStats.maxHp)) * 100));
            const victory = generateVictoryLoot(currentDungeon, runFortuneRef.current, currentDifficulty, hpPercent);
            const isFirstAct1 = currentDungeon.id === 'act1_crypt' && !(achievementStats.dungeonClears['act1_crypt']);
            if (isFirstAct1) {
              const need = Math.max(1, calculateMaxExp(playerStats.level) - playerStats.exp);
              victory.exp = Math.max(victory.exp, need);
              victory.items = [makeFirstClearSteelBase(), ...victory.items];
              victory.performanceGrade = '첫 원정 성공 · 레벨 업';
            }
            setMaxUnlockedDifficulty(prev => Math.max(prev, victory.nextDifficulty));

            setPlayerStats(p => ({
              ...p,
              gold: p.gold + victory.gold,
              shards: p.shards + victory.shards
            }));

            const uniqueDropCount = victory.items.filter(i => i.rarity === "unique" || i.rarity === "legendary" || i.rarity === "runeword").length;
            setAchievementStats(prev => ({
              ...prev,
              totalGoldEarned: prev.totalGoldEarned + victory.gold,
              maxDifficultyEver: Math.max(prev.maxDifficultyEver || 1, victory.nextDifficulty),
              dungeonClears: {
                ...prev.dungeonClears,
                [currentDungeon.id]: (prev.dungeonClears[currentDungeon.id] || 0) + 1
              },
              uniqueItemsFound: prev.uniqueItemsFound + uniqueDropCount
            }));

            addPlayerExp(victory.exp);
            setInventory(prev => [...prev, ...victory.items]);

            setRunesVault(prev => {
              const copy = { ...prev };
              Object.entries(victory.runes).forEach(([rKey, count]) => {
                copy[rKey] = (copy[rKey] || 0) + count;
              });
              return copy;
            });

            setDungeonVictoryLoot({
              gold: victory.gold,
              shards: victory.shards,
              exp: victory.exp,
              items: victory.items,
              runes: victory.runes,
              advanceLevels: victory.advanceLevels,
              nextDifficulty: victory.nextDifficulty,
              performanceGrade: victory.performanceGrade
            });

            setIsVictoryModalOpen(true);
            playLegendaryDropSound();
            addLog(`👑 축하합니다! [${currentDungeon.name}]을(를) 정복하여 전설의 전리품을 획득했습니다!`, "loot");
          }, 1200);
          return;
        } else if (isEventRewardRoom) {
          addLog('🎁 룸의 수호 몬스터들을 모두 소탕했습니다! 전장의 전리품을 수령하세요!', 'loot');
          return;
        } else {
          const cons = currentRoom?.connections || [];
          setPendingExitRoomId(cons.length > 0 ? cons[0] : null);
          if (currentRoom && (currentRoom.type === 'normal' || currentRoom.type === 'elite')) {
            const drop = generateRoomClearLoot(currentDungeon, currentDifficulty, runFortuneRef.current, currentRoom.type);
            if (drop.gold > 0) {
              setPlayerStats(p => ({ ...p, gold: p.gold + drop.gold }));
            }
            if (drop.items.length > 0) {
              setInventory(prev => [...drop.items, ...prev]);
            }
            if (drop.runeName) {
              setRunesVault(prev => ({ ...prev, [drop.runeName!]: (prev[drop.runeName!] || 0) + 1 }));
            }
            setLatestRoomLootEvent({
              type: 'combat',
              title: currentRoom.type === 'elite' ? '엘리트 처치 전리품' : '소탕 전리품',
              gold: drop.gold,
              items: drop.items,
              runeName: drop.runeName,
              count: drop.runeName ? 1 : undefined
            });
          }
          addLog('🏆 룸의 모든 적을 소탕했습니다. ←/→ 로 길을 고르고 [Space]로 진행하세요.', 'loot');
          return;
        }
      }

      // Horde Counter-Attack Turn
      setIsEnemyTurn(true);
      setHordeTimelinePercent(100);

      setTimeout(() => {
        const hordeResult = resolveHordeCounterAttack(
          survivors,
          playerStats.level,
          playerStats.hp,
          playerStats.maxHp,
          playerStats.rage,
          playerStats.maxRage,
          totalStats.evasion,
          totalStats.defense,
          totalStats.damageReduction,
          consumables,
          playerStats.shield || 0
        );

        if (hordeResult.frozenCount > 0) {
          addLog(`❄️ 서리 분쇄에 얼어붙은 몬스터 ${hordeResult.frozenCount}마리가 행동불가(Freeze) 상태로 공격을 건너뜁니다!`, "system");
        }

        if (hordeResult.dodgedCount > 0) {
          addLog(`💨 민첩한 움직임으로 적 ${hordeResult.dodgedCount}마리의 공격을 완벽히 회피(DODGE!)했습니다! (피해 0)`, "system");
        }

        if (hordeResult.absorbedDamage > 0) {
          addLog(`🛡️ 보호막이 적 피해 ${hordeResult.absorbedDamage}을(를) 흡수했습니다! (남은 쉴드: ${hordeResult.nextShield})`, "system");
        }
        if (hordeResult.totalEnemyDamage > 0) {
          playHordeAttackSound();

          if (hordeResult.potionUsed) {
            setConsumables(hordeResult.newConsumables);
            playPotionSound();
            if (hordeResult.autoResurrected) {
              addLog(`✨ [자동 물약 기사회생] 치명타로 쓰러질 뻔했으나 생명력 물약을 자동으로 즉시 마셔 생존했습니다! (+${hordeResult.nextHp} HP)`, "system");
            } else {
              addLog('🧪 [자동 물약] 체력이 50% 이하로 떨어져 생명력 물약을 자동으로 섭취했습니다! (+100 HP)', 'system');
            }
          }

          if (hordeResult.isDead) {
            setIsEnemyTurn(false);
            setIsAttacking(false);
            setIsDeathModalOpen(true);
            setPlayerStats(prev => ({ ...prev, hp: 0, rage: 0 }));
          } else {
            setPlayerStats(prev => ({
              ...prev,
              hp: hordeResult.nextHp,
              rage: Math.min(prev.maxRage, prev.rage + hordeResult.rageGainOnHit)
            }));
          }

          addLog(
            `⚔️ 몬스터 전열의 반격! ${hordeResult.activeAttackerCount - hordeResult.dodgedCount}마리 공격 적중 ➔ ${hordeResult.totalEnemyDamage} 피해 (분노 충전 +${Math.min(25, Math.max(6, Math.floor(hordeResult.totalEnemyDamage * 1.5)))})`,
            'damage'
          );
        }

        setMonsters(prev => prev.map(m => ({ ...m, isFrozen: false })));
        setIsEnemyTurn(false);
        setHordeTimelinePercent(totalStats.baseAtbPercent || 50);

      }, 700);

    }, totalHitTime);

  }, [viewMode, isAttacking, isEnemyTurn, playerStats, selectedSkill, totalStats, playerLane, monsters, maxChainThisRoom, currentDungeon, currentRoomId, consumables, addLog, addPlayerExp]);
  const selectSkillOrExecute = useCallback((skill: Skill) => {
    if (!isSkillUnlocked(skill.id, playerStats.level)) {
      addLog(`[${skill.name}]은(는) 레벨 ${skill.unlockLevel ?? '?'}에 해금됩니다.`, 'system');
      return;
    }
    if (selectedSkill.id === skill.id) {
      if (monsters.length > 0) {
        executeAttack();
      }
    } else {
      setSelectedSkill(skill);
    }
  }, [selectedSkill, executeAttack, playerStats.level, monsters, addLog]);

  // Consumables Quick Slot
  const useConsumable = useCallback((hotkeyOrId: string) => {
    const item = consumables.find(c => c.hotkey === hotkeyOrId || c.id === hotkeyOrId);
    if (!item) return;
    if (item.count <= 0) {
      addLog(`[${item.name}]이(가) 모두 소진되었습니다!`, 'system');
      return;
    }

    setConsumables(prev => prev.map(c => c.id === item.id ? { ...c, count: c.count - 1 } : c));
    playPotionSound();

    if (item.type === 'hp') {
      setPlayerStats(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + item.effectValue) }));
      addLog(`🧪 [${item.name}] 복용! HP가 ${item.effectValue} 회복되었습니다.`, 'loot');
    } else if (item.type === 'rage') {
      setPlayerStats(prev => ({ ...prev, rage: Math.min(prev.maxRage, prev.rage + item.effectValue) }));
      addLog(`🧪 [${item.name}] 복용! 분노가 ${item.effectValue} 충전되었습니다.`, 'loot');
    } else if (item.type === 'defense') {
      setTempBuffs(prev => ({ ...prev, defenseBonus: prev.defenseBonus + item.effectValue }));
      addLog(`🛡️ [${item.name}] 복용! 방어력이 +${item.effectValue} 증가했습니다.`, 'loot');
    } else if (item.type === 'overkill') {
      setTempBuffs(prev => ({ ...prev, overkillBonus: prev.overkillBonus + item.effectValue }));
      addLog(`⚡ [${item.name}] 복용! 오버킬 효율이 +${item.effectValue}% 증가했습니다.`, 'loot');
    }
  }, [consumables, addLog]);

  const resetBattleFormation = useCallback(() => {
    setMonsters(createDungeonFormation(currentDungeon.id, currentDungeon.rooms.find(r => r.id === currentRoomId)?.type || 'normal', playerStats.level));
    setChainCount(0);
    setMaxChainThisRoom(0);
    setPlayerStats(prev => ({ ...prev, hp: prev.maxHp, rage: 75 }));
    addLog('현재 방의 몬스터 포메이션으로 전장을 초기화했습니다.', 'system');
  }, [addLog, currentDungeon, currentRoomId, playerStats.level]);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // Equip / Unequip
  const equipItem = (item: GameItem, targetSlot?: EquipSlot) => {
    if (viewMode === 'battle' && monsters.length > 0) {
      addLog('전투 중에는 장비를 교체할 수 없습니다!', 'system');
      return;
    }
    if (item.requiredLevel && playerStats.level < item.requiredLevel) {
      addLog(`[${item.name}]은(는) 레벨 ${item.requiredLevel} 이상부터 착용할 수 있습니다!`, 'system');
      return;
    }
    if (item.isIdentified === false) {
      addLog('미확인 아이템은 먼저 감정해야 장착할 수 있습니다!', 'system');
      return;
    }
    
    // Exact slot determination
    let slot = targetSlot || (item.slot as EquipSlot);

    // Ring slot handling: support 'ring', 'ring1', 'ring2'
    if (item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2' || targetSlot === 'ring1' || targetSlot === 'ring2') {
      if (targetSlot === 'ring1' || targetSlot === 'ring2') {
        slot = targetSlot;
      } else {
        // Auto pick: prefer empty slot, then ring1
        if (!equipment.ring1) slot = 'ring1';
        else if (!equipment.ring2) slot = 'ring2';
        else slot = 'ring1';
      }
    }

    const current = equipment[slot];

    setEquipment(prev => ({ ...prev, [slot]: item }));
    setInventory(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return current ? [...filtered, current] : filtered;
    });
    
    const slotKoreanName = slot === 'ring1' ? '반지 1' : slot === 'ring2' ? '반지 2' : slot;
    addLog(`[${item.name}]을(를) ${slotKoreanName} 슬롯에 장착했습니다.`, 'system');
  };


  const unequipItem = (slot: EquipSlot) => {
    if (viewMode === 'battle' && monsters.length > 0) {
      addLog('전투 중에는 장비를 해제할 수 없습니다!', 'system');
      return;
    }
    const item = equipment[slot];
    if (!item) return;

    setEquipment(prev => {
      const copy = { ...prev };
      delete copy[slot];
      return copy;
    });
    setInventory(prev => [...prev, item]);
    addLog(`[${item.name}]을(를) 해제했습니다.`, 'system');
  };

  const upgradeStat = (stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', amount: number = 1) => {
    setPlayerStats(prev => {
      if (prev.statPoints <= 0) return prev;
      const ptsToUse = Math.max(1, Math.min(amount, prev.statPoints));
      if (ptsToUse <= 0) return prev;
      addLog(`${stat.toUpperCase()} 스탯이 +${ptsToUse} 상승했습니다. (현재: ${prev[stat] + ptsToUse})`, 'system');
      return {
        ...prev,
        statPoints: prev.statPoints - ptsToUse,
        [stat]: prev[stat] + ptsToUse
      };
    });
  };

  const enterDungeon = (dungeonId: string, difficulty?: number) => {
    if (!isActUnlocked(dungeonId, achievementStats.dungeonClears)) {
      addLog('이전 막을 클리어해야 이 던전에 진입할 수 있습니다.', 'system');
      return;
    }
    if (inventory.length >= 40) {
      addLog('❌ 가방이 가득 찼습니다. 판매 후 출발하세요.', 'system');
      return;
    }
    if (inventory.length >= 35) {
      addLog(`⚠️ 가방이 거의 찼습니다 (${inventory.length}/40)`, 'system');
    }
    const dungeon = DUNGEONS_DATA.find(d => d.id === dungeonId) || DUNGEONS_DATA[0];
    const diffToUse = difficulty || currentDifficulty || 1;
    setCurrentDifficulty(diffToUse);
    const rolledRooms = prepareDungeonRun(dungeon);
    const firstRoomId = rolledRooms.find(r => r.id === 2)?.id || rolledRooms.find(r => r.type !== 'start')?.id || 2;
    const firstRoom = rolledRooms.find(r => r.id === firstRoomId);
    const roomType = firstRoom?.type || 'normal';

    runFortuneRef.current = totalStats.fortune;
    setDungeonSnapshot({
      inventory: [...inventory],
      runesVault: { ...runesVault },
      gold: playerStats.gold,
      exp: playerStats.exp,
      level: playerStats.level,
      shards: playerStats.shards
    });

    setConsumables(curr => curr.map(c => c.id === 'c_hp' ? { ...c, count: Math.max(5, c.count) } : c));
    setRoomEventClaimed(false);
    setLatestRoomLootEvent(null);
    setDungeonBuffs([]);
    setPendingExitRoomId(null);
    setCurrentDungeon({
      ...dungeon,
      rooms: rolledRooms.map(r => ({
        ...r,
        current: r.id === firstRoomId,
        revealed: r.type === 'start' || r.id === firstRoomId
      }))
    });
    setCurrentRoomId(firstRoomId);
    setMonsters(createDungeonFormation(dungeon.id, roomType, playerStats.level, diffToUse));
    setChainCount(0);
    setMaxChainThisRoom(0);
    setViewMode('battle');
    startBGM('dungeon');
    addLog("⚔️ [" + dungeon.name + "] (난이도 Lv." + diffToUse + ") 진입. [Q] 가르기 · [Space] 공격 · [←/→] 레인", "system");
  };

  const selectNextRoom = (roomId: number) => {
    setRoomEventClaimed(false);
    setLatestRoomLootEvent(null);
    setPendingExitRoomId(null);
    setCurrentRoomId(roomId);
    setCurrentDungeon(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => ({
        ...r,
        current: r.id === roomId,
        revealed: r.revealed || r.id === roomId
      }))
    }));

    const room = currentDungeon.rooms.find(r => r.id === roomId);
    const roomType = room?.type || 'normal';
    const spawned = createDungeonFormation(currentDungeon.id, roomType, playerStats.level, currentDifficulty);
    setMonsters(spawned);
    setChainCount(0);
    setMaxChainThisRoom(0);

    if (room?.type === 'boss') {
      startBGM('boss');
    } else {
      startBGM('dungeon');
    }

    addLog("새로운 룸에 진입했습니다: " + (room?.revealed || true ? (room?.title || "전장") : "???"), "system");
    if (spawned.length === 0 && (roomType === 'treasure' || roomType === 'rune' || roomType === 'shrine')) {
      setPendingExitRoomId(null);
    } else if (spawned.length === 0) {
      const cons = room?.connections || [];
      setPendingExitRoomId(cons[0] ?? null);
    }
  };

  const cyclePendingExit = (dir: number) => {
    const room = currentDungeon.rooms.find(r => r.id === currentRoomId);
    const cons = room?.connections || [];
    if (cons.length < 2) return;
    setPendingExitRoomId(prev => {
      const cur = prev ?? cons[0];
      const idx = Math.max(0, cons.indexOf(cur));
      return cons[(idx + dir + cons.length) % cons.length];
    });
  };


  const returnToTown = () => {
    setViewMode('town');
    setMonsters(createDungeonFormation('act1_crypt', 'normal', playerStats.level));
    setTempBuffs({ defenseBonus: 0, overkillBonus: 0 });
    setDungeonSnapshot(null);
    setPendingExitRoomId(null);
    setConsumables(curr => curr.map(c => c.id === 'c_hp' ? { ...c, count: Math.max(5, c.count) } : c));
    startBGM('town');
    addLog('마을로 귀환했습니다. (생명력 물약 5개 무료 자동 충전 완료)', 'system');
  };

  const abandonDungeon = () => {
    if (dungeonSnapshot) {
      setInventory(dungeonSnapshot.inventory);
      setRunesVault(dungeonSnapshot.runesVault);
      setPlayerStats(p => ({
        ...p,
        hp: p.maxHp,
        gold: dungeonSnapshot.gold,
        exp: dungeonSnapshot.exp,
        level: dungeonSnapshot.level,
        shards: dungeonSnapshot.shards,
        rage: 0,
        shield: 0
      }));
    } else {
      setPlayerStats(p => ({ ...p, hp: p.maxHp, rage: 0 }));
    }
    setDungeonBuffs([]);
    setLatestRoomLootEvent(null);
    setPendingExitRoomId(null);
    setDungeonSnapshot(null);
    setTempBuffs({ defenseBonus: 0, overkillBonus: 0 });
    setConsumables(curr => curr.map(c => c.id === 'c_hp' ? { ...c, count: Math.max(5, c.count) } : c));
    setViewMode('town');
    startBGM('town');
    addLog('원정을 포기했습니다. 이번 런에서 얻은 전리품은 모두 사라집니다.', 'system');
  };

  const confirmDeathAndReturnToTown = () => {
    setIsDeathModalOpen(false);
    if (dungeonSnapshot) {
      setInventory(dungeonSnapshot.inventory);
      setRunesVault(dungeonSnapshot.runesVault);
      setPlayerStats(p => ({
        ...p,
        hp: p.maxHp, // 체력 100% 만땅 완충!
        gold: dungeonSnapshot.gold,
        exp: dungeonSnapshot.exp,
        level: dungeonSnapshot.level,
        shards: dungeonSnapshot.shards,
        rage: 0
      }));
    } else {
      setPlayerStats(p => ({
        ...p,
        hp: p.maxHp, // 체력 100% 만땅 완충!
        rage: 0
      }));
    }
    setConsumables(curr => curr.map(c => c.id === 'c_hp' ? { ...c, count: Math.max(5, c.count) } : c));
    setViewMode('town');
    setTempBuffs({ defenseBonus: 0, overkillBonus: 0 });
    setDungeonSnapshot(null);
    setAchievementStats(prev => ({ ...prev, totalDeaths: prev.totalDeaths + 1 }));
    addLog('🏥 [소생] 데커드 케인의 치료로 생명력 100%를 회복하고 마을에서 부활했습니다!', 'system');
  };

  // Diablo II System Actions
  const socketRuneIntoItem = (targetItemId: string, runeId: string) => {
    const target = inventory.find(i => i.id === targetItemId);
    const runeItem = inventory.find(i => i.id === runeId);
    if (!target || !runeItem) return;

    const res = socketRuneHelper(target, runeItem);
    if (!res.success || !res.updatedItem) {
      addLog(res.message, 'system');
      return;
    }

    setInventory(prev => prev.filter(i => i.id !== runeId).map(i => i.id === targetItemId ? res.updatedItem! : i));
    if (res.isRuneWord) {
      playRuneWordSound();
      addLog(res.message, 'loot');
    } else {
      addLog(res.message, 'system');
    }
  };

  const transmuteInCube = (itemIds: string[]) => {
    const selectedItems = inventory.filter(i => itemIds.includes(i.id));
    const res = cubeTransmuteHelper(selectedItems);

    if (!res.success || !res.createdItem || !res.consumedItemIds) {
      addLog(res.message, 'system');
      return;
    }

    const consumedSet = new Set(res.consumedItemIds);
    setInventory(prev => [...prev.filter(i => !consumedSet.has(i.id)), res.createdItem!]);
    playRuneWordSound();
    addLog(res.message, 'loot');
  };

  const sellItem = (itemId: string): number => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return 0;
    const price = getItemSellPrice(item);
    setInventory(prev => prev.filter(i => i.id !== itemId));
    setPlayerStats(prev => ({ ...prev, gold: prev.gold + price }));
    playRuneWordSound();
    addLog(`💰 [${item.name}]을(를) 상점에 판매하여 ${price} Gold를 획득했습니다.`, "loot");
    return price;
  };

  const bulkSellItems = (rarities: ItemRarity[] = ["normal", "magic"]): { count: number; gold: number } => {
    const { remainingInventory, soldCount, totalGold } = bulkSellHelper(inventory, rarities);
    if (soldCount === 0) return { count: 0, gold: 0 };

    setInventory(remainingInventory);
    setPlayerStats(prev => ({ ...prev, gold: prev.gold + totalGold }));
    playRuneWordSound();
    addLog(`💰 일반/마법 장비 ${soldCount}개를 일괄 판매하여 총 ${totalGold} Gold를 획득했습니다!`, "loot");
    return { count: soldCount, gold: totalGold };
  };

  const gambleItem = (gambleType: "weapon" | "armor" | "ring" | "amulet"): { item: GameItem; isHighRarity: boolean } | null => {
    const costMap = { weapon: 3500, armor: 4000, ring: 6000, amulet: 7500 };
    const cost = costMap[gambleType];

    if (playerStats.gold < cost) {
      addLog(`도박 골드가 부족합니다! (필요: ${cost}G, 보유: ${playerStats.gold}G)`, "system");
      return null;
    }

    setPlayerStats(prev => ({ ...prev, gold: prev.gold - cost }));
    const pLevel = playerStats.level || 1;
    const { item: newItem, isHighRarity } = generateGambleItem(gambleType, pLevel, cost);

    setInventory(prev => [newItem, ...prev]);
    if (isHighRarity) {
      setAchievementStats(prev => ({ ...prev, uniqueItemsFound: prev.uniqueItemsFound + 1 }));
      playLegendaryDropSound();
    } else {
      playIdentifySound();
    }
    addLog(`🎲 기드의 도박 완료! [${newItem.name}] (${newItem.rarity.toUpperCase()})을(를) 뽑았습니다. (식별 필요)`, "loot");
    return { item: newItem, isHighRarity };
  };

  const identifyItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.isIdentified) return;

    const pLevel = playerStats.level || 1;
    const identified = identifyItemHelper(item, pLevel);

    setInventory(prev => prev.map(i => i.id === itemId ? identified : i));
    playRuneWordSound();
    addLog(`📜 식별 완료! [${identified.name}]의 숨겨진 능력(스탯 & 접사)이 밝혀졌습니다!`, "loot");
  };

  const identifyAllItems = (): GameItem[] => {
    const unidentified = inventory.filter(i => i.isIdentified === false);
    if (unidentified.length === 0) {
      addLog('식별할 미확인 아이템이 없습니다. "Stay awhile and listen!"', "system");
      return [];
    }
    const pLevel = playerStats.level || 1;
    const identifiedList = unidentified.map(item => identifyItemHelper(item, pLevel));

    setInventory(prev => prev.map(item => {
      const found = identifiedList.find(idItem => idItem.id === item.id);
      return found ? found : item;
    }));

    playRuneWordSound();
    addLog(`📜 데커드 케인이 소지한 모든 미확인 아이템(${unidentified.length}개)을 완벽히 감정했습니다!`, "loot");
    return identifiedList;
  };

  const claimTreasure = () => {
    if (roomEventClaimed) return null;
    setRoomEventClaimed(true);

    const reward = claimTreasureHelper(currentDungeon, currentDifficulty, runFortuneRef.current);
    setPlayerStats(p => ({
      ...p,
      gold: p.gold + reward.gold,
      shards: p.shards + reward.shards
    }));
    setInventory(prev => [...reward.items, ...prev]);

    const isUnique = reward.items.some(i => i.rarity === "unique" || i.rarity === "legendary" || i.rarity === "runeword");
    setAchievementStats(prev => ({
      ...prev,
      totalGoldEarned: prev.totalGoldEarned + reward.gold,
      uniqueItemsFound: prev.uniqueItemsFound + (isUnique ? 1 : 0)
    }));

    const itemNames = reward.items.map(i => "[" + i.name + "]").join(", ");
    setLatestRoomLootEvent({
      type: 'treasure',
      title: '황금 보물상자 개봉',
      gold: reward.gold,
      shards: reward.shards,
      items: reward.items
    });

    playLegendaryDropSound();
    addLog("🎁 [황금 궤짝 개봉] +" + reward.gold + "G, 샤드 +" + reward.shards + "개, 전리품 " + reward.items.length + "개(" + itemNames + ") 획득!", "loot");
    const cons = currentDungeon.rooms.find(r => r.id === currentRoomId)?.connections || [];
    setPendingExitRoomId(cons.length > 0 ? cons[0] : null);
    return { gold: reward.gold, items: reward.items, shards: reward.shards };
  };

  const claimRuneAltar = () => {
    if (roomEventClaimed) return null;
    setRoomEventClaimed(true);

    const { runeName, count } = claimRuneAltarHelper(currentDungeon.id);
    setRunesVault(prev => ({
      ...prev,
      [runeName]: (prev[runeName] || 0) + count
    }));

    setLatestRoomLootEvent({
      type: 'rune',
      title: '고대 룬 제단 기도',
      runeName,
      count
    });

    playRuneWordSound();
    addLog("✨ [고대 룬 제단] 기도를 통해 [" + runeName + " 룬] " + count + "개를 보관함에 획득했습니다!", "loot");
    const cons = currentDungeon.rooms.find(r => r.id === currentRoomId)?.connections || [];
    setPendingExitRoomId(cons.length > 0 ? cons[0] : null);
    return { runeName, count };
  };

  const claimShrine = (buffType: "fortune" | "crit" | "defense") => {
    if (roomEventClaimed) return;
    setRoomEventClaimed(true);

    const newBuff = createShrineBuff(buffType, currentDifficulty);
    if (buffType === "crit") {
      setPlayerStats(p => ({ ...p, hp: p.maxHp }));
    }

    setDungeonBuffs(prev => [...prev.filter(b => b.type !== buffType), newBuff]);
    setLatestRoomLootEvent({
      type: 'shrine',
      title: '고대 성소의 축복',
      buffName: newBuff.name,
      buffDesc: newBuff.description
    });

    playRuneWordSound();
    addLog("🏛️ [성소의 축복] [" + newBuff.name + "] 활성화! (" + newBuff.description + ")", "system");
    const cons = currentDungeon.rooms.find(r => r.id === currentRoomId)?.connections || [];
    setPendingExitRoomId(cons.length > 0 ? cons[0] : null);
  };

    const buyPotions = () => {
      const cost = 200;
      if (playerStats.gold < cost) {
        addLog('골드가 부족합니다! (필요: 200G)', 'system');
        return;
      }
      setPlayerStats(p => ({ ...p, gold: p.gold - cost }));
      setConsumables(curr => curr.map(c => c.id === 'c_hp' ? { ...c, count: c.count + 5 } : c));
      playRuneWordSound();
      addLog('🧪 상인에게서 생명력 물약 5개를 구매했습니다! (-200G)', 'loot');
    };

    const startTutorial = () => {
    setViewMode('town');
    closeModal();
    setTutorialStep(0);
    setIsTutorialOpen(true);
  };

  const completeTutorial = () => {
    setIsTutorialOpen(false);
    setHasSeenTutorial(true);
    addLog('🎓 튜토리얼 완료! [Space] 키 또는 출격 버튼으로 첫 원정을 시작하세요.', 'system');
  };

  const resetGameSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVE_KEY);
    }
    setPlayerStats(DEFAULT_PLAYER_STATS);
    setEquipment(INITIAL_EQUIPMENT);
    setInventory(SAMPLE_INVENTORY);
    setRunesVault(DEFAULT_RUNES_VAULT);
    setSkillLevels({ slash: 1, execute: 1, cleave: 1, whirlwind: 1 });
    setSkillRunes({
      slash: 'rune_fire'
    });
    setPendingExitRoomId(null);
    setConsumables(INITIAL_CONSUMABLES);
    setCurrentDungeon(DUNGEONS_DATA[0]);
    setCurrentRoomId(2);
    setMonsters(createDungeonFormation('act1_crypt', 'normal', 1));
    setChainCount(0);
    setViewMode('town');
    setAchievementStats(INITIAL_ACHIEVEMENT_STATS);
    setClaimedAchievements([]);
    setHasSeenTutorial(false);
    setIsTutorialOpen(true);
    setTutorialStep(0);
    addLog('💾 캐릭터를 레벨 1 및 단촐한 기본 장비로 초기화하고 새 모험을 시작했습니다.', 'system');
  };

    const contextValue: GameContextType = useMemo(() => ({
    viewMode,
    activeModal,
    playerStats,
    equipment,
    inventory,
    consumables,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    maxUnlockedDifficulty,
    setCurrentDifficulty,
    latestRoomLootEvent,
    clearLatestRoomLootEvent,
    monsters,
    playerLane,
    selectedSkill,
    combatLogs,
    chainCount,
    maxChainThisRoom,
    isAttacking,
    isEnemyTurn,
    hordeTimelinePercent,
    floatingDamages,
    totalStats,
    preview,
    bestLaneHint,
    setViewMode,
    openModal,
    closeModal,
    equipItem,
    unequipItem,
    upgradeStat,
    resetStatPoints,
    setPlayerLane,
    setSelectedSkill,
    selectSkillOrExecute,
    executeAttack,
    useConsumable,
    enterDungeon,
    selectNextRoom,
    pendingExitRoomId,
    cyclePendingExit,
    returnToTown,
    abandonDungeon,
    addLog,
    resetBattleFormation,
    equippedSkillSlots,
    equipSkillToSlot,
    equippedSkills,
    getSkillForSlot,
    skillRunes,
    setSkillRune,
    skillLevels,
    upgradeSkill,
    resetSkillPoints,
    runesVault,
    addRuneToVault,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    isVictoryModalOpen,
    dungeonVictoryLoot,
    closeVictoryModal,
    identifyAllVictoryLoot,
    isDeathModalOpen,
    confirmDeathAndReturnToTown,
    isLevelUpAnimated,
    socketRuneIntoItem,
    transmuteInCube,
    gambleItem,
    identifyItem,
    identifyAllItems,
    sellItem,
    bulkSellItems,
    getItemSellPrice,
    resetGameSave,
    soundVolume,
    setSoundVolume,
    isMuted,
    setIsMuted,
    exportSaveData,
    importSaveData,
    buyPotions,
    dungeonBuffs,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    achievementStats,
    claimedAchievements,
    claimAchievementReward,
    claimAllAchievementRewards,
    hasSeenTutorial,
    isTutorialOpen,
    tutorialStep,
    startTutorial,
    completeTutorial,
    setTutorialStep
  }), [
    viewMode,
    activeModal,
    playerStats,
    equipment,
    inventory,
    consumables,
    currentDungeon,
    currentRoomId,
    pendingExitRoomId,
    currentDifficulty,
    maxUnlockedDifficulty,
    latestRoomLootEvent,
    monsters,
    playerLane,
    selectedSkill,
    combatLogs,
    chainCount,
    maxChainThisRoom,
    isAttacking,
    isEnemyTurn,
    hordeTimelinePercent,
    floatingDamages,
    totalStats,
    preview,
    bestLaneHint,
    isVictoryModalOpen,
    dungeonVictoryLoot,
    isDeathModalOpen,
    isLevelUpAnimated,
    soundVolume,
    isMuted,
    dungeonBuffs,
    roomEventClaimed,
    achievementStats,
    claimedAchievements,
    hasSeenTutorial,
    isTutorialOpen,
    tutorialStep,
    runesVault,
    equippedSkillSlots,
    equippedSkills,
    skillRunes,
    skillLevels
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
