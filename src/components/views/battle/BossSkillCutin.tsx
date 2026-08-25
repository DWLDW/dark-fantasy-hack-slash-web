import React from 'react';
import { useGame } from '../../../state/gameStore';
import { AlertTriangle, Zap, Flame, Skull, ShieldAlert, Sparkles } from 'lucide-react';

/**
 * BossSkillCutin — Full-screen cinematic skill cut-in banner and elemental flash
 * Triggers dynamically whenever a boss unleashes their signature skill or phase ability.
 */
export const BossSkillCutin: React.FC = React.memo(() => {
  const { activeBossSkill } = useGame();

  if (!activeBossSkill) return null;

  const { name, icon, title, desc, element } = activeBossSkill;

  // Elemental color configurations
  const theme = (() => {
    switch (element) {
      case 'poison':
        return {
          flashClass: 'animate-flash-poison bg-emerald-950/60 shadow-[inset_0_0_120px_rgba(16,185,129,0.7)]',
          borderClass: 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.8)]',
          bgBanner: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950',
          titleColor: 'text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]',
          badge: 'bg-emerald-600 text-white border-emerald-300',
          elementIcon: '🧪'
        };
      case 'fire':
        return {
          flashClass: 'animate-flash-fire bg-red-950/60 shadow-[inset_0_0_120px_rgba(239,68,68,0.75)]',
          borderClass: 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.85)]',
          bgBanner: 'bg-gradient-to-r from-red-950 via-rose-900 to-orange-950',
          titleColor: 'text-orange-200 drop-shadow-[0_0_15px_rgba(249,115,22,0.95)]',
          badge: 'bg-red-600 text-white border-orange-300',
          elementIcon: '🔥'
        };
      case 'cold':
        return {
          flashClass: 'animate-flash-cold bg-cyan-950/60 shadow-[inset_0_0_120px_rgba(6,182,212,0.7)]',
          borderClass: 'border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.8)]',
          bgBanner: 'bg-gradient-to-r from-cyan-950 via-sky-900 to-indigo-950',
          titleColor: 'text-cyan-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]',
          badge: 'bg-cyan-600 text-white border-cyan-300',
          elementIcon: '❄️'
        };
      case 'lightning':
        return {
          flashClass: 'animate-flash-lightning bg-amber-950/60 shadow-[inset_0_0_120px_rgba(245,158,11,0.75)]',
          borderClass: 'border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.85)]',
          bgBanner: 'bg-gradient-to-r from-amber-950 via-yellow-900 to-zinc-950',
          titleColor: 'text-yellow-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.95)]',
          badge: 'bg-amber-500 text-iron-950 border-yellow-200',
          elementIcon: '⚡'
        };
      case 'void':
        return {
          flashClass: 'animate-flash-void bg-purple-950/65 shadow-[inset_0_0_120px_rgba(168,85,247,0.75)]',
          borderClass: 'border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.85)]',
          bgBanner: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-zinc-950',
          titleColor: 'text-purple-200 drop-shadow-[0_0_15px_rgba(192,132,252,0.95)]',
          badge: 'bg-purple-600 text-white border-purple-300',
          elementIcon: '🔮'
        };
      default:
        return {
          flashClass: 'animate-flash-fire bg-stone-950/60 shadow-[inset_0_0_120px_rgba(220,38,38,0.65)]',
          borderClass: 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.7)]',
          bgBanner: 'bg-gradient-to-r from-stone-950 via-zinc-900 to-stone-950',
          titleColor: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]',
          badge: 'bg-stone-700 text-white border-stone-400',
          elementIcon: '⚔️'
        };
    }
  })();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-16 sm:pt-20 select-none overflow-hidden">
      {/* 1. Fullscreen Elemental Flash Vignette */}
      <div className={`fixed inset-0 pointer-events-none ${theme.flashClass}`} />

      {/* 2. Top-Center Cinematic Boss Skill Cut-in Banner */}
      <div className={`relative z-50 max-w-xl w-[92%] sm:w-auto px-4 sm:px-8 py-3 rounded-2xl border-2 ${theme.borderClass} ${theme.bgBanner} animate-boss-cutin shadow-2xl flex items-center gap-3 sm:gap-4 overflow-hidden`}>
        {/* Shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-boss-hp-shimmer pointer-events-none" />

        {/* Large Imposing Boss Icon */}
        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/70 border-2 border-white/40 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_20px_rgba(0,0,0,0.9)]">
          <span>{icon || '👑'}</span>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-300 truncate">
              {name}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border font-mono ${theme.badge}`}>
              {theme.elementIcon} 궁극기 발동
            </span>
          </div>

          <h2 className={`font-cinzel font-black text-lg sm:text-2xl truncate ${theme.titleColor}`}>
            {title}
          </h2>

          <p className="text-[10px] sm:text-xs text-gray-200 font-mono mt-0.5 truncate opacity-95">
            {desc}
          </p>
        </div>

        {/* Warning Indicator */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center pl-1">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          <span className="text-[8px] sm:text-[9px] font-mono font-black text-red-300 mt-0.5">WARNING</span>
        </div>
      </div>
    </div>
  );
});

BossSkillCutin.displayName = 'BossSkillCutin';
