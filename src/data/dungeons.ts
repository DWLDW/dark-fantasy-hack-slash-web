import { DungeonInfo, Monster, DungeonBuff } from '../types/game';
import { GAME_ITEMS_POOL, getActDropPool } from './items';

export const SHRINE_BUFFS_POOL: Record<string, Omit<DungeonBuff, 'id'>> = {
  fortune: {
    name: '태양의 축복',
    type: 'fortune',
    value: 35,
    description: '매직 아이템 발견 확률(MF) +35%',
    icon: '☀️'
  },
  crit: {
    name: '피의 축복',
    type: 'crit',
    value: 15,
    description: '체력 100% 즉시 완충 & 치명타율 +15%',
    icon: '🩸'
  },
  defense: {
    name: '강철의 축복',
    type: 'defense',
    value: 50,
    description: '방어력 +50 & 물리 피해 감소 +10%',
    icon: '🛡️'
  }
};

export const ACT_DUNGEON_GROUPS: Record<number, string[]> = {
  1: ['act1_1_den', 'act1_2_crypt', 'act1_3_tower', 'act1_4_catacombs'],
  2: ['act2_1_sewers', 'act2_2_halls', 'act2_3_maggot', 'act2_4_tomb'],
  3: ['act3_1_spider', 'act3_2_jungle', 'act3_3_travincal', 'act3_4_durance'],
  4: ['act4_1_plains', 'act4_2_forge', 'act4_3_sanctuary', 'act4_4_altar'],
  5: ['act5_1_foothills', 'act5_2_summit', 'act5_3_keep', 'act5_4_throne']
};

export const ALL_DUNGEON_IDS = Object.values(ACT_DUNGEON_GROUPS).flat();

export function isDungeonUnlocked(dungeonId: string, dungeonClears: Record<string, number> = {}): boolean {
  if (!dungeonId) return true;
  const index = ALL_DUNGEON_IDS.indexOf(dungeonId);
  if (index <= 0) return true; // First dungeon of Act 1 is always unlocked

  // Check which act this dungeon belongs to
  let currentAct = 1;
  let actDungeons: string[] = ACT_DUNGEON_GROUPS[1];
  for (let act = 1; act <= 5; act++) {
    if (ACT_DUNGEON_GROUPS[act] && ACT_DUNGEON_GROUPS[act].includes(dungeonId)) {
      currentAct = act;
      actDungeons = ACT_DUNGEON_GROUPS[act];
      break;
    }
  }

  const dIdxInAct = actDungeons.indexOf(dungeonId);
  if (dIdxInAct === -1) return true; // Unknown dungeon fallback to open

  // If first dungeon of an Act > 1, must have cleared all dungeons of previous act
  if (dIdxInAct === 0 && currentAct > 1) {
    const prevActDungeons = ACT_DUNGEON_GROUPS[currentAct - 1];
    if (!prevActDungeons) return true;
    return prevActDungeons.every(dId => (dungeonClears[dId] || 0) >= 1);
  }

  // Otherwise, must have cleared the previous dungeon in the same act
  const prevDungeonId = actDungeons[dIdxInAct - 1];
  if (!prevDungeonId) return true;
  return (dungeonClears[prevDungeonId] || 0) >= 1;
}

export function isActUnlocked(actOrDungeon: number | string, dungeonClears: Record<string, number> = {}): boolean {
  if (typeof actOrDungeon === 'string') {
    return isDungeonUnlocked(actOrDungeon, dungeonClears);
  }
  const actNum = actOrDungeon;
  if (actNum <= 1) return true;
  const prevActDungeons = ACT_DUNGEON_GROUPS[actNum - 1];
  if (!prevActDungeons) return false;
  return prevActDungeons.every(dId => (dungeonClears[dId] || 0) >= 1);
}

export function getHighestUnlockedDungeon(dungeonClears: Record<string, number> = {}): DungeonInfo {
  for (let i = ALL_DUNGEON_IDS.length - 1; i >= 0; i--) {
    const dId = ALL_DUNGEON_IDS[i];
    if (isDungeonUnlocked(dId, dungeonClears)) {
      const found = DUNGEONS_DATA.find(d => d.id === dId);
      if (found) return found;
    }
  }
  return DUNGEONS_DATA[0];
}

export function generateEndlessRiftDungeon(tier: number = 1, previousActTheme?: number): DungeonInfo {
  const safeTier = Math.max(1, tier);
  // Pick random act theme (1..5) different from previous
  const availableThemes = [1, 2, 3, 4, 5].filter(t => t !== previousActTheme);
  const randomAct = availableThemes[Math.floor(Math.random() * availableThemes.length)] || ((safeTier % 5) + 1);

  const patterns: ('column_charge' | 'wide_wall' | 'pincer_flank' | 'horde_swarm')[] = [
    'column_charge',
    'wide_wall',
    'pincer_flank',
    'horde_swarm'
  ];
  const spawnPattern = patterns[(safeTier - 1) % patterns.length];

  const recLevel = 80 + Math.floor((safeTier - 1) * 2.5);
  const difficultyLabel: DungeonInfo['difficulty'] =
    safeTier <= 5 ? '쉬움' : safeTier <= 15 ? '보통' : safeTier <= 30 ? '어려움' : '지옥';

  const actNames = ['', '카타콤 심연', '사막 황금석묘', '자카룸 맹독사원', '혼돈의 용암성역', '세계석 혹한정상'];

  return {
    id: `endless_rift_t${safeTier}`,
    name: `🌌 대균열 ${safeTier}단계 (Rift Tier ${safeTier})`,
    theme: `[Act ${randomAct} ${actNames[randomAct]}] 차원 왜곡 전장 · ${
      spawnPattern === 'column_charge'
        ? '세로 돌파 군세 (관통 추천)'
        : spawnPattern === 'wide_wall'
        ? '가로 횡대 군세 (휩쓸기 추천)'
        : spawnPattern === 'pincer_flank'
        ? '양익 협공 군세'
        : '초거대 대군세 스웜'
    }`,
    recommendedLevel: recLevel,
    difficulty: difficultyLabel,
    elementalInfo: '모든 속성 복합 저항 & 전술적 군세 돌파',
    monsterSummary: `대균열 왜곡 정예, 수호자 대악마, 전술 군세 (${spawnPattern})`,
    bestClearTime: '--:--',
    maxChainRecord: 0,
    isEndlessRift: true,
    riftTier: safeTier,
    riftActTheme: randomAct,
    riftSpawnPattern: spawnPattern,
    dropItems: [],
    rooms: [
      { id: 1, type: 'start', title: `차원 왜곡 관문 (Tier ${safeTier})`, cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: `균열 선봉 전초 (전술 룸)`, cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: `균열 정예 집결지`, cleared: false, current: false, connections: [4], revealed: false },
      { id: 4, type: 'treasure', title: `차원의 고대 보물함`, cleared: false, current: false, connections: [5], revealed: false, rewardDesc: '신화적 고대 전리품' },
      { id: 5, type: safeTier % 2 === 0 ? 'rune' : 'shrine', title: safeTier % 2 === 0 ? '대악마 룬 제단' : '차원의 성소', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '고급 룬 또는 강력한 축복' },
      { id: 6, type: 'boss', title: `균열 수호자 알현실`, cleared: false, current: false, connections: [], revealed: false, rewardDesc: '대균열 수호자 신화 드랍' }
    ]
  };
}

