import { GameItem, DungeonInfo, Skill, Monster, ConsumableItem, RuneWordRecipe, SkillRune } from '../types/game';

// 1. Diablo II Runes Definition (El to Zod - 28 Comprehensive Runes)
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
    statsWeapon: { overkillEfficiency: 15 },
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
    weaponBonus: '독 피해 +75',
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
  Thul: {
    id: 'Thul',
    name: '주울 (Thul) 룬',
    number: 10,
    weaponBonus: '냉기 피해 3~14, 빙결',
    armorBonus: '냉기 저항 +35%',
    statsWeapon: { minDmg: 3, maxDmg: 14, overkillEfficiency: 10 },
    statsArmor: { defense: 20, allResist: 10 }
  },
  Amn: {
    id: 'Amn',
    name: '앰 (Amn) 룬',
    number: 11,
    weaponBonus: '타격 시 생명력 7% 흡수',
    armorBonus: '공격자에게 피해 14 반사',
    statsWeapon: { lifeSteal: 7 },
    statsArmor: { defense: 25 }
  },
  Sol: {
    id: 'Sol',
    name: '솔 (Sol) 룬',
    number: 12,
    weaponBonus: '최소 대미지 +9',
    armorBonus: '받는 피해 7 감소',
    statsWeapon: { minDmg: 9 },
    statsArmor: { defense: 35 }
  },
  Shael: {
    id: 'Shael',
    name: '샤엘 (Shael) 룬',
    number: 13,
    weaponBonus: '공격 속도 +20%',
    armorBonus: '타격 회복 속도 +20%',
    statsWeapon: { critChance: 8, overkillEfficiency: 15 },
    statsArmor: { defense: 30 }
  },
  Dol: {
    id: 'Dol',
    name: '돌 (Dol) 룬',
    number: 14,
    weaponBonus: '적중 시 몬스터 도주 25%',
    armorBonus: '생명력 회복 +7',
    statsWeapon: { minDmg: 10, maxDmg: 15 },
    statsArmor: { hp: 50 }
  },
  Hel: {
    id: 'Hel',
    name: '헬 (Hel) 룬',
    number: 15,
    weaponBonus: '착용 요구치 -20%',
    armorBonus: '착용 요구치 -15%',
    statsWeapon: { critChance: 5 },
    statsArmor: { defense: 40 }
  },
  Lem: {
    id: 'Lem',
    name: '렘 (Lem) 룬',
    number: 20,
    weaponBonus: '괴물로부터 얻는 골드 +75%',
    armorBonus: '괴물로부터 얻는 골드 +50%',
    statsWeapon: { fortune: 20 },
    statsArmor: { fortune: 15 }
  },
  Pul: {
    id: 'Pul',
    name: '풀 (Pul) 룬',
    number: 21,
    weaponBonus: '악마에 대한 피해 +75%',
    armorBonus: '방어력 +30%',
    statsWeapon: { minDmg: 15, maxDmg: 25 },
    statsArmor: { defense: 50 }
  },
  Um: {
    id: 'Um',
    name: '움 (Um) 룬',
    number: 22,
    weaponBonus: '상처 악화 25% (출혈)',
    armorBonus: '모든 저항 +15%',
    statsWeapon: { minDmg: 20, maxDmg: 30, overkillEfficiency: 20 },
    statsArmor: { defense: 60, allResist: 15 }
  },
  Mal: {
    id: 'Mal',
    name: '말 (Mal) 룬',
    number: 23,
    weaponBonus: '괴물 회복 저지',
    armorBonus: '마법 피해 7 감소',
    statsWeapon: { minDmg: 25, maxDmg: 35 },
    statsArmor: { defense: 70 }
  },
  Ist: {
    id: 'Ist',
    name: '이스트 (Ist) 룬',
    number: 24,
    weaponBonus: '매직 아이템 발견 확률 +30%',
    armorBonus: '매직 아이템 발견 확률 +25%',
    statsWeapon: { fortune: 30 },
    statsArmor: { fortune: 25 }
  },
  Gul: {
    id: 'Gul',
    name: '굴 (Gul) 룬',
    number: 25,
    weaponBonus: '공격 등급 +20%',
    armorBonus: '최대 독 저항 +5%',
    statsWeapon: { critChance: 12 },
    statsArmor: { defense: 80 }
  },
  Vex: {
    id: 'Vex',
    name: '벡스 (Vex) 룬',
    number: 26,
    weaponBonus: '타격 시 마나/분노 7% 흡수',
    armorBonus: '최대 화염 저항 +5%',
    statsWeapon: { minDmg: 30, maxDmg: 50, lifeSteal: 7 },
    statsArmor: { defense: 90, allResist: 15 }
  },
  Ohm: {
    id: 'Ohm',
    name: '옴 (Ohm) 룬',
    number: 27,
    weaponBonus: '피해량 +50% 증가',
    armorBonus: '최대 냉기 저항 +5%',
    statsWeapon: { minDmg: 40, maxDmg: 70 },
    statsArmor: { defense: 100 }
  },
  Lo: {
    id: 'Lo',
    name: '로 (Lo) 룬',
    number: 28,
    weaponBonus: '치명적 공격 20% (Deadly Strike)',
    armorBonus: '최대 번개 저항 +5%',
    statsWeapon: { critChance: 20, critDamage: 50 },
    statsArmor: { defense: 120 }
  },
  Sur: {
    id: 'Sur',
    name: '수르 (Sur) 룬',
    number: 29,
    weaponBonus: '목표물 시야 차단 (실명)',
    armorBonus: '최대 마나/분노 +5%',
    statsWeapon: { minDmg: 50, maxDmg: 80 },
    statsArmor: { hp: 100 }
  },
  Ber: {
    id: 'Ber',
    name: '베르 (Ber) 룬',
    number: 30,
    weaponBonus: '강타 확률 20% (Crushing Blow)',
    armorBonus: '피해 감소 8%',
    statsWeapon: { minDmg: 60, maxDmg: 100, critChance: 15 },
    statsArmor: { defense: 150, hp: 120 }
  },
  Jah: {
    id: 'Jah',
    name: '자 (Jah) 룬',
    number: 31,
    weaponBonus: '목표물의 방어력 완전 무시',
    armorBonus: '최대 생명력 5% 증가',
    statsWeapon: { minDmg: 80, maxDmg: 120, overkillEfficiency: 35 },
    statsArmor: { hp: 150, defense: 150 }
  },
  Cham: {
    id: 'Cham',
    name: '참 (Cham) 룬',
    number: 32,
    weaponBonus: '빙결되지 않음, 대상 동결',
    armorBonus: '빙결되지 않음',
    statsWeapon: { minDmg: 90, maxDmg: 140 },
    statsArmor: { defense: 180 }
  },
  Zod: {
    id: 'Zod',
    name: '조드 (Zod) 룬',
    number: 33,
    weaponBonus: '파괴 불가 (Indestructible)',
    armorBonus: '파괴 불가',
    statsWeapon: { minDmg: 120, maxDmg: 200, critChance: 25, overkillEfficiency: 50 },
    statsArmor: { defense: 250, hp: 200, allResist: 30 }
  }
};

