import { RuneWordRecipe } from '../types/game';

export const RUNEWORD_RECIPES: RuneWordRecipe[] = [
  // --- Early Game (Acts 1-2) ---
  {
    id: 'rw_steel',
    name: '강철 (Steel)',
    requiredRunes: ['Tir', 'El'],
    allowedSlot: 'weapon',
    requiredSockets: 2,
    enhancedDamage: 50,
    bonusStats: { minDmg: 5, maxDmg: 10, attackSpeed: 25, str: 6, critChance: 10, overkillEfficiency: 20 },
    specialEffect: '공격력 +50% 증가, 공격 속도 +25%, 상처 악화, 처치 시 분노 +2',
    description: '[Tir + El] 베이스 공격력 +50%, 공격 속도 +25%! 베어낼수록 예리함이 살아나는 초반 국민 명검.'
  },
  {
    id: 'rw_stealth',
    name: '스텔스 (Stealth)',
    requiredRunes: ['Tal', 'Eth'],
    allowedSlot: 'armor',
    requiredSockets: 2,
    enhancedDefense: 50,
    bonusStats: { defense: 20, attackSpeed: 15, dex: 6, hp: 50, evasion: 8 },
    specialEffect: '방어력 +50%, 공격/이동 속도 +15%, 회피 +8%, 독 저항 +35%',
    description: '[Tal + Eth] 베이스 방어력 +50%! 빠른 기동성과 저항을 제공하는 초반 국민 경량 갑주.'
  },
  {
    id: 'rw_leaf',
    name: '꽃잎 (Leaf)',
    requiredRunes: ['Tir', 'Ral'],
    allowedSlot: 'weapon',
    requiredSockets: 2,
    enhancedDamage: 60,
    bonusStats: { minDmg: 12, maxDmg: 28, int: 8, wis: 8 },
    specialEffect: '화염 피해 대폭 추가, 모든 스킬 위력 +20%, 처치 시 마나/분노 회복',
    description: '[Tir + Ral] 화염 원소 정령이 깃들어 폭발적인 화염 피해를 입히는 초반 마검.'
  },
  {
    id: 'rw_lore',
    name: '전승 (Lore)',
    requiredRunes: ['Ort', 'Sol'],
    allowedSlot: 'helm',
    requiredSockets: 2,
    enhancedDefense: 60,
    bonusStats: { defense: 15, int: 5, wis: 5, damageReduction: 5 },
    specialEffect: '방어력 +60%, 모든 스킬 위력 +15%, 번개 저항 +30%, 물리 피해 감소 5%',
    description: '[Ort + Sol] 베이스 방어력 +60%! 지혜와 원소 저항이 깃든 고대의 투구.'
  },
  {
    id: 'rw_ancients_pledge',
    name: "고대인의 서약 (Ancient's Pledge)",
    requiredRunes: ['Ral', 'Ort', 'Tal'],
    allowedSlot: 'shield',
    requiredSockets: 3,
    enhancedDefense: 80,
    bonusStats: { defense: 30, allResist: 48, evasion: 5 },
    specialEffect: '방어력 +80% 증가, 모든 원소 저항 +48%, 회피율 +5%',
    description: "[Ral + Ort + Tal] 베이스 방어력 +80%! 아리앗 산의 축복이 깃든 견고한 저항 방패."
  },
  {
    id: 'rw_rhyme',
    name: '각운 (Rhyme)',
    requiredRunes: ['Shael', 'Eth'],
    allowedSlot: 'shield',
    requiredSockets: 2,
    enhancedDefense: 60,
    bonusStats: { defense: 25, attackSpeed: 10, evasion: 15, fortune: 25, allResist: 25 },
    specialEffect: '빙결되지 않음(Cannot be Frozen), 회피율 +15%, 매직 찬스(MF) +25%',
    description: '[Shael + Eth] 빙결 면역과 높은 회피율, 매직 찬스를 고루 갖춘 만능 가성비 방패.'
  },

  // --- Mid Game (Acts 2-3) ---
  {
    id: 'rw_spirit',
    name: '스피리트 (Spirit)',
    requiredRunes: ['Tal', 'Thul', 'Ort', 'Amn'],
    allowedSlot: 'weapon',
    requiredSockets: 4,
    enhancedDamage: 70,
    bonusStats: { minDmg: 15, maxDmg: 28, attackSpeed: 25, int: 12, hp: 80, allResist: 30 },
    specialEffect: '공격력 +70%, 공격 속도 +25%, 모든 스킬 위력 +35%, 원소 저항 +30%',
    description: '[Tal + Thul + Ort + Amn] 베이스 공격력 +70%! 사계의 원소 정령이 깃든 국민 만능 명검.'
  },
  {
    id: 'rw_insight',
    name: '통찰 (Insight)',
    requiredRunes: ['Ral', 'Tir', 'Tal', 'Sol'],
    allowedSlot: 'weapon',
    requiredSockets: 4,
    enhancedDamage: 35, // 너프: 순수 딜은 낮추고 명상 오라에 집중
    bonusStats: { minDmg: 10, maxDmg: 20, attackSpeed: 25, critChance: 15 },
    specialEffect: '명상 오라: 매 턴 분노 +20 자동 회복 & 스킬 분노 소모량 25% 감소, 공격 속도 +25%',
    description: '[Ral + Tir + Tal + Sol] [휠윈드/스킬 난사용 유틸 무기] 공격력은 낮으나, 매 턴 분노를 +20씩 자동 충전하고 스킬 분노 소모를 25% 줄여 휠윈드를 무한 난사할 수 있는 최고의 유틸리티 명검.'
  },
  {
    id: 'rw_smoke',
    name: '연기 (Smoke)',
    requiredRunes: ['Nef', 'Lum'],
    allowedSlot: 'armor',
    requiredSockets: 2,
    enhancedDefense: 100,
    bonusStats: { defense: 40, allResist: 50, evasion: 10 },
    specialEffect: '방어력 +100%, 모든 저항 +50%, 원거리 공격 방어력 +50',
    description: '[Nef + Lum] 자욱한 안개로 적의 시야를 흐리고 모든 원소 저항을 +50% 끌어올리는 방어 갑주.'
  },
  {
    id: 'rw_lionheart',
    name: '사자심장 (Lionheart)',
    requiredRunes: ['Hel', 'Lum', 'Fal'],
    allowedSlot: 'armor',
    requiredSockets: 3,
    enhancedDefense: 80,
    bonusStats: { defense: 35, str: 25, dex: 15, con: 20, hp: 110, allResist: 30 },
    specialEffect: '힘 +25, 체력 +20, 민첩 +15, 최대 생명력 +110, 모든 저항 +30%',
    description: '[Hel + Lum + Fal] 착용자에게 사자의 용맹과 막대한 올스탯을 부여하는 균형 잡힌 명품 갑주.'
  },

  // --- Late Game (Acts 3-4) ---
  {
    id: 'rw_obedience',
    name: '순종 (Obedience)',
    requiredRunes: ['Hel', 'Ko', 'Thul', 'Eth', 'Fal'],
    allowedSlot: 'weapon',
    requiredSockets: 5,
    enhancedDamage: 180,
    bonusStats: { minDmg: 45, maxDmg: 90, str: 15, dex: 15, defense: 40, allResist: 25 },
    specialEffect: '강타 40%, 적 방어력 -25%, 화염 피해 +150, 모든 저항 +25%',
    description: '[Hel + Ko + Thul + Eth + Fal] 적을 굴복시키는 무자비한 5룬 결합 대형 무기.'
  },
  {
    id: 'rw_duress',
    name: '협박 (Duress)',
    requiredRunes: ['Shael', 'Um', 'Thul'],
    allowedSlot: 'armor',
    requiredSockets: 3,
    enhancedDefense: 150,
    bonusStats: { defense: 60, attackSpeed: 15, critChance: 15, overkillEfficiency: 30, allResist: 20 },
    specialEffect: '강타 15%, 상처 악화 33%, 공격 속도 +15%, 냉기 피해 추가',
    description: '[Shael + Um + Thul] 공격과 방어를 동시에 극대화하는 광전사용 돌격 갑주.'
  },
  {
    id: 'rw_stone',
    name: '돌 (Stone)',
    requiredRunes: ['Shael', 'Um', 'Pul', 'Lum'],
    allowedSlot: 'armor',
    requiredSockets: 4,
    enhancedDefense: 250,
    bonusStats: { defense: 140, con: 16, str: 16, allResist: 20, damageReduction: 12 },
    specialEffect: '방어력 +250% 초극강 철벽, 타격 회복 속도 대폭 증가, 피해 감소 12%',
    description: '[Shael + Um + Pul + Lum] 바위산과 같은 절대적인 방어력을 자랑하는 철벽 갑옷.'
  },
  {
    id: 'rw_crescent_moon',
    name: '초승달 (Crescent Moon)',
    requiredRunes: ['Shael', 'Um', 'Tir'],
    allowedSlot: 'weapon',
    requiredSockets: 3,
    enhancedDamage: 120,
    bonusStats: { minDmg: 30, maxDmg: 60, attackSpeed: 30, critChance: 15 },
    specialEffect: '타격 시 10% 확률 스태틱 필드(전체 체력 25% 삭감), 적 번개 저항 -35%',
    description: '[Shael + Um + Tir] 번개의 일격을 터뜨려 적 전체의 체력을 순식간에 깎아내는 번개 명검.'
  },

  // --- Endgame & High Torment (Acts 4-5) ---
  {
    id: 'rw_grief',
    name: '슬픔 (Grief)',
    requiredRunes: ['Eth', 'Tir', 'Lo', 'Mal', 'Ral'],
    allowedSlot: 'weapon',
    requiredSockets: 5,
    bonusStats: { minDmg: 240, maxDmg: 360, attackSpeed: 40, critChance: 25, overkillEfficiency: 50 },
    specialEffect: '적 방어력 완전 무시, 치명적 공격 +20%, 공격 속도 +40%, 괴물 회복 저지',
    description: '[Eth + Tir + Lo + Mal + Ral] 근접 물리 딜의 절대 정점. +300급 절대 피해와 극강의 공격 속도를 뿜어냅니다.'
  },
  {
    id: 'rw_fortitude',
    name: '인내 (Fortitude)',
    requiredRunes: ['El', 'Sol', 'Dol', 'Lo'],
    allowedSlot: 'armor',
    requiredSockets: 4,
    enhancedDefense: 200,
    bonusStats: { defense: 80, hp: 160, allResist: 30, damageReduction: 15 },
    specialEffect: '물리 피해량 +200% 증폭, 칠흑 갑주 발동, 생명력 대폭 증가, 모든 저항 +30%',
    description: '[El + Sol + Dol + Lo] 베이스 방어력 +200% & 모든 물리 피해 +200% 증폭! 공방일체의 최고봉 갑주.'
  },
  {
    id: 'rw_enigma',
    name: '수수께끼 (Enigma)',
    requiredRunes: ['Jah', 'Ith', 'Ber'],
    allowedSlot: 'armor',
    requiredSockets: 3,
    bonusStats: { defense: 160, str: 35, hp: 120, fortune: 90, damageReduction: 8 },
    specialEffect: '모든 스킬 +2, 레벨 비례 힘 대폭 상승, MF +90%, 물리 피해 감소 8%',
    description: '[Jah + Ith + Ber] 시공간을 초월하는 전설의 마법 갑주. 막대한 스탯과 매직 파밍의 궁극체.'
  },
  {
    id: 'rw_phoenix',
    name: '불사조 (Phoenix)',
    requiredRunes: ['Vex', 'Vex', 'Lo', 'Jah'],
    allowedSlot: 'shield',
    requiredSockets: 4,
    enhancedDefense: 150,
    bonusStats: { minDmg: 40, maxDmg: 80, defense: 90, hp: 150, allResist: 25 },
    specialEffect: '구원의 오라: 적 처치 시 생명력/분노 100% 즉시 완충, 물리 피해 +150% 증폭',
    description: '[Vex + Vex + Lo + Jah] 쓰러진 적의 영혼을 흡수하여 체력과 분노를 즉시 완충하는 불멸의 성물.'
  },
  {
    id: 'rw_infinity',
    name: '무한 (Infinity)',
    requiredRunes: ['Ber', 'Mal', 'Ber', 'Ist'],
    allowedSlot: 'weapon',
    requiredSockets: 4,
    enhancedDamage: 220,
    bonusStats: { minDmg: 120, maxDmg: 220, attackSpeed: 35, fortune: 50 },
    specialEffect: '선고 오라: 적의 방어력 및 모든 원소 저항 85% 파괴, 강타 40%',
    description: '[Ber + Mal + Ber + Ist] 적의 방어선과 저항을 완전히 붕괴시키는 파멸의 신기.'
  },
  {
    id: 'rw_last_wish',
    name: '마지막 소원 (Last Wish)',
    requiredRunes: ['Jah', 'Mal', 'Jah', 'Sur', 'Jah', 'Ber'],
    allowedSlot: 'weapon',
    requiredSockets: 6,
    enhancedDamage: 280,
    bonusStats: { minDmg: 180, maxDmg: 320, attackSpeed: 30, critChance: 30, fortune: 65 },
    specialEffect: '위세 오라: 아군 전체 공격력 +200%, 강타 70%, 타격 시 생명력 추출',
    description: '[Jah + Mal + Jah + Sur + Jah + Ber] 6개 고급 룬의 정수가 빚어낸 궁극의 축복과 파괴.'
  },
  {
    id: 'rw_botd',
    name: '죽음의 숨결 (Breath of the Dying)',
    requiredRunes: ['Vex', 'Hel', 'El', 'Eld', 'Zod', 'Eth'],
    allowedSlot: 'weapon',
    requiredSockets: 6,
    enhancedDamage: 350,
    bonusStats: { minDmg: 260, maxDmg: 450, attackSpeed: 60, str: 30, dex: 30, con: 30, overkillEfficiency: 60, lifeSteal: 15 },
    specialEffect: '파괴 불가(Indestructible), 공격 속도 +60%, 모든 능력치 +30, 생명력/분노 15% 흡수',
    description: '[Vex + Hel + El + Eld + Zod + Eth] 6개 룬의 궁극 합일, 불멸의 파괴신이 깃든 절대 무기.'
  }
];
