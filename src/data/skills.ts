import { Skill, SkillRune } from '../types/game';

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

export const WARRIOR_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    level: 1,
    maxLevel: 10,
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.2,
    overkillEfficiency: 0.50,
    rageGainPerHit: 12,
    route: 'line',
    description: '기본 베기 공격. 자원 소모가 없으며 타격당 분노 +12를 생성하여 처형/휠윈드 스킬을 빌드업합니다.',
    icon: 'Sword',
    hotkey: 'Q',
    activeRuneId: 'rune_fire',
    unlockLevel: 1
  },
  {
    id: 'execute',
    name: '처형 (Execute)',
    level: 1,
    maxLevel: 10,
    rageCost: 30,
    manaCost: 0,
    damageMultiplier: 4.2,
    overkillEfficiency: 0.80,
    lifeStealPercent: 50,
    route: 'single',
    description: '전방 단일 적에게 4.2배수의 치명적 처형 일격을 가하며 체력 50%를 흡혈합니다. 전열 몬스터 격살 시 막대한 오버킬 에너지가 후열 전체를 관통 소탕합니다!',
    icon: 'Skull',
    hotkey: 'W',
    activeRuneId: 'rune_poison',
    unlockLevel: 8
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    level: 1,
    maxLevel: 10,
    rageCost: 10,
    manaCost: 0,
    damageMultiplier: 1.5,
    overkillEfficiency: 0.70,
    rageGainPerHit: 15,
    route: 'branch',
    description: '전방 및 좌우 3개 Lane의 전열을 강타. 명중한 적 1마리당 분노 +15를 생성하여 자원을 급속 충전합니다!',
    icon: 'Zap',
    hotkey: 'E',
    activeRuneId: 'rune_lightning',
    unlockLevel: 16
  },
  {
    id: 'whirlwind',
    name: '휠윈드 (Whirlwind)',
    level: 1,
    maxLevel: 10,
    rageCost: 45,
    manaCost: 0,
    damageMultiplier: 1.1,
    overkillEfficiency: 0.60,
    rageGainPerHit: 0, // 자체 분노 생성 제거 -> 자원 소모형 순수 소탕기! (통찰 무기 착용 시 난사 가능)
    route: 'radius',
    description: '전 레인 2열(10칸)을 휩쓰는 광역 폭풍. 타격 시 자체 분노를 생성하지 않아 자원을 소모하므로, 통찰(Insight) 룬워드를 착용하거나 가르기/휩쓸기와 연계해야 난사할 수 있습니다.',
    icon: 'RotateCw',
    hotkey: 'R',
    activeRuneId: 'rune_frost',
    unlockLevel: 28
  }
];

export function getSkillUnlockLevel(skillId: string): number {
  const skill = WARRIOR_SKILLS.find(s => s.id === skillId);
  return skill?.unlockLevel ?? 1;
}

export function isSkillUnlocked(skillId: string, playerLevel: number): boolean {
  return playerLevel >= getSkillUnlockLevel(skillId);
}