// 2. Comprehensive RuneWord Recipes Catalog
export const RUNEWORD_RECIPES: RuneWordRecipe[] = [
  {
    id: 'rw_steel',
    name: '강철 (Steel)',
    requiredRunes: ['Tir', 'El'],
    allowedSlot: 'weapon',
    requiredSockets: 2,
    bonusStats: { minDmg: 45, maxDmg: 65, str: 8, critChance: 10, overkillEfficiency: 20 },
    specialEffect: '공격 속도 +25%, 상처 악화 50%, 처치 시 분노 +2',
    description: '[Tir + El] 베어낼수록 예리함이 살아나는 초반 명검.'
  },
  {
    id: 'rw_stealth',
    name: '스텔스 (Stealth)',
    requiredRunes: ['Tal', 'Eth'],
    allowedSlot: 'armor',
    requiredSockets: 2,
    bonusStats: { defense: 60, dex: 6, hp: 50 },
    specialEffect: '이동 속도 +25%, 분노 재생 +15%, 독 저항 +30%',
    description: '[Tal + Eth] 빠른 기동성과 저항을 제공하는 경량 갑주.'
  },
  {
    id: 'rw_lore',
    name: '전승 (Lore)',
    requiredRunes: ['Ort', 'Sol'],
    allowedSlot: 'helm',
    requiredSockets: 2,
    bonusStats: { defense: 45, int: 5, wis: 5 },
    specialEffect: '모든 스킬 위력 +15%, 번개 저항 +30%, 피해 감소 7',
    description: '[Ort + Sol] 지혜와 원소 저항이 깃든 고대의 투구.'
  },
  {
    id: 'rw_ancients_pledge',
    name: "고대인의 서약 (Ancient's Pledge)",
    requiredRunes: ['Ral', 'Ort', 'Tal'],
    allowedSlot: 'shield',
    requiredSockets: 3,
    bonusStats: { defense: 80 },
    specialEffect: '모든 원소 저항 +45%, 방어력 +50%',
    description: '[Ral + Ort + Tal] 아리앗 산의 축복이 깃든 견고한 방패.'
  },
  {
    id: 'rw_spirit',
    name: '스피리트 (Spirit)',
    requiredRunes: ['Tal', 'Thul', 'Ort', 'Amn'],
    allowedSlot: 'weapon',
    requiredSockets: 4,
    bonusStats: { minDmg: 60, maxDmg: 90, int: 12, hp: 80 },
    specialEffect: '모든 스킬 위력 +35%, 분노/마나 재생 +25%, 원소 저항 +35%',
    description: '[Tal + Thul + Ort + Amn] 사계의 원소 정령이 깃든 만능 명검.'
  },
  {
    id: 'rw_insight',
    name: '통찰 (Insight)',
    requiredRunes: ['Ral', 'Tir', 'Tal', 'Sol'],
    allowedSlot: 'weapon',
    requiredSockets: 4,
    bonusStats: { minDmg: 80, maxDmg: 130, critChance: 20 },
    specialEffect: '명상 오라: 초당 분노 +10 자동 충전, 치명타 피해 +50%',
    description: '[Ral + Tir + Tal + Sol] 분노가 마르지 않는 무한 연계용 무기.'
  },
  {
    id: 'rw_fortitude',
    name: '인내 (Fortitude)',
    requiredRunes: ['El', 'Sol', 'Dol', 'Lo'],
    allowedSlot: 'armor',
    requiredSockets: 4,
    bonusStats: { defense: 220, hp: 150 },
    specialEffect: '물리 피해량 +200%, 모든 저항 +30%, 생명력 대폭 증가',
    description: '[El + Sol + Dol + Lo] 난공불락의 방어력과 막대한 피해 증폭 갑주.'
  },
  {
    id: 'rw_grief',
    name: '슬픔 (Grief)',
    requiredRunes: ['Eth', 'Tir', 'Lo', 'Mal', 'Ral'],
    allowedSlot: 'weapon',
    requiredSockets: 5,
    bonusStats: { minDmg: 180, maxDmg: 260, critChance: 25, overkillEfficiency: 40 },
    specialEffect: '적 방어력 완전 무시, 치명적 공격 20%, 처치 시 체력 흡수',
    description: '[Eth + Tir + Lo + Mal + Ral] 근접전의 정점, 절대 파괴의 검.'
  },
  {
    id: 'rw_enigma',
    name: '수수께끼 (Enigma)',
    requiredRunes: ['Jah', 'Ith', 'Ber'],
    allowedSlot: 'armor',
    requiredSockets: 3,
    bonusStats: { defense: 180, str: 25, hp: 120, fortune: 80 },
    specialEffect: '모든 스킬 +2, 텔레포트 이동, 대량 STR, MF +80%',
    description: '[Jah + Ith + Ber] 시공간을 초월하는 전설의 마법 갑주.'
  },
  {
    id: 'rw_botd',
    name: '죽음의 숨결 (Breath of the Dying)',
    requiredRunes: ['Vex', 'Hel', 'El', 'Eld', 'Zod', 'Eth'],
    allowedSlot: 'weapon',
    requiredSockets: 6,
    bonusStats: { minDmg: 280, maxDmg: 420, str: 30, dex: 30, con: 30, overkillEfficiency: 60 },
    specialEffect: '파괴 불가, 생명력 흡수 15%, 모든 스탯 +30, 독 폭발',
    description: '[Vex + Hel + El + Eld + Zod + Eth] 6개 룬의 궁극 합일, 불멸의 파괴신.'
  }
];

