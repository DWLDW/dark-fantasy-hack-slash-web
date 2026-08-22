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

// 3. Diverse Skill Runes Catalog (Elements & Distinct Playstyle Modifiers)
export const SKILL_RUNES_DATA: SkillRune[] = [
  {
    id: 'rune_fire',
    name: '지옥불 폭발 (Hellfire)',
    element: 'fire',
    description: '오버킬 발생 시 주변에 화염 연쇄 폭발을 일으켜 파괴력을 극대화합니다.',
    damageBonusPercent: 25,
    overkillBonusPercent: 30,
    specialEffectName: '화염 연쇄 폭발 (+25% 피해 / +30% 오버킬)',
    color: '#ef4444'
  },
  {
    id: 'rune_frost',
    name: '서리 분쇄 (Frost Shatter)',
    element: 'cold',
    description: '명중한 적을 40% 확률로 빙결시켜 다음 턴 행동을 완전히 무력화합니다.',
    damageBonusPercent: 15,
    overkillBonusPercent: 20,
    specialEffectName: '명중 시 40% 확률 적 행동불가(빙결)',
    color: '#38bdf8'
  },
  {
    id: 'rune_lightning',
    name: '연쇄 번개 (Chain Lightning)',
    element: 'lightning',
    description: '치명타 확률이 +25% 대폭 증가하고, 치명타 폭발 시 강력한 번개가 방전됩니다.',
    damageBonusPercent: 20,
    overkillBonusPercent: 20,
    specialEffectName: '치명타 확률 +25% 대폭 증가',
    color: '#fbbf24'
  },
  {
    id: 'rune_poison',
    name: '맹독 학살 (Venom Slaughter)',
    element: 'poison',
    description: '적의 방어력을 50% 깎아내려(Armor Shred) 단단한 엘리트 저지선을 무력화합니다.',
    damageBonusPercent: 15,
    overkillBonusPercent: 25,
    specialEffectName: '적 방어력 50% 관통 및 감소',
    color: '#4ade80'
  },
  {
    id: 'rune_void',
    name: '공허 영혼흡수 (Void Devour)',
    element: 'void',
    description: '모든 분노 생성량이 20% 증가(올림 처리)하며, 처치 시 생명력을 추가 흡수합니다.',
    damageBonusPercent: 20,
    overkillBonusPercent: 20,
    specialEffectName: '분노 생성량 +20% 올림 증폭 & 영혼 흡혈',
    color: '#c084fc'
  }
];

