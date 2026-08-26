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
    description: '모든 분노 생성량이 15% 증가(올림 처리)하며, 처치 시 생명력을 추가 흡수합니다.',
    damageBonusPercent: 20,
    overkillBonusPercent: 20,
    specialEffectName: '분노 생성량 +15% 올림 증폭 & 영혼 흡혈',
    color: '#c084fc'
  }
];

export const ALL_AVAILABLE_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    level: 1,
    maxLevel: 20,
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.2,
    overkillEfficiency: 0.50,
    rageGainPerHit: 12,
    route: 'single',
    description: '기본 단일 타격. 명중 시 분노를 +12 획득하며 전방의 적에게 빠른 물리 피해를 입힙니다.',
    icon: 'Swords',
    hotkey: 'Q',
    activeRuneId: 'rune_fire',
    unlockLevel: 1,
    hitCount: 1
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    level: 1,
    maxLevel: 20,
    rageCost: 15,
    manaCost: 0,
    damageMultiplier: 1.6,
    overkillEfficiency: 0.85,
    rageGainPerHit: 4,
    route: 'branch',
    description: '현재 레인과 인접한 좌우 레인(총 3레인)의 최전방 적들을 동시에 베어냅니다. (타격당 분노 +4)',
    icon: 'Zap',
    hotkey: 'W',
    activeRuneId: 'rune_lightning',
    unlockLevel: 2,
    hitCount: 3
  },
  {
    id: 'shield_bash',
    name: '방패 강타 (Shield Bash)',
    level: 1,
    maxLevel: 20,
    rageCost: 10,
    manaCost: 0,
    damageMultiplier: 1.3,
    overkillEfficiency: 0.40,
    rageGainPerHit: 4,
    route: 'single',
    description: '방패로 전방 적을 강타하여 피해를 입히고 자신의 방어력의 100%만큼 보호막(Shield)을 생성합니다. (보스 저지 게이지 250% 파괴)',
    icon: 'Shield',
    hotkey: 'W',
    activeRuneId: 'rune_frost',
    unlockLevel: 5,
    hitCount: 1
  },
  {
    id: 'execute',
    name: '처형 (Execute)',
    level: 1,
    maxLevel: 20,
    rageCost: 20,
    manaCost: 0,
    damageMultiplier: 2.2,
    overkillEfficiency: 0.90,
    rageGainPerHit: 0,
    route: 'single',
    description: '전방 단일 적에게 220%의 파괴적인 일격을 날립니다. 오버킬 발생 시 잉여 데미지의 90%가 후열 적에게 관통 이월됩니다.',
    icon: 'Skull',
    hotkey: 'E',
    activeRuneId: 'rune_poison',
    unlockLevel: 10,
    hitCount: 1
  },
  {
    id: 'whirlwind',
    name: '휠윈드 (Whirlwind)',
    level: 1,
    maxLevel: 20,
    rageCost: 35,
    manaCost: 0,
    damageMultiplier: 1.3,
    overkillEfficiency: 0.80,
    rageGainPerHit: 3,
    route: 'radius',
    description: '무기를 휘두르며 전장의 5개 모든 레인 최전방 적들을 동시에 폭풍처럼 회전 타격합니다. (타격당 분노 +3)',
    icon: 'RotateCw',
    hotkey: 'R',
    activeRuneId: 'rune_fire',
    unlockLevel: 15,
    hitCount: 5
  },
  {
    id: 'berserk',
    name: '광전사의 진노 (Berserk)',
    level: 1,
    maxLevel: 20,
    rageCost: 25,
    manaCost: 0,
    damageMultiplier: 2.8,
    overkillEfficiency: 0.95,
    rageGainPerHit: 0,
    route: 'single',
    description: '자신의 생명력 10%를 희생하여 전방 적에게 280%의 폭발적인 치명타 피해를 입힙니다.',
    icon: 'Flame',
    hotkey: 'E',
    activeRuneId: 'rune_fire',
    unlockLevel: 20,
    hitCount: 1
  },
  {
    id: 'war_cry',
    name: '전장의 함성 (War Cry)',
    level: 1,
    maxLevel: 20,
    rageCost: 10,
    manaCost: 0,
    damageMultiplier: 1.4,
    overkillEfficiency: 0.70,
    rageGainPerHit: 8,
    route: 'radius',
    description: '포효를 내질러 전 레인 적들에게 충격을 주고 타격당 분노 +8을 획득합니다. (분노 소모 10, 최대 3타격 분노 생성)',
    icon: 'Activity',
    hotkey: 'R',
    activeRuneId: 'rune_void',
    unlockLevel: 25,
    hitCount: 5
  }
];

export const WARRIOR_SKILLS: Skill[] = ALL_AVAILABLE_SKILLS;

export const DEFAULT_EQUIPPED_SLOTS: Record<string, string> = {
  Q: 'slash',
  W: 'cleave',
  E: 'execute',
  R: 'whirlwind'
};

export function getSkillById(id: string): Skill | undefined {
  return ALL_AVAILABLE_SKILLS.find(s => s.id === id);
}

export function isSkillUnlocked(skillId: string, playerLevel: number): boolean {
  const s = getSkillById(skillId);
  return s ? playerLevel >= (s.unlockLevel ?? 1) : false;
}

export function getSkillDamageText(
  skill: Skill,
  totalStats?: any,
  level: number = 1,
  runeId?: string | null
): string {
  const rune = SKILL_RUNES_DATA.find(r => r.id === (runeId || skill.activeRuneId));
  const runeBonus = rune?.damageBonusPercent || 0;
  const levelBonus = (level - 1) * 15;
  const baseMult = skill.damageMultiplier || 1.0;
  const totalPercent = Math.round((baseMult * 100) + levelBonus + runeBonus);

  if (totalStats && (totalStats.minDamage || totalStats.maxDamage)) {
    const minD = Math.floor((totalStats.minDamage || 1) * (totalPercent / 100));
    const maxD = Math.floor((totalStats.maxDamage || totalStats.minDamage || 1) * (totalPercent / 100));
    return `${totalPercent}% (${minD}~${maxD})`;
  }

  return `${totalPercent}%`;
}