export function getNextStoryDungeon(currentDungeonId: string, currentTier: number = 1): DungeonInfo | null {
  // If in endless rift, increment tier
  if (currentDungeonId.startsWith('endless_rift_')) {
    const nextTier = currentTier + 1;
    return generateEndlessRiftDungeon(nextTier);
  }

  const currentIndex = ALL_DUNGEON_IDS.indexOf(currentDungeonId);
  if (currentIndex === -1) {
    return generateEndlessRiftDungeon(1);
  }
  
  // If final act 5 boss is beaten, automatically transition to Endless Rift Tier 1
  if (currentIndex >= ALL_DUNGEON_IDS.length - 1) {
    return generateEndlessRiftDungeon(1);
  }

  const nextId = ALL_DUNGEON_IDS[currentIndex + 1];
  return DUNGEONS_DATA.find(d => d.id === nextId) || generateEndlessRiftDungeon(1);
}

function create6RoomGraph(themeTitles: {
  start: string;
  wave: string;
  elite: string;
  treasure: string;
  event: string;
  boss: string;
}, isRuneRoom: boolean = false): DungeonInfo['rooms'] {
  return [
    { id: 1, type: 'start', title: themeTitles.start, cleared: true, current: false, connections: [2], revealed: true },
    { id: 2, type: 'normal', title: themeTitles.wave, cleared: false, current: false, connections: [3], revealed: false },
    { id: 3, type: 'elite', title: themeTitles.elite, cleared: false, current: false, connections: [4], revealed: false },
    { id: 4, type: 'treasure', title: themeTitles.treasure, cleared: false, current: false, connections: [5], revealed: false, rewardDesc: '황금 보물함 및 희귀 장비' },
    { id: 5, type: isRuneRoom ? 'rune' : 'shrine', title: themeTitles.event, cleared: false, current: false, connections: [6], revealed: false, rewardDesc: isRuneRoom ? '고급 룬 제단' : '성소 축복' },
    { id: 6, type: 'boss', title: themeTitles.boss, cleared: false, current: false, connections: [], revealed: false, rewardDesc: '수호자 보스 드랍' }
  ];
}

