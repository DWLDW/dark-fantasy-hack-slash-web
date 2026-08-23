import { DungeonInfo, Monster, DungeonBuff } from '../types/game';
import { GAME_ITEMS_POOL } from './items';

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

export const ACT_ORDER = ['act1_crypt', 'act2_tomb', 'act3_jungle', 'act4_chaos', 'act5_worldstone'] as const;

export function isActUnlocked(dungeonId: string, dungeonClears: Record<string, number> = {}): boolean {
  const idx = ACT_ORDER.indexOf(dungeonId as typeof ACT_ORDER[number]);
  if (idx <= 0) return true;
  const prev = ACT_ORDER[idx - 1];
  return (dungeonClears[prev] || 0) >= 1;
}

export const DUNGEONS_DATA: DungeonInfo[] = [
  {
    id: 'act1_crypt',
    name: '1막: 핏빛 황야와 지하묘지 (Crypt & Blood Moor)',
    theme: '피로 물든 황야와 고대 언데드 납골당',
    recommendedLevel: 1,
    difficulty: '쉬움',
    elementalInfo: '물리 취약, 관통 공격에 극도로 취약',
    monsterSummary: '고블린 척탄병, 해골 궁수, 썩은 좀비 떼, 안다리엘의 환영',
    bestClearTime: '01분 45초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL.find(i => i.id === 'e_short_sword_2s') || GAME_ITEMS_POOL[0],
      GAME_ITEMS_POOL.find(i => i.id === 'e_scimitar_2s') || GAME_ITEMS_POOL[1],
      GAME_ITEMS_POOL.find(i => i.id === 'e_studded_leather') || GAME_ITEMS_POOL[2],
      GAME_ITEMS_POOL.find(i => i.id === 'e_nagelring') || GAME_ITEMS_POOL[3],
      GAME_ITEMS_POOL.find(i => i.id === 'e_gull_dagger') || GAME_ITEMS_POOL[4],
      GAME_ITEMS_POOL.find(i => i.id === 'e_cap_2s') || GAME_ITEMS_POOL[5],
      GAME_ITEMS_POOL.find(i => i.id === 'e_bloodfist') || GAME_ITEMS_POOL[6]
    ],
    rooms: [
      { id: 1, type: 'start', title: '황야 야영지 입구', cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: '핏빛 황야 적 무리', cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: '중간보스: 납골당 집행관', cleared: false, current: false, connections: [4, 5], revealed: false },
      { id: 4, type: 'treasure', title: '고대인의 황금 보물함', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '황금 보물함 및 희귀 장비' },
      { id: 5, type: 'shrine', title: '핏빛 고대 성소', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '행운/치명/방어 성소 축복' },
      { id: 6, type: 'boss', title: '우두머리: 안다리엘의 방', cleared: false, current: false, connections: [], revealed: false, rewardDesc: '안다리엘의 환영 (유니크 장갑/목걸이)' }
    ]
  },
  {
    id: 'act2_tomb',
    name: "2막: 루트 골레인의 탈 라샤 무덤 (Tal Rasha's Tomb)",
    theme: '사막의 모래폭풍과 봉인된 일곱 무덤',
    recommendedLevel: 15,
    difficulty: '보통',
    elementalInfo: '화염/번개 저항 권장, 전기 스캐럽 주의',
    monsterSummary: '사막 딱정벌레, 미이라 사제, 모래 약탈자, 두리엘의 유령',
    bestClearTime: '03분 12초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL.find(i => i.id === 'e_crystal_sword_4s') || GAME_ITEMS_POOL[0],
      GAME_ITEMS_POOL.find(i => i.id === 'e_broad_sword_4s') || GAME_ITEMS_POOL[1],
      GAME_ITEMS_POOL.find(i => i.id === 'e_breast_plate_3s') || GAME_ITEMS_POOL[2],
      GAME_ITEMS_POOL.find(i => i.id === 'u_tarnhelm') || GAME_ITEMS_POOL[3],
      GAME_ITEMS_POOL.find(i => i.id === 'u_chance_guards') || GAME_ITEMS_POOL[4],
      GAME_ITEMS_POOL.find(i => i.id === 'u_magefist') || GAME_ITEMS_POOL[5]
    ],
    rooms: [
      { id: 1, type: 'start', title: '루트 골레인 성문', cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: '사막 딱정벌레 무리', cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: '중간보스: 모래 약탈자 군주', cleared: false, current: false, connections: [4, 5], revealed: false },
      { id: 4, type: 'treasure', title: '파라오의 황금 석관', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '중급 룬 및 샤크스킨 방어구' },
      { id: 5, type: 'rune', title: '사막의 룬 제단', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: 'Amn / Sol 룬 제단' },
      { id: 6, type: 'boss', title: '우두머리: 진정한 탈 라샤의 방', cleared: false, current: false, connections: [], revealed: false, rewardDesc: '두리엘의 유령 (구교복/소켓 무기 드랍)' }
    ]
  },
  {
    id: 'act3_jungle',
    name: '3막: 쿠라스트 밀림과 트라빈칼 (Travincal & Durance)',
    theme: '짙은 독무가 가득한 정글과 증오의 사원',
    recommendedLevel: 25,
    difficulty: '어려움',
    elementalInfo: '독/냉기 저항 필수, 카운실 하이드라 주의',
    monsterSummary: '우달 몽둥이병, 자이언트 모스키토, 하이 카운실, 메피스토의 환영',
    bestClearTime: '04분 50초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL.find(i => i.id === 'e_zweihander_5s') || GAME_ITEMS_POOL[0],
      GAME_ITEMS_POOL.find(i => i.id === 'e_mage_plate_3s') || GAME_ITEMS_POOL[1],
      GAME_ITEMS_POOL.find(i => i.id === 'm_vipermagi') || GAME_ITEMS_POOL[2],
      GAME_ITEMS_POOL.find(i => i.id === 'u_vampire_gaze') || GAME_ITEMS_POOL[3],
      GAME_ITEMS_POOL.find(i => i.id === 'm_waterwalk') || GAME_ITEMS_POOL[4],
      GAME_ITEMS_POOL.find(i => i.id === 'u_soj') || GAME_ITEMS_POOL[6]
    ],
    rooms: [
      { id: 1, type: 'start', title: '쿠라스트 부두', cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: '거미 숲 모스키토 군단', cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: '중간보스: 트라빈칼 평의회장', cleared: false, current: false, connections: [4, 5], revealed: false, rewardDesc: '하이 카운실 (고급 룬/유니크 악세)' },
      { id: 4, type: 'treasure', title: '핏빛 보물창고', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '엘리트 소켓 장비 및 보석' },
      { id: 5, type: 'shrine', title: '증오의 피빛 성소', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '행운/치명 축복 성소' },
      { id: 6, type: 'boss', title: '우두머리: 증오의 억류지 3층', cleared: false, current: false, connections: [], revealed: false, rewardDesc: '메피스토의 환영 (샤코/조던링/워트래블러)' }
    ]
  },
  {
    id: 'act4_chaos',
    name: '4막: 혼돈의 성역 (Chaos Sanctuary)',
    theme: '불타는 지옥과 디아블로의 5대 봉인',
    recommendedLevel: 35,
    difficulty: '지옥',
    elementalInfo: '화염/번개 저항 75% 필수, 붉은 번개 주의',
    monsterSummary: '죽음의 기사, 폭풍 시전사, 베놈 로드, 디아블로',
    bestClearTime: '06분 20초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL.find(i => i.id === 'e_phase_blade_5s') || GAME_ITEMS_POOL[0],
      GAME_ITEMS_POOL.find(i => i.id === 'e_archon_plate_4s') || GAME_ITEMS_POOL[1],
      GAME_ITEMS_POOL.find(i => i.id === 'e_monarch_4s') || GAME_ITEMS_POOL[2],
      GAME_ITEMS_POOL.find(i => i.id === 'u_shako') || GAME_ITEMS_POOL[3],
      GAME_ITEMS_POOL.find(i => i.id === 'u_gorerider') || GAME_ITEMS_POOL[4],
      GAME_ITEMS_POOL.find(i => i.id === 'u_draculs') || GAME_ITEMS_POOL[5],
      GAME_ITEMS_POOL.find(i => i.id === 'u_highlords_wrath') || GAME_ITEMS_POOL[6]
    ],
    rooms: [
      { id: 1, type: 'start', title: '판데모니움 요새', cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: '절망의 평원 베놈 로드', cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: '중간보스: 대장장이 헤파스토', cleared: false, current: false, connections: [4, 5], revealed: false, rewardDesc: '대장장이 헤파스토 (Ist / Gul 룬 드랍)' },
      { id: 4, type: 'rune', title: '지옥불 룬 제단', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: 'Vex / Ohm / Lo 최고급 룬 제단' },
      { id: 5, type: 'shrine', title: '혼돈의 지옥 성소', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '지옥의 축복 버프' },
      { id: 6, type: 'boss', title: '우두머리: 오각성 중앙 제단', cleared: false, current: false, connections: [], revealed: false, rewardDesc: '공포의 군주 디아블로 (마라/할배검/윈드포스)' }
    ]
  },
  {
    id: 'act5_worldstone',
    name: '5막: 세계석 성채와 바알의 옥좌 (Worldstone Keep)',
    theme: '아리앗 산의 얼어붙은 정상과 파멸의 세계석',
    recommendedLevel: 50,
    difficulty: '지옥',
    elementalInfo: '모든 저항 및 물리 피해 감소 극대화 필수',
    monsterSummary: '블러드 로드, 저주받은 오블리비언 나이트, 바알의 미니언 군단, 파멸의 군주 바알',
    bestClearTime: '08분 15초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL.find(i => i.id === 'e_colossus_blade_6s') || GAME_ITEMS_POOL[0],
      GAME_ITEMS_POOL.find(i => i.id === 'e_thresher_4s') || GAME_ITEMS_POOL[1],
      GAME_ITEMS_POOL.find(i => i.id === 'u_grandfather') || GAME_ITEMS_POOL[2],
      GAME_ITEMS_POOL.find(i => i.id === 'u_windforce') || GAME_ITEMS_POOL[3],
      GAME_ITEMS_POOL.find(i => i.id === 'u_stormshield') || GAME_ITEMS_POOL[4],
      GAME_ITEMS_POOL.find(i => i.id === 'u_maras') || GAME_ITEMS_POOL[5],
      GAME_ITEMS_POOL.find(i => i.id === 'u_tyraels_might') || GAME_ITEMS_POOL[6]
    ],
    rooms: [
      { id: 1, type: 'start', title: '하로가스 성채', cleared: true, current: false, connections: [2], revealed: true },
      { id: 2, type: 'normal', title: '피의 언덕 블러드 로드', cleared: false, current: false, connections: [3], revealed: false },
      { id: 3, type: 'elite', title: '중간보스: 오블리비언 나이트', cleared: false, current: false, connections: [4, 5], revealed: false, rewardDesc: '바알의 선봉대 (Ber / Jah / Cham 룬 드랍)' },
      { id: 4, type: 'treasure', title: '아리앗 고대인의 금고', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: '엘리트 유니크 풀세트 드랍' },
      { id: 5, type: 'rune', title: '파괴의 룬 제단', cleared: false, current: false, connections: [6], revealed: false, rewardDesc: 'Jah / Cham / Zod 궁극의 룬 제단' },
      { id: 6, type: 'boss', title: '우두머리: 파멸의 옥좌 심연', cleared: false, current: false, connections: [], revealed: false, rewardDesc: '파멸의 군주 바알 (종결 신기 및 고대 룬 대량 드랍)' }
    ]
  }
];

