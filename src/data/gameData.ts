import { GameItem, DungeonInfo, Skill, Monster, ConsumableItem, RuneWordRecipe } from '../types/game';

// Diablo II Runes Definition
export interface D2RuneDef {
  id: string;
  name: string;
  number: number;
  weaponBonus: string;
  armorBonus: string;
  statsWeapon: Record<string, number>;
  statsArmor: Record<string, number>;
}

export const D2_RUNES: Record<string, D2RuneDef> = {
  El: {
    id: 'El',
    name: '엘 (El) 룬',
    number: 1,
    weaponBonus: '공격력 +5, 명중률 증가',
    armorBonus: '방어력 +15, 시야 증가',
    statsWeapon: { minDmg: 3, maxDmg: 5 },
    statsArmor: { defense: 15 }
  },
  Eld: {
    id: 'Eld',
    name: '엘드 (Eld) 룬',
    number: 2,
    weaponBonus: '언데드에게 주는 피해 +50%',
    armorBonus: '방어 성공률 +7%',
    statsWeapon: { minDmg: 4, maxDmg: 8 },
    statsArmor: { defense: 20 }
  },
  Tir: {
    id: 'Tir',
    name: '티르 (Tir) 룬',
    number: 3,
    weaponBonus: '적 처치 시 분노/마나 +2',
    armorBonus: '적 처치 시 분노/마나 +2',
    statsWeapon: { minDmg: 2, maxDmg: 4 },
    statsArmor: { hp: 15 }
  },
  Nef: {
    id: 'Nef',
    name: '네프 (Nef) 룬',
    number: 4,
    weaponBonus: '적 밀쳐내기 (Knockback)',
    armorBonus: '원거리 방어력 +30',
    statsWeapon: { minDmg: 3, maxDmg: 6 },
    statsArmor: { defense: 30 }
  },
  Eth: {
    id: 'Eth',
    name: '에드 (Eth) 룬',
    number: 5,
    weaponBonus: '목표물의 방어력 -25%',
    armorBonus: '분노/마나 회복 속도 +15%',
    statsWeapon: { overkillEfficiency: 10 },
    statsArmor: { defense: 15 }
  },
  Ith: {
    id: 'Ith',
    name: '아이드 (Ith) 룬',
    number: 6,
    weaponBonus: '최대 대미지 +9',
    armorBonus: '받는 피해의 15%를 분노로 전환',
    statsWeapon: { maxDmg: 9 },
    statsArmor: { hp: 25 }
  },
  Tal: {
    id: 'Tal',
    name: '탈 (Tal) 룬',
    number: 7,
    weaponBonus: '독 피해 +75 (5초간)',
    armorBonus: '독 저항 +35%',
    statsWeapon: { minDmg: 8, maxDmg: 15 },
    statsArmor: { defense: 20, allResist: 10 }
  },
  Ral: {
    id: 'Ral',
    name: '랄 (Ral) 룬',
    number: 8,
    weaponBonus: '화염 피해 5~30 추가',
    armorBonus: '화염 저항 +35%',
    statsWeapon: { minDmg: 5, maxDmg: 30 },
    statsArmor: { defense: 20, allResist: 10 }
  },
  Ort: {
    id: 'Ort',
    name: '오르트 (Ort) 룬',
    number: 9,
    weaponBonus: '번개 피해 1~50 추가',
    armorBonus: '번개 저항 +35%',
    statsWeapon: { minDmg: 1, maxDmg: 50 },
    statsArmor: { defense: 20, allResist: 10 }
  },
  Sol: {
    id: 'Sol',
    name: '솔 (Sol) 룬',
    number: 12,
    weaponBonus: '최소 대미지 +9',
    armorBonus: '받는 물리 피해 7 감소',
    statsWeapon: { minDmg: 9, maxDmg: 9 },
    statsArmor: { defense: 35 }
  },
  Shael: {
    id: 'Shael',
    name: '샤엘 (Shael) 룬',
    number: 13,
    weaponBonus: '공격 속도 +20%',
    armorBonus: '타격 회복 속도 +20%',
    statsWeapon: { attackSpeed: 20 },
    statsArmor: { defense: 25 }
  },
  Amn: {
    id: 'Amn',
    name: '앰 (Amn) 룬',
    number: 11,
    weaponBonus: '타격 시 7% 생명력 흡수',
    armorBonus: '공격자에게 14 피해 반사',
    statsWeapon: { lifeSteal: 7 },
    statsArmor: { defense: 30 }
  },
  Ber: {
    id: 'Ber',
    name: '베르 (Ber) 룬',
    number: 30,
    weaponBonus: '20% 강타 확률 (Crushing Blow)',
    armorBonus: '받는 피해 8% 감소 (Damage Reduce)',
    statsWeapon: { critDamage: 50, overkillEfficiency: 25 },
    statsArmor: { defense: 80, hp: 100 }
  },
  Jah: {
    id: 'Jah',
    name: '자 (Jah) 룬',
    number: 31,
    weaponBonus: '목표물의 방어력 완전 무시',
    armorBonus: '최대 생명력 +5%',
    statsWeapon: { minDmg: 30, maxDmg: 60 },
    statsArmor: { hp: 150 }
  }
};

