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

export const ALL_AVAILABLE_SKILLS: Skill[] = [
  {
    id: 'slash',
    name: '가르기 (Slash)',
    level: 1,
    maxLevel: 10,
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.2,
    overkillEfficiency: 0.50,
    rageGainPerHit: 15,
    route: 'line',
    description: '기본 공격. 자원 소모가 없으며 타격당 분노 +15를 생성하여 처형/휩쓸기/휠윈드 스킬을 빌드업합니다.',
    icon: 'Sword',
    hotkey: 'Q',
    activeRuneId: 'rune_fire',
    unlockLevel: 1,
    hitCount: 1
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
    route: 'single',
    description: '전방 단일 적에게 4.2배수의 치명적 처형 일격을 가합니다. 처형으로 적 격살 시 적의 반격을 무효화하고 즉시 추가 턴(EXTRA TURN)을 획득합니다!',
    icon: 'Skull',
    hotkey: 'W',
    activeRuneId: 'rune_poison',
    unlockLevel: 2,
    hitCount: 1
  },
  {
    id: 'cleave',
    name: '휩쓸기 (Cleave)',
    level: 1,
    maxLevel: 10,
    rageCost: 15,
    manaCost: 0,
    damageMultiplier: 1.6,
    overkillEfficiency: 0.70,
    rageGainPerHit: 0,
    route: 'branch',
    description: '전방 및 좌우 3개 Lane의 전열을 휩쓰는 광역기. 적은 분노(15)를 소모하여 다수의 적을 빠르게 소탕합니다.',
    icon: 'Zap',
    hotkey: 'E',
    activeRuneId: 'rune_lightning',
    unlockLevel: 3,
    hitCount: 3
  },
  {
    id: 'shield_bash',
    name: '방패 강타 (Shield Bash)',
    level: 1,
    maxLevel: 10,
    rageCost: 15,
    manaCost: 0,
    damageMultiplier: 2.4,
    overkillEfficiency: 0.65,
    route: 'single',
    description: '단단한 방패로 전방 적을 후려쳐 2.4배 물리 피해를 입히고 플레이어에게 생명력 보호막(Shield)을 생성합니다!',
    icon: 'Shield',
    hotkey: 'W',
    activeRuneId: 'rune_frost',
    unlockLevel: 6,
    hitCount: 1
  },
  {
    id: 'berserk',
    name: '광폭 공격 (Berserk)',
    level: 1,
    maxLevel: 10,
    rageCost: 25,
    manaCost: 0,
    damageMultiplier: 1.1,
    overkillEfficiency: 0,
    route: 'single',
    description: '오버킬 없이 전방 단일 적에게 1.1배수의 맹렬한 광폭 일격을 3연타(총 3.3배) 퍼붓습니다.',
    icon: 'Flame',
    hotkey: 'E',
    activeRuneId: 'rune_fire',
    unlockLevel: 15,
    hitCount: 3
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
    rageGainPerHit: 0,
    route: 'radius',
    description: '전 레인 2열(10칸)을 휩쓰는 광역 폭풍. 타격 시 자체 분노를 생성하지 않아 자원을 소모하므로, 통찰(Insight) 룬워드를 착용하거나 가르기/휩쓸기와 연계해야 난사할 수 있습니다.',
    icon: 'RotateCw',
    hotkey: 'R',
    activeRuneId: 'rune_frost',
    unlockLevel: 20,
    hitCount: 10
  },
  {
    id: 'war_cry',
    name: '전장의 함성 (War Cry)',
    level: 1,
    maxLevel: 10,
    rageCost: 0,
    manaCost: 0,
    damageMultiplier: 1.4,
    overkillEfficiency: 0.70,
    rageGainPerHit: 10,
    route: 'radius',
    description: '포효를 내질러 전 레인 적들에게 충격을 주고 타격당 분노 +10을 획득합니다.',
    icon: 'Activity',
    hotkey: 'R',
    activeRuneId: 'rune_void',
    unlockLevel: 25,
    hitCount: 10
  }
];

export const DEFAULT_EQUIPPED_SLOTS: Record<'Q' | 'W' | 'E' | 'R', string> = {
  Q: 'slash',
  W: 'execute',
  E: 'cleave',
  R: 'whirlwind'
};

export const WARRIOR_SKILLS: Skill[] = [
  ALL_AVAILABLE_SKILLS.find(s => s.id === 'slash')!,
  ALL_AVAILABLE_SKILLS.find(s => s.id === 'execute')!,
  ALL_AVAILABLE_SKILLS.find(s => s.id === 'cleave')!,
  ALL_AVAILABLE_SKILLS.find(s => s.id === 'whirlwind')!
];

export function getSkillById(id: string): Skill | undefined {
  return ALL_AVAILABLE_SKILLS.find(s => s.id === id);
}

export function getSkillUnlockLevel(skillId: string): number {
  const skill = ALL_AVAILABLE_SKILLS.find(s => s.id === skillId);
  return skill?.unlockLevel ?? 1;
}

export function isSkillUnlocked(skillId: string, playerLevel: number): boolean {
  return playerLevel >= getSkillUnlockLevel(skillId);
}

export function getSkillDamageText(
  skill: Skill,
  totalStats: { minDmg?: number; maxDmg?: number },
  level: number = 1,
  runeId?: string | null
): string {
  const minD = Math.max(1, totalStats.minDmg || 10);
  const maxD = Math.max(minD, totalStats.maxDmg || 15);
  const avgD = Math.round((minD + maxD) / 2);

  const levelMult = 1 + (level - 1) * 0.15;
  const activeRune = runeId ? SKILL_RUNES_DATA.find(r => r.id === runeId) : null;
  const runeDmgBonus = 1 + (activeRune?.damageBonusPercent || 0) / 100;
  const totalMult = skill.damageMultiplier * levelMult * runeDmgBonus;

  const dmgMin = Math.floor(minD * totalMult);
  const dmgMax = Math.floor(maxD * totalMult);
  const dmgAvg = Math.floor(avgD * totalMult);
  const percentStr = Math.round(totalMult * 100) + '%';

  const hitSuffix = skill.hitCount && skill.hitCount > 1 ? ` x${skill.hitCount}` : '';
  const shieldSuffix = skill.id === 'shield_bash' ? ' 🛡️' : '';

  return `${percentStr}(${dmgAvg})${hitSuffix}${shieldSuffix}`;
}

export function getSkillDamageRangeDetail(
  skill: Skill,
  totalStats: { minDmg?: number; maxDmg?: number },
  level: number = 1,
  runeId?: string | null
): { percent: number; minDamage: number; maxDamage: number; avgDamage: number; hitCount: number } {
  const minD = Math.max(1, totalStats.minDmg || 10);
  const maxD = Math.max(minD, totalStats.maxDmg || 15);
  const avgD = Math.round((minD + maxD) / 2);

  const levelMult = 1 + (level - 1) * 0.15;
  const activeRune = runeId ? SKILL_RUNES_DATA.find(r => r.id === runeId) : null;
  const runeDmgBonus = 1 + (activeRune?.damageBonusPercent || 0) / 100;
  const totalMult = skill.damageMultiplier * levelMult * runeDmgBonus;

  return {
    percent: Math.round(totalMult * 100),
    minDamage: Math.floor(minD * totalMult),
    maxDamage: Math.floor(maxD * totalMult),
    avgDamage: Math.floor(avgD * totalMult),
    hitCount: skill.hitCount || 1
  };
}