// 3. Diverse Skill Runes Catalog (Elements & Special Modifiers)
export const SKILL_RUNES_DATA: SkillRune[] = [
  {
    id: 'rune_fire',
    name: '지옥불 폭발 (Hellfire)',
    element: 'fire',
    description: '오버킬 발생 시 대상 주변 1칸에 화염 폭발을 일으킵니다.',
    damageBonusPercent: 25,
    overkillBonusPercent: 30,
    specialEffectName: '화염 연쇄 폭발',
    color: '#ef4444'
  },
  {
    id: 'rune_frost',
    name: '서리 분쇄 (Frost Shatter)',
    element: 'cold',
    description: '적들을 빙결시키고, 오버킬 잔여 피해 전이 효율을 극대화합니다.',
    damageBonusPercent: 20,
    overkillBonusPercent: 45,
    specialEffectName: '빙결 & 얼음 파편',
    color: '#38bdf8'
  },
  {
    id: 'rune_lightning',
    name: '연쇄 번개 (Chain Lightning)',
    element: 'lightning',
    description: '타격 시 인접한 모든 레인의 적들에게 번개 감전 피해를 흩뿌립니다.',
    damageBonusPercent: 35,
    overkillBonusPercent: 20,
    specialEffectName: '연쇄 감전 방전',
    color: '#fbbf24'
  },
  {
    id: 'rune_poison',
    name: '맹독 학살 (Venom Slaughter)',
    element: 'poison',
    description: '적의 방어력을 35% 관통하고 치명적인 지속 맹독을 주입합니다.',
    damageBonusPercent: 20,
    overkillBonusPercent: 25,
    specialEffectName: '방어력 35% 관통',
    color: '#4ade80'
  },
  {
    id: 'rune_void',
    name: '공허 영혼흡수 (Void Devour)',
    element: 'void',
    description: '처치한 적 1마리당 생명력 20을 즉시 흡수하고 분노를 대량 충전합니다.',
    damageBonusPercent: 30,
    overkillBonusPercent: 25,
    specialEffectName: '처치 시 생명/분노 흡수',
    color: '#c084fc'
  }
];