export function createDungeonFormation(
  dungeonId: string,
  roomType: 'normal' | 'elite' | 'boss' | 'treasure' | 'rune' | 'shrine' | 'start' = 'normal',
  difficultyLevel: number = 1
): Monster[] {
  const monsters: Monster[] = [];
  const hpMult = 1 + (difficultyLevel - 1) * 0.35;
  const defMult = 1 + (difficultyLevel - 1) * 0.20;
  const dmgMult = 1 + (difficultyLevel - 1) * 0.25;

  let baseMonsterName = '황야 고블린';
  let eliteMonsterName = '오크 집행관';
  let bossName = '안다리엘의 환영';
  let iconType = 'Goblin';

  if (dungeonId === 'act2_tomb') {
    baseMonsterName = '사막 딱정벌레';
    eliteMonsterName = '모래 약탈자';
    bossName = '두리엘의 유령';
    iconType = 'Bug';
  } else if (dungeonId === 'act3_jungle') {
    baseMonsterName = '정글 모스키토';
    eliteMonsterName = '트라빈칼 평의회원';
    bossName = '메피스토의 환영';
    iconType = 'Mosquito';
  } else if (dungeonId === 'act4_chaos') {
    baseMonsterName = '심연의 베놈 로드';
    eliteMonsterName = '죽음의 기사단장';
    bossName = '공포의 군주 디아블로';
    iconType = 'Demon';
  } else if (dungeonId === 'act5_worldstone') {
    baseMonsterName = '블러드 로드 전사';
    eliteMonsterName = '오블리비언 로드';
    bossName = '파멸의 군주 바알';
    iconType = 'Lord';
  }

  for (let l = 0; l < 5; l++) {
    for (let d = 0; d < 6; d++) {
      const isBoss = (roomType === 'boss') && (l === 2 && d === 0);
      const isElite = !isBoss && (roomType === 'elite' || roomType === 'boss') && (d === 0 && (l === 1 || l === 3));

      let mHp = Math.floor(65 * hpMult);
      let mDef = Math.floor(15 * defMult);
      let mDmg = Math.floor(6 * dmgMult);
      let mName = baseMonsterName;
      let rank: 'normal' | 'elite' | 'boss' = 'normal';

      if (isBoss) {
        mHp = Math.floor(1800 * hpMult);
        mDef = Math.floor(60 * defMult);
        mDmg = Math.floor(25 * dmgMult);
        mName = `👑 ${bossName}`;
        rank = 'boss';
      } else if (isElite) {
        mHp = Math.floor(280 * hpMult);
        mDef = Math.floor(35 * defMult);
        mDmg = Math.floor(14 * dmgMult);
        mName = `⭐ ${eliteMonsterName}`;
        rank = 'elite';
      } else if (d === 0) {
        mHp = Math.floor(95 * hpMult);
        mDef = Math.floor(20 * defMult);
      }

      monsters.push({
        id: `mon_${l}_${d}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: mName,
        hp: mHp,
        maxHp: mHp,
        defense: mDef,
        rank,
        lane: l,
        depth: d,
        intent: {
          type: 'attack',
          damage: mDmg,
          targetLane: l
        },
        icon: iconType
      });
    }
  }

  return monsters;
}
