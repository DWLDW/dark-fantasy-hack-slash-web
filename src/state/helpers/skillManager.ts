import { Skill } from '../../types/game';
import { ALL_AVAILABLE_SKILLS, WARRIOR_SKILLS } from '../../data/skills';
import { WARRIOR_PASSIVE_SKILLS, getPassiveById } from '../../data/passiveSkills';

export interface SkillUpgradeResult {
  success: boolean;
  message: string;
  newLevels?: Record<string, number>;
  newSkillPoints?: number;
}

export function upgradeSkillHelper(
  skillId: string,
  currentLevels: Record<string, number>,
  skillPoints: number,
  amount: number = 1
): SkillUpgradeResult {
  if (skillPoints <= 0) {
    return { success: false, message: '사용 가능한 스킬 포인트가 부족합니다!' };
  }
  const skill = ALL_AVAILABLE_SKILLS.find(s => s.id === skillId);
  const maxLv = skill?.maxLevel || 30;
  const currentLv = currentLevels[skillId] || 1;

  if (currentLv >= maxLv) {
    return { success: false, message: `스킬이 이미 최대 레벨(Lv ${maxLv})에 도달했습니다!` };
  }

  const actualAmount = Math.min(amount, skillPoints, maxLv - currentLv);
  if (actualAmount <= 0) {
    return { success: false, message: '더 이상 포인트를 투자할 수 없습니다.' };
  }

  const newLv = currentLv + actualAmount;
  return {
    success: true,
    message: `✨ [${skill?.name || skillId}] 스킬이 Lv.${newLv}로 강화되었습니다! (+${actualAmount * 15}% 피해 추가)`,
    newLevels: {
      ...currentLevels,
      [skillId]: newLv
    },
    newSkillPoints: skillPoints - actualAmount
  };
}

export function upgradePassiveHelper(
  passiveId: string,
  currentPassiveLevels: Record<string, number>,
  skillPoints: number,
  playerLevel: number,
  amount: number = 1
): SkillUpgradeResult {
  if (skillPoints <= 0) {
    return { success: false, message: '사용 가능한 스킬 포인트가 부족합니다!' };
  }
  const passive = getPassiveById(passiveId);
  if (!passive) {
    return { success: false, message: '존재하지 않는 패시브 스킬입니다.' };
  }
  if (playerLevel < passive.unlockLevel) {
    return { success: false, message: `Lv.${passive.unlockLevel} 달성 시 해금되는 패시브입니다.` };
  }

  const currentLv = currentPassiveLevels[passiveId] || 0;
  if (currentLv >= passive.maxLevel) {
    return { success: false, message: `패시브가 이미 최대 마스터 레벨(Lv ${passive.maxLevel})입니다!` };
  }

  const actualAmount = Math.min(amount, skillPoints, passive.maxLevel - currentLv);
  if (actualAmount <= 0) {
    return { success: false, message: '더 이상 포인트를 투자할 수 없습니다.' };
  }

  const newLv = currentLv + actualAmount;
  return {
    success: true,
    message: `🧬 [${passive.name}] 패시브가 Lv.${newLv}로 강화되었습니다!`,
    newLevels: {
      ...currentPassiveLevels,
      [passiveId]: newLv
    },
    newSkillPoints: skillPoints - actualAmount
  };
}

export function resetSkillPointsHelper(
  currentSkillLevels: Record<string, number>,
  currentPassiveLevels: Record<string, number>,
  currentSkillPoints: number
): {
  newSkillLevels: Record<string, number>;
  newPassiveLevels: Record<string, number>;
  newSkillPoints: number;
  refundedPoints: number;
} {
  // Active skills start at Lv 1 (invested = lv - 1)
  const activeSpent = Object.values(currentSkillLevels).reduce((acc, lv) => acc + Math.max(0, lv - 1), 0);
  // Passive skills start at Lv 0 (invested = lv)
  const passiveSpent = Object.values(currentPassiveLevels).reduce((acc, lv) => acc + Math.max(0, lv), 0);
  const totalRefunded = activeSpent + passiveSpent;

  return {
    newSkillLevels: {
      slash: 1,
      execute: 1,
      cleave: 1,
      whirlwind: 1,
      shield_bash: 1,
      berserk: 1,
      war_cry: 1
    },
    newPassiveLevels: {},
    newSkillPoints: currentSkillPoints + totalRefunded,
    refundedPoints: totalRefunded
  };
}

export function getEffectiveSkill(
  selectedSkill: Skill,
  skillLevels: Record<string, number>,
  skillRunes: Record<string, string>
): Skill {
  const baseSkill = ALL_AVAILABLE_SKILLS.find(s => s.id === selectedSkill.id) || selectedSkill;
  const currentLv = skillLevels[selectedSkill.id] || 1;
  const activeRune = skillRunes[selectedSkill.id] || baseSkill.activeRuneId;
  const levelMult = 1 + (currentLv - 1) * 0.15; // +15% per skill level

  return {
    ...baseSkill,
    level: currentLv,
    damageMultiplier: Number((baseSkill.damageMultiplier * levelMult).toFixed(2)),
    activeRuneId: activeRune
  };
}
