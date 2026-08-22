import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ViewMode,
  ModalType,
  PlayerStats,
  GameItem,
  EquipSlot,
  DungeonInfo,
  Monster,
  Skill,
  CombatLogEntry,
  ConsumableItem
} from '../types/game';
import {
  INITIAL_EQUIPMENT,
  SAMPLE_INVENTORY,
  GAME_ITEMS_POOL,
  WARRIOR_SKILLS,
  DUNGEONS_DATA,
  INITIAL_CONSUMABLES,
  D2_RUNES,
  RUNEWORD_RECIPES,
  createDungeonFormation
} from '../data/gameData';
import { resolveAttack, createGoblin30Formation, findBestLaneForSkill, AttackResolution, CombatHitResult } from '../combat/combatEngine';
import { simulateRuneWordCrafting } from '../utils/runeCrafting';
import {
  playSlashSound,
  playHitSound,
  playKillSound,
  playExplosionSound,
  playHordeAttackSound,
  playRuneWordSound,
  playIdentifySound,
  playLegendaryDropSound
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
  totalStats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    minDmg: number;
    maxDmg: number;
    defense: number;
    critChance: number;
    critDamage: number;
    overkillEfficiency: number;
    fortune: number;
    lifeSteal: number;
  };

  // Preview calculation (100% matched with resolveAttack)
  preview: AttackResolution;

  // Actions
  setViewMode: (view: ViewMode) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  equipItem: (item: GameItem) => void;
  unequipItem: (slot: EquipSlot) => void;
  upgradeStat: (stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => void;
  resetStatPoints: () => void;
  setPlayerLane: (lane: number) => void;
  setSelectedSkill: (skill: Skill) => void;
  selectSkillOrExecute: (skill: Skill) => void;
  executeAttack: () => void;
  useConsumable: (hotkeyOrId: string) => void;
  enterDungeon: (dungeonId: string) => void;
  selectNextRoom: (roomId: number) => void;
  returnToTown: () => void;
  addLog: (text: string, type?: CombatLogEntry['type']) => void;
  resetBattleFormation: () => void;
  
  // Skill Runes & Point Upgrades
  skillRunes: Record<string, string>;
  setSkillRune: (skillId: string, runeId: string | null) => void;
  skillLevels: Record<string, number>;
  upgradeSkill: (skillId: string) => void;
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
  } | null;
  closeVictoryModal: () => void;
  identifyAllVictoryLoot: () => void;

  // Diablo 2 Crafting & Features
  socketRuneIntoItem: (targetItemId: string, runeId: string) => void;
  transmuteInCube: (itemIds: string[]) => void;
  gambleItem: (gambleType: 'weapon' | 'armor' | 'ring' | 'amulet') => void;
  identifyItem: (itemId: string) => void;
  identifyAllItems: () => void;
  resetGameSave: () => void;
}

const SAVE_KEY = 'DARK_FANTASY_SAVE_V1';

const getInitialSave = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load save from localStorage', e);
  }
  return null;
};

const savedData = getInitialSave();

export function calculateMaxExp(level: number): number {
  return Math.floor(100 * Math.pow(1.20, level - 1) + 25 * level);
}

const DEFAULT_RUNES_VAULT: Record<string, number> = {
  El: 3, Eld: 2, Tir: 2, Nef: 1, Eth: 2, Ith: 1, Tal: 3, Ral: 2, Ort: 2, Thul: 1
};

