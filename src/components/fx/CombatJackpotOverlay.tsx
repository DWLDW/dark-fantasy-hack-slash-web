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
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center select-none overflow-hidden" aria-hidden>
      
      {/* 💥 Main Center Jackpot Popup Banner */}
      <div
        key={activeEvent.id}
        className={`flex flex-col items-center justify-center text-center ${
          activeEvent.isCrit ? 'animate-crit-slam' : 'animate-jackpot-pop'
        }`}
      >
        {/* Top Badges Row (Crit / Overkill / WeakSpot) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-0.5">
          {activeEvent.isCrit && (
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-iron-950 font-black text-xs sm:text-sm tracking-widest shadow-[0_0_20px_rgba(251,191,36,1)] border border-white flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span>CRITICAL HIT!</span>
              <Sparkles className="w-3.5 h-3.5 text-red-600 fill-current" />
            </div>
          )}

          {activeEvent.isWeakSpotHit && (
            <div className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.9)] border border-emerald-200 animate-bounce">
              <span>🎯 WEAK SPOT 2.5x</span>
            </div>
          )}

          {activeEvent.isBossBreak && (
            <div className="px-2 py-0.5 rounded-full bg-red-600 text-yellow-200 font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,1)] border-2 border-yellow-300 animate-bounce">
              <span>💥 BREAK! GROGGY</span>
            </div>
          )}

          {activeEvent.isExtraStrike && (
            <div className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-400 text-amber-300 font-mono font-bold text-[10px] sm:text-xs">
              ⚡ 신속 연격 +35%
            </div>
          )}
        </div>

        {/* 🎰 BIG ROLLING TOTAL DAMAGE NUMBER */}
        <div className="relative">
          <div
            className={`font-mono font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] ${
              activeEvent.isCrit
                ? 'text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-orange-500 filter drop-shadow-[0_0_25px_rgba(251,191,36,0.9)]'
                : isBigHit
                ? 'text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-300 to-red-500 filter drop-shadow-[0_0_18px_rgba(239,68,68,0.8)]'
                : 'text-xl sm:text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
            }`}
          >
            {activeEvent.isCrit ? '💥 ' : ''}
            {displayNumber.toLocaleString()}
            <span className="text-xs sm:text-base text-amber-200 ml-1 font-cinzel font-bold">TOTAL</span>
          </div>

          {/* Underline Flame Aura for Big Hits */}
          {isBigHit && (
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,1)] mt-0.5 animate-pulse" />
          )}
        </div>

        {/* Bottom Multi-Kill / Overkill Roulette Counter */}
        <div className="flex items-center gap-2 mt-1">
          {activeEvent.overkillCount > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-mono font-black text-[10px] sm:text-xs border border-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-overkill-pop flex items-center gap-1">
              <Skull className="w-3 h-3 text-yellow-300" />
              <span>OVERKILL x{activeEvent.overkillCount}</span>
            </div>
          )}

          {activeEvent.chainCount >= 2 && (
            <div className="px-2 py-0.5 rounded-full bg-iron-950/90 text-amber-300 font-mono font-black text-[10px] sm:text-xs border border-amber-500 shadow flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>CHAIN x{activeEvent.chainCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CombatJackpotOverlay.displayName = 'CombatJackpotOverlay';
