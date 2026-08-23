export type ViewMode = 'town' | 'dungeon_select' | 'dungeon_exploration' | 'battle';

export type ModalType = null | 'character' | 'inventory' | 'skills' | 'storage' | 'blacksmith' | 'settings';

export type ItemRarity = 'normal' | 'magic' | 'rare' | 'set' | 'unique' | 'runeword' | 'legendary';

export type EquipSlot = 'helm' | 'amulet' | 'weapon' | 'armor' | 'shield' | 'gloves' | 'ring1' | 'ring2' | 'boots';

export interface ItemStats {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  hp?: number;
  mana?: number;
  minDmg?: number;
  maxDmg?: number;
  defense?: number;
  evasion?: number; // 회피율 % (Dodge Chance)
  damageReduction?: number; // 물리 피해 감소 % (Damage Reduced By %)
  critChance?: number;
  critDamage?: number;
  overkillEfficiency?: number; // e.g. +15%
  lifeSteal?: number;
  manaSteal?: number;
  attackSpeed?: number;
  weaponSpeed?: number;
  moveSpeed?: number;
  allResist?: number;
  fortune?: number; // Magic Find %
}

export interface GameItem {
  id: string;
  name: string;
  baseItemName?: string;
  rarity: ItemRarity;
  tier?: 'normal' | 'exceptional' | 'elite';
  slot: EquipSlot | 'rune' | 'gem' | 'material' | 'consumable';
  stats: ItemStats;
  sockets?: number; // 0 to 4
  socketedRunes?: string[]; // e.g. ['Tir', 'El']
  isRuneWord?: boolean;
  runeWordName?: string;
  isIdentified?: boolean;
  subAffixes?: { id: string; name: string; value: number; label: string }[];
  specialEffect?: string;
  speedCategory?: 'very_fast' | 'fast' | 'normal' | 'slow' | 'very_slow';
  baseAtbPercent?: number; // 기본 시작 ATB 게이지 %
  stackCount?: number; // 동일 베이스/아이템 중첩 수치
  value: number;
  icon: string;
  description: string;
  requiredLevel?: number;
}

export interface RuneWordRecipe {
  id: string;
  name: string;
  requiredRunes: string[]; // e.g. ['Tir', 'El']
  allowedSlot: EquipSlot;
  requiredSockets: number;
  bonusStats: ItemStats;
  specialEffect: string;
  description: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  count: number;
  type: 'hp' | 'rage' | 'defense' | 'overkill';
  effectValue: number;
  description: string;
  icon: string;
  hotkey: string;
}

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  rage: number;
  maxRage: number;
  mana: number;
  maxMana: number;
  gold: number;
  shards: number;
  statPoints: number;
  skillPoints: number;
  
  // Base 6 Attributes
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  evasion?: number;
  damageReduction?: number;
}

export type RoomType = 'start' | 'normal' | 'elite' | 'treasure' | 'rune' | 'shrine' | 'boss';


export interface DungeonBuff {
  id: string;
  name: string;
  type: 'fortune' | 'crit' | 'defense' | 'damage';
  value: number;
  description: string;
  icon: string;
}

export interface DungeonRoom {
  id: number;
  type: RoomType;
  title: string;
  cleared: boolean;
  current: boolean;
  connections: number[];
  monsterCount?: number;
  rewardDesc?: string;
}

export interface DungeonInfo {
  id: string;
  name: string;
  theme: string;
  recommendedLevel: number;
  difficulty: '쉬움' | '보통' | '어려움' | '지옥';
  elementalInfo: string;
  monsterSummary: string;
  dropItems: GameItem[];
  bestClearTime: string;
  maxChainRecord: number;
  rooms: DungeonRoom[];
}

export type MonsterRank = 'normal' | 'champion' | 'elite' | 'boss';

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  defense: number;
  rank: MonsterRank;
  lane: number;
  depth: number;
  intent: {
    type: 'attack' | 'cast' | 'defend' | 'buff';
    damage?: number;
    targetLane?: number;
    chargePercent?: number;
  };
  icon: string;
  isTargeted?: boolean;
  isPredictedDead?: boolean;
  isFrozen?: boolean;
  incomingDamage?: number;
  bossGimmick?: string;
}

export type SkillRoute = 'line' | 'branch' | 'radius' | 'single';

export type ElementType = 'physical' | 'fire' | 'cold' | 'lightning' | 'poison' | 'void';

export interface SkillRune {
  id: string;
  name: string;
  element: ElementType;
  description: string;
  damageBonusPercent: number;
  overkillBonusPercent: number;
  specialEffectName: string;
  color: string;
}

export interface Skill {
  id: string;
  name: string;
  element?: ElementType;
  level?: number;
  maxLevel?: number;
  rageCost: number;
  manaCost: number;
  damageMultiplier: number;
  overkillEfficiency: number;
  rageGainPerHit?: number;
  lifeStealPercent?: number;
  route: SkillRoute;
  description: string;
  icon: string;
  hotkey: 'Q' | 'W' | 'E' | 'R' | string;
  soundType?: string;
  activeRuneId?: string | null;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'damage' | 'kill' | 'chain' | 'system' | 'loot';
}
