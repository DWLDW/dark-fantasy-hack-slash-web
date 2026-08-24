export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
  reward: { gold?: number; shards?: number; };
  unlocked?: boolean;
}

export interface AchievementStats {
  maxChainEver: number;
  totalKills: number;
  totalGoldEarned: number;
  dungeonClears: Record<string, number>;
  runeWordsCreated: number;
  uniqueItemsFound: number;
  bossKills: number;
  playerLevel: number;
  totalDeaths: number;
  maxDifficultyEver?: number;
}

export const INITIAL_ACHIEVEMENT_STATS: AchievementStats = {
  maxChainEver: 0,
  totalKills: 0,
  totalGoldEarned: 0,
  dungeonClears: {},
  runeWordsCreated: 0,
  uniqueItemsFound: 0,
  bossKills: 0,
  playerLevel: 1,
  totalDeaths: 0,
  maxDifficultyEver: 1,
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_chain',
    name: '첫 오버킬 체인',
    description: '오버킬 체인 2회 이상을 달성하여 적을 연쇄 처치하세요.',
    icon: 'Zap',
    condition: (stats) => stats.maxChainEver >= 2,
    reward: { gold: 100 }
  },
  {
    id: 'slaughter_10',
    name: 'x10 학살',
    description: '단 한 번의 일격으로 10마리 이상의 적을 연쇄 섬멸하세요.',
    icon: 'Skull',
    condition: (stats) => stats.maxChainEver >= 10,
    reward: { gold: 300 }
  },
  {
    id: 'massacre_25',
    name: 'x25 대학살',
    description: '단 한 번의 일격으로 25마리 이상의 적을 잿더미로 만드세요.',
    icon: 'Flame',
    condition: (stats) => stats.maxChainEver >= 25,
    reward: { gold: 500, shards: 5 }
  },
  {
    id: 'annihilation_50',
    name: 'x50 전멸',
    description: '50마리 이상의 대군세를 단숨에 전멸시키세요.',
    icon: 'Crosshair',
    condition: (stats) => stats.maxChainEver >= 50,
    reward: { gold: 1000, shards: 10 }
  },
  {
    id: 'apocalypse_100',
    name: 'x100 종말',
    description: '경이로운 100마리 연쇄 학살로 전장에 종말을 선사하세요.',
    icon: 'Sparkles',
    condition: (stats) => stats.maxChainEver >= 100,
    reward: { gold: 3000, shards: 25 }
  },
  {
    id: 'first_runeword',
    name: '첫 룬워드 제작',
    description: '호라드릭 큐브의 지혜를 빌려 첫 룬워드 장비를 완성하세요.',
    icon: 'Hammer',
    condition: (stats) => stats.runeWordsCreated >= 1,
    reward: { gold: 200 }
  },
  {
    id: 'first_unique',
    name: '첫 유니크 획득',
    description: '성역에 숨겨진 희귀한 유니크/전설 장비를 발견하세요.',
    icon: 'Gift',
    condition: (stats) => stats.uniqueItemsFound >= 1,
    reward: { gold: 200 }
  },
  {
    id: 'boss_slayer_10',
    name: '보스 10회 처치',
    description: '던전의 수호자 보스 몬스터를 10회 처단하세요.',
    icon: 'Crown',
    condition: (stats) => stats.bossKills >= 10,
    reward: { gold: 1000 }
  },
  {
    id: 'level_20',
    name: '레벨 20 달성',
    description: '피와 뼈를 깎는 수련 끝에 레벨 20에 도달하세요.',
    icon: 'Trophy',
    condition: (stats) => stats.playerLevel >= 20,
    reward: { gold: 500, shards: 10 }
  },
  {
    id: 'kills_1000',
    name: '1000마리 처치',
    description: '악마와 언데드 1,000마리를 처단하여 피의 제사를 완성하세요.',
    icon: 'Target',
    condition: (stats) => stats.totalKills >= 1000,
    reward: { gold: 500 }
  },
  {
    id: 'phoenix_5',
    name: '불사조',
    description: '죽음의 문턱을 5회 넘나들고 다시 부활하여 칼을 쥐세요.',
    icon: 'ShieldAlert',
    condition: (stats) => stats.totalDeaths >= 5,
    reward: { gold: 100 }
  },
  {
    id: 'clear_act1',
    name: '1막: 지하묘지 정복',
    description: '1막: 핏빛 황야와 지하묘지를 1회 이상 클리어하세요.',
    icon: 'Award',
    condition: (stats) => (stats.dungeonClears['act1_4_catacombs'] || stats.dungeonClears['act1_2_crypt'] || stats.dungeonClears['act1_1_den'] || 0) >= 1,
    reward: { gold: 300 }
  },
  {
    id: 'clear_act2',
    name: '2막: 사막 묘실 정복',
    description: '2막: 메마른 사막의 고대 묘실을 1회 이상 클리어하세요.',
    icon: 'Award',
    condition: (stats) => (stats.dungeonClears['act2_4_tomb'] || stats.dungeonClears['act2_1_sewers'] || 0) >= 1,
    reward: { gold: 300 }
  },
  {
    id: 'clear_act3',
    name: '3막: 증오의 사원 정복',
    description: '3막: 쿠라스트와 증오의 억류지를 1회 이상 클리어하세요.',
    icon: 'Award',
    condition: (stats) => (stats.dungeonClears['act3_4_durance'] || stats.dungeonClears['act3_2_jungle'] || 0) >= 1,
    reward: { gold: 300 }
  },
  {
    id: 'clear_act4',
    name: '4막: 혼돈의 성역 정복',
    description: '4막: 불길의 강과 혼돈의 제단을 1회 이상 클리어하세요.',
    icon: 'Award',
    condition: (stats) => (stats.dungeonClears['act4_4_altar'] || stats.dungeonClears['act4_3_sanctuary'] || 0) >= 1,
    reward: { gold: 300 }
  },
  {
    id: 'clear_act5',
    name: '5막: 세계석 성채 정복',
    description: '5막: 아리앗 정상과 파괴의 옥좌를 1회 이상 클리어하세요.',
    icon: 'Award',
    condition: (stats) => (stats.dungeonClears['act5_4_throne'] || stats.dungeonClears['act5_3_keep'] || 0) >= 1,
    reward: { gold: 300 }
  },
  {
    id: 'torment_10',
    name: '고난의 길 (T10 돌파)',
    description: '무한 난이도 Lv.10 이상을 클리어하여 진정한 도전을 시작하세요.',
    icon: 'ShieldAlert',
    condition: (stats) => (stats.maxDifficultyEver || 1) >= 10,
    reward: { gold: 1500, shards: 15 }
  },
  {
    id: 'torment_50',
    name: '고행의 군주 (T50 돌파)',
    description: '무한 난이도 Lv.50 이상을 격파하여 악마들에게 공포를 심어주세요.',
    icon: 'Crown',
    condition: (stats) => (stats.maxDifficultyEver || 1) >= 50,
    reward: { gold: 5000, shards: 50 }
  },
  {
    id: 'torment_100',
    name: '성역의 신화 (T100 정복)',
    description: '무한 난이도 Lv.100 이상을 돌파하여 불멸의 신화가 되세요.',
    icon: 'Sparkles',
    condition: (stats) => (stats.maxDifficultyEver || 1) >= 100,
    reward: { gold: 15000, shards: 100 }
  },
  {
    id: 'level_50',
    name: '만렙의 경지 (Lv.50)',
    description: '모든 잠재력을 개화하여 레벨 50에 도달하세요.',
    icon: 'Trophy',
    condition: (stats) => stats.playerLevel >= 50,
    reward: { gold: 3000, shards: 30 }
  },
  {
    id: 'gold_100k',
    name: '황금빛 거부',
    description: '누적 100,000 Gold 이상을 획득하여 성역의 대부호가 되세요.',
    icon: 'Coins',
    condition: (stats) => stats.totalGoldEarned >= 100000,
    reward: { gold: 5000, shards: 20 }
  },
  {
    id: 'master_runewords',
    name: '고대 룬의 대가',
    description: '호라드릭 큐브를 통해 룬워드 장비를 5회 이상 제작하세요.',
    icon: 'Hammer',
    condition: (stats) => stats.runeWordsCreated >= 5,
    reward: { gold: 2000, shards: 20 }
  }
];
