import React, { useEffect, useState } from 'react';
import { Sparkles, Skull, Flame } from 'lucide-react';

export interface AttackSummaryEvent {
  id: string;
  totalDamage: number;
  isCrit: boolean;
  isExtraStrike: boolean;
  isBossBreak?: boolean;
  isWeakSpotHit?: boolean;
  overkillCount: number;
  chainCount: number;
  skillName: string;
  element: string;
}

interface CombatJackpotOverlayProps {
  attackSummary: AttackSummaryEvent | null;
}

export const CombatJackpotOverlay: React.FC<CombatJackpotOverlayProps> = React.memo(({ attackSummary }) => {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [activeEvent, setActiveEvent] = useState<AttackSummaryEvent | null>(null);

  useEffect(() => {
    if (!attackSummary || attackSummary.totalDamage <= 0) return;

    setActiveEvent(attackSummary);
    const targetDmg = attackSummary.totalDamage;
    const startTime = performance.now();
    const duration = Math.min(300, Math.max(120, targetDmg > 500 ? 250 : 150)); // 120ms~250ms rapid slot roll

    let animFrame: number;
    const roll = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out expo for rapid snappy casino feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(targetDmg * eased);
      setDisplayNumber(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(roll);
      } else {
        setDisplayNumber(targetDmg);
      }
    };

    animFrame = requestAnimationFrame(roll);

    const timer = setTimeout(() => {
      setActiveEvent(null);
      setDisplayNumber(0);
    }, 1250);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [attackSummary]);

  if (!activeEvent || displayNumber <= 0) return null;

  const isBigHit = activeEvent.totalDamage >= 300 || activeEvent.isCrit;

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex flex-col items-center justify-center select-none overflow-visible" aria-hidden>
      
      {/* 🎰 BIG CENTRAL ARCADE JACKPOT & CRIT SLAM BANNER */}
      <div
        key={activeEvent.id}
        className={`flex flex-col items-center justify-center text-center -translate-y-6 ${
          activeEvent.isCrit ? 'animate-crit-slam' : 'animate-jackpot-pop'
        }`}
      >
        {/* Top Badges Row (Crit / Overkill / WeakSpot) */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-1.5 pointer-events-none">
          {activeEvent.isCrit && (
            <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-iron-950 font-black text-sm sm:text-base tracking-widest border-2 border-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse">
              <Sparkles className="w-4 h-4 text-red-600 fill-current" />
              <span>CRITICAL HIT!</span>
              <Sparkles className="w-4 h-4 text-red-600 fill-current" />
            </div>
          )}

          {activeEvent.isWeakSpotHit && (
            <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm tracking-wider border-2 border-emerald-200 shadow-xl animate-bounce">
              <span>🎯 WEAK SPOT 2.5x</span>
            </div>
          )}

          {activeEvent.isBossBreak && (
            <div className="px-3 py-1 rounded-full bg-red-600 text-yellow-200 font-black text-xs sm:text-sm tracking-wider border-2 border-yellow-300 shadow-xl animate-bounce">
              <span>💥 BREAK! GROGGY</span>
            </div>
          )}

          {activeEvent.isExtraStrike && (
            <div className="px-2 py-0.5 rounded-full bg-amber-950/95 border-2 border-amber-400 text-amber-300 font-mono font-black text-xs sm:text-sm shadow-lg">
              ⚡ 신속 연격 +35%
            </div>
          )}
        </div>

        {/* 🎰 BIG ROLLING TOTAL DAMAGE NUMBER (Centrally Positioned Arcade Slot Roll) */}
        <div className="relative pointer-events-none">
          <div
            className={`font-mono font-black tracking-tight text-stroke-thin ${
              activeEvent.isCrit
                ? 'text-4xl sm:text-6xl md:text-7xl text-yellow-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]'
                : isBigHit
                ? 'text-3xl sm:text-5xl md:text-6xl text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]'
                : 'text-2xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]'
            }`}
          >
            {activeEvent.isCrit ? '💥 ' : ''}
            {displayNumber.toLocaleString()}
            <span className="text-sm sm:text-xl text-amber-200 ml-1.5 font-cinzel font-black">TOTAL</span>
          </div>

          {/* Underline Light Glow */}
          {isBigHit && (
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-1 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          )}
        </div>

        {/* Bottom Multi-Kill / Overkill Roulette Counter */}
        <div className="flex items-center gap-2.5 mt-2 pointer-events-none">
          {activeEvent.overkillCount > 0 && (
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-mono font-black text-xs sm:text-sm border-2 border-orange-300 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-overkill-pop flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-yellow-300" />
              <span>OVERKILL x{activeEvent.overkillCount}</span>
            </div>
          )}

          {activeEvent.chainCount >= 2 && (
            <div className="px-3 py-1 rounded-full bg-iron-950/95 text-amber-300 font-mono font-black text-xs sm:text-sm border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>CHAIN x{activeEvent.chainCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CombatJackpotOverlay.displayName = 'CombatJackpotOverlay';
