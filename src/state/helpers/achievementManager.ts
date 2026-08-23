import { Achievement, AchievementStats } from '../../types/game';
import { ACHIEVEMENTS } from '../../data/achievements';

export interface ClaimSingleResult {
  success: boolean;
  achievement?: Achievement;
  goldGain: number;
  shardGain: number;
}

export interface ClaimAllResult {
  claimedCount: number;
  newlyClaimedIds: string[];
  totalGold: number;
  totalShards: number;
}

export function claimAchievementHelper(
  achievementId: string,
  claimedAchievements: string[],
  stats: AchievementStats
): ClaimSingleResult {
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!ach || claimedAchievements.includes(achievementId)) {
    return { success: false, goldGain: 0, shardGain: 0 };
  }
  if (!ach.condition(stats)) {
    return { success: false, goldGain: 0, shardGain: 0 };
  }

  const goldGain = ach.reward.gold || 0;
  const shardGain = ach.reward.shards || 0;

  return {
    success: true,
    achievement: ach,
    goldGain,
    shardGain
  };
}

export function claimAllAchievementsHelper(
  claimedAchievements: string[],
  stats: AchievementStats
): ClaimAllResult {
  const eligible = ACHIEVEMENTS.filter(a => a.condition(stats) && !claimedAchievements.includes(a.id));
  if (eligible.length === 0) {
    return { claimedCount: 0, newlyClaimedIds: [], totalGold: 0, totalShards: 0 };
  }

  let totalGold = 0;
  let totalShards = 0;
  const newlyClaimedIds: string[] = [];

  eligible.forEach(ach => {
    newlyClaimedIds.push(ach.id);
    totalGold += ach.reward.gold || 0;
    totalShards += ach.reward.shards || 0;
  });

  return {
    claimedCount: eligible.length,
    newlyClaimedIds,
    totalGold,
    totalShards
  };
}

