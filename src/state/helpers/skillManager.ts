import { Skill } from '../../types/game';
import { WARRIOR_SKILLS } from '../../data/skills';

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
  const currentLv = currentLevels[skillId] || 1;
  if (currentLv >= 10) {
    return { success: false, message: '스킬이 이미 최대 레벨(Lv 10)에 도달했습니다!' };
  }

  const actualAmount = Math.min(amount, skillPoints, 10 - currentLv);
  if (actualAmount <= 0) {
    return { success: false, message: '더 이상 포인트를 투자할 수 없습니다.' };
  }

  const newLv = currentLv + actualAmount;
  return {
    success: true,
    message: `✨ [${skillId.toUpperCase()}] 스킬이 Lv.${newLv}로 강화되었습니다! (+${actualAmount * 15}% 피해 추가)`,
    newLevels: {
      ...currentLevels,
      [skillId]: newLv
    },
    newSkillPoints: skillPoints - actualAmount
  };
}

export function resetSkillPointsHelper(
  currentLevels: Record<string, number>,
  currentSkillPoints: number
): { newLevels: Record<string, number>; newSkillPoints: number; refundedPoints: number } {
  const totalSpent = Object.values(currentLevels).reduce((acc, lv) => acc + (lv - 1), 0);
  return {
    newLevels: {
      slash: 1,
      execute: 1,
      cleave: 1,
      whirlwind: 1
    },
    newSkillPoints: currentSkillPoints + totalSpent,
    refundedPoints: totalSpent
  };
}

export function getEffectiveSkill(
  selectedSkill: Skill,
  skillLevels: Record<string, number>,
  skillRunes: Record<string, string>
): Skill {
  const baseSkill = WARRIOR_SKILLS.find(s => s.id === selectedSkill.id) || selectedSkill;
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