// 5. Comprehensive Item Pool Categorized by Progression (Early, Mid, Late Game)
export const GAME_ITEMS_POOL: GameItem[] = [
  // --- ACT 1: Early Game Items (Normal Tier, Magic, Early Unique) ---
  {
    id: 'e_short_sword_2s',
    name: '숏소드 (2 소켓)',
    baseItemName: '숏소드 (Short Sword)',
    rarity: 'normal',
    tier: 'normal',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 65,
    stats: { minDmg: 3, maxDmg: 7, attackSpeed: 10 },
    value: 150,
    icon: 'Sword',
    description: '[노말 도검 / 빠른 공속] 2개의 빈 소켓. [Tir + El]을 박으면 초반 국민 룬워드 강철(Steel) 완성!'
  },
  {
    id: 'e_scimitar_2s',
    name: '시미터 (2 소켓)',
    baseItemName: '시미터 (Scimitar)',
    rarity: 'normal',
    tier: 'normal',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'very_fast',
    baseAtbPercent: 75,
    stats: { minDmg: 2, maxDmg: 6, attackSpeed: 20 },
    value: 180,
    icon: 'Sword',
    description: '[노말 도검 / 매우 빠른 공속] 날렵한 곡도로 시작 ATB 게이지가 75%에서 출발합니다.'
  },
  {
    id: 'e_studded_leather',
    name: '징박힌 가죽 갑옷',
    baseItemName: '가죽 갑옷 (Studded Leather)',
    rarity: 'magic',
    tier: 'normal',
    slot: 'armor',
    isIdentified: false,
    stats: { defense: 35, evasion: 5, hp: 20 },
    value: 200,
    icon: 'Shield',
    description: '단단한 쇠못이 박혀 방어력 +35와 회피율 +5%를 제공하는 경량 갑옷.'
  },
  {
    id: 'e_nagelring',
    name: '나겔링 (Nagelring)',
    rarity: 'unique',
    slot: 'ring1',
    isIdentified: false,
    stats: { fortune: 30, str: 2, damageReduction: 3 },
    specialEffect: '매직 아이템 발견율(Fortune) +30%, 받는 물리 피해 -3',
    value: 800,
    icon: 'CircleDot',
    description: '황금빛으로 반짝이는 고대 행운의 반지. 전리품 파밍을 시작하는 전사의 필수품.'
  },
  {
    id: 'e_gull_dagger',
    name: '갈매기 단검 (Gull Dagger)',
    rarity: 'unique',
    tier: 'normal',
    slot: 'weapon',
    isIdentified: false,
    speedCategory: 'very_fast',
    baseAtbPercent: 75,
    stats: { minDmg: 1, maxDmg: 15, fortune: 50 },
    specialEffect: '매직 아이템 발견율 +50%, 매우 빠른 공격 속도',
    value: 1200,
    icon: 'Sword',
    description: '보물 사냥꾼들이 목숨을 걸고 찾아 헤매던 황금 보물 단검.'
  },
  {
    id: 'e_sigon_shield',
    name: "시곤의 수호방패 (Sigon's Guard)",
    rarity: 'set',
    tier: 'normal',
    slot: 'shield',
    isIdentified: false,
    stats: { defense: 45, evasion: 10, allResist: 10 },
    specialEffect: '모든 스킬 레벨 +1, 방어 블록/회피율 +10%',
    value: 650,
    icon: 'Shield',
    description: '고대 시곤 기사단의 성스러운 철벽 방패.'
  },
  {
    id: 'e_cap_2s',
    name: '가죽 모자 (2 소켓)',
    baseItemName: '가죽 모자 (Cap)',
    rarity: 'normal',
    tier: 'normal',
    slot: 'helm',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 12, evasion: 3 },
    value: 120,
    icon: 'HardHat',
    description: '2개의 소켓이 뚫린 가죽 모자. [Nef + Tir]을 박으면 천저(Nadir) 완성!'
  },
  {
    id: 'e_bloodfist',
    name: '블러드피스트 (Bloodfist)',
    rarity: 'unique',
    tier: 'normal',
    slot: 'gloves',
    isIdentified: false,
    stats: { defense: 18, hp: 40, attackSpeed: 10 },
    specialEffect: '공격 속도 +10%, 최소 대미지 +5, 최대 생명력 +40',
    value: 500,
    icon: 'Shield',
    description: '피로 물든 투사의 가죽 장갑.'
  },

  // --- ACT 2 & 3: Mid Game Items (Exceptional Tier, Socket Bases & Strong Uniques) ---
  {
    id: 'm_cs_4s',
    name: '크리스탈 소드 (4 소켓)',
    baseItemName: '크리스탈 소드 (Crystal Sword)',
    rarity: 'normal',
    tier: 'normal',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'normal',
    baseAtbPercent: 50,
    stats: { minDmg: 5, maxDmg: 15 },
    value: 1200,
    icon: 'Sword',
    description: '[노말 도검 / 보통 공속] 4소켓 명품 베이스. [Tal + Thul + Ort + Amn]으로 영혼(Spirit) 제작!'
  },
  {
    id: 'm_flail_4s',
    name: '프레일 (4 소켓)',
    baseItemName: '프레일 (Flail)',
    rarity: 'normal',
    tier: 'normal',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'very_fast',
    baseAtbPercent: 75,
    stats: { minDmg: 1, maxDmg: 24, attackSpeed: 15 },
    value: 1400,
    icon: 'Sword',
    description: '[노말 철퇴 / 매우 빠른 공속] 4개의 빈 소켓. 오크의 심장(HOTO) 베이스.'
  },
  {
    id: 'm_rune_sword_4s',
    name: '룬 소드 (4 소켓)',
    baseItemName: '룬 소드 (Rune Sword)',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 65,
    stats: { minDmg: 21, maxDmg: 45 },
    value: 2400,
    icon: 'Sword',
    description: '[익셉셔널 도검 / 빠른 공속] 기본 공격력이 대폭 향상된 4소켓 중급 도검.'
  },
  {
    id: 'm_thresher_4s',
    name: '쓰레셔 폴암 (4 소켓)',
    baseItemName: '쓰레셔 (Thresher)',
    rarity: 'normal',
    tier: 'elite',
    slot: 'weapon',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'fast',
    baseAtbPercent: 65,
    stats: { minDmg: 12, maxDmg: 141 },
    value: 3500,
    icon: 'Sword',
    description: '[엘리트 장병기 / 빠른 공속] 4개의 빈 소켓. [Ral + Tir + Tal + Sol]을 박으면 통찰(Insight) 완성!'
  },
  {
    id: 'm_vipermagi',
    name: '독사마술사의 가죽 (Skin of the Vipermagi)',
    rarity: 'unique',
    tier: 'exceptional',
    slot: 'armor',
    isIdentified: false,
    stats: { defense: 110, evasion: 8, allResist: 25, damageReduction: 10 },
    specialEffect: '모든 스킬 레벨 +1, 시전 속도 +30%, 모든 저항 +25%, 물리 피해 감소 10%',
    value: 2200,
    icon: 'Shield',
    description: '푸른 뱀 가죽으로 제작된 마도사의 명품 로브.'
  },
  {
    id: 'm_waterwalk',
    name: '물나그네 부츠 (Waterwalk)',
    rarity: 'unique',
    tier: 'exceptional',
    slot: 'boots',
    isIdentified: false,
    stats: { defense: 65, evasion: 15, hp: 60, dex: 15 },
    specialEffect: '회피율 +15%, 원거리 방어 +100, 최대 생명력 +60',
    value: 1500,
    icon: 'Footprints',
    description: '물 위를 걷는 듯 가벼운 고대 상어 가죽 부츠.'
  },
  {
    id: 'm_bone_helm_2s',
    name: '본 헬름 (2 소켓)',
    baseItemName: '본 헬름 (Bone Helm)',
    rarity: 'normal',
    tier: 'exceptional',
    slot: 'helm',
    sockets: 2,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 45, evasion: 5 },
    value: 900,
    icon: 'HardHat',
    description: '2개의 소켓이 뚫린 해골 투구. [Ort + Sol]을 박으면 전승(Lore) 완성!'
  },

  // --- ACT 4 & 5: End Game Items (Elite Tier Sockets, Mythic Uniques) ---
  {
    id: 'u_pb_5s',
    name: '페이즈 블레이드 (5 소켓)',
    baseItemName: '페이즈 블레이드 (Phase Blade)',
    rarity: 'normal',
    tier: 'elite',
    slot: 'weapon',
    sockets: 5,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'very_fast',
    baseAtbPercent: 80,
    stats: { minDmg: 31, maxDmg: 35, attackSpeed: 30 },
    value: 4500,
    icon: 'Sword',
    description: '[엘리트 도검 / 최고속 WSM -30] 파괴 불가 광선검. [Eth + Tir + Lo + Mal + Ral]로 깊은 고뇌(Grief) 완성!'
  },
  {
    id: 'u_colossus_blade',
    name: '콜로서스 블레이드 (6 소켓)',
    baseItemName: '콜로서스 블레이드 (Colossus Blade)',
    rarity: 'normal',
    tier: 'elite',
    slot: 'weapon',
    sockets: 6,
    socketedRunes: [],
    isIdentified: true,
    speedCategory: 'slow',
    baseAtbPercent: 35,
    stats: { minDmg: 25, maxDmg: 65 },
    value: 5500,
    icon: 'Sword',
    description: '[엘리트 대검 / 묵직한 한방] 압도적인 파괴력의 6소켓 대검. 죽어가는 자의 숨결(BotD) 베이스.'
  },
  {
    id: 'u_shako',
    name: '할리퀸 관모 (Harlequin Crest Shako)',
    rarity: 'unique',
    tier: 'elite',
    slot: 'helm',
    isIdentified: false,
    stats: { defense: 140, hp: 80, str: 2, dex: 2, con: 2, int: 2, fortune: 50, damageReduction: 10 },
    specialEffect: '모든 스킬 레벨 +2, 받는 물리 피해 10% 감소, 매직 아이템 발견율 +50%',
    value: 8500,
    icon: 'HardHat',
    description: '녹색으로 빛나는 전설의 가죽 모자. 모든 영웅들이 갈망하는 지고의 투구.'
  },
  {
    id: 'u_maras',
    name: "마라의 만화경 (Mara's Kaleidoscope)",
    rarity: 'unique',
    slot: 'amulet',
    isIdentified: false,
    stats: { str: 5, dex: 5, con: 5, int: 5, wis: 5, cha: 5, allResist: 30 },
    specialEffect: '모든 스킬 레벨 +2, 모든 능력치 +5, 모든 저항 +30%',
    value: 7800,
    icon: 'Sparkles',
    description: '다채로운 무지갯빛 마력이 소용돌이치는 최상급 고대 목걸이.'
  },
  {
    id: 'u_soj',
    name: '요르단의 반지 (Stone of Jordan)',
    rarity: 'unique',
    slot: 'ring1',
    isIdentified: false,
    stats: { minDmg: 5, maxDmg: 15, int: 10 },
    specialEffect: '모든 스킬 레벨 +1, 최대 분노/마나 +25%, 번개 피해 1~12 추가',
    value: 9900,
    icon: 'CircleDot',
    description: '성역의 역사에서 가장 귀중하고 유명한 전설의 반지.'
  },
  {
    id: 'u_bulkathos',
    name: '불카토스의 결혼반지 (Bul-Kathos)',
    rarity: 'unique',
    slot: 'ring2',
    isIdentified: false,
    stats: { hp: 50, str: 5 },
    specialEffect: '모든 스킬 레벨 +1, 생명력 흡수 +5%, 레벨당 생명력 증가',
    value: 8200,
    icon: 'CircleDot',
    description: '야만용사의 시조 불카토스가 착용했던 피의 힘이 깃든 반지.'
  },
  {
    id: 'u_monarch_4s',
    name: '엘리트 모나크 (4 소켓)',
    baseItemName: '모나크 (Monarch)',
    rarity: 'normal',
    tier: 'elite',
    slot: 'shield',
    sockets: 4,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 148, evasion: 15 },
    value: 3500,
    icon: 'Shield',
    description: '4개의 빈 소켓이 뚫린 최고급 방패. [Tal + Thul + Ort + Amn]으로 영혼 방패 제작 가능!'
  },
  {
    id: 'u_archon_3s',
    name: '아칸 플레이트 (3 소켓)',
    baseItemName: '아칸 플레이트 (Archon Plate)',
    rarity: 'normal',
    tier: 'elite',
    slot: 'armor',
    sockets: 3,
    socketedRunes: [],
    isIdentified: true,
    stats: { defense: 185, evasion: 10 },
    value: 4500,
    icon: 'Shield',
    description: '3개의 소켓이 뚫린 최고급 경량 갑주. [Jah + Ith + Ber]를 박으면 수수께끼(Enigma) 완성!'
  },
  {
    id: 'u_draculs',
    name: "드라큘의 손아귀 (Dracul's Grasp)",
    rarity: 'unique',
    tier: 'elite',
    slot: 'gloves',
    isIdentified: false,
    stats: { defense: 125, str: 15, evasion: 5 },
    specialEffect: '타격 시 5% 확률로 생명력 추출(Life Tap) 발동, 공격 명중 시 생명력 10% 흡수',
    value: 6500,
    icon: 'Shield',
    description: '흡혈귀의 저주가 깃들어 적의 피를 빨아들이는 뱀파이어 건틀릿.'
  },
  {
    id: 'u_gorerider',
    name: '고어 라이더 (Gore Rider)',
    rarity: 'unique',
    tier: 'elite',
    slot: 'boots',
    isIdentified: false,
    stats: { defense: 140, evasion: 8 },
    specialEffect: '치명타 확률 +15%, 강타 확률 +15%, 상처 악화 +10%',
    value: 6200,
    icon: 'Footprints',
    description: '적의 뼈와 살을 짓이기며 전장을 질주하는 광전사의 군화.'
  }
];