// 4. Balanced Warrior Skills (Nerfed Q, Heavily Buffed Rage Skills W, E, R)
export const WARRIOR_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.0, // Nerfed from 1.2
    overkillEfficiency: 0.45, // Heavily nerfed from 1.0 -> basic skill for 1~2 small kills
    route: 'line',
    description: '기본 직선 베기. 자원을 소모하지 않으며, 전열의 약한 적 1~2마리를 정리하는 데 적합합니다.',
    icon: 'Sword',
    hotkey: 'Q',
    activeRuneId: 'rune_fire'
  },
  {
    id: 'execute',
    name: '처형 (Execute)',
    rageCost: 30, // Buffed: Reduced cost from 35
    manaCost: 0,
    damageMultiplier: 4.2, // Heavily buffed from 2.8 -> High damage boss/elite breaker
    overkillEfficiency: 0.85,
    route: 'single',
    description: '단일 대상에게 괴멸적인 타격! 높은 방어력의 엘리트나 보스의 체인 저지점을 일격에 파쇄합니다.',
    icon: 'Skull',
    hotkey: 'W',
    activeRuneId: 'rune_poison'
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    rageCost: 20, // Buffed: Reduced cost from 25
    manaCost: 0,
    damageMultiplier: 1.8, // Buffed from 1.6
    overkillEfficiency: 0.90, // Buffed from 0.85
    route: 'branch',
    description: '전방 및 좌우 3개 Lane의 전열을 동시에 강타. 밀집된 전열을 한 번에 붕괴시킵니다.',
    icon: 'Zap',
    hotkey: 'E',
    activeRuneId: 'rune_lightning'
  },
  {
    id: 'whirlwind',
    name: '휠윈드 (Whirlwind)',
    rageCost: 50, // Buffed: Reduced cost from 60
    manaCost: 0,
    damageMultiplier: 3.5, // Massively buffed from 2.2 -> Ultimate mass extinction
    overkillEfficiency: 1.30, // Heavily buffed from 1.1 -> Kills 10~20 enemies in 1 hit!
    route: 'radius',
    description: '전 레인 2열(총 10칸)을 휩쓰는 파괴의 폭풍! 10~20마리를 한 방에 연쇄 폭사시키는 광전사의 궁극기.',
    icon: 'RotateCw',
    hotkey: 'R',
    activeRuneId: 'rune_frost'
  }
];