// Diablo II RuneWord Recipes
export const RUNEWORD_RECIPES: RuneWordRecipe[] = [
  {
    id: 'steel',
    name: '강철 (Steel)',
    requiredRunes: ['Tir', 'El'],
    allowedSlot: 'weapon',
    requiredSockets: 2,
    bonusStats: { minDmg: 20, maxDmg: 35, critChance: 10, overkillEfficiency: 25 },
    specialEffect: '공격 속도 +25%, 상처 악화 50%, 적 처치 시 분노 +2 획득',
    description: '초반 전사 파밍의 상징. 빠른 공격속도와 오버킬 전이로 적 무리를 일도양단합니다.'
  },
  {
    id: 'stealth',
    name: '스텔스 (Stealth)',
    requiredRunes: ['Tal', 'Eth'],
    allowedSlot: 'armor',
    requiredSockets: 2,
    bonusStats: { defense: 35, dex: 6, hp: 40 },
    specialEffect: '이동 속도 +25%, 분노/마나 재생 +15%, 독 저항 +30%',
    description: '기동성과 자원 회복을 비약적으로 높여주는 최고의 초반 룬워드 갑주.'
  },
  {
    id: 'lore',
    name: '전승 (Lore)',
    requiredRunes: ['Ort', 'Sol'],
    allowedSlot: 'helm',
    requiredSockets: 2,
    bonusStats: { defense: 45, str: 8, hp: 60 },
    specialEffect: '모든 스킬 위력 +15%, 번개 저항 +30%, 물리 피해 감소 7',
    description: '고대 전사의 지혜가 깃든 투구. 모든 스킬의 기본 위력이 상승합니다.'
  },
  {
    id: 'ancient_pledge',
    name: '고대인의 서약 (Ancient\'s Pledge)',
    requiredRunes: ['Ral', 'Ort', 'Tal'],
    allowedSlot: 'shield',
    requiredSockets: 3,
    bonusStats: { defense: 60, con: 15, hp: 80 },
    specialEffect: '방어력 +50%, 화염/번개/냉기/독 저항 +45%',
    description: '3대 원소와 독 저항을 극대화하여 엘리트 및 마법 공격을 완벽히 방어합니다.'
  },
  {
    id: 'enigma',
    name: '수수께끼 (Enigma)',
    requiredRunes: ['Jah', 'Ith', 'Ber'],
    allowedSlot: 'armor',
    requiredSockets: 3,
    bonusStats: { defense: 120, str: 35, hp: 200, overkillEfficiency: 40 },
    specialEffect: '모든 스킬 +2, 순간이동(Teleport) 개방, 마법 아이템 발견확률(MF) +80%',
    description: '디아블로2 종결 룬워드. 차원을 넘나드는 기동성과 압도적인 파밍 효율을 제공합니다.'
  }
];