// Initial Starting Inventory
export const SAMPLE_INVENTORY: GameItem[] = GAME_ITEMS_POOL.slice(0, 10);

// 4. Balanced Warrior Skills (Nerfed Q, Heavily Buffed Rage Skills W, E, R)
export const WARRIOR_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    level: 1,
    maxLevel: 10,
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.0,
    overkillEfficiency: 0.45,
    rageGainPerHit: 0,
    route: 'line',
    description: '기본 직선 베기. 자원을 소모하지 않으며, 전열의 약한 적 1~2마리를 정리하는 데 적합합니다.',
    icon: 'Sword',
    hotkey: 'Q',
    activeRuneId: 'rune_fire'
  },
  {
    id: 'execute',
    name: '처형 (Execute)',
    level: 1,
    maxLevel: 10,
    rageCost: 30, // 분노 30 유지
    manaCost: 0,
    damageMultiplier: 8.5, // 2배 이상 상향! (단일 극딜 파쇄기)
    overkillEfficiency: 0.85,
    lifeStealPercent: 50, // 가한 피해의 50% HP 즉시 흡수!
    route: 'single',
    description: '단일 대상에게 괴멸적인 타격(x8.5)! 가한 피해의 50%를 생명력으로 즉시 흡수하여 위기를 탈출합니다.',
    icon: 'Skull',
    hotkey: 'W',
    activeRuneId: 'rune_poison'
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    level: 1,
    maxLevel: 10,
    rageCost: 10, // 분노 소모 10으로 대폭 감소
    manaCost: 0,
    damageMultiplier: 1.5,
    overkillEfficiency: 0.70,
    rageGainPerHit: 15, // 명중 1마리당 분노 +15 생성 (3마리 적중 시 분노 +45 생성 -> 순수 +35 충전!)
    route: 'branch',
    description: '전방 및 좌우 3개 Lane의 전열을 강타. 명중한 적 1마리당 분노 +15를 생성하여 자원을 급속 충전합니다!',
    icon: 'Zap',
    hotkey: 'E',
    activeRuneId: 'rune_lightning'
  },
  {
    id: 'whirlwind',
    name: '휠윈드 (Whirlwind)',
    level: 1,
    maxLevel: 10,
    rageCost: 50,
    manaCost: 0,
    damageMultiplier: 0.85, // 넓은 범위에 약한 다단히트 광역기
    overkillEfficiency: 0.50,
    rageGainPerHit: 2, // 기본 타격 명중당 분노 +2 환급 (오버킬 대상은 분노 제외)
    route: 'radius',
    description: '전 레인 2열(10칸)을 휩쓰는 광역 다단 폭풍. 1회 타격 위력은 낮으나 넓은 범위를 긁어냅니다.',
    icon: 'RotateCw',
    hotkey: 'R',
    activeRuneId: 'rune_frost'
  }
];