// 5. Rich Sample Inventory (Clean Equipment, Socket Bases, Uniques, and Accessories - NO RUNES)
export const SAMPLE_INVENTORY: GameItem[] = [
  // Socket Bases for RuneWords
  {
    id: 'base_cs_4s',
    name: '크리스탈 소드 (4 소켓)',
    baseItemName: '크리스탈 소드 (Crystal Sword)',
    rarity: 'normal',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    stats: { minDmg: 20, maxDmg: 35 },
    value: 1200,
    icon: 'Sword',
    description: '4개의 빈 소켓이 뚫린 명품 도검. [Tal + Thul + Ort + Amn]을 박으면 스피리트(Spirit) 완성!'
  },
  {
    id: 'base_monarch_4s',
    name: '모나크 실드 (4 소켓)',
    baseItemName: '모나크 (Monarch)',
    rarity: 'normal',
    slot: 'shield',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 145 },
    value: 2500,
    icon: 'Shield',
    description: '4개의 빈 소켓이 뚫린 전설의 엘리트 방패. [Tal + Thul + Ort + Amn]을 박으면 스피리트 방패 완성!'
  },
  {
    id: 'base_archon_3s',
    name: '아칸 플레이트 (3 소켓)',
    baseItemName: '아칸 플레이트 (Archon Plate)',
    rarity: 'normal',
    slot: 'armor',
    sockets: 3,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 180 },
    value: 3000,
    icon: 'Shield',
    description: '3개의 소켓이 뚫린 최고급 경량 갑주. [Jah + Ith + Ber]를 박으면 수수께끼(Enigma) 완성!'
  },
  {
    id: 'base_dusk_4s',
    name: '더스크 슈라우드 (4 소켓)',
    baseItemName: '더스크 슈라우드 (Dusk Shroud)',
    rarity: 'normal',
    slot: 'armor',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 165 },
    value: 2800,
    icon: 'Shield',
    description: '4개의 소켓이 뚫린 엘리트 갑옷. [El + Sol + Dol + Lo]를 박으면 인내(Fortitude) 완성!'
  },
  {
    id: 'base_bone_helm_2s',
    name: '본 헬름 (2 소켓)',
    baseItemName: '본 헬름 (Bone Helm)',
    rarity: 'normal',
    slot: 'helm',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 45 },
    value: 900,
    icon: 'HardHat',
    description: '2개의 소켓이 뚫린 해골 투구. [Ort + Sol]을 박으면 전승(Lore) 완성!'
  },
  {
    id: 'base_polearm_4s',
    name: '쓰레셔 (4 소켓)',
    baseItemName: '쓰레셔 (Thresher)',
    rarity: 'normal',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    stats: { minDmg: 40, maxDmg: 85 },
    value: 2000,
    icon: 'Sword',
    description: '4개의 소켓이 뚫린 장병기. [Ral + Tir + Tal + Sol]을 박으면 통찰(Insight) 완성!'
  },

  // Accessories (Amulet, Rings)
  {
    id: 'u_maras',
    name: "마라의 만화경 (Mara's Kaleidoscope)",
    rarity: 'unique',
    slot: 'amulet',
    isIdentified: true,
    stats: { str: 5, dex: 5, con: 5, int: 5, wis: 5, cha: 5, allResist: 30 },
    specialEffect: '모든 스킬 레벨 +2, 모든 능력치 +5, 모든 저항 +30%',
    value: 25000,
    icon: 'CircleDot',
    description: '화려한 빛을 발산하는 디아블로 2 최고의 졸업 목걸이.'
  },
  {
    id: 'u_soj',
    name: '요르단의 반지 (Stone of Jordan - 조던링)',
    rarity: 'unique',
    slot: 'ring1',
    isIdentified: true,
    stats: { int: 10, mana: 80 },
    specialEffect: '모든 스킬 레벨 +1, 최대 마나 +25%, 번개 피해 추가',
    value: 20000,
    icon: 'CircleDot',
    description: '전설적인 화폐이자 스킬 레벨을 올려주는 절대 반지.'
  },
  {
    id: 'u_bk_ring',
    name: "불카토스의 결혼반지 (Bul-Kathos' Wedding Band)",
    rarity: 'unique',
    slot: 'ring2',
    isIdentified: true,
    stats: { hp: 120, lifeSteal: 5 },
    specialEffect: '모든 스킬 레벨 +1, 타격 시 생명력 5% 흡수, 레벨 비례 생명력 증가',
    value: 18000,
    icon: 'CircleDot',
    description: '바바리안의 위대한 시조 불카토스의 결혼반지.'
  },

  // Unique Helms, Armors, Gloves, Boots
  {
    id: 'u_shako',
    name: '할리퀸 관모 (Harlequin Crest - 샤코)',
    rarity: 'unique',
    slot: 'helm',
    isIdentified: true,
    stats: { defense: 120, hp: 100, mana: 100, fortune: 50 },
    specialEffect: '모든 스킬 +2, 물리 피해 감소 10%, 매직 아이템 발견 확률(MF) +50%',
    value: 22000,
    icon: 'HardHat',
    description: '디아블로 2 최고의 만능 국민 투구, 일명 샤코.'
  },
  {
    id: 'u_draculs',
    name: "드라큘의 손아귀 (Dracul's Grasp)",
    rarity: 'unique',
    slot: 'gloves',
    isIdentified: true,
    stats: { defense: 75, str: 15, lifeSteal: 10 },
    specialEffect: '타격 시 5% 확률로 라이프 탭 저주 시전, 상처 악화 25%',
    value: 16000,
    icon: 'Shield',
    description: '피를 갈구하는 뱀파이어의 건틀릿.'
  },
  {
    id: 'u_gore_rider',
    name: '선혈 기수 (Gore Rider - 고어 부츠)',
    rarity: 'unique',
    slot: 'boots',
    isIdentified: true,
    stats: { defense: 85, moveSpeed: 30, critChance: 15 },
    specialEffect: '강타 15%, 치명적 공격 15%, 상처 악화 10%, 이동 속도 +30%',
    value: 15000,
    icon: 'Footprints',
    description: '근접 밀리 캐릭터들의 영원한 최종 부츠.'
  }
];