export const INITIAL_EQUIPMENT: Record<string, GameItem> = {
  weapon: {
    id: 'rw_steel',
    name: '강철 (Steel)',
    baseItemName: '브로드소드 (Broad Sword)',
    rarity: 'runeword',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: ['Tir', 'El'],
    isRuneWord: true,
    runeWordName: '강철 (Steel)',
    isIdentified: true,
    stats: { minDmg: 55, maxDmg: 82, str: 10, critChance: 10, overkillEfficiency: 25 },
    specialEffect: '공격 속도 +25%, 상처 악화 50%, 처치 시 분노 +2',
    value: 2500,
    icon: 'Sword',
    description: '[룬워드: Tir + El] 베어낼수록 예리함이 살아나는 명검.'
  },
  armor: {
    id: 'rw_stealth',
    name: '스텔스 (Stealth)',
    baseItemName: '체인 메일 (Chain Mail)',
    rarity: 'runeword',
    slot: 'armor',
    sockets: 2,
    socketedRunes: ['Tal', 'Eth'],
    isRuneWord: true,
    runeWordName: '스텔스 (Stealth)',
    isIdentified: true,
    stats: { defense: 58, dex: 6, hp: 60 },
    specialEffect: '이동 속도 +25%, 분노 재생 +15%, 독 저항 +30%',
    value: 2200,
    icon: 'Shield',
    description: '[룬워드: Tal + Eth] 빠른 기동성과 저항을 제공하는 경량 갑주.'
  },
  helm: {
    id: 'base_helm',
    name: '소켓 캡 투구',
    baseItemName: '캡 (Cap)',
    rarity: 'normal',
    slot: 'helm',
    sockets: 2,
    socketedRunes: ['Ort'],
    isIdentified: true,
    stats: { defense: 22 },
    value: 350,
    icon: 'HardHat',
    description: '[소켓 1/2 장착됨: Ort] 번개 저항이 깃든 가죽 투구.'
  },
  shield: {
    id: 'base_shield',
    name: '타워 실드 (3 소켓)',
    baseItemName: '타워 실드 (Tower Shield)',
    rarity: 'normal',
    slot: 'shield',
    sockets: 3,
    socketedRunes: ['Ral', 'Ort'],
    isIdentified: true,
    stats: { defense: 45 },
    value: 500,
    icon: 'Shield',
    description: '[소켓 2/3 장착됨: Ral, Ort] 룬 1개를 추가로 박으면 룬워드 완성 가능!'
  },
  ring1: {
    id: 'r_rare',
    name: '시체의 손가락 (Corpse Grasp)',
    rarity: 'rare',
    slot: 'ring1',
    isIdentified: true,
    stats: { str: 8, lifeSteal: 6, fortune: 15 },
    subAffixes: [
      { id: 'a1', name: '흡혈의', value: 6, label: '타격 시 생명력 흡수 +6%' },
      { id: 'a2', name: '거인의', value: 8, label: '힘(STR) +8' },
      { id: 'a3', name: '행운의', value: 15, label: '매직 아이템 발견 확률(MF) +15%' }
    ],
    value: 3000,
    icon: 'CircleDot',
    description: '시체의 손가락에서 떼어낸 저주받은 반지. 파밍 행운과 피를 갈구합니다.'
  }
};

export const INITIAL_CONSUMABLES: ConsumableItem[] = [
  {
    id: 'c_hp',
    name: '대형 생명력 물약',
    count: 6,
    type: 'hp',
    effectValue: 250,
    description: '생명력을 즉시 250 회복합니다.',
    icon: 'Heart',
    hotkey: '1'
  },
  {
    id: 'c_rage',
    name: '활력의 물약 (Rejuvenation)',
    count: 3,
    type: 'rage',
    effectValue: 50,
    description: '분노를 즉시 50 충전합니다.',
    icon: 'Flame',
    hotkey: '2'
  },
  {
    id: 'c_def',
    name: '철갑 영약',
    count: 3,
    type: 'defense',
    effectValue: 60,
    description: '이번 턴 동안 방어력이 +60 증가합니다.',
    icon: 'Shield',
    hotkey: '3'
  },
  {
    id: 'c_overkill',
    name: '질풍의 비약',
    count: 2,
    type: 'overkill',
    effectValue: 30,
    description: '오버킬 피해 전이 효율이 +30% 일시 증가합니다.',
    icon: 'Zap',
    hotkey: '4'
  }
];