// 6. Initial Consumables
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

export const INITIAL_EQUIPMENT: Record<string, GameItem> = {
  weapon: {
    id: 'rw_steel_equipped',
    name: '강철 (Steel)',
    baseItemName: '숏소드 (Short Sword)',
    rarity: 'runeword',
    slot: 'weapon',
    sockets: 2,
    socketedRunes: ['Tir', 'El'],
    isRuneWord: true,
    runeWordName: '강철 (Steel)',
    isIdentified: true,
    stats: { minDmg: 35, maxDmg: 58, str: 6, critChance: 10 },
    specialEffect: '공격 속도 +25%, 상처 악화 50%, 처치 시 분노 +2',
    value: 1500,
    icon: 'Sword',
    description: '[룬워드: Tir + El] 베어낼수록 예리함이 살아나는 초반 명검.'
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
    stats: { defense: 58, dex: 6, hp: 40 },
    specialEffect: '이동 속도 +25%, 분노 재생 +15%, 독 저항 +30%',
    value: 1200,
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
    stats: { defense: 18 },
    value: 250,
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
    stats: { defense: 42 },
    value: 400,
    icon: 'Shield',
    description: '[소켓 2/3 장착됨: Ral, Ort] 룬 1개를 추가로 박으면 룬워드 완성 가능!'
  },
  ring1: {
    id: 'r_nagel',
    name: '나겔링 (Nagelring)',
    rarity: 'unique',
    slot: 'ring1',
    isIdentified: true,
    stats: { fortune: 30, str: 2 },
    specialEffect: '매직 아이템 발견율(Fortune) +30%, 피격 피해 -3',
    value: 800,
    icon: 'CircleDot',
    description: '황금빛으로 반짝이는 고대 행운의 반지.'
  }
};