export const DUNGEONS_DATA: DungeonInfo[] = [
  // ==================== ACT 1 (4 Dungeons) ====================
  {
    id: 'act1_1_den',
    name: '1막 1장: 악의 소굴 (Den of Evil)',
    theme: '황야 지하의 음침한 고블린 소굴',
    recommendedLevel: 1,
    difficulty: '쉬움',
    elementalInfo: '물리 취약, 관통 공격에 극도로 취약',
    monsterSummary: '황야 고블린, 해골 궁수, 불타는 시체좀비',
    bestClearTime: '01분 15초',
    maxChainRecord: 30,
    dropItems: getActDropPool(1),
    rooms: create6RoomGraph({
      start: '황야 야영지 입구',
      wave: '악의 소굴 전초',
      elite: '중간보스: 화염 고블린 투사',
      treasure: '고블린 비밀 금고',
      event: '황야의 성소',
      boss: '우두머리: 불타는 시체좀비'
    })
  },
  {
    id: 'act1_2_crypt',
    name: '1막 2장: 매장지 지하묘지 (Crypt & Mausoleum)',
    theme: '피로 물든 황야와 고대 언데드 납골당',
    recommendedLevel: 4,
    difficulty: '쉬움',
    elementalInfo: '언데드 물리 취약, 뼈 분쇄',
    monsterSummary: '납골당 해골 전사, 부패 좀비, 핏빛 갈까마귀',
    bestClearTime: '01분 30초',
    maxChainRecord: 30,
    dropItems: getActDropPool(1),
    rooms: create6RoomGraph({
      start: '매장지 정문',
      wave: '납골당 지하 회랑',
      elite: '중간보스: 해골 군단장',
      treasure: '고대인의 황금 보물함',
      event: '납골당 룬 제단',
      boss: '우두머리: 핏빛 갈까마귀의 환영'
    }, true)
  },
  {
    id: 'act1_3_tower',
    name: '1막 3장: 잊혀진 탑 (The Forgotten Tower)',
    theme: '백작부인의 핏빛 탑과 보물 지하 감옥',
    recommendedLevel: 8,
    difficulty: '보통',
    elementalInfo: '화염/냉기 저항 권장, 룬 드랍 특화',
    monsterSummary: '탑의 유령 기사, 타락한 궁수, 핏빛 백작부인',
    bestClearTime: '01분 45초',
    maxChainRecord: 30,
    dropItems: getActDropPool(1),
    rooms: create6RoomGraph({
      start: '잊혀진 탑 1층',
      wave: '탑 지하 감옥',
      elite: '중간보스: 고문관 악마',
      treasure: '백작부인의 룬 보물함',
      event: '탑의 핏빛 성소',
      boss: '우두머리: 핏빛 백작부인'
    })
  },
  {
    id: 'act1_4_catacombs',
    name: '1막 4장: 수도원 지하묘지 (Catacombs: Andariel)',
    theme: '고뇌의 여왕 안다리엘의 거처',
    recommendedLevel: 12,
    difficulty: '보통',
    elementalInfo: '독 저항 필수, 화염 취약',
    monsterSummary: '어둠의 주술사, 고뇌의 악마, 안다리엘의 환영',
    bestClearTime: '02분 00초',
    maxChainRecord: 30,
    dropItems: getActDropPool(1),
    rooms: create6RoomGraph({
      start: '카타콤 4층 진입로',
      wave: '고뇌의 성소 전초',
      elite: '중간보스: 고뇌의 사제',
      treasure: '타락한 성녀의 금고',
      event: '고대 비전의 룬 제단',
      boss: '우두머리: 고뇌의 여왕 안다리엘'
    }, true)
  },

  // ==================== ACT 2 (4 Dungeons) ====================
  {
    id: 'act2_1_sewers',
    name: '2막 1장: 루트 골레인 하수구 (Sewers)',
    theme: '사막 도시 밑바닥의 썩은 오폐수 미로',
    recommendedLevel: 16,
    difficulty: '보통',
    elementalInfo: '독/물리 저항 권장',
    monsterSummary: '사막 딱정벌레, 하수구 시체약탈자, 라다먼트',
    bestClearTime: '02분 10초',
    maxChainRecord: 30,
    dropItems: getActDropPool(2),
    rooms: create6RoomGraph({
      start: '하수구 1층 입구',
      wave: '오폐수 수로',
      elite: '중간보스: 미이라 역병사제',
      treasure: '도굴꾼의 숨겨진 보물',
      event: '사막의 룬 제단',
      boss: '우두머리: 시체약탈자 라다먼트'
    }, true)
  },
  {
    id: 'act2_2_halls',
    name: '2막 2장: 죽음의 홀 (Halls of the Dead)',
    theme: '호라드릭 큐브가 잠든 고대 사막 묘지',
    recommendedLevel: 20,
    difficulty: '보통',
    elementalInfo: '전기 스캐럽 주의, 번개 저항 권장',
    monsterSummary: '모래 딱정벌레 군단, 언데드 파수병, 미라 수호자',
    bestClearTime: '02분 30초',
    maxChainRecord: 30,
    dropItems: getActDropPool(2),
    rooms: create6RoomGraph({
      start: '죽음의 홀 입구',
      wave: '모래 석실',
      elite: '중간보스: 딱정벌레 여왕',
      treasure: '호라드릭 황금 상자',
      event: '태양의 사막 성소',
      boss: '우두머리: 고대 미이라 수호장'
    })
  },
  {
    id: 'act2_3_maggot',
    name: '2막 3장: 마고트 동굴 (Maggot Lair)',
    theme: '거대 모래벌레들의 좁은 굴과 산란실',
    recommendedLevel: 24,
    difficulty: '어려움',
    elementalInfo: '독 면역 주의, 좁은 통로 관통 극대화',
    monsterSummary: '거대 모래벌레, 산란 독충, 콜디웜 버로우어',
    bestClearTime: '02분 45초',
    maxChainRecord: 30,
    dropItems: getActDropPool(2),
    rooms: create6RoomGraph({
      start: '마고트 굴 입구',
      wave: '산란 동굴 통로',
      elite: '중간보스: 독충 군단장',
      treasure: '모래벌레 소굴 보물',
      event: '사막 비전 룬 제단',
      boss: '우두머리: 거대 산란 여왕 콜디웜'
    }, true)
  },
  {
    id: 'act2_4_tomb',
    name: '2막 4장: 탈 라샤의 진정한 무덤 (Tal Rasha: Duriel)',
    theme: '고통의 대공 두리엘이 봉인된 일곱 무덤 심연',
    recommendedLevel: 28,
    difficulty: '어려움',
    elementalInfo: '빙결 저항 필수, 결빙 오라 주의',
    monsterSummary: '사막 미이라 사제, 화염 군주, 고통의 대공 두리엘',
    bestClearTime: '03분 12초',
    maxChainRecord: 30,
    dropItems: getActDropPool(2),
    rooms: create6RoomGraph({
      start: '탈 라샤 무덤 성문',
      wave: '봉인된 일곱 무덤 회랑',
      elite: '중간보스: 화염 파괴자 사제',
      treasure: '파라오의 황금 석관',
      event: '고통의 사막 성소',
      boss: '우두머리: 고통의 대공 두리엘'
    })
  },

  // ==================== ACT 3 (4 Dungeons) ====================
  {
    id: 'act3_1_spider',
    name: '3막 1장: 거미 숲 동굴 (Spider Cavern)',
    theme: '독무가 가득한 정글과 맹독 거미 소굴',
    recommendedLevel: 32,
    difficulty: '어려움',
    elementalInfo: '독 저항 75% 필수',
    monsterSummary: '자이언트 스파이더, 정글 모스키토, 불꽃눈 거미',
    bestClearTime: '03분 30초',
    maxChainRecord: 30,
    dropItems: getActDropPool(3),
    rooms: create6RoomGraph({
      start: '쿠라스트 부두 전초',
      wave: '거미 숲 늪지대',
      elite: '중간보스: 맹독 거미 군주',
      treasure: '정글 원주민 금고',
      event: '밀림의 독기 성소',
      boss: '우두머리: 불꽃눈 거미'
    })
  },
  {
    id: 'act3_2_jungle',
    name: '3막 2장: 약탈자 밀림 사원 (Flayer Dungeon)',
    theme: '원주민 우달과 주술사들의 비밀 의식장',
    recommendedLevel: 36,
    difficulty: '어려움',
    elementalInfo: '화염/번개 저항 권장, 맹렬한 공속',
    monsterSummary: '우달 몽둥이병, 약탈자 주술사, 마녀 닥 파란',
    bestClearTime: '03분 50초',
    maxChainRecord: 30,
    dropItems: getActDropPool(3),
    rooms: create6RoomGraph({
      start: '약탈자 정글 입구',
      wave: '늪지 동굴 회랑',
      elite: '중간보스: 우달 족장',
      treasure: '기드빈 의식 보물함',
      event: '증오의 밀림 룬 제단',
      boss: '우두머리: 약탈자 대주술사'
    }, true)
  },
  {
    id: 'act3_3_travincal',
    name: '3막 3장: 트라빈칼 평의회 (Travincal)',
    theme: '자카룸 하이 카운실의 성스러운 타락 사원',
    recommendedLevel: 40,
    difficulty: '지옥',
    elementalInfo: '화염 저항 필수, 카운실 하이드라 주의',
    monsterSummary: '하이 카운실, 광신도 전사, 젤레브 스파크피스트',
    bestClearTime: '04분 15초',
    maxChainRecord: 30,
    dropItems: getActDropPool(3),
    rooms: create6RoomGraph({
      start: '트라빈칼 사원 회랑',
      wave: '평의회 중앙 광장',
      elite: '중간보스: 카운실 집행관 토르크',
      treasure: '평의회 황금 성궤',
      event: '신성한 증오의 성소',
      boss: '우두머리: 하이 카운실 이스마일'
    })
  },
  {
    id: 'act3_4_durance',
    name: '3막 4장: 증오의 억류지 (Durance: Mephisto)',
    theme: '증오의 군주 메피스토의 핏빛 심연',
    recommendedLevel: 45,
    difficulty: '지옥',
    elementalInfo: '냉기/번개 저항 필수, 번개 구체 주의',
    monsterSummary: '블러드 로드, 저주받은 영혼, 증오의 군주 메피스토',
    bestClearTime: '04분 50초',
    maxChainRecord: 30,
    dropItems: getActDropPool(3),
    rooms: create6RoomGraph({
      start: '증오의 억류지 3층 입구',
      wave: '핏빛 피의 호수',
      elite: '중간보스: 카운실 수호자 브렘',
      treasure: '메피스토의 핏빛 보물창고',
      event: '증오의 고대 룬 제단',
      boss: '우두머리: 증오의 군주 메피스토'
    }, true)
  },

  // ==================== ACT 4 (4 Dungeons) ====================
  {
    id: 'act4_1_plains',
    name: '4막 1장: 절망의 평원 (Plains of Despair)',
    theme: '불타는 지옥과 타락한 대천사 이주얼',
    recommendedLevel: 50,
    difficulty: '지옥',
    elementalInfo: '냉기/물리 저항 필수',
    monsterSummary: '지옥불 악마, 절망의 유령 기사, 타락한 천사 이주얼',
    bestClearTime: '05분 10초',
    maxChainRecord: 30,
    dropItems: getActDropPool(4),
    rooms: create6RoomGraph({
      start: '판데모니움 요새 성문',
      wave: '절망의 평원 용암 지대',
      elite: '중간보스: 심연의 악마 장군',
      treasure: '타락천사의 보물함',
      event: '지옥불 성소',
      boss: '우두머리: 타락한 대천사 이주얼'
    })
  },
  {
    id: 'act4_2_forge',
    name: '4막 2장: 불길의 강 대장간 (River of Flame)',
    theme: '지옥의 모루와 대장장이 헤파스토',
    recommendedLevel: 55,
    difficulty: '지옥',
    elementalInfo: '화염 저항 80% 필수, 화염 파동 주의',
    monsterSummary: '베놈 로드, 폭풍 시전사, 대장장이 헤파스토',
    bestClearTime: '05분 35초',
    maxChainRecord: 30,
    dropItems: getActDropPool(4),
    rooms: create6RoomGraph({
      start: '불길의 강 협곡',
      wave: '용암 제련소 회랑',
      elite: '중간보스: 불길의 강 수호대장',
      treasure: '지옥 대장장이의 룬 금고',
      event: '지옥불 고급 룬 제단',
      boss: '우두머리: 대장장이 헤파스토'
    }, true)
  },
  {
    id: 'act4_3_sanctuary',
    name: '4막 3장: 혼돈의 성역 (Chaos Sanctuary)',
    theme: '오각성 5대 봉인과 죽음의 기사단',
    recommendedLevel: 60,
    difficulty: '지옥',
    elementalInfo: '모든 저항 극대화, 물리 피해 감소 필수',
    monsterSummary: '오블리비언 나이트, 독침 시전사, 영혼의 잠식자',
    bestClearTime: '06분 00초',
    maxChainRecord: 30,
    dropItems: getActDropPool(4),
    rooms: create6RoomGraph({
      start: '성역 봉인 입구',
      wave: '5대 봉인 중앙 회랑',
      elite: '중간보스: 대군주 사이스',
      treasure: '혼돈의 보물함',
      event: '공포의 지옥 성소',
      boss: '우두머리: 봉인 파수관 영혼의 잠식자'
    })
  },
  {
    id: 'act4_4_altar',
    name: '4막 4장: 공포의 제단 (Diablo: Lord of Terror)',
    theme: '공포의 군주 디아블로의 중앙 오각성',
    recommendedLevel: 65,
    difficulty: '지옥',
    elementalInfo: '붉은 번개 주의, 화염/번개 저항 85% 필수',
    monsterSummary: '망각의 기사단, 베놈 로드 군단, 공포의 군주 디아블로',
    bestClearTime: '06분 30초',
    maxChainRecord: 30,
    dropItems: getActDropPool(4),
    rooms: create6RoomGraph({
      start: '오각성 중앙 진입로',
      wave: '공포의 지옥불 군단',
      elite: '중간보스: 베놈 로드 군주',
      treasure: '공포의 군주 비밀 석관',
      event: '파멸의 최고급 룬 제단',
      boss: '우두머리: 공포의 군주 디아블로'
    }, true)
  },

  // ==================== ACT 5 (4 Dungeons) ====================
  {
    id: 'act5_1_foothills',
    name: '5막 1장: 피의 언덕 공성전 (Bloody Foothills)',
    theme: '아리앗 산의 투석기와 바알의 침략 선봉대',
    recommendedLevel: 70,
    difficulty: '지옥',
    elementalInfo: '원거리 투석기 포격 주의, 방어 극대화',
    monsterSummary: '블러드 로드 전사, 공성 투석기 악마, 쉔크 더 오버시어',
    bestClearTime: '06분 50초',
    maxChainRecord: 30,
    dropItems: getActDropPool(5),
    rooms: create6RoomGraph({
      start: '하로가스 공성 성벽',
      wave: '피의 언덕 참호',
      elite: '중간보스: 투석기 지휘관',
      treasure: '바바리안 군용 보급상자',
      event: '아리앗 혹한 성소',
      boss: '우두머리: 감독관 쉔크'
    })
  },
  {
    id: 'act5_2_summit',
    name: '5막 2장: 아리앗 정상의 시험 (Arreat Summit)',
    theme: '고대 3대 바바리안 수호신들의 시험',
    recommendedLevel: 75,
    difficulty: '지옥',
    elementalInfo: '휠윈드/도약 공격 주의, 물리 피해 감소 필수',
    monsterSummary: '탈릭(휠윈드), 코릭(도약), 마다크(투척)',
    bestClearTime: '07분 15초',
    maxChainRecord: 30,
    dropItems: getActDropPool(5),
    rooms: create6RoomGraph({
      start: '정상 성문 광장',
      wave: '고대인의 얼어붙은 제단',
      elite: '중간보스: 수호신 탈릭',
      treasure: '고대인의 황금 유물함',
      event: '고대인의 궁극 룬 제단',
      boss: '우두머리: 3대 고대 바바리안 수호신'
    }, true)
  },
  {
    id: 'act5_3_keep',
    name: '5막 3장: 세계석 성채 (Worldstone Keep)',
    theme: '아리앗 산 깊은 심연의 세계석 수호 성채',
    recommendedLevel: 80,
    difficulty: '지옥',
    elementalInfo: '모든 저항 75% 필수, 블랙 소울 주의',
    monsterSummary: '오블리비언 로드, 서큐버스, 블랙 소울 군단',
    bestClearTime: '07분 40초',
    maxChainRecord: 30,
    dropItems: getActDropPool(5),
    rooms: create6RoomGraph({
      start: '세계석 성채 3층',
      wave: '성채 심연 회랑',
      elite: '중간보스: 블랙 소울 여왕',
      treasure: '세계석 파괴의 보물창고',
      event: '궁극의 세계석 성소',
      boss: '우두머리: 바알의 선봉대 군단'
    })
  },
  {
    id: 'act5_4_throne',
    name: '5막 4장: 파멸의 옥좌 심연 (Baal: Lord of Destruction)',
    theme: '파멸의 군주 바알과 5대 미니언 파상 공세',
    recommendedLevel: 85,
    difficulty: '지옥',
    elementalInfo: '종결급 스탯 & 전 저항 극대화 필수',
    monsterSummary: '콜렌조, 아크멜, 바르툭, 벤타르, 리스터 더 토멘터, 파멸의 군주 바알',
    bestClearTime: '08분 15초',
    maxChainRecord: 30,
    dropItems: getActDropPool(5),
    rooms: create6RoomGraph({
      start: '파멸의 옥좌 진입로',
      wave: '바알의 5대 미니언 군단',
      elite: '중간보스: 리스터 더 토멘터',
      treasure: '고대 세계석 궁극 금고',
      event: '파괴의 신화 룬 제단 (Zod / Cham / Jah)',
      boss: '우두머리: 파멸의 군주 바알'
    }, true)
  }
];