export const SAMPLE_INVENTORY: GameItem[] = [
  // Runes
  {
    id: 'rune_tal',
    name: '탈 (Tal) 룬',
    rarity: 'magic',
    slot: 'rune',
    stats: {},
    value: 500,
    icon: 'Sparkles',
    description: '룬 넘버 #7. 무기: 독 대미지 / 방어구: 독 저항 +35% (스텔스, 고대인의서약 재료)'
  },
  {
    id: 'rune_eth',
    name: '에드 (Eth) 룬',
    rarity: 'magic',
    slot: 'rune',
    stats: {},
    value: 400,
    icon: 'Sparkles',
    description: '룬 넘버 #5. 무기: 방어력감소 / 방어구: 마나재생 (스텔스 재료)'
  },
  {
    id: 'rune_ral',
    name: '랄 (Ral) 룬',
    rarity: 'magic',
    slot: 'rune',
    stats: {},
    value: 600,
    icon: 'Sparkles',
    description: '룬 넘버 #8. 무기: 화염 대미지 / 방어구: 화염 저항 +35% (고대인의서약 재료)'
  },
  {
    id: 'rune_sol',
    name: '솔 (Sol) 룬',
    rarity: 'rare',
    slot: 'rune',
    stats: {},
    value: 1500,
    icon: 'Sparkles',
    description: '룬 넘버 #12. 무기: 최소대미지 / 방어구: 물리감소 (전승 투구 재료)'
  },
  {
    id: 'rune_ber',
    name: '베르 (Ber) 룬',
    rarity: 'legendary',
    slot: 'rune',
    stats: {},
    value: 25000,
    icon: 'Sparkles',
    description: '고급 하이룬 #30. 무기: 20% 강타 / 방어구: 피해 8% 감소 (수수께끼, 무한 재료)'
  },
  {
    id: 'rune_jah',
    name: '자 (Jah) 룬',
    rarity: 'legendary',
    slot: 'rune',
    stats: {},
    value: 30000,
    icon: 'Sparkles',
    description: '최고급 하이룬 #31. 무기: 방어력무시 / 방어구: 최대생명력 +5% (수수께끼 재료)'
  },

  // Base items for runewords
  {
    id: 'base_broadsword',
    name: '고급 브로드소드 (2 소켓)',
    baseItemName: '브로드소드 (Broad Sword)',
    rarity: 'normal',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    stats: { minDmg: 18, maxDmg: 28 },
    value: 300,
    icon: 'Sword',
    description: '2개의 빈 소켓이 뚫린 노멀 베이스 칼. Tir + El을 박으면 [강철] 룬워드 발동!'
  },
  {
    id: 'base_helm2',
    name: '본 헬름 (2 소켓)',
    baseItemName: '본 헬름 (Bone Helm)',
    rarity: 'normal',
    slot: 'helm',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 32 },
    value: 450,
    icon: 'HardHat',
    description: '2개의 빈 소켓이 뚫린 해골 투구. Ort + Sol을 박으면 [전승] 룬워드 발동!'
  },

  // Unidentified Item for Cain identify
  {
    id: 'unid_amulet',
    name: '미확인 아뮬렛 (Unidentified)',
    rarity: 'rare',
    slot: 'amulet',
    isIdentified: false,
    stats: {},
    value: 1000,
    icon: 'Sparkles',
    description: '신비한 마력이 감도는 미확인 목걸이. 데커드 케인이나 식별 스크롤로 감정해야 합니다.'
  },

  // Perfect Gems
  {
    id: 'gem_ruby',
    name: '완벽한 루비 (Perfect Ruby)',
    rarity: 'rare',
    slot: 'gem',
    stats: { hp: 38, minDmg: 15 },
    value: 800,
    icon: 'CircleDot',
    description: '무기 장착 시 화염 대미지 +15 / 방어구 장착 시 생명력 +38. 큐브 합성 재료.'
  },
  {
    id: 'gem_skull',
    name: '완벽한 해골 (Perfect Skull)',
    rarity: 'rare',
    slot: 'gem',
    stats: { lifeSteal: 4, manaSteal: 3 },
    value: 1200,
    icon: 'Skull',
    description: '무기 장착 시 4% 흡혈 / 방어구 장착 시 재생 증가. 매직 아이템 리롤 큐브 재료.'
  }
];

