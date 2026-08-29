export type ViewMode = 'town' | 'dungeon_select' | 'dungeon_exploration' | 'battle';

export type ModalType = null | 'character' | 'inventory' | 'skills' | 'storage' | 'blacksmith' | 'settings' | 'achievement' | 'auth';

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
  shield?: number;
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
  fortune?: number; // Magic Find % (MF)
  goldFind?: number; // Extra Gold from Monsters % (GF)
  turnRageRegen?: number; // 턴당 분노 자동 회복량
  rageCostReduction?: number; // 분노 소모량 감소 %
  allSkills?: number; // +All Skills level bonus
  // 🌟 RuneWord & Unique Special Stats
  enhancedDamage?: number; // Off-weapon ED % (e.g. Fortitude +200%, Phoenix +150%)
  crushingBlow?: number; // 강타 확률 % (Crushing Blow)
  openWounds?: number; // 상처 악화 확률 % (Open Wounds)
  ignoreTargetDefense?: boolean; // 적 방어력 무시 (Grief, Faith, Jah)
  targetDefenseReduction?: number; // 적 방어력 감소 % (Infinity -85%, Eth -25%)
  convictionAura?: boolean; // 선고 오라 (Infinity - 적 방어/저항 85% 파괴)
  redemptionOnKill?: boolean; // 구원의 오라 (Phoenix - 처치 시 HP/분노 완충)
  mightAura?: boolean; // 위세 오라 (Last Wish - 공격력 +200%)
  chillingArmor?: boolean; // 칠흑 갑주 (Fortitude - 피격 시 결빙 반사 & 방어 +50%)
  staticFieldChance?: number; // 스태틱 필드 발동 확률 % (Crescent Moon)
  amplifyDamageChance?: number; // 앰플리파이 발동 확률 % (Atma)
  lifeTapChance?: number; // 라이프 탭 발동 확률 % (Dracul, Last Wish, Exile)
  cannotBeFrozen?: boolean; // 결빙 방지 (Raven Frost, Rhyme, Cham)
  damageToDemons?: number; // 악마 대상 추가 피해 % (Laying of Hands +350%)
  knockback?: boolean; // 적 밀쳐내기 (Windforce)
}

export interface GameItem {
  id: string;
  name: string;
  baseItemName?: string;
  rarity: ItemRarity;
  tier?: 'normal' | 'exceptional' | 'elite' | string;
  slot: EquipSlot | 'rune' | 'gem' | 'material' | 'consumable' | 'ring';
  stats: ItemStats;
  sockets?: number; // 0 to 4
  socketedRunes?: string[]; // e.g. ['Tir', 'El']
  isRuneWord?: boolean;
  runeWordName?: string;
  isIdentified?: boolean;
  isLocked?: boolean;
  realUniqueName?: string;
  setName?: string;
  subAffixes?: { id: string; name: string; value: number; label: string }[];
  specialEffect?: string;
  speedCategory?: 'very_fast' | 'fast' | 'normal' | 'slow' | 'very_slow';
  baseAtbPercent?: number; // 기본 시작 ATB 게이지 %
  /** B안 무기군 분류: sword/axe/mace/polearm/bow/crossbow — weapon 슬롯일 때만 유효 */
  weaponGroup?: 'sword' | 'axe' | 'mace' | 'polearm' | 'bow' | 'crossbow';
  /** B안 무기 과군: melee / missile — 무기군 상위 분류 */
  weaponSuperGroup?: 'melee' | 'missile';
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
  enhancedDamage?: number; // e.g. +50 means +50% base min/max damage
  enhancedDefense?: number; // e.g. +50 means +50% base defense
  bonusStats: ItemStats;
  specialEffect: string;
  description: string;
  /** B안 무기군 제한: 비어있으면 모든 weapon 허용 */
  allowedWeaponGroups?: Array<'sword' | 'axe' | 'mace' | 'polearm' | 'bow' | 'crossbow'>;
  /** B안 무기 상위군 제한: melee/missile */
  allowedWeaponSuperGroup?: 'melee' | 'missile';
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
  shield?: number;
  /** Layered shield charges: each layer has amount + remaining turns. Oldest expires first. */
  shieldLayers?: { amount: number; turns: number }[];
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
  revealed?: boolean;
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
  isEndlessRift?: boolean;
  riftTier?: number;
  riftActTheme?: number; // 1..5 for dynamic background & audio
  riftSpawnPattern?: 'standard' | 'column_charge' | 'wide_wall' | 'pincer_flank' | 'horde_swarm';
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
    skillName?: string;
    desc?: string;
  };
  icon: string;
  isTargeted?: boolean;
  isPredictedDead?: boolean;
  isFrozen?: boolean;
  isInvulnerable?: boolean;
  bossGimmick?: string;
  bossSignatureKey?: string;
  element?: ElementType;
  bossStaggerHp?: number;
  bossStaggerMaxHp?: number;
  bossWeakLane?: number;
  isGroggy?: boolean;
  bossTelegraphLanes?: number[];
  isChargingUltimate?: boolean;
  bossUltimateName?: string;
  isGuarding?: boolean;
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
  unlockLevel?: number;
  hitCount?: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'damage' | 'kill' | 'chain' | 'system' | 'loot';
}

export type { PassiveSkill } from '../data/passiveSkills';
export type { Achievement, AchievementStats } from '../data/achievements';

export interface RoomLootEvent {
  type: 'treasure' | 'rune' | 'shrine' | 'combat';
  title: string;
  gold?: number;
  shards?: number;
  items?: GameItem[];
  runeName?: string;
  count?: number;
  buffName?: string;
  buffDesc?: string;
  isGodlyDrop?: boolean;
  godlyItemNames?: string[];
}

export interface TownUpgrades {
  potionCapacityLevel: number; // 0..5 (3, 4, 5, 6, 8, 10)
  potionHealingLevel: number; // 0..10 (+15 HP/Lv)
  consumablePowerLevel: number; // 0..10 (+10 def / +10 rage/Lv)
  gambleLevel: number; // 1..5 (1: Normal, 2: Exceptional, 3: Elite I, 4: Elite II, 5: Ancient End-Game)
}

export const DEFAULT_TOWN_UPGRADES: TownUpgrades = {
  potionCapacityLevel: 0,
  potionHealingLevel: 0,
  consumablePowerLevel: 0,
  gambleLevel: 1
};

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}