export interface BossMetadata {
  name: string;
  icon: string;
  element: 'physical' | 'fire' | 'cold' | 'lightning' | 'poison' | 'void';
  signatureKey: string;
  gimmickTitle: string;
  gimmickDesc: string;
}

export const BOSS_METADATA_TABLE: Record<string, BossMetadata> = {
  // Act 1
  act1_1_den: {
    name: '불타는 시체좀비',
    icon: '🧟‍♂️',
    element: 'fire',
    signatureKey: 'corpse_explosion',
    gimmickTitle: '시체 폭발',
    gimmickDesc: '3턴마다 전장에 화염 파동을 방출하여 1.5배 피해를 입힙니다.'
  },
  act1_2_crypt: {
    name: '핏빛 갈까마귀의 환영',
    icon: '🦅',
    element: 'void',
    signatureKey: 'shadow_barrage',
    gimmickTitle: '암흑 화살비 & 소환',
    gimmickDesc: 'HP 50% 이하 시 언데드 하수인 2마리를 소환합니다.'
  },
  act1_3_tower: {
    name: '핏빛 백작부인',
    icon: '🧛‍♀️',
    element: 'physical',
    signatureKey: 'blood_drain',
    gimmickTitle: '피의 장막 태세',
    gimmickDesc: '4턴마다 방어 태세를 취해 받는 피해를 70% 감소시킵니다.'
  },
  act1_4_catacombs: {
    name: '고뇌의 여왕 안다리엘',
    icon: '🦂',
    element: 'poison',
    signatureKey: 'poison_nova',
    gimmickTitle: '맹독 분사 & 독성 웅덩이',
    gimmickDesc: '3턴마다 전장에 맹독을 살포하여 보호막을 파괴하고 맹독 피해를 입힙니다.'
  },

  // Act 2
  act2_1_sewers: {
    name: '시체약탈자 라다먼트',
    icon: '🪦',
    element: 'poison',
    signatureKey: 'undead_raise',
    gimmickTitle: '망자 부활 의식',
    gimmickDesc: 'HP 50% 이하 시 부패 미이라 하수인 2마리를 부활시킵니다.'
  },
  act2_2_halls: {
    name: '고대 미이라 수호장',
    icon: '🏺',
    element: 'lightning',
    signatureKey: 'charged_shield',
    gimmickTitle: '태양의 충전 방패',
    gimmickDesc: '4턴마다 고대 방어 태세로 받는 피해를 70% 감소시킵니다.'
  },
  act2_3_maggot: {
    name: '거대 산란 여왕 콜디웜',
    icon: '🐛',
    element: 'cold',
    signatureKey: 'frost_burrow',
    gimmickTitle: '혹한의 잠복 포효',
    gimmickDesc: '3턴마다 동결 파동을 방출하여 플레이어의 보호막을 파괴합니다.'
  },
  act2_4_tomb: {
    name: '고통의 대공 두리엘',
    icon: '🪲',
    element: 'cold',
    signatureKey: 'holy_freeze_charge',
    gimmickTitle: '결빙 오라 & 흉포한 돌진',
    gimmickDesc: '결빙 오라로 플레이어 회피율을 억제하며 3턴마다 강력한 돌진 강타를 가합니다.'
  },

  // Act 3
  act3_1_spider: {
    name: '불꽃눈 거미',
    icon: '🕷️',
    element: 'fire',
    signatureKey: 'fire_web',
    gimmickTitle: '화염 거미줄 방어',
    gimmickDesc: '4턴마다 단단한 화염 거미줄을 둘러 받는 피해를 70% 차단합니다.'
  },
  act3_2_jungle: {
    name: '약탈자 대주술사',
    icon: '👺',
    element: 'fire',
    signatureKey: 'inferno_breath',
    gimmickTitle: '원주민 화염 숨결',
    gimmickDesc: '3턴마다 맹렬한 지옥불 숨결로 전 레인 광역 화염 피해를 입힙니다.'
  },
  act3_3_travincal: {
    name: '하이 카운실 이스마일',
    icon: '🧝',
    element: 'fire',
    signatureKey: 'hydra_summon',
    gimmickTitle: '타락 평의회 수호병 소환',
    gimmickDesc: 'HP 50% 이하 시 평의회 정예 집행관 2마리를 소환합니다.'
  },
  act3_4_durance: {
    name: '증오의 군주 메피스토',
    icon: '💀',
    element: 'lightning',
    signatureKey: 'lightning_pylon',
    gimmickTitle: '증오의 뇌격 & 번개 첨탑',
    gimmickDesc: '4턴마다 뇌격 방어막을 전개하여 받는 피해를 70% 감소시키고 광역 피해를 가합니다.'
  },

  // Act 4
  act4_1_plains: {
    name: '타락한 대천사 이주얼',
    icon: '🪽',
    element: 'cold',
    signatureKey: 'frozen_blade',
    gimmickTitle: '얼어붙은 성검의 참격',
    gimmickDesc: '3턴마다 혹한의 성검을 휘둘러 보호막을 일격에 파괴하고 냉기 피해를 입힙니다.'
  },
  act4_2_forge: {
    name: '대장장이 헤파스토',
    icon: '🔨',
    element: 'fire',
    signatureKey: 'forge_smash',
    gimmickTitle: '지옥 모루 분쇄 & 증원',
    gimmickDesc: 'HP 50% 이하 시 지옥 대장간 불길의 수호병 2마리를 소환합니다.'
  },
  act4_3_sanctuary: {
    name: '봉인 파수관 영혼의 잠식자',
    icon: '👁️',
    element: 'void',
    signatureKey: 'void_gaze',
    gimmickTitle: '혼돈의 5대 봉인 방어',
    gimmickDesc: '4턴마다 5대 봉인의 결계를 가동하여 받는 피해를 70% 차단합니다.'
  },
  act4_4_altar: {
    name: '공포의 군주 디아블로',
    icon: '👹',
    element: 'fire',
    signatureKey: 'red_lightning_hose',
    gimmickTitle: '붉은 번개 숨결 & 지옥불 파동',
    gimmickDesc: '3턴마다 전장을 휩쓰는 붉은 번개 숨결을 뿜어 보호막을 소각하고 파멸적 화염 피해를 입힙니다.'
  },

  // Act 5
  act5_1_foothills: {
    name: '감독관 쉔크',
    icon: '🎪',
    element: 'physical',
    signatureKey: 'catapult_strike',
    gimmickTitle: '공성 투석기 & 선봉대 소환',
    gimmickDesc: 'HP 50% 이하 시 바알의 공성 선봉대 2마리를 증원 소환합니다.'
  },
  act5_2_summit: {
    name: '3대 고대 바바리안 수호신',
    icon: '⚔️',
    element: 'physical',
    signatureKey: 'ancients_whirlwind',
    gimmickTitle: '3인 합동 휠윈드 태세',
    gimmickDesc: '4턴마다 탈릭/코릭/마다크의 강철 방어 태세를 취해 피해를 70% 감소시킵니다.'
  },
  act5_3_keep: {
    name: '바알의 선봉대 군단',
    icon: '🛡️',
    element: 'void',
    signatureKey: 'vanguard_phalanx',
    gimmickTitle: '세계석 파멸의 포효',
    gimmickDesc: '3턴마다 전장을 뒤흔드는 심연의 포효로 보호막을 파괴하고 광역 피해를 가합니다.'
  },
  act5_4_throne: {
    name: '파멸의 군주 바알',
    icon: '🐙',
    element: 'cold',
    signatureKey: 'vile_clone_burn',
    gimmickTitle: '환영 분신 & 파멸의 촉수',
    gimmickDesc: 'HP 50% 이하 시 파멸의 환영 하수인 2마리를 소환하며 강력한 냉기 공격을 퍼붓습니다.'
  }
};