export const WARRIOR_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.2,
    overkillEfficiency: 1.0,
    route: 'line',
    description: '전방 1개 Lane을 깊숙이 관통 베기. 적을 처치하면 잔여 피해가 뒤쪽 적에게 100% 전달됩니다.',
    icon: 'Sword',
    hotkey: 'Q'
  },
  {
    id: 'execute',
    name: '처형 (Execute)',
    rageCost: 35,
    manaCost: 0,
    damageMultiplier: 2.8,
    overkillEfficiency: 1.25,
    route: 'single',
    description: '단일 대상에게 괴멸적인 타격. HP가 50% 이하인 적에게 50% 추가 피해를 입히며 막대한 오버킬을 유발합니다.',
    icon: 'Skull',
    hotkey: 'W'
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    rageCost: 25,
    manaCost: 0,
    damageMultiplier: 1.6,
    overkillEfficiency: 0.85,
    route: 'branch',
    description: '전방 및 좌우 인접 Lane 전열을 동시에 휩쓸어 공격. 밀집된 적 무리를 붕괴시킵니다.',
    icon: 'Zap',
    hotkey: 'E'
  },
  {
    id: 'whirlwind',
    name: '휠윈드 (Whirlwind)',
    rageCost: 60,
    manaCost: 0,
    damageMultiplier: 2.2,
    overkillEfficiency: 1.1,
    route: 'radius',
    description: '회전하는 무기의 폭풍으로 전 레인의 적들에게 다단 히트와 연쇄 오버킬을 폭발시킵니다.',
    icon: 'RotateCw',
    hotkey: 'R'
  }
];