// 7. 5 Thematic Dungeons (Acts 1 to 5 with Scaled Difficulty & High-Tier Rune/Item Drops)
export const DUNGEONS_DATA: DungeonInfo[] = [
  {
    id: 'act1_crypt',
    name: '1막: 핏빛 황야와 지하묘지 (Crypt & Blood Moor)',
    theme: '피로 물든 황야와 고대 언데드 납골당',
    recommendedLevel: 5,
    difficulty: '쉬움',
    elementalInfo: '물리 취약, 관통 공격에 극도로 취약',
    monsterSummary: '고블린 척탄병, 해골 궁수, 썩은 좀비 떼, 오크 집행관',
    bestClearTime: '01분 45초',
    maxChainRecord: 30,
    dropItems: [
      GAME_ITEMS_POOL[0], // 강철 숏소드 2s
      GAME_ITEMS_POOL[1], // 징박힌 가죽 갑옷
      GAME_ITEMS_POOL[2], // 나겔링
      GAME_ITEMS_POOL[3], // 갈매기 단검
      GAME_ITEMS_POOL[5], // 가죽 모자 2s
      GAME_ITEMS_POOL[6], // 블러드피스트
    ],
    rooms: [
      { id: 1, type: 'start', title: '황야의 야영지', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '핏빛 동굴 통로', cleared: true, current: false, connections: [3, 4], monsterCount: 30 },
      { id: 3, type: 'treasure', title: '숨겨진 룬 궤짝', cleared: false, current: false, connections: [5], rewardDesc: '기본 룬(El~Ort) 및 골드' },
      { id: 4, type: 'elite', title: '묘지기 오크의 석실', cleared: false, current: true, connections: [5], monsterCount: 30, rewardDesc: '오크 집행관 (나겔링/소켓 드랍)' },
      { id: 5, type: 'rune', title: '고대 제단', cleared: false, current: false, connections: [6], rewardDesc: 'Tal / Ral 룬 제단' },
      { id: 6, type: 'boss', title: '지하묘지 심연', cleared: false, current: false, connections: [], monsterCount: 30, rewardDesc: '보스: 언데드 대장 (유니크 장비 확정)' }
    ]
  },
  {
    id: 'act2_tomb',
    name: '2막: 메마른 사막의 고대 묘실 (Lut Gholein Tomb)',
    theme: '작열하는 사막 지하의 비밀 왕실 무덤',
    recommendedLevel: 15,
    difficulty: '보통',
    elementalInfo: '독/암흑 저항 30%, 번개 및 빙결 공격에 취약',
    monsterSummary: '사막 전갈, 미이라 고위 사제, 모래 메뚜기 떼, 고대 무덤 수호자',
    bestClearTime: '03분 10초',
    maxChainRecord: 55,
    dropItems: [
      GAME_ITEMS_POOL[4], // 시곤 방패
      GAME_ITEMS_POOL[7], // 크리스탈 소드 4s
      GAME_ITEMS_POOL[8], // 쓰레셔 4s
      GAME_ITEMS_POOL[10], // 물나그네 부츠
      GAME_ITEMS_POOL[11], // 본 헬름 2s
    ],
    rooms: [
      { id: 1, type: 'start', title: '오아시스 지하 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '모래 바람의 회랑', cleared: false, current: false, connections: [3, 4], monsterCount: 30 },
      { id: 3, type: 'shrine', title: '태양의 성소', cleared: false, current: false, connections: [5], rewardDesc: '매직 찬스 +35% 버프' },
      { id: 4, type: 'elite', title: '미이라 제사장의 방', cleared: false, current: false, connections: [5], monsterCount: 30, rewardDesc: '중급 룬(Thul~Lem) 드랍' },
      { id: 5, type: 'treasure', title: '파라오의 황금 묘실', cleared: false, current: false, connections: [6], rewardDesc: '크리스탈소드 4s & 탈라샤 룬' },
      { id: 6, type: 'boss', title: '두리엘의 얼어붙은 방', cleared: false, current: false, connections: [], monsterCount: 30, rewardDesc: '보스 두리엘 (4소켓 장비 & 유니크)' }
    ]
  },
  {
    id: 'act3_jungle',
    name: '3막: 쿠라스트 부패 밀림 (Kurast Jungle)',
    theme: '독기와 안개가 자욱한 늪지 사원과 증오의 신전',
    recommendedLevel: 28,
    difficulty: '어려움',
    elementalInfo: '독 면역(80%), 화염 및 관통 피해에 150% 취약',
    monsterSummary: '자카룸 광신도, 부패의 주술사, 늪지대 히드라, 정글 파괴자',
    bestClearTime: '04분 50초',
    maxChainRecord: 75,
    dropItems: [
      GAME_ITEMS_POOL[9], // 구교복
      GAME_ITEMS_POOL[11], // 본 헬름 2s
      GAME_ITEMS_POOL[16], // 모나크 4s
      GAME_ITEMS_POOL[17], // 아칸 플레이트 3s
    ],
    rooms: [
      { id: 1, type: 'start', title: '부두 거점 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '거미 숲 통로', cleared: false, current: false, connections: [3], monsterCount: 30 },
      { id: 3, type: 'elite', title: '자카룸 광신도 소굴', cleared: false, current: false, connections: [4, 5], monsterCount: 30 },
      { id: 4, type: 'rune', title: '증오의 제단', cleared: false, current: false, connections: [6], rewardDesc: '상급 룬(Hel~Ist) 드랍' },
      { id: 5, type: 'treasure', title: '쿠라스트 보물 수장고', cleared: false, current: false, connections: [6], rewardDesc: '모나크 4소켓 & 구교복' },
      { id: 6, type: 'boss', title: '메피스토의 증오의 신전', cleared: false, current: false, connections: [], monsterCount: 30, rewardDesc: '보스 메피스토 (최상급 룬워드 베이스)' }
    ]
  },
  {
    id: 'act4_chaos',
    name: '4막: 혼돈의 성역 (Chaos Sanctuary)',
    theme: '용암과 지옥의 화염이 타오르는 디아블로의 본거지',
    recommendedLevel: 40,
    difficulty: '지옥',
    elementalInfo: '화염 저항 90%, 냉기 및 맹독 방어력 분쇄에 취약',
    monsterSummary: '망각의 기사단, 화염 군주, 베놈 로드, 카오스 집행관',
    bestClearTime: '06분 20초',
    maxChainRecord: 90,
    dropItems: [
      GAME_ITEMS_POOL[12], // 할리퀸 샤코
      GAME_ITEMS_POOL[14], // 조던링
      GAME_ITEMS_POOL[18], // 드라큘의 손아귀
      GAME_ITEMS_POOL[19], // 고어 라이더
    ],
    rooms: [
      { id: 1, type: 'start', title: '지옥불 평원 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '절망의 평원', cleared: false, current: false, connections: [3], monsterCount: 30 },
      { id: 3, type: 'elite', title: '영혼의 강 봉인석', cleared: false, current: false, connections: [4, 5], monsterCount: 30 },
      { id: 4, type: 'rune', title: '화염 군주의 제단', cleared: false, current: false, connections: [6], rewardDesc: '고급 룬(Gul~Sur) 드랍' },
      { id: 5, type: 'treasure', title: '혼돈의 보물고', cleared: false, current: false, connections: [6], rewardDesc: '샤코 & 조던링 드랍' },
      { id: 6, type: 'boss', title: '디아블로의 옥좌', cleared: false, current: false, connections: [], monsterCount: 30, rewardDesc: '공포의 군주 디아블로 (종결 전설 확정)' }
    ]
  },
  {
    id: 'act5_worldstone',
    name: '5막: 세계석 성채 (Worldstone Keep)',
    theme: '성역의 운명이 걸린 아리앗 산 정상의 신화적 성채',
    recommendedLevel: 55,
    difficulty: '지옥',
    elementalInfo: '전 속성 복합 저항 50%, 강력한 치명타와 흡혈 빌드 필요',
    monsterSummary: '죽음의 군주(Death Lord), 피의 유혹자, 지옥의 바알 분신, 불멸의 수호신',
    bestClearTime: '08분 45초',
    maxChainRecord: 120,
    dropItems: [
      GAME_ITEMS_POOL[12], // 샤코
      GAME_ITEMS_POOL[13], // 마라의 만화경
      GAME_ITEMS_POOL[14], // 조던링
      GAME_ITEMS_POOL[15], // 불카토스 링
      GAME_ITEMS_POOL[17], // 아칸 플레이트 3s
      GAME_ITEMS_POOL[19], // 고어 라이더
    ],
    rooms: [
      { id: 1, type: 'start', title: '아리앗 산 정상 성채 입구', cleared: true, current: false, connections: [2] },
      { id: 2, type: 'normal', title: '세계석 성채 1층', cleared: false, current: false, connections: [3], monsterCount: 30 },
      { id: 3, type: 'elite', title: '고대 야만용사 3인의 시험', cleared: false, current: false, connections: [4, 5], monsterCount: 30 },
      { id: 4, type: 'rune', title: '파괴의 룬 성소', cleared: false, current: false, connections: [6], rewardDesc: '최상급 룬(Ber / Jah / Zod) 드랍' },
      { id: 5, type: 'treasure', title: '세계석 심연 보물고', cleared: false, current: false, connections: [6], rewardDesc: '마라의 만화경 & 불카토스 링' },
      { id: 6, type: 'boss', title: '파괴의 군주 바알의 알현실', cleared: false, current: false, connections: [], monsterCount: 30, rewardDesc: '파괴의 군주 바알 (신화 아이템 확정 드랍)' }
    ]
  }
];

// 8. Dynamic Formation Factory per Dungeon and Room with Distinct Monster Visuals
export function createDungeonFormation(dungeonId = 'act1_crypt', roomId = 4): Monster[] {
  const monsters: Monster[] = [];
  let idCounter = 1;

  // Dungeon Difficulty Scaling
  let baseHp = 28;
  let baseDef = 4;
  let eliteHp = 200;
  let eliteDef = 25;
  let eliteTitle = '오크 집행관 [ELITE]';
  let normalName1 = '고블린 전사';
  let normalName2 = '해골 궁수';
  let shieldName = '오크 방패병';

  if (dungeonId === 'act2_tomb') {
    baseHp = 60;
    baseDef = 12;
    eliteHp = 420;
    eliteDef = 35;
    eliteTitle = '고대 무덤 수호자 [ELITE]';
    normalName1 = '사막 전갈';
    normalName2 = '미이라 사제';
    shieldName = '석관 방패병';
  } else if (dungeonId === 'act3_jungle') {
    baseHp = 130;
    baseDef = 22;
    eliteHp = 800;
    eliteDef = 50;
    eliteTitle = '자카룸 하이 프리스트 [ELITE]';
    normalName1 = '광신도 척살병';
    normalName2 = '정글 주술사';
    shieldName = '성전사 방패병';
  } else if (dungeonId === 'act4_chaos') {
    baseHp = 260;
    baseDef = 38;
    eliteHp = 1600;
    eliteDef = 70;
    eliteTitle = '카오스 집행관 [ELITE]';
    normalName1 = '망각의 기사';
    normalName2 = '베놈 로드';
    shieldName = '지옥불 방패병';
  } else if (dungeonId === 'act5_worldstone') {
    baseHp = 520;
    baseDef = 55;
    eliteHp = 3000;
    eliteDef = 95;
    eliteTitle = '죽음의 군주 (Death Lord) [ELITE]';
    normalName1 = '피의 유혹자';
    normalName2 = '바알의 파괴자';
    shieldName = '성채 철벽 수호병';
  }

  // 5 Lanes x 6 Depths = Exactly 30 Monsters
  for (let l = 0; l < 5; l++) {
    for (let d = 0; d < 6; d++) {
      const isEliteStopper = l === 2 && d === 1; // Lane 2 Depth 1 is Elite Anchor
      const isFrontShield = d === 0 && (l === 1 || l === 2 || l === 3);

      let hp = Math.floor(baseHp + Math.random() * (baseHp * 0.4));
      let def = baseDef;
      let rank: 'normal' | 'elite' = 'normal';
      let name = d % 2 === 0 ? normalName1 : normalName2;
      let icon = 'Sword';

      if (isEliteStopper) {
        hp = eliteHp;
        def = eliteDef;
        rank = 'elite';
        name = eliteTitle;
        icon = 'Crown';
      } else if (isFrontShield) {
        hp = Math.floor(baseHp * 1.8);
        def = Math.floor(baseDef * 2.2);
        name = shieldName;
        icon = 'Shield';
      } else if (d >= 2) {
        // Back rows are squishier for chain overkill thrills
        hp = Math.max(15, Math.floor(baseHp * 0.75));
        def = Math.max(2, Math.floor(baseDef * 0.5));
      }

      monsters.push({
        id: `m_${dungeonId}_r${roomId}_${l}_${d}_${idCounter++}`,
        name,
        hp,
        maxHp: hp,
        defense: def,
        rank,
        lane: l,
        depth: d,
        intent: {
          type: 'attack',
          damage: isEliteStopper ? Math.floor(baseHp * 0.6) : Math.floor(baseHp * 0.25) + 8,
          targetLane: l
        },
        icon
      });
    }
  }

  return monsters;
}

// Fallback compatibility factory for goblin 30 formation
export function createGoblin30Formation(): Monster[] {
  return createDungeonFormation('act1_crypt', 4);
}