export interface MonsterTemplate {
  name: string;
  icon: string;
}

export interface DungeonMonsterRoster {
  frontline: MonsterTemplate; // d=0 Tank/Melee
  midline: MonsterTemplate;   // d=1 Bruiser/Fighter
  backline: MonsterTemplate;  // d=2 Ranged/Caster
  elite: MonsterTemplate;
}

export const DUNGEON_MONSTER_TEMPLATES: Record<string, DungeonMonsterRoster> = {
  // ==================== ACT 1 ====================
  act1_1_den: {
    frontline: { name: '악의 소굴 고블린', icon: '👺' },
    midline: { name: '부패한 시체 구울', icon: '🧟' },
    backline: { name: '카버 흑마술사', icon: '🧙‍♂️' },
    elite: { name: '화염 고블린 투사', icon: '👺🔥' }
  },
  act1_2_crypt: {
    frontline: { name: '납골당 해골 전사', icon: '💀' },
    midline: { name: '역병 시체좀비', icon: '🧟‍♂️' },
    backline: { name: '타락한 뼈 궁수', icon: '🏹' },
    elite: { name: '해골 군단장', icon: '💀⚔️' }
  },
  act1_3_tower: {
    frontline: { name: '탑의 유령 방패병', icon: '🛡️👻' },
    midline: { name: '핏빛 염소인간 투사', icon: '🐐' },
    backline: { name: '타락한 핏빛 궁수', icon: '🏹🩸' },
    elite: { name: '고문관 악마장', icon: '👿' }
  },
  act1_4_catacombs: {
    frontline: { name: '고뇌의 거미 마귀', icon: '🕷️' },
    midline: { name: '타락한 사령술사', icon: '🔮' },
    backline: { name: '맹독 가시 악마', icon: '🦂' },
    elite: { name: '고뇌의 사제', icon: '🕷️⭐' }
  },

  // ==================== ACT 2 ====================
  act2_1_sewers: {
    frontline: { name: '하수도 독침 모기', icon: '🦟' },
    midline: { name: '저주받은 언데드 시라소니', icon: '🐆' },
    backline: { name: '역병 미이라 사제', icon: '🏺' },
    elite: { name: '하수도 부패 군주', icon: '🦟👑' }
  },
  act2_2_oasis: {
    frontline: { name: '모래 구더기 유충', icon: '🐛' },
    midline: { name: '사막 약탈자 전사', icon: '🥷' },
    backline: { name: '풍뎅이 번개충', icon: '🪲⚡' },
    elite: { name: '거대 번개 풍뎅이', icon: '🪲⭐' }
  },
  act2_3_sanctuary: {
    frontline: { name: '비전의 유령 수호자', icon: '👻' },
    midline: { name: '차원 왜곡 악마', icon: '👾' },
    backline: { name: '소환술사 제자', icon: '🧙' },
    elite: { name: '비전 차원장', icon: '🔮⭐' }
  },
  act2_4_duriel: {
    frontline: { name: '탈 라샤의 수호 미이라', icon: '🏺' },
    midline: { name: '사막 맹독 전갈', icon: '🦂' },
    backline: { name: '모래 폭풍 뼈 마법사', icon: '💀🌪️' },
    elite: { name: '고대 무덤 수호대장', icon: '🏺⭐' }
  },

  // ==================== ACT 3 ====================
  act3_1_jungle: {
    frontline: { name: '밀림 맹독 거미', icon: '🕷️' },
    midline: { name: '정글 피그미 전사', icon: '🎭' },
    backline: { name: '밀림 침묵의 주술사', icon: '🧙‍♂️' },
    elite: { name: '피그미 족장', icon: '🎭⭐' }
  },
  act3_2_kurast: {
    frontline: { name: '자카룸 광신도 전사', icon: '⚔️' },
    midline: { name: '타락한 사원 집행관', icon: '🛡️' },
    backline: { name: '암흑 번개 주술사', icon: '⚡' },
    elite: { name: '자카룸 대사제', icon: '🧙‍♂️⭐' }
  },
  act3_3_travincal: {
    frontline: { name: '평의회 근위 호위병', icon: '🛡️' },
    midline: { name: '히드라 소환사', icon: '🐉' },
    backline: { name: '자카룸 흑마도사', icon: '🔮' },
    elite: { name: '평의회 집행관 토크', icon: '🧝⭐' }
  },
  act3_4_durance: {
    frontline: { name: '증오의 피의 군주', icon: '🧛' },
    midline: { name: '타락한 언데드 기사', icon: '💀🛡️' },
    backline: { name: '영혼 흡수 유령', icon: '👻' },
    elite: { name: '브렘 스파크피스트', icon: '⚡⭐' }
  },

  // ==================== ACT 4 ====================
  act4_1_plains: {
    frontline: { name: '지옥의 핏빛 메가데몬', icon: '👹' },
    midline: { name: '타락한 악마 늑대', icon: '🐺' },
    backline: { name: '어둠의 저주 망령', icon: '👻' },
    elite: { name: '절망의 집행관', icon: '👹⭐' }
  },
  act4_2_forge: {
    frontline: { name: '용암 불꽃 골렘', icon: '🗿🔥' },
    midline: { name: '화염 채찍 악마', icon: '👿' },
    backline: { name: '지옥불 사제', icon: '🧙‍♂️🔥' },
    elite: { name: '대장간 화염거인', icon: '🔨⭐' }
  },
  act4_3_sanctuary: {
    frontline: { name: '파멸의 베놈 로드', icon: '🐉' },
    midline: { name: '혼돈의 흑마법 기사', icon: '🛡️🔮' },
    backline: { name: '망각의 뼈 사령술사', icon: '💀🧙‍♂️' },
    elite: { name: '영혼의 잠식자 파수관', icon: '👁️⭐' }
  },
  act4_4_altar: {
    frontline: { name: '지옥의 공포 베놈로드', icon: '🐉🔥' },
    midline: { name: '심연의 파멸군주', icon: '👹' },
    backline: { name: '대악마 직속 주술사', icon: '🧙‍♂️🩸' },
    elite: { name: '군주 드 사이스', icon: '💀👑' }
  },

  // ==================== ACT 5 ====================
  act5_1_foothills: {
    frontline: { name: '바알의 공성 돌격병', icon: '🦏' },
    midline: { name: '설원 야만족 투사', icon: '🪓' },
    backline: { name: '공성 투석기 포병', icon: '💣' },
    elite: { name: '핏빛 언덕 투사장', icon: '🎪⭐' }
  },
  act5_2_summit: {
    frontline: { name: '수호신 탈릭의 환영', icon: '🛡️⚔️' },
    midline: { name: '수호신 코릭의 환영', icon: '🪓' },
    backline: { name: '수호신 마다크의 환영', icon: '🏹⚡' },
    elite: { name: '고대인의 정예 투사', icon: '⚔️⭐' }
  },
  act5_3_keep: {
    frontline: { name: '바알의 자폭 파괴자', icon: '💣' },
    midline: { name: '설원 예티 거수', icon: '🦍' },
    backline: { name: '피의 유혹 세이렌', icon: '🧜‍♀️' },
    elite: { name: '공룡 수호거수 리스터', icon: '🦖⭐' }
  },
  act5_4_throne: {
    frontline: { name: '파멸의 자폭 괴수', icon: '💣' },
    midline: { name: '지옥의 영혼 흡수자', icon: '🧛‍♂️' },
    backline: { name: '심연의 어둠 소환사', icon: '🐙' },
    elite: { name: '파멸의 분신 하수인', icon: '🐙⭐' }
  }
};