export const DUNGEONS_DATA: DungeonInfo[] = [
  {
    id: 'goblin_cave',
    name: '고블린 동굴 (Goblin Cave)',
    theme: '절벽 아래 채굴 동굴과 조잡한 방어 요새',
    recommendedLevel: 5,
    difficulty: '쉬움',
    elementalInfo: '물리 취약, 관통 공격에 극도로 취약',
    monsterSummary: '고블린 정찰병, 고블린 전사, 고블린 샤먼 (방패 전열과 다수의 저체력 후열)',
    bestClearTime: '02분 14초',
    maxChainRecord: 36,
    dropItems: [
      SAMPLE_INVENTORY[0], // Tal
      SAMPLE_INVENTORY[1], // Eth
      SAMPLE_INVENTORY[6], // 2소켓 브로드소드
    ],
    rooms: [
      { id: 1, type: 'start', title: '동굴 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '버려진 채굴장', cleared: true, current: false, connections: [3, 4], monsterCount: 18 },
      { id: 3, type: 'treasure', title: '비밀 룬 보관소', cleared: false, current: false, connections: [5], rewardDesc: 'Tal / Eth 룬 상자' },
      { id: 4, type: 'elite', title: '경비 대장의 막사', cleared: false, current: true, connections: [5], monsterCount: 28, rewardDesc: '오크 집행관 (소켓 장비 드랍)' },
      { id: 5, type: 'rune', title: '샤먼의 제단', cleared: false, current: false, connections: [6], rewardDesc: 'Ral 룬 획득' },
      { id: 6, type: 'boss', title: '고블린 족장의 옥좌', cleared: false, current: false, connections: [], monsterCount: 45, rewardDesc: '유니크 링 & 하이룬 드랍' }
    ]
  },
  {
    id: 'crypt',
    name: '잊혀진 납골당 (Forgotten Crypt)',
    theme: '봉인된 왕실 묘지와 지하 납골당',
    recommendedLevel: 15,
    difficulty: '보통',
    elementalInfo: '암흑 저항 50%, 신성/화염 취약, 높은 물리 방어',
    monsterSummary: '스켈레톤 방패병, 좀비 떼, 해골 마법사 (밀집 웨이브와 부활 메커니즘)',
    bestClearTime: '04분 30초',
    maxChainRecord: 68,
    dropItems: [
      SAMPLE_INVENTORY[2], // Ral
      SAMPLE_INVENTORY[3], // Sol
      SAMPLE_INVENTORY[7], // 2소켓 본헬름
    ],
    rooms: [
      { id: 1, type: 'start', title: '봉인된 묘지 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '무명 용사의 회랑', cleared: false, current: false, connections: [3], monsterCount: 32 },
      { id: 3, type: 'shrine', title: '고대 성소', cleared: false, current: false, connections: [4, 5], rewardDesc: '축복: 매직 아이템 발견율 +50%' },
      { id: 4, type: 'elite', title: '묘지기 기사의 석실', cleared: false, current: false, connections: [6], monsterCount: 40 },
      { id: 5, type: 'treasure', title: '왕실 보물고', cleared: false, current: false, connections: [6], rewardDesc: '고급 보석 및 룬' },
      { id: 6, type: 'boss', title: '해골왕의 안식처', cleared: false, current: false, connections: [], monsterCount: 70 }
    ]
  },
  {
    id: 'inferno_mine',
    name: '지옥불 광산 (Inferno Mine)',
    theme: '마력이 폭주한 용암 광산과 붕괴 직전의 제련소',
    recommendedLevel: 28,
    difficulty: '어려움',
    elementalInfo: '화염 저항 80%, 냉기 취약, 주기적 바닥 화염 피해',
    monsterSummary: '엠버 파인드, 용암 거미, 화염 골렘 (강력한 원거리 캐스팅과 단단한 골렘)',
    bestClearTime: '--분 --초',
    maxChainRecord: 0,
    dropItems: [SAMPLE_INVENTORY[4], SAMPLE_INVENTORY[5]], // Ber, Jah
    rooms: [
      { id: 1, type: 'start', title: '용암 지대 진입로', cleared: false, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '작열하는 갱도', cleared: false, current: false, connections: [3], monsterCount: 45 },
      { id: 3, type: 'boss', title: '지옥불 용광로 심장부', cleared: false, current: false, connections: [], monsterCount: 90 }
    ]
  }
];

export function generateBattleMonsters(): Monster[] {
  const monsters: Monster[] = [];
  const names = ['고블린 정찰병', '고블린 전사', '고블린 척탄병', '오크 방패병', '고블린 주술사'];
  
  for (let lane = 0; lane < 5; lane++) {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let depth = 0; depth < count; depth++) {
      const isFront = depth === 0;
      const isElite = lane === 2 && depth === 1;
      const isTank = isFront && (lane === 1 || lane === 3);

      let name = names[Math.floor(Math.random() * 3)];
      let hp = 45 + depth * 15;
      let maxHp = hp;
      let defense = 5;
      let rank: Monster['rank'] = 'normal';
      let icon = '💀';

      if (isElite) {
        name = '오크 집행관 (ELITE)';
        hp = 280;
        maxHp = 280;
        defense = 25;
        rank = 'elite';
        icon = '👹';
      } else if (isTank) {
        name = '고블린 방패병';
        hp = 95;
        maxHp = 95;
        defense = 18;
        rank = 'champion';
        icon = '🛡️';
      } else if (depth >= 2 && Math.random() > 0.6) {
        name = '고블린 주술사';
        hp = 50;
        maxHp = 50;
        defense = 2;
        icon = '🧙‍♂️';
      }

      monsters.push({
        id: `m_${lane}_${depth}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        hp,
        maxHp,
        defense,
        rank,
        lane,
        depth,
        intent: {
          type: isElite ? 'attack' : Math.random() > 0.4 ? 'attack' : 'defend',
          damage: isElite ? 45 : 12 + depth * 3,
          targetLane: lane,
          chargePercent: Math.floor(Math.random() * 60) + 20
        },
        icon
      });
    }
  }

  return monsters;
}
