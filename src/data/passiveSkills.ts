export interface PassiveSkill {
  id: string;
  name: string;
  maxLevel: number;
  unlockLevel: number;
  icon: string;
  category: 'offense' | 'defense' | 'utility';
  description: string;
  statBonusText: (level: number) => string;
  nextLevelBonusText: (level: number) => string;
}

export const WARRIOR_PASSIVE_SKILLS: PassiveSkill[] = [
  {
    id: 'weapon_mastery',
    name: '무기 숙련 (Weapon Mastery)',
    maxLevel: 20,
    unlockLevel: 1,
    icon: 'Swords',
    category: 'offense',
    description: '무기를 다루는 숙련도를 극대화하여 물리 최소/최대 공격력을 증가시킵니다.',
    statBonusText: (level: number) => `물리 공격력 +${level * 4}% (최소/최대 +${level * 4}%)`,
    nextLevelBonusText: (level: number) => `물리 공격력 +${(level + 1) * 4}%`
  },
  {
    id: 'iron_skin',
    name: '강철 피부 (Iron Skin)',
    maxLevel: 20,
    unlockLevel: 5,
    icon: 'Shield',
    category: 'defense',
    description: '혹독한 수련으로 피부를 강철처럼 단련하여 방어력과 피해 감소율을 증폭합니다.',
    statBonusText: (level: number) => `방어력 +${level * 5}% & 물리 피해 감소 +${level * 1}%`,
    nextLevelBonusText: (level: number) => `방어력 +${(level + 1) * 5}% & 물리 피해 감소 +${(level + 1) * 1}%`
  },
  {
    id: 'deadly_strike',
    name: '치명적 타격 (Deadly Strike)',
    maxLevel: 20,
    unlockLevel: 10,
    icon: 'Crosshair',
    category: 'offense',
    description: '적의 급소를 정확히 노려 치명타 확률과 치명타 피해량을 대폭 끌어올립니다.',
    statBonusText: (level: number) => `치명타 확률 +${(level * 1.5).toFixed(1)}% & 치명타 피해 +${level * 5}%`,
    nextLevelBonusText: (level: number) => `치명타 확률 +${((level + 1) * 1.5).toFixed(1)}% & 치명타 피해 +${(level + 1) * 5}%`
  },
  {
    id: 'bloodthirst',
    name: '피의 갈증 (Bloodthirst)',
    maxLevel: 20,
    unlockLevel: 15,
    icon: 'HeartPulse',
    category: 'defense',
    description: '적에게 가한 피해량에 비례하여 생명력을 흡수(라이프스틸)합니다.',
    statBonusText: (level: number) => `생명력 흡수(Life Steal) +${level * 1}%`,
    nextLevelBonusText: (level: number) => `생명력 흡수(Life Steal) +${(level + 1) * 1}%`
  },
  {
    id: 'berserker_rage',
    name: '광전사의 분노 (Berserker Rage)',
    maxLevel: 20,
    unlockLevel: 20,
    icon: 'Flame',
    category: 'utility',
    description: '전투 중 타격 시 생성되는 분노량과 매 턴 시작 시 자동 회복되는 분노를 늘립니다.',
    statBonusText: (level: number) => `타격 분노 생성 +${level * 2} & 턴당 분노 재생 +${level * 2}`,
    nextLevelBonusText: (level: number) => `타격 분노 생성 +${(level + 1) * 2} & 턴당 분노 재생 +${(level + 1) * 2}`
  },
  {
    id: 'overkill_crusher',
    name: '오버킬 분쇄 (Overkill Crusher)',
    maxLevel: 20,
    unlockLevel: 25,
    icon: 'Zap',
    category: 'offense',
    description: '적을 처치하고 남은 오버킬 데미지가 후열 적들에게 전이되는 효율을 증폭합니다.',
    statBonusText: (level: number) => `오버킬 전이 효율 +${level * 4}% & 추가 공격력 +${level * 3}%`,
    nextLevelBonusText: (level: number) => `오버킬 전이 효율 +${(level + 1) * 4}% & 추가 공격력 +${(level + 1) * 3}%`
  },
  {
    id: 'elemental_attunement',
    name: '원소 친화 (Elemental Attunement)',
    maxLevel: 20,
    unlockLevel: 30,
    icon: 'Sparkles',
    category: 'utility',
    description: '모든 속성 저항력을 강화하고 활성화된 룬의 원소 피해량을 추가 증폭합니다.',
    statBonusText: (level: number) => `모든 원소 저항력 +${level * 2}% & 속성 룬 피해 +${level * 3}%`,
    nextLevelBonusText: (level: number) => `모든 원소 저항력 +${(level + 1) * 2}% & 속성 룬 피해 +${(level + 1) * 3}%`
  },
  {
    id: 'titan_juggernaut',
    name: '거인의 불굴 (Titan Juggernaut)',
    maxLevel: 20,
    unlockLevel: 35,
    icon: 'Crown',
    category: 'defense',
    description: '거인의 웅장한 체력과 불굴의 의지로 최대 생명력 및 보스 멸망기 저지력(Break)을 증가시킵니다.',
    statBonusText: (level: number) => `최대 생명력 +${level * 5}% & 보스 멸망기 저지력 +${level * 10}%`,
    nextLevelBonusText: (level: number) => `최대 생명력 +${(level + 1) * 5}% & 보스 멸망기 저지력 +${(level + 1) * 10}%`
  }
];

export function getPassiveById(id: string): PassiveSkill | undefined {
  return WARRIOR_PASSIVE_SKILLS.find(p => p.id === id);
}

export function isPassiveUnlocked(passiveId: string, playerLevel: number): boolean {
  const p = getPassiveById(passiveId);
  return p ? playerLevel >= p.unlockLevel : false;
}