const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  exp: 0,
  maxExp: 125,
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
  const [currentRoomId, setCurrentRoomId] = useState<number>(() => savedData?.currentRoomId || 4);
  const [skillRunes, setSkillRunes] = useState<Record<string, string>>(() => savedData?.skillRunes || {
    slash: 'rune_fire',
    execute: 'rune_poison',
    cleave: 'rune_lightning',
    whirlwind: 'rune_frost'
  });
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>(() => savedData?.skillLevels || {
    slash: 1,
    execute: 1,
    cleave: 1,
    whirlwind: 1
  });
  
  // Auto-save to localStorage whenever persistent states change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dataToSave = {
        playerStats,
        equipment,
        inventory,
        runesVault,
        consumables,
        currentDungeonId: currentDungeon.id,
        currentRoomId,
        skillRunes,
        skillLevels
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to auto-save to localStorage', e);
    }
  }, [playerStats, equipment, inventory, runesVault, consumables, currentDungeon.id, currentRoomId, skillRunes, skillLevels]);

  const upgradeSkill = (skillId: string) => {
    if (playerStats.skillPoints <= 0) {
      addLog('사용 가능한 스킬 포인트가 부족합니다!', 'system');
      return;
    }
    const currentLv = skillLevels[skillId] || 1;
    if (currentLv >= 10) {
      addLog('스킬이 이미 최대 레벨(Lv 10)에 도달했습니다!', 'system');
      return;
    }

    setSkillLevels(prev => ({
      ...prev,
      [skillId]: currentLv + 1
    }));
    setPlayerStats(prev => ({
      ...prev,
      skillPoints: prev.skillPoints - 1
    }));
    playRuneWordSound();
    addLog(`✨ [${skillId.toUpperCase()}] 스킬이 Lv.${currentLv + 1}로 강화되었습니다! (+15% 피해 증가)`, 'system');
  };

  const resetSkillPoints = () => {
    const totalSpent = Object.values(skillLevels).reduce((acc, lv) => acc + (lv - 1), 0);
    setSkillLevels({
      slash: 1,
      execute: 1,
      cleave: 1,
      whirlwind: 1
    });
    setPlayerStats(prev => ({
      ...prev,
      skillPoints: prev.skillPoints + totalSpent
    }));
    addLog(`🔄 모든 스킬 포인트(${totalSpent}P)를 초기화하여 반환했습니다.`, 'system');
  };

  const addRuneToVault = (runeKey: string, count = 1) => {
    setRunesVault(prev => ({
      ...prev,
      [runeKey]: (prev[runeKey] || 0) + count
    }));
    addLog(`💎 [${runeKey} 룬] x${count}개를 룬 보관함에 획득했습니다!`, 'loot');
  };

  const craftRuneWord = (targetItemId: string, recipeId: string): boolean => {
    // Find in inventory OR currently equipped slots
    const targetItem = inventory.find(i => i.id === targetItemId) || Object.values(equipment).find(i => i?.id === targetItemId);
    const recipe = RUNEWORD_RECIPES.find(r => r.id === recipeId);
    if (!targetItem || !recipe) {
      addLog('제작 대상 아이템 또는 룬워드 레시피를 찾을 수 없습니다.', 'system');
      return false;
    }

    const isSlotMatch = targetItem.slot === recipe.allowedSlot ||
      ((targetItem.slot === 'ring1' || targetItem.slot === 'ring2') && (recipe.allowedSlot === 'ring1' || recipe.allowedSlot === 'ring2'));

    // Check if target item is eligible
    if (targetItem.rarity !== 'normal' || !isSlotMatch || (targetItem.sockets || 0) < recipe.requiredSockets) {
      addLog(`[${targetItem.name}]은(는) [${recipe.name}]의 제작 조건(노말 ${recipe.requiredSockets}소켓 ${recipe.allowedSlot})에 맞지 않습니다.`, 'system');
      return false;
    }

    // Check required runes count in runesVault
    const requiredCounts: Record<string, number> = {};
    recipe.requiredRunes.forEach(r => {
      requiredCounts[r] = (requiredCounts[r] || 0) + 1;
    });

    for (const [rKey, reqCount] of Object.entries(requiredCounts)) {
      if ((runesVault[rKey] || 0) < reqCount) {
        addLog(`필요한 [${rKey} 룬]이 부족합니다! (보유: ${runesVault[rKey] || 0} / 필요: ${reqCount})`, 'system');
        return false;
      }
    }

    // Deduct runes from runesVault
    setRunesVault(prev => {
      const copy = { ...prev };
      Object.entries(requiredCounts).forEach(([rKey, reqCount]) => {
        copy[rKey] = Math.max(0, (copy[rKey] || 0) - reqCount);
      });
      return copy;
    });

    // Upgrade target item to RuneWord
    const updatedItem: GameItem = {
      ...targetItem,
      name: recipe.name,
      rarity: 'runeword',
      isRuneWord: true,
      runeWordName: recipe.name,
      socketedRunes: recipe.requiredRunes,
      stats: {
        ...targetItem.stats,
        ...recipe.bonusStats
      },
      specialEffect: recipe.specialEffect,
      description: `[룬워드: ${recipe.requiredRunes.join(' + ')}] ${recipe.description}`
    };

    // Update in Equipment if currently worn, otherwise in Inventory
    const equippedSlotKey = Object.keys(equipment).find(k => equipment[k as EquipSlot]?.id === targetItemId) as EquipSlot | undefined;
    if (equippedSlotKey) {
      setEquipment(prev => ({ ...prev, [equippedSlotKey]: updatedItem }));
    } else {
      setInventory(prev => prev.map(i => i.id === targetItemId ? updatedItem : i));
    }

    playRuneWordSound();
    addLog(`✨ 스마트 룬워드 제작 성공! [${recipe.name}]이(가) 완성되었습니다!`, 'loot');
    return true;
  };

  const craftRuneWordWithTransmute = (targetItemId: string, recipeId: string): boolean => {
    // Find in inventory OR currently equipped slots
    const targetItem = inventory.find(i => i.id === targetItemId) || Object.values(equipment).find(i => i?.id === targetItemId);
    const recipe = RUNEWORD_RECIPES.find(r => r.id === recipeId);
    if (!targetItem || !recipe) {
      addLog('제작 대상 아이템 또는 룬워드 레시피를 찾을 수 없습니다.', 'system');
      return false;
    }

    const isSlotMatch = targetItem.slot === recipe.allowedSlot ||
      ((targetItem.slot === 'ring1' || targetItem.slot === 'ring2') && (recipe.allowedSlot === 'ring1' || recipe.allowedSlot === 'ring2'));

    if (targetItem.rarity !== 'normal' || !isSlotMatch || (targetItem.sockets || 0) < recipe.requiredSockets) {
      addLog(`[${targetItem.name}]은(는) [${recipe.name}]의 제작 조건에 맞지 않습니다.`, 'system');
      return false;
    }

    const sim = simulateRuneWordCrafting(recipe, runesVault);
    if (!sim.canTransmuteCraft) {
      addLog(`하위 룬을 모두 합성해도 필요한 룬이 부족합니다!`, 'system');
      return false;
    }

    // Deduct calculated transmuted runes cost
    setRunesVault(prev => {
      const copy = { ...prev };
      Object.entries(sim.transmutedRunesCost).forEach(([rKey, count]) => {
        copy[rKey] = Math.max(0, (copy[rKey] || 0) - count);
      });
      return copy;
    });

    const updatedItem: GameItem = {
      ...targetItem,
      name: recipe.name,
      rarity: 'runeword',
      isRuneWord: true,
      runeWordName: recipe.name,
      socketedRunes: recipe.requiredRunes,
      stats: {
        ...targetItem.stats,
        ...recipe.bonusStats
      },
      specialEffect: recipe.specialEffect,
      description: `[룬워드: ${recipe.requiredRunes.join(' + ')}] ${recipe.description}`
    };

    // Update in Equipment if currently worn, otherwise in Inventory
    const equippedSlotKey = Object.keys(equipment).find(k => equipment[k as EquipSlot]?.id === targetItemId) as EquipSlot | undefined;
    if (equippedSlotKey) {
      setEquipment(prev => ({ ...prev, [equippedSlotKey]: updatedItem }));
    } else {
      setInventory(prev => prev.map(i => i.id === targetItemId ? updatedItem : i));
    }

    playRuneWordSound();
    addLog(`🔮 하위 룬 연쇄 합성 및 [${recipe.name}] 룬워드 완성!`, 'loot');
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
      if (item.rarity === 'unique' || item.rarity === 'legendary' || item.rarity === 'set') {
        hasLegendary = true;
      }
      return { ...item, isIdentified: true };
    });

    setDungeonVictoryLoot(prev => prev ? { ...prev, items: identifiedItems } : null);
    setInventory(prev => prev.map(i => ({ ...i, isIdentified: true })));

    playIdentifySound();
    if (hasLegendary) {
      setTimeout(() => playLegendaryDropSound(), 300);
      addLog(`✨ 데커드 케인의 감정으로 전설/유니크 아이템의 숨겨진 힘이 깨어났습니다!`, 'loot');
    } else {
      addLog(`📜 데커드 케인이 모든 전리품을 감정했습니다.`, 'system');
    }
  };

  const transmuteRunesInVault = (runeKey: string): boolean => {
    const runeOrder = [
      'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
      'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Lem', 'Pul', 'Um', 'Mal', 'Ist',
      'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod'
    ];
    const idx = runeOrder.indexOf(runeKey);
    if (idx < 0 || idx >= runeOrder.length - 1) {
      addLog('더 이상 상위 룬으로 합성할 수 없습니다.', 'system');
      return false;
    }

    if ((runesVault[runeKey] || 0) < 3) {
      addLog(`합성에는 동일한 [${runeKey} 룬] 3개가 필요합니다. (현재 보유: ${runesVault[runeKey] || 0}개)`, 'system');
      return false;
    }

    const nextKey = runeOrder[idx + 1];
    setRunesVault(prev => ({
      ...prev,
      [runeKey]: prev[runeKey] - 3,
      [nextKey]: (prev[nextKey] || 0) + 1
    }));

    playRuneWordSound();
    addLog(`🔮 큐브 합성 성공! [${runeKey} 룬] 3개 ➔ [${nextKey} 룬] 1개 연성!`, 'loot');
    return true;
  };

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

  const [dungeonSnapshot, setDungeonSnapshot] = useState<{
    inventory: GameItem[];
    runesVault: Record<string, number>;
    gold: number;
    exp: number;
    level: number;
  } | null>(null);

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
    let str = playerStats.str;
    let dex = playerStats.dex;
    let con = playerStats.con;
    let int = playerStats.int;
    let wis = playerStats.wis;
    let cha = playerStats.cha;

    let minDmg = 5;
    let maxDmg = 10;
    let defense = con * 1.5 + tempBuffs.defenseBonus;
    let evasion = Math.min(75, Math.floor(dex * 0.25)); // 민첩 4당 회피 1% (최대 75% 캡)
    let damageReduction = 0; // 물리 피해 감소 % (최대 50% 캡)
    let critChance = 10 + dex * 0.25;
    let critDamage = 150;
    let overkillEfficiency = 100 + tempBuffs.overkillBonus;
    let fortune = cha * 1.2;
    let lifeSteal = 0;
    let baseAtbPercent = 50; // 기본 액션 게이지 50%

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

      if (item.slot === 'weapon' && item.baseAtbPercent) {
        baseAtbPercent = item.baseAtbPercent;
      }

      // Socketed Runes bonus
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
          }
        });
      }

      // Sub-affixes
      if (item.subAffixes) {
        item.subAffixes.forEach(affix => {
          if (affix.id.includes('crit')) critChance += affix.value;
          if (affix.id.includes('overkill')) overkillEfficiency += affix.value;
          if (affix.id.includes('str')) str += affix.value;
          if (affix.id.includes('life')) lifeSteal += affix.value;
          if (affix.id.includes('fortune')) fortune += affix.value;
        });
      }
    });

    minDmg += Math.floor(str * 1.5);
    maxDmg += Math.floor(str * 2.0);

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
      lifeSteal: Math.floor(lifeSteal),
      baseAtbPercent
    };
  }, [playerStats, equipment, tempBuffs]);

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

  // ==============================================================
  // REAL HACK & SLASH SEQUENTIAL EXECUTION & HORDE COUNTER-ATTACK
  // ==============================================================
  const executeAttack = useCallback(() => {
    if (viewMode !== 'battle' || isAttacking || isEnemyTurn) return;
    if (playerStats.hp <= 0) {
      addLog('플레이어가 쓰러졌습니다! 마을로 귀환해야 합니다.', 'system');
      return;
    }
    if (playerStats.rage < effectiveSkill.rageCost) {
      addLog(`분노가 부족합니다! (필요: ${effectiveSkill.rageCost}, 현재: ${playerStats.rage})`, 'system');
      return;
    }

    setIsAttacking(true);

    // Consume Rage
    if (effectiveSkill.rageCost > 0) {
      setPlayerStats(prev => ({ ...prev, rage: Math.max(0, prev.rage - effectiveSkill.rageCost) }));
    }

    // Execute actual attack resolution
    const result = resolveAttack(
      playerStats.level,
      totalStats,
      effectiveSkill,
      playerLane,
      monsters,
      false // Real random dice roll
    );

    // Play initial blade slash
    playSlashSound();

    addLog(
      `[${effectiveSkill.name} Lv.${effectiveSkill.level || 1}] 발동! ${result.isCritical ? '★ 치명타 폭발!' : ''} (총 위력: ${result.totalDamage})`,
      'damage'
    );

    // Sequential hit & kill explosion loop
    const targets = result.targetsHit;
    const kills = result.kills;
    const hitStepDuration = Math.max(40, Math.min(80, Math.floor(600 / Math.max(1, targets.length))));

    targets.forEach((hit, index) => {
      setTimeout(() => {
        // Impact sound
        playHitSound(hit.depth);

        // Kill sound with ascending pitch
        if (hit.isFatal) {
          const killIndex = kills.indexOf(hit.monsterId) + 1;
          playKillSound(killIndex);
        }

        // Add floating damage popup with Overkill indicator
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

        // Remove floating damage after 800ms
        setTimeout(() => {
          setFloatingDamages(prev => prev.slice(1));
        }, 800);
      }, index * hitStepDuration);
    });

    // Finalize action after all hits land
    const totalHitTime = targets.length * hitStepDuration + 150;

    setTimeout(() => {
      // If mass kills >= 5, trigger sub-bass explosion rumble
      if (kills.length >= 5) {
        playExplosionSound();
      }

      // STRICT GDD RULE: Chain count is reset to this single action's kills
      setChainCount(result.chainCount);
      if (result.chainCount > maxChainThisRoom) {
        setMaxChainThisRoom(result.chainCount);
      }

      // CRITICAL RULE: ONLY primary targets generate hit rage! Overkill spillover targets do NOT generate rage.
      const primaryTargets = targets.filter(t => !t.isOverkillHit);
      const overkillTargets = targets.filter(t => t.isOverkillHit);
      const hitRage = primaryTargets.length * (effectiveSkill.rageGainPerHit || 0);
      const killRage = result.chainCount * 4;
      const voidKillRage = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 10 : 0;
      let rawRageGained = hitRage + killRage + voidKillRage;

      // 공허 영혼흡수(Void Devour): 분노 생성량 20% 올림 증폭 (Math.ceil)
      const totalRageGained = effectiveSkill.activeRuneId === 'rune_void'
        ? Math.ceil(rawRageGained * 1.20)
        : rawRageGained;

      // Life Steal Calculation (from Skill e.g. Execute + Void Rune)
      const skillHeal = effectiveSkill.lifeStealPercent
        ? Math.floor(result.totalDamage * (effectiveSkill.lifeStealPercent / 100))
        : 0;
      const voidHeal = effectiveSkill.activeRuneId === 'rune_void' ? result.chainCount * 25 : 0;
      const totalHpHealed = skillHeal + voidHeal;

      // Gold & Loot & EXP calculation
      const gainedGold = result.chainCount * 25 + (result.stopperId ? 100 : 0);

      // Calculate EXP per kill based on monster rank and dungeon
      let actionExp = 0;
      result.kills.forEach(kId => {
        const m = monsters.find(mon => mon.id === kId);
        if (m) {
          const isElite = m.rank === 'elite';
          const baseMExp = Math.max(1, Math.floor(m.maxHp * 0.08));
          actionExp += isElite ? baseMExp * 4 : baseMExp;
        }
      });

      if (actionExp > 0) {
        addPlayerExp(actionExp);
      }

      // Apply Player Gains
      setPlayerStats(prev => ({
        ...prev,
        gold: prev.gold + gainedGold,
        rage: Math.min(prev.maxRage, prev.rage + totalRageGained),
        hp: Math.min(prev.maxHp, prev.hp + totalHpHealed)
      }));

      // Combat Logs for Gains
      if (totalRageGained > 0) {
        addLog(
          `⚡ 분노 +${totalRageGained} 충전! (기본 ${primaryTargets.length}타격 x${effectiveSkill.rageGainPerHit || 0} + 처치 ${killRage}${effectiveSkill.activeRuneId === 'rune_void' ? ` + 공허 20% 증폭(${totalRageGained - rawRageGained})` : ''}) ${overkillTargets.length > 0 ? `[오버킬 전이 ${overkillTargets.length}마리 폭발]` : ''}`,
          'system'
        );
      }

      if (totalHpHealed > 0) {
        addLog(
          `🩸 생명력 +${totalHpHealed} 흡수 회복! ${skillHeal > 0 ? `(처형 흡혈 ${skillHeal})` : ''} ${voidHeal > 0 ? `(공허 영혼 흡수 ${voidHeal})` : ''}`,
          'loot'
        );
      }

      if (result.chainCount > 0) {
        addLog(
          `💥 [Chain x${result.chainCount}] ${result.chainCount}마리 몬스터 연쇄 처치! (+${gainedGold}G)`,
          'chain'
        );
      }

      if (result.stopperId) {
        const stopperMonster = monsters.find(m => m.id === result.stopperId);
        addLog(`🛡️ ${stopperMonster?.name || '적'}의 견고한 방어에 오버킬 체인이 저지되었습니다!`, 'system');
      }

      // Compress surviving monsters per lane (GDD Section 11.2)
      const survivors: Monster[] = [];
      for (let l = 0; l < 5; l++) {
        const laneSurvivors = result.newMonsters
          .filter(m => m.lane === l && m.hp > 0)
          .sort((a, b) => a.depth - b.depth);

        laneSurvivors.forEach((m, idx) => {
          survivors.push({ ...m, depth: idx });
        });
      }

      setMonsters(survivors);
      setIsAttacking(false);

      // Check Victory & Auto Transition to Next Room
      if (survivors.length === 0) {
        addLog('🏆 전장의 모든 적을 소탕했습니다! 1초 후 다음 룸으로 자동 이동합니다...', 'loot');
        playRuneWordSound();

        setTimeout(() => {
          const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
          if (currentRoom && currentRoom.connections && currentRoom.connections.length > 0) {
            const nextRoomId = currentRoom.connections[0];
            selectNextRoom(nextRoomId);
          } else {
            // DUNGEON CLEARED! Generate rich victory loot scaled by Dungeon Tier
            const dungeonIndex = Math.max(0, DUNGEONS_DATA.findIndex(d => d.id === currentDungeon.id));
            const multiplier = dungeonIndex + 1;

            const victoryGold = Math.floor(3000 * multiplier + Math.random() * 1000);
            const victoryShards = 10 * multiplier;
            const victoryExp = currentDungeon.id === 'act1_crypt' ? 100
              : currentDungeon.id === 'act2_tomb' ? 600
              : currentDungeon.id === 'act3_jungle' ? 3000
              : currentDungeon.id === 'act4_chaos' ? 14000
              : 70000;

            // Dungeon Tier Rune Pools
            const DUNGEON_RUNE_TIERS: Record<string, string[]> = {
              act1_crypt: ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort'],
              act2_tomb: ['Tal', 'Ral', 'Ort', 'Thul', 'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io'],
              act3_jungle: ['Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem', 'Pul', 'Um', 'Mal'],
              act4_chaos: ['Lem', 'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur'],
              act5_worldstone: ['Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber', 'Jah', 'Cham', 'Zod']
            };

            const availableRunes = DUNGEON_RUNE_TIERS[currentDungeon.id] || DUNGEON_RUNE_TIERS['act1_crypt'];
            const droppedRunes: Record<string, number> = {};
            const runeDropCount = Math.min(4, Math.floor(1 + Math.random() * 2 + (totalStats.fortune > 30 ? 1 : 0)));

            for (let i = 0; i < runeDropCount; i++) {
              const randomRune = availableRunes[Math.floor(Math.random() * availableRunes.length)];
              droppedRunes[randomRune] = (droppedRunes[randomRune] || 0) + 1;
            }

            // Generate dropped items from this dungeon's dedicated drop pool
            const pool = currentDungeon.dropItems && currentDungeon.dropItems.length > 0
              ? currentDungeon.dropItems
              : GAME_ITEMS_POOL.slice(0, 5);

            const itemDropCount = Math.min(3, Math.floor(1 + Math.random() * 2));
            const droppedItems: GameItem[] = [];

            for (let i = 0; i < itemDropCount; i++) {
              const base = pool[Math.floor(Math.random() * pool.length)];
              droppedItems.push({
                ...base,
                id: `loot_${currentDungeon.id}_${Date.now()}_${i}`,
                isIdentified: false // Unidentified for Deckard Cain
              });
            }

            // Update player state
            setPlayerStats(p => ({
              ...p,
              gold: p.gold + victoryGold,
              shards: p.shards + victoryShards
            }));

            addPlayerExp(victoryExp);

            // Add dropped items to inventory
            setInventory(prev => [...prev, ...droppedItems]);

            // Add dropped runes to vault
            setRunesVault(prev => {
              const copy = { ...prev };
              Object.entries(droppedRunes).forEach(([rKey, count]) => {
                copy[rKey] = (copy[rKey] || 0) + count;
              });
              return copy;
            });

            setDungeonVictoryLoot({
              gold: victoryGold,
              shards: victoryShards,
              exp: victoryExp,
              items: droppedItems,
              runes: droppedRunes
            });

            setIsVictoryModalOpen(true);
            playLegendaryDropSound();
            addLog(`👑 축하합니다! [${currentDungeon.name}]을(를) 정복하여 전설의 전리품을 획득했습니다!`, 'loot');
          }
        }, 1200);
        return;
      }

      // ==============================================================
      // WAIT ATB: ENEMY HORDE COUNTER-ATTACK TURN
      // ==============================================================
      setIsEnemyTurn(true);
      setHordeTimelinePercent(100);

      setTimeout(() => {
        // Front-row monsters: EXACTLY the foremost alive monster in each of the 5 lanes (max 5 monsters)
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
          // Check Evasion (Dodge Chance)
          const isDodged = Math.random() * 100 < (totalStats.evasion || 0);
          if (isDodged) {
            dodgedCount++;
            return;
          }

          const isElite = m.rank === 'elite' || m.rank === 'boss';
          const rawDmg = m.intent.damage || (isElite ? 20 : 6);
          const k = 100 + playerStats.level * 10;
          const defMult = k / (k + Math.max(0, totalStats.defense));
          const drMult = (100 - (totalStats.damageReduction || 0)) / 100;
          totalEnemyDamage += Math.max(1, Math.floor(rawDmg * defMult * drMult));
        });

        if (frozenCount > 0) {
          addLog(`❄️ 서리 분쇄에 얼어붙은 몬스터 ${frozenCount}마리가 행동불가(Freeze) 상태로 공격을 건너뜁니다!`, 'system');
        }

        if (dodgedCount > 0) {
          addLog(`💨 민첩한 움직임으로 적 ${dodgedCount}마리의 공격을 완벽히 회피(DODGE!)했습니다! (피해 0)`, 'system');
        }

        if (totalEnemyDamage > 0) {
          playHordeAttackSound();
          
          setPlayerStats(prev => {
            const nextHp = prev.hp - totalEnemyDamage;
            if (nextHp <= 0) {
              // PLAYER DEATH & DUNGEON DEFEAT PENALTY
              setTimeout(() => {
                if (dungeonSnapshot) {
                  setInventory(dungeonSnapshot.inventory);
                  setRunesVault(dungeonSnapshot.runesVault);
                  setPlayerStats(p => ({
                    ...p,
                    hp: Math.floor(p.maxHp * 0.5),
                    gold: dungeonSnapshot.gold,
                    exp: dungeonSnapshot.exp,
                    level: dungeonSnapshot.level,
                    rage: 0
                  }));
                } else {
                  setPlayerStats(p => ({
                    ...p,
                    hp: Math.floor(p.maxHp * 0.5),
                    rage: 0
                  }));
                }
                setViewMode('town');
                setIsEnemyTurn(false);
                setIsAttacking(false);
                setTempBuffs({ defenseBonus: 0, overkillBonus: 0 });
                setDungeonSnapshot(null);
                addLog('💀 [던전 실패] 플레이어가 사망했습니다! 이번 던전에서 획득한 모든 전리품을 잃고 마을로 강제 후송되었습니다.', 'system');
              }, 600);

              return { ...prev, hp: 0 };
            }
            return { ...prev, hp: nextHp };
          });

          addLog(
            `⚔️ 몬스터 전열의 반격! ${activeAttackers.length - dodgedCount}마리 공격 적중 ➔ ${totalEnemyDamage} 피해 (방어력 ${totalStats.defense} / 피해감소 ${totalStats.damageReduction || 0}%)`,
            'damage'
          );
        }

        // Thaw all frozen monsters after skipping their turn
        setMonsters(prev => prev.map(m => ({ ...m, isFrozen: false })));

        setIsEnemyTurn(false);
        // Reset player ATB according to equipped Weapon Speed (Fast: 65~80%, Slow: 35%)
        setHordeTimelinePercent(totalStats.baseAtbPercent || 50);

        // Smart Auto-Targeting: Set player lane to the best lane with maximum targets/damage
        const bestLane = findBestLaneForSkill(playerStats.level, totalStats, selectedSkill, survivors);
        setPlayerLane(bestLane);
      }, 700);

    }, totalHitTime);

  }, [viewMode, isAttacking, isEnemyTurn, playerStats, selectedSkill, totalStats, playerLane, monsters, maxChainThisRoom, currentDungeon, currentRoomId, addLog]);

  // Skill Selector with Auto-Targeting and Double-Tap Instant Cast
  const selectSkillOrExecute = useCallback((skill: Skill) => {
    if (selectedSkill.id === skill.id) {
      // Double tap same skill -> execute attack immediately!
      executeAttack();
    } else {
      setSelectedSkill(skill);
      // Auto-target the best lane for this new skill
      const bestLane = findBestLaneForSkill(playerStats.level, totalStats, skill, monsters);
      setPlayerLane(bestLane);
    }
  }, [selectedSkill, executeAttack, playerStats.level, totalStats, monsters]);

  // Consumables Quick Slot
  const useConsumable = useCallback((hotkeyOrId: string) => {
    const item = consumables.find(c => c.hotkey === hotkeyOrId || c.id === hotkeyOrId);
    if (!item) return;
    if (item.count <= 0) {
      addLog(`[${item.name}]이(가) 모두 소진되었습니다!`, 'system');
      return;
    }

    setConsumables(prev => prev.map(c => c.id === item.id ? { ...c, count: c.count - 1 } : c));

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
    setMonsters(createGoblin30Formation());
    setChainCount(0);
    setMaxChainThisRoom(0);
    setPlayerStats(prev => ({ ...prev, hp: prev.maxHp, rage: 75 }));
    addLog('GDD 26장 30마리 검증 포메이션으로 전장을 초기화했습니다.', 'system');
  }, [addLog]);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // Equip / Unequip
  const equipItem = (item: GameItem) => {
    if (viewMode === 'battle') {
      addLog('전투 중에는 장비를 교체할 수 없습니다!', 'system');
      return;
    }
    if (item.isIdentified === false) {
      addLog('미확인 아이템은 먼저 감정해야 장착할 수 있습니다!', 'system');
      return;
    }
    const slot = item.slot as EquipSlot;
    const current = equipment[slot];

    setEquipment(prev => ({ ...prev, [slot]: item }));
    setInventory(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return current ? [...filtered, current] : filtered;
    });
    addLog(`[${item.name}]을(를) 장착했습니다.`, 'system');
  };

  const unequipItem = (slot: EquipSlot) => {
    if (viewMode === 'battle') {
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

  const upgradeStat = (stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
    if (playerStats.statPoints <= 0) return;
    setPlayerStats(prev => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      [stat]: prev[stat] + 1
    }));
    addLog(`${stat.toUpperCase()} 스탯이 1 상승했습니다.`, 'system');
  };

  const enterDungeon = (dungeonId: string) => {
    const dungeon = DUNGEONS_DATA.find(d => d.id === dungeonId) || DUNGEONS_DATA[0];
    const firstRoomId = dungeon.rooms[1]?.id || 2;

    // Take snapshot before dungeon entry for death penalty
    setDungeonSnapshot({
      inventory: [...inventory],
      runesVault: { ...runesVault },
      gold: playerStats.gold,
      exp: playerStats.exp,
      level: playerStats.level
    });

    setCurrentDungeon(dungeon);
    setCurrentRoomId(firstRoomId);
    setMonsters(createDungeonFormation(dungeon.id, firstRoomId));
    setChainCount(0);
    setMaxChainThisRoom(0);
    setViewMode('battle');
    addLog(`⚔️ [${dungeon.name}]에 진입했습니다! (${dungeon.monsterSummary})`, 'system');
  };

  const selectNextRoom = (roomId: number) => {
    setCurrentRoomId(roomId);
    setMonsters(createDungeonFormation(currentDungeon.id, roomId));
    setChainCount(0);
    addLog(`새로운 룸(Room #${roomId})에 진입했습니다.`, 'system');
  };

  const returnToTown = () => {
    setViewMode('town');
    setMonsters(createDungeonFormation('act1_crypt', 4));
    setTempBuffs({ defenseBonus: 0, overkillBonus: 0 });
    setDungeonSnapshot(null);
    addLog('마을로 귀환했습니다.', 'system');
  };

  // Diablo II System Actions
  const socketRuneIntoItem = (targetItemId: string, runeId: string) => {
    const target = inventory.find(i => i.id === targetItemId);
    const runeItem = inventory.find(i => i.id === runeId);
    if (!target || !runeItem) return;

    if (!target.sockets || (target.socketedRunes && target.socketedRunes.length >= target.sockets)) {
      addLog('더 이상 룬을 박을 빈 소켓이 없습니다!', 'system');
      return;
    }

    const runeKey = Object.keys(D2_RUNES).find(k => runeItem.name.includes(k) || runeItem.name.includes(D2_RUNES[k].name.split(' ')[0])) || 'El';
    const newSocketed = [...(target.socketedRunes || []), runeKey];

    let isRuneWord = false;
    let runeWordMatch: typeof RUNEWORD_RECIPES[0] | undefined = undefined;

    if (target.rarity === 'normal' && newSocketed.length === target.sockets) {
      runeWordMatch = RUNEWORD_RECIPES.find(rw => {
        if (rw.allowedSlot !== target.slot || rw.requiredSockets !== target.sockets) return false;
        return rw.requiredRunes.every((r, idx) => r === newSocketed[idx]);
      });

      if (runeWordMatch) {
        isRuneWord = true;
      }
    }

    const updatedItem: GameItem = {
      ...target,
      socketedRunes: newSocketed,
      ...(isRuneWord && runeWordMatch ? {
        name: runeWordMatch.name,
        rarity: 'runeword',
        isRuneWord: true,
        runeWordName: runeWordMatch.name,
        specialEffect: runeWordMatch.specialEffect,
        stats: {
          ...target.stats,
          ...runeWordMatch.bonusStats
        },
        description: `[룬워드: ${runeWordMatch.requiredRunes.join(' + ')}] ${runeWordMatch.description}`
      } : {
        description: `[소켓 ${newSocketed.length}/${target.sockets} 장착: ${newSocketed.join(', ')}] ${target.baseItemName || target.name}`
      })
    };

    setInventory(prev => prev.filter(i => i.id !== runeId).map(i => i.id === targetItemId ? updatedItem : i));

    if (isRuneWord && runeWordMatch) {
      playRuneWordSound();
      addLog(`✨ 고대 룬워드 발동! [${runeWordMatch.name}] 완성!`, 'loot');
    } else {
      addLog(`[${target.name}]의 소켓에 [${runeKey} 룬]을 장착했습니다.`, 'system');
    }
  };

  const transmuteInCube = (itemIds: string[]) => {
    const selectedItems = inventory.filter(i => itemIds.includes(i.id));
    if (selectedItems.length === 0) {
      addLog('큐브에 합성할 재료를 넣으세요.', 'system');
      return;
    }

    // Recipe 1: 3 of same Runes -> 1 higher Rune
    if (selectedItems.length === 3 && selectedItems.every(i => i.slot === 'rune' && i.name === selectedItems[0].name)) {
      const runeName = selectedItems[0].name;
      const rKey = Object.keys(D2_RUNES).find(k => runeName.includes(k) || runeName.includes(D2_RUNES[k].name.split(' ')[0]));
      
      const runeOrder = ['El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Sol', 'Shael', 'Amn', 'Ber', 'Jah'];
      const curIdx = rKey ? runeOrder.indexOf(rKey) : -1;

      if (curIdx >= 0 && curIdx < runeOrder.length - 1) {
        const nextKey = runeOrder[curIdx + 1];
        const nextDef = D2_RUNES[nextKey];
        const newRune: GameItem = {
          id: `cube_rune_${Math.random()}`,
          name: nextDef.name,
          rarity: nextDef.number >= 20 ? 'legendary' : 'rare',
          slot: 'rune',
          stats: {},
          value: nextDef.number * 350,
          icon: 'Sparkles',
          description: `[룬 #${nextDef.number}] 무기: ${nextDef.weaponBonus} / 방어구: ${nextDef.armorBonus}`
        };

        setInventory(prev => [...prev.filter(i => !itemIds.includes(i.id)), newRune]);
        playRuneWordSound();
        addLog(`🔮 호라드릭 큐브 합성 성공! [${newRune.name}]을(를) 연성했습니다!`, 'loot');
        return;
      }
    }

    // Recipe 2: Normal Item + 1 Rune -> Add Sockets
    const normalItem = selectedItems.find(i => i.rarity === 'normal' && (!i.sockets || i.sockets === 0));
    const hasRune = selectedItems.find(i => i.slot === 'rune');

    if (selectedItems.length === 2 && normalItem && hasRune) {
      const socketCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 sockets
      const updated: GameItem = {
        ...normalItem,
        sockets: socketCount,
        socketedRunes: [],
        name: `${normalItem.baseItemName || normalItem.name} (${socketCount} 소켓)`,
        description: `${socketCount}개의 빈 소켓이 뚫린 베이스 아이템. 룬을 박아 룬워드를 제작하세요.`
      };

      setInventory(prev => [...prev.filter(i => !itemIds.includes(i.id)), updated]);
      playRuneWordSound();
      addLog(`🔮 큐브의 힘으로 [${updated.name}]에 ${socketCount}개의 소켓을 뚫었습니다!`, 'loot');
      return;
    }

    addLog('일치하는 호라드릭 큐브 레시피가 없습니다.', 'system');
  };

  const gambleItem = (gambleType: 'weapon' | 'armor' | 'ring' | 'amulet') => {
    const costMap = { weapon: 3500, armor: 4000, ring: 6000, amulet: 7500 };
    const cost = costMap[gambleType];

    if (playerStats.gold < cost) {
      addLog(`도박 골드가 부족합니다! (필요: ${cost}G, 보유: ${playerStats.gold}G)`, 'system');
      return;
    }

    setPlayerStats(prev => ({ ...prev, gold: prev.gold - cost }));

    const roll = Math.random() * 100;
    let rarity: GameItem['rarity'] = 'magic';
    if (roll > 99.5) rarity = 'legendary';
    else if (roll > 96) rarity = 'unique';
    else if (roll > 80) rarity = 'rare';

    const newItem: GameItem = {
      id: `gamble_${Math.random()}`,
      name: `미확인 ${gambleType === 'weapon' ? '검' : gambleType === 'armor' ? '갑옷' : gambleType === 'ring' ? '반지' : '목걸이'}`,
      rarity,
      slot: gambleType === 'ring' ? 'ring1' : gambleType,
      isIdentified: false,
      stats: {},
      value: cost,
      icon: gambleType === 'weapon' ? 'Sword' : gambleType === 'armor' ? 'Shield' : 'Sparkles',
      description: '기드의 상점에서 도박으로 뽑은 미확인 아이템. 케인의 식별로 대박을 확인하세요!'
    };

    setInventory(prev => [newItem, ...prev]);
    addLog(`🎲 기드의 도박 완료! [${newItem.name}]을(를) 뽑았습니다. (식별 필요)`, 'loot');
  };

  const identifyItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.isIdentified) return;

    const affixes = [
      { id: 'crit', name: '예리함', value: 8, label: '치명타 확률 +8%' },
      { id: 'overkill', name: '도륙', value: 20, label: '오버킬 잔여 피해 전이 +20%' },
      { id: 'life', name: '흡혈', value: 6, label: '타격 시 생명력 흡수 +6%' },
      { id: 'str', name: '거인의', value: 12, label: '힘(STR) +12' },
      { id: 'fortune', name: '행운의', value: 25, label: '매직 아이템 발견 확률(MF) +25%' }
    ];

    const rolledAffixes = [affixes[Math.floor(Math.random() * affixes.length)], affixes[Math.floor(Math.random() * affixes.length)]];

    const identified: GameItem = {
      ...item,
      name: item.rarity === 'unique' ? '바람살 (Windforce)' : item.rarity === 'rare' ? '용사의 맹세 (Hero\'s Vow)' : '마법사의 장비',
      isIdentified: true,
      stats: {
        minDmg: 35,
        maxDmg: 58,
        defense: 40,
        str: 10
      },
      subAffixes: rolledAffixes,
      description: '데커드 케인이 감정한 신비로운 장비입니다.'
    };

    setInventory(prev => prev.map(i => i.id === itemId ? identified : i));
    playRuneWordSound();
    addLog(`📜 식별 완료! [${identified.name}]의 숨겨진 능력이 밝혀졌습니다!`, 'loot');
  };

  const identifyAllItems = () => {
    const unidentified = inventory.filter(i => i.isIdentified === false);
    if (unidentified.length === 0) {
      addLog('식별할 미확인 아이템이 없습니다. "Stay awhile and listen!"', 'system');
      return;
    }
    unidentified.forEach(i => identifyItem(i.id));
    playRuneWordSound();
    addLog(`📜 데커드 케인이 소지한 모든 미확인 아이템(${unidentified.length}개)을 식별했습니다!`, 'loot');
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
      slash: 'rune_fire',
      execute: 'rune_poison',
      cleave: 'rune_lightning',
      whirlwind: 'rune_frost'
    });
    setConsumables(INITIAL_CONSUMABLES);
    setCurrentDungeon(DUNGEONS_DATA[0]);
    setCurrentRoomId(2);
    setMonsters(createDungeonFormation('act1_crypt', 2));
    setChainCount(0);
    setViewMode('town');
    addLog('💾 캐릭터를 레벨 1 및 단촐한 기본 장비로 초기화하고 새 모험을 시작했습니다.', 'system');
  };

  return (
    <GameContext.Provider
      value={{
        viewMode,
        activeModal,
        playerStats,
        equipment,
        inventory,
        consumables,
        currentDungeon,
        currentRoomId,
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
        returnToTown,
        addLog,
        resetBattleFormation,
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
        socketRuneIntoItem,
        transmuteInCube,
        gambleItem,
        identifyItem,
        identifyAllItems,
        resetGameSave
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