export const INITIAL_EQUIPMENT: Record<string, GameItem> = {
  weapon: {
    id: 'rw_steel_equipped',
    name: '강철 (Steel)',
    baseItemName: '브로드소드 (Broad Sword)',
    rarity: 'runeword',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: ['Tir', 'El'],
    isRuneWord: true,
    runeWordName: '강철 (Steel)',
    isIdentified: true,
    stats: { minDmg: 55, maxDmg: 82, str: 10, critChance: 10, overkillEfficiency: 20 },
    specialEffect: '공격 속도 +25%, 상처 악화 50%, 처치 시 분노 +2',
    value: 2500,
    icon: 'Sword',
    description: '[룬워드: Tir + El] 베어낼수록 예리함이 살아나는 명검.'
  },
  armor: {
    id: 'rw_stealth_equipped',
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
    count: 8,
    type: 'hp',
    effectValue: 250,
    description: '생명력을 즉시 250 회복합니다.',
    icon: 'Heart',
    hotkey: '1'
  },
  {
    id: 'c_rage',
    name: '활력의 물약 (Rejuvenation)',
    count: 5,
    type: 'rage',
    effectValue: 60,
    description: '분노를 즉시 60 충전합니다.',
    icon: 'Flame',
    hotkey: '2'
  },
  {
    id: 'c_def',
    name: '철갑 영약',
    count: 4,
    type: 'defense',
    effectValue: 70,
    description: '이번 턴 동안 방어력이 +70 증가합니다.',
    icon: 'Shield',
    hotkey: '3'
  },
  {
    id: 'c_overkill',
    name: '질풍의 비약',
    count: 3,
    type: 'overkill',
    effectValue: 40,
    description: '오버킬 피해 전이 효율이 +40% 일시 증가합니다.',
    icon: 'Zap',
    hotkey: '4'
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
      SAMPLE_INVENTORY[1], // Thul
      SAMPLE_INVENTORY[8], // 4소켓 크리스탈소드
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
      SAMPLE_INVENTORY[2], // Ort
      SAMPLE_INVENTORY[3], // Amn
      SAMPLE_INVENTORY[11], // 샤코
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
    name: '인페르노 심연 (Inferno Mine)',
    theme: '용암이 끓어오르는 폐광과 악마 군단',
    recommendedLevel: 30,
    difficulty: '지옥',
    elementalInfo: '화염 면역(100%), 빙결/냉기 피해에 200% 취약',
    monsterSummary: '용암 골렘, 지옥 사냥개, 데몬 로드 (강력한 체인 스토퍼와 광역 폭발)',
    bestClearTime: '06분 15초',
    maxChainRecord: 95,
    dropItems: [
      SAMPLE_INVENTORY[5], // Lo
      SAMPLE_INVENTORY[6], // Ber
      SAMPLE_INVENTORY[7], // Jah
      SAMPLE_INVENTORY[12], // 조던링
    ],
    rooms: [
      { id: 1, type: 'start', title: '용암 갱도 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '작열하는 제련소', cleared: false, current: false, connections: [3], monsterCount: 50 },
      { id: 3, type: 'elite', title: '화염 군주의 제단', cleared: false, current: false, connections: [4], monsterCount: 65 },
      { id: 4, type: 'boss', title: '불지옥의 심장', cleared: false, current: false, connections: [], monsterCount: 100 }
    ]
  }
];
