import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { ACHIEVEMENTS, Achievement } from '../../data/achievements';
import {
  Trophy,
  CheckCircle,
  Lock,
  Coins,
  Sparkles,
  X,
  Flame,
  Skull,
  Crosshair,
  Hammer,
  Gift,
  Crown,
  Target,
  ShieldAlert,
  Zap,
  Award,
  GiftIcon
} from 'lucide-react';

export const AchievementModal: React.FC = () => {
  const {
    closeModal,
    achievementStats,
    claimedAchievements,
    claimAchievementReward,
    claimAllAchievementRewards
  } = useGame();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Helper to render icon by name
  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = isUnlocked
      ? 'w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
      : 'w-6 h-6 text-iron-500';

    switch (iconName) {
      case 'Zap': return <Zap className={iconClass} />;
      case 'Skull': return <Skull className={iconClass} />;
      case 'Flame': return <Flame className={iconClass} />;
      case 'Crosshair': return <Crosshair className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'Hammer': return <Hammer className={iconClass} />;
      case 'Gift': return <Gift className={iconClass} />;
      case 'Crown': return <Crown className={iconClass} />;
      case 'Target': return <Target className={iconClass} />;
      case 'ShieldAlert': return <ShieldAlert className={iconClass} />;
      case 'Award': return <Award className={iconClass} />;
      default: return <Trophy className={iconClass} />;
    }
  };

  // Helper to calculate progress info
  const getProgressInfo = (ach: Achievement) => {
    switch (ach.id) {
      case 'first_chain':
        return { current: Math.min(2, achievementStats.maxChainEver), max: 2, label: `${achievementStats.maxChainEver} / 2` };
      case 'slaughter_10':
        return { current: Math.min(10, achievementStats.maxChainEver), max: 10, label: `${achievementStats.maxChainEver} / 10` };
      case 'massacre_25':
        return { current: Math.min(25, achievementStats.maxChainEver), max: 25, label: `${achievementStats.maxChainEver} / 25` };
      case 'annihilation_50':
        return { current: Math.min(50, achievementStats.maxChainEver), max: 50, label: `${achievementStats.maxChainEver} / 50` };
      case 'apocalypse_100':
        return { current: Math.min(100, achievementStats.maxChainEver), max: 100, label: `${achievementStats.maxChainEver} / 100` };
      case 'first_runeword':
        return { current: Math.min(1, achievementStats.runeWordsCreated), max: 1, label: `${achievementStats.runeWordsCreated} / 1` };
      case 'first_unique':
        return { current: Math.min(1, achievementStats.uniqueItemsFound), max: 1, label: `${achievementStats.uniqueItemsFound} / 1` };
      case 'boss_slayer_10':
        return { current: Math.min(10, achievementStats.bossKills), max: 10, label: `${achievementStats.bossKills} / 10` };
      case 'level_20':
        return { current: Math.min(20, achievementStats.playerLevel), max: 20, label: `Lv.${achievementStats.playerLevel} / 20` };
      case 'kills_1000':
        return { current: Math.min(1000, achievementStats.totalKills), max: 1000, label: `${achievementStats.totalKills.toLocaleString()} / 1,000` };
      case 'phoenix_5':
        return { current: Math.min(5, achievementStats.totalDeaths), max: 5, label: `${achievementStats.totalDeaths} / 5` };
      case 'clear_act1': {
        const c1 = (achievementStats.dungeonClears['act1_4_catacombs'] || achievementStats.dungeonClears['act1_crypt'] || 0);
        return { current: Math.min(1, c1), max: 1, label: `${c1} / 1` };
      }
      case 'clear_act2': {
        const c2 = (achievementStats.dungeonClears['act2_4_tomb'] || achievementStats.dungeonClears['act2_tomb'] || 0);
        return { current: Math.min(1, c2), max: 1, label: `${c2} / 1` };
      }
      case 'clear_act3': {
        const c3 = (achievementStats.dungeonClears['act3_4_durance'] || achievementStats.dungeonClears['act3_jungle'] || 0);
        return { current: Math.min(1, c3), max: 1, label: `${c3} / 1` };
      }
      case 'clear_act4': {
        const c4 = (achievementStats.dungeonClears['act4_4_altar'] || achievementStats.dungeonClears['act4_chaos'] || 0);
        return { current: Math.min(1, c4), max: 1, label: `${c4} / 1` };
      }
      case 'clear_act5': {
        const c5 = (achievementStats.dungeonClears['act5_4_throne'] || achievementStats.dungeonClears['act5_worldstone'] || 0);
        return { current: Math.min(1, c5), max: 1, label: `${c5} / 1` };
      }
      case 'level_50':
        return { current: Math.min(50, achievementStats.playerLevel), max: 50, label: `Lv.${achievementStats.playerLevel} / 50` };
      case 'gold_100k':
        return { current: Math.min(100000, achievementStats.totalGoldEarned || 0), max: 100000, label: `${(achievementStats.totalGoldEarned || 0).toLocaleString()} / 100,000 G` };
      case 'master_runewords':
        return { current: Math.min(5, achievementStats.runeWordsCreated), max: 5, label: `${achievementStats.runeWordsCreated} / 5` };
      case 'torment_10':
        return { current: Math.min(10, achievementStats.maxDifficultyEver || 1), max: 10, label: `T${achievementStats.maxDifficultyEver || 1} / T10` };
      case 'torment_50':
        return { current: Math.min(50, achievementStats.maxDifficultyEver || 1), max: 50, label: `T${achievementStats.maxDifficultyEver || 1} / T50` };
      case 'torment_100':
        return { current: Math.min(100, achievementStats.maxDifficultyEver || 1), max: 100, label: `T${achievementStats.maxDifficultyEver || 1} / T100` };
      default:
        return { current: ach.condition(achievementStats) ? 1 : 0, max: 1, label: ach.condition(achievementStats) ? '완료' : '미완료' };
    }
  };

  const unlockedAchievementsList = ACHIEVEMENTS.filter(a => a.condition(achievementStats));
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievementsList.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const unclaimedCount = unlockedAchievementsList.filter(a => !claimedAchievements.includes(a.id)).length;

  const filteredAchievements = ACHIEVEMENTS.filter(ach => {
    const isUnlocked = ach.condition(achievementStats);
    if (activeFilter === 'unlocked') return isUnlocked;
    if (activeFilter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="bg-iron-950 border-2 border-brass-500/80 rounded-xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-scale-in text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-iron-800 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-600 to-amber-900 rounded-lg border border-amber-400 shadow-md">
            <Trophy className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
              성역의 위업 (ACHIEVEMENTS)
            </h2>
            <p className="text-xs text-gray-400">
              성역에서 세운 위대한 업적을 달성하고 황금과 영혼의 샤드 보상을 쟁취하세요.
            </p>
          </div>
        </div>

        <button
          onClick={closeModal}
          className="p-1.5 hover:bg-iron-800 text-gray-400 hover:text-white rounded-lg transition"
          title="닫기 (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Overview Stats Bar & Claim All */}
      <div className="bg-iron-900/90 border border-iron-800 p-3 sm:p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0 shadow-inner">
        {/* Progress Bar */}
        <div className="w-full md:w-1/2 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-gray-300 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              업적 달성률
            </span>
            <span className="text-amber-300 font-bold">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-iron-950 h-2.5 rounded-full overflow-hidden border border-iron-700">
            <div
              className="bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 h-full transition-all duration-500 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats & Claim All Button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Quick Stats Tag */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-gray-400 bg-iron-950 px-3 py-1.5 rounded border border-iron-800">
            <span>🔥 최고 체인: <strong className="text-amber-300">x{achievementStats.maxChainEver}</strong></span>
            <span>⚔️ 누적 처치: <strong className="text-red-400">{achievementStats.totalKills.toLocaleString()}</strong></span>
          </div>

          {/* Claim All Button */}
          {unclaimedCount > 0 ? (
            <button
              onClick={claimAllAchievementRewards}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-iron-950 font-black text-xs rounded-lg shadow-lg flex items-center gap-1.5 transition transform active:scale-95 animate-bounce"
            >
              <GiftIcon className="w-4 h-4" />
              <span>모든 보상 받기 ({unclaimedCount}개)</span>
            </button>
          ) : (
            <div className="text-xs text-gray-500 font-mono px-3 py-1.5 bg-iron-950 rounded border border-iron-800">
              모든 보상 수령 완료
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-iron-800 pb-2 flex-shrink-0 text-xs font-bold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'all'
              ? 'bg-brass-500/20 text-brass-200 border border-brass-500/60 shadow'
              : 'text-gray-400 hover:text-white hover:bg-iron-900'
          }`}
        >
          전체 ({totalCount})
        </button>
        <button
          onClick={() => setActiveFilter('unlocked')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFilter === 'unlocked'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60 shadow'
              : 'text-gray-400 hover:text-white hover:bg-iron-900'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>달성 완료 ({unlockedCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('locked')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFilter === 'locked'
              ? 'bg-iron-800 text-gray-200 border border-iron-600 shadow'
              : 'text-gray-400 hover:text-white hover:bg-iron-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <span>진행 중 ({totalCount - unlockedCount})</span>
        </button>
      </div>

      {/* Achievement List Grid (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.condition(achievementStats);
            const isClaimed = claimedAchievements.includes(ach.id);
            const progress = getProgressInfo(ach);
            const percent = Math.min(100, Math.round((progress.current / progress.max) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-iron-900 via-iron-900 to-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-950/30'
                    : 'bg-iron-900/50 border-iron-800/80 opacity-75'
                }`}
              >
                {/* Background decorative glow for unlocked */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Top Info */}
                <div className="flex items-start gap-3">
                  {/* Icon Frame */}
                  <div
                    className={`p-2.5 rounded-lg border flex-shrink-0 flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-iron-950 border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        : 'bg-iron-950 border-iron-800'
                    }`}
                  >
                    {renderIcon(ach.icon, isUnlocked)}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`font-cinzel font-bold text-sm truncate ${
                          isUnlocked ? 'text-amber-200' : 'text-gray-400'
                        }`}
                      >
                        {ach.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/50">
                          <CheckCircle className="w-3 h-3 text-amber-400" />
                          달성
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-iron-950 px-1.5 py-0.5 rounded border border-iron-800">
                          <Lock className="w-3 h-3" />
                          잠김
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>진척도</span>
                    <span className={isUnlocked ? 'text-amber-300 font-bold' : 'text-gray-400'}>
                      {progress.label}
                    </span>
                  </div>
                  <div className="w-full bg-iron-950 h-1.5 rounded-full overflow-hidden border border-iron-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isUnlocked ? 'bg-amber-400' : 'bg-iron-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Rewards & Action */}
                <div className="mt-3 pt-2.5 border-t border-iron-800/80 flex items-center justify-between gap-2">
                  {/* Rewards tag */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-gray-400 text-[11px]">보상:</span>
                    {ach.reward.gold && (
                      <span className="flex items-center gap-1 text-brass-300 bg-iron-950 px-2 py-0.5 rounded border border-brass-600/40">
                        <Coins className="w-3 h-3 text-brass-400" />
                        {ach.reward.gold.toLocaleString()}G
                      </span>
                    )}
                    {ach.reward.shards && (
                      <span className="flex items-center gap-1 text-purple-300 bg-iron-950 px-2 py-0.5 rounded border border-purple-600/40">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        {ach.reward.shards}
                      </span>
                    )}
                  </div>

                  {/* Button / Status */}
                  <div>
                    {isUnlocked ? (
                      isClaimed ? (
                        <span className="text-[11px] font-bold text-gray-500 font-mono px-2.5 py-1 bg-iron-950 rounded border border-iron-800">
                          수령 완료
                        </span>
                      ) : (
                        <button
                          onClick={() => claimAchievementReward(ach.id)}
                          className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-iron-950 font-black text-xs rounded shadow transition transform active:scale-95 flex items-center gap-1"
                        >
                          <GiftIcon className="w-3 h-3" />
                          <span>보상 수령</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono">
                        미달성
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2 border-t border-iron-800 flex-shrink-0">
        <button
          onClick={closeModal}
          className="px-5 py-2 bg-iron-800 hover:bg-iron-700 text-gray-200 hover:text-white font-bold text-xs rounded-lg transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