export function createDungeonFormation(
  dungeonId: string,
  roomType: 'normal' | 'elite' | 'boss' | 'treasure' | 'rune' | 'shrine' | 'start' = 'normal',
  playerLevel: number = 1,
  difficultyLevel: number = 1
): Monster[] {
  const monsters: Monster[] = [];
  // Start room has no monsters. Treasure, rune, and shrine rooms have guardian defenders!
  if (roomType === 'start') {
    return monsters;
  }

  const diff = Math.max(1, difficultyLevel);
  const hpMult = 1 + (diff - 1) * 0.35 + (playerLevel * 0.03);
  const defMult = 1 + (diff - 1) * 0.20;
  const dmgMult = 1 + (diff - 1) * 0.25 + (playerLevel * 0.02);

  const dungeon = DUNGEONS_DATA.find(d => d.id === dungeonId) || DUNGEONS_DATA[0];
  const recLv = Math.max(1, dungeon.recommendedLevel || 1);
  const roster = DUNGEON_MONSTER_TEMPLATES[dungeonId] || DUNGEON_MONSTER_TEMPLATES['act1_1_den'];

  const bossMeta = BOSS_METADATA_TABLE[dungeonId] || {
    name: '지옥의 군주',
    icon: '👑',
    element: 'physical' as const,
    signatureKey: 'roar',
    gimmickTitle: '광역 포효',
    gimmickDesc: '3턴마다 전 레인 광역 포효'
  };

  // Smooth, satisfying Diablo 2 progression curve across all 20 dungeons
  const baseHp = recLv <= 10
    ? Math.floor(18 + recLv * 6)
    : Math.floor(40 + recLv * 7.5 + Math.pow(recLv / 10, 1.5) * 10);

  const baseDef = recLv <= 10
    ? Math.max(0, Math.floor((recLv - 1) * 1.1))
    : Math.floor(4 + recLv * 0.85);

  const baseDmg = recLv <= 10
    ? Math.max(2, Math.floor(2 + recLv * 0.45))
    : Math.floor(5 + recLv * 0.65);

  // 🌌 ENDLESS RIFT TACTICAL FORMATION GENERATION
  if (dungeon.isEndlessRift || dungeonId.startsWith('endless_rift_')) {
    const tierMatch = dungeonId.match(/endless_rift_t(\d+)/i);
    const tier = tierMatch ? parseInt(tierMatch[1], 10) : (dungeon.riftTier || 1);
    const riftRecLv = 80 + Math.floor((tier - 1) * 2.5);
    const actThemeNum = dungeon.riftActTheme || ((tier % 5) + 1);
    const pattern = dungeon.riftSpawnPattern || 'column_charge';

    // Pick act theme roster based on random rift act theme
    const actKey = actThemeNum === 1 ? 'act1_4_catacombs' : actThemeNum === 2 ? 'act2_4_tomb' : actThemeNum === 3 ? 'act3_4_durance' : actThemeNum === 4 ? 'act4_4_altar' : 'act5_4_throne';
    const riftRoster = DUNGEON_MONSTER_TEMPLATES[actKey] || DUNGEON_MONSTER_TEMPLATES['act5_4_throne'];
    const riftBossMeta = BOSS_METADATA_TABLE[actKey] || BOSS_METADATA_TABLE['act5_4_throne'];

    // Base stats scaled to end-game level
    const endBaseHp = Math.floor(40 + riftRecLv * 7.5 + Math.pow(riftRecLv / 10, 1.5) * 10);
    const endBaseDef = Math.floor(4 + riftRecLv * 0.85);
    const endBaseDmg = Math.floor(5 + riftRecLv * 0.65);

    // Endless Rift Tier scaling: progressive exponential growth
    const riftHpScale = 1 + (tier * 0.15) + Math.pow(tier / 12, 1.5);
    const riftDefScale = 1 + (tier * 0.08);
    const riftDmgScale = 1 + (tier * 0.12) + (tier * 0.01);

    const baseRiftHp = Math.floor(endBaseHp * 1.5 * riftHpScale);
    const baseRiftDef = Math.floor(endBaseDef * 1.15 * riftDefScale);
    const baseRiftDmg = Math.floor(endBaseDmg * 1.35 * riftDmgScale);

    // Build tactical lane-depth map based on pattern
    const spawnSlots: { l: number; d: number; isBoss?: boolean; isElite?: boolean }[] = [];

    if (roomType === 'boss') {
      // Boss Room: Guardian Boss at center (L2, D0), Elites at L1, L3, and minions supporting
      spawnSlots.push({ l: 2, d: 0, isBoss: true });
      spawnSlots.push({ l: 1, d: 0, isElite: true });
      spawnSlots.push({ l: 3, d: 0, isElite: true });
      spawnSlots.push({ l: 0, d: 0 }); spawnSlots.push({ l: 0, d: 1 });
      spawnSlots.push({ l: 4, d: 0 }); spawnSlots.push({ l: 4, d: 1 });
      spawnSlots.push({ l: 1, d: 1 }); spawnSlots.push({ l: 2, d: 1 }); spawnSlots.push({ l: 3, d: 1 });
      spawnSlots.push({ l: 0, d: 2 }); spawnSlots.push({ l: 2, d: 2 }); spawnSlots.push({ l: 4, d: 2 });
    } else if (pattern === 'column_charge') {
      // 🎯 Column Charge (세로 집중 돌파): L1 & L3 packed deep (0..4), L0, L2, L4 (0..1)
      // Total 16 mobs! Encourages straight line pierce / cleave!
      for (let l = 0; l < 5; l++) {
        const isFocus = (l === 1 || l === 3);
        const maxD = isFocus ? 5 : 2;
        for (let d = 0; d < maxD; d++) {
          const isElite = roomType === 'elite' && isFocus && d === 0;
          spawnSlots.push({ l, d, isElite });
        }
      }
    } else if (pattern === 'wide_wall') {
      // 🌊 Wide Wall (가로 횡대 방어벽): All 5 lanes wide frontline (d=0..2)
      // Total 15 mobs! Encourages horizontal sweep / whirlwind!
      for (let l = 0; l < 5; l++) {
        for (let d = 0; d < 3; d++) {
          const isElite = roomType === 'elite' && (l === 1 || l === 3) && d === 0;
          spawnSlots.push({ l, d, isElite });
        }
      }
    } else if (pattern === 'pincer_flank') {
      // 🦀 Pincer Flank (양익 협공): L0 & L4 deep (0..3), L2 center anchor (0..2), L1 & L3 (0..1)
      // Total 15 mobs!
      for (let l = 0; l < 5; l++) {
        const depths = (l === 0 || l === 4) ? 4 : (l === 2) ? 3 : 2;
        for (let d = 0; d < depths; d++) {
          const isElite = roomType === 'elite' && (l === 0 || l === 4) && d === 0;
          spawnSlots.push({ l, d, isElite });
        }
      }
    } else {
      // 💥 Horde Swarm (대군세 스웜): 17~18 massive density for overkill chains!
      for (let l = 0; l < 5; l++) {
        const count = (l === 2 || l === 1 || l === 3) ? 4 : 3;
        for (let d = 0; d < count; d++) {
          const isElite = roomType === 'elite' && (l === 1 || l === 3) && d === 0;
          spawnSlots.push({ l, d, isElite });
        }
      }
    }

    for (const slot of spawnSlots) {
      let mHp = baseRiftHp;
      let mDef = baseRiftDef;
      let mDmg = baseRiftDmg;

      const template = slot.d === 0 ? riftRoster.frontline : slot.d === 1 ? riftRoster.midline : riftRoster.backline;
      let mName = template.name;
      let mIcon = template.icon;
      let rank: 'normal' | 'elite' | 'boss' = 'normal';

      if (slot.isBoss) {
        mHp = Math.floor(baseRiftHp * 9.5);
        mDef = Math.floor(baseRiftDef * 1.5);
        mDmg = Math.floor(baseRiftDmg * 2.6);
        mName = `🌌 [균열 수호자] ${riftBossMeta.name}`;
        mIcon = riftBossMeta.icon;
        rank = 'boss';
      } else if (slot.isElite) {
        mHp = Math.floor(baseRiftHp * 3.8);
        mDef = Math.floor(baseRiftDef * 1.3);
        mDmg = Math.floor(baseRiftDmg * 1.8);
        mName = `⭐ ${riftRoster.elite.name}`;
        mIcon = riftRoster.elite.icon;
        rank = 'elite';
      } else if (slot.d === 0) {
        mHp = Math.floor(mHp * 1.25);
        mDef = mDef + 3;
      }

      monsters.push({
        id: `${dungeonId}_l${slot.l}_d${slot.d}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: mName,
        hp: Math.max(1, mHp),
        maxHp: Math.max(1, mHp),
        defense: Math.max(0, mDef),
        rank,
        lane: slot.l,
        depth: slot.d,
        intent: {
          type: 'attack',
          damage: Math.max(1, mDmg),
          targetLane: slot.l,
          chargePercent: slot.isBoss ? 25 : 35 + ((slot.l * 7 + slot.d * 13) % 35)
        },
        bossGimmick: slot.isBoss ? `${riftBossMeta.gimmickTitle}: ${riftBossMeta.gimmickDesc}` : undefined,
        bossSignatureKey: slot.isBoss ? riftBossMeta.signatureKey : undefined,
        element: slot.isBoss ? riftBossMeta.element : undefined,
        icon: mIcon
      });
    }

    return monsters;
  }

  // 5 Lanes x 3 depths = 15 monsters (standard story dungeons)
  const depthsPerLane = 3;

  for (let l = 0; l < 5; l++) {
    for (let d = 0; d < depthsPerLane; d++) {
      const isBoss = (roomType === 'boss') && (l === 2 && d === 0);
      const isElite = !isBoss && (roomType === 'elite' || roomType === 'boss' || roomType === 'treasure' || roomType === 'shrine' || roomType === 'rune') && (d === 0 && (l === 1 || l === 3));

      let mHp = Math.floor(baseHp * hpMult);
      let mDef = Math.floor(baseDef * defMult);
      let mDmg = Math.floor(baseDmg * dmgMult);

      // Pick distinctive monster archetype based on depth:
      // d=0: Frontline Melee/Tank, d=1: Midline Bruiser, d=2: Backline Caster/Ranged
      const template = d === 0 ? roster.frontline : d === 1 ? roster.midline : roster.backline;
      let mName = template.name;
      let mIcon = template.icon;
      let rank: 'normal' | 'elite' | 'boss' = 'normal';

      if (isBoss) {
        mHp = recLv <= 10 ? Math.floor(baseHp * 6.5 * hpMult) : Math.floor(baseHp * 8.5 * hpMult);
        mDef = Math.floor((baseDef + (recLv <= 10 ? 4 : 8)) * defMult);
        mDmg = recLv <= 10 ? Math.floor(baseDmg * 2.5 * dmgMult) : Math.floor(baseDmg * 2.8 * dmgMult);
        mName = bossMeta.name;
        mIcon = bossMeta.icon;
        rank = 'boss';
      } else if (isElite) {
        mHp = recLv <= 10 ? Math.floor(baseHp * 3.0 * hpMult) : Math.floor(baseHp * 3.8 * hpMult);
        mDef = Math.floor((baseDef + (recLv <= 10 ? 2 : 4)) * defMult);
        mDmg = recLv <= 10 ? Math.floor(baseDmg * 1.6 * dmgMult) : Math.floor(baseDmg * 1.8 * dmgMult);
        mName = roster.elite.name;
        mIcon = roster.elite.icon;
        rank = 'elite';
      } else if (d === 0) {
        // Frontline Guard: slightly sturdier
        mHp = Math.floor(mHp * 1.25);
        mDef = mDef + (recLv <= 10 ? 1 : 2);
      } else if (d === 2) {
        // Backline ranged: slightly higher attack
        mDmg = Math.floor(mDmg * 1.2);
      }

      monsters.push({
        id: `${dungeonId}_l${l}_d${d}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: mName,
        hp: Math.max(1, mHp),
        maxHp: Math.max(1, mHp),
        defense: Math.max(0, mDef),
        rank,
        lane: l,
        depth: d,
        intent: {
          type: 'attack',
          damage: Math.max(1, mDmg),
          targetLane: l,
          chargePercent: isBoss ? 25 : 40 + ((l * 7 + d * 13) % 30)
        },
        bossGimmick: isBoss ? `${bossMeta.gimmickTitle}: ${bossMeta.gimmickDesc}` : undefined,
        bossSignatureKey: isBoss ? bossMeta.signatureKey : undefined,
        element: isBoss ? bossMeta.element : undefined,
        icon: mIcon
      });
    }
  }

  return monsters;
}
