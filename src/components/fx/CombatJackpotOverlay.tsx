import React, { useEffect, useState } from 'react';
import { Skull, Flame, Zap, Target, ShieldAlert } from 'lucide-react';

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
    const duration = Math.min(280, Math.max(120, targetDmg > 500 ? 240 : 140));

    let animFrame: number;
    const roll = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Sharp snap ease-out for fighting game arcade roll
      const eased = 1 - Math.pow(1 - progress, 4);
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
    }, 1350);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [attackSummary]);

  if (!activeEvent || displayNumber <= 0) return null;

  const isBigHit = activeEvent.totalDamage >= 300 || activeEvent.isCrit;

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex flex-col items-center justify-center select-none overflow-visible" aria-hidden>
      
      {/* 💥 ANIME FIGHTING SLAM WRAPPER */}
      <div
        key={activeEvent.id}
        className={`flex flex-col items-center justify-center text-center -translate-y-6 ${
          activeEvent.isCrit ? 'animate-anime-slam' : 'animate-slash-slide'
        }`}
      >
        
        {/* =========================================================================
            1. TOP HIGH-IMPACT COMBAT BADGES (Kill la Kill / P5 Angular Badges)
            ========================================================================= */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-2 pointer-events-none">
          
          {/* ⚡ CRITICAL HIT! (TRIGGER Style Flaming Lightning Chevron) */}
          {activeEvent.isCrit && (
            <div
              className="relative p-[2.5px] bg-black banner-hard-shadow -skew-x-12"
              style={{ clipPath: 'polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%)' }}
            >
              <div
                className="px-5 py-1.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-red-600 flex items-center gap-2 text-black font-black tracking-widest uppercase text-sm sm:text-base animate-hazard-stripes"
                style={{
                  clipPath: 'polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%)',
                  backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 8px, transparent 8px, transparent 16px)'
                }}
              >
                <Zap className="w-4 h-4 text-black fill-current animate-bounce" />
                <span className="text-anime-stroke-thin text-white font-black italic tracking-wider">
                  CRITICAL HIT!
                </span>
                <Zap className="w-4 h-4 text-black fill-current animate-bounce" />
              </div>
            </div>
          )}

          {/* 🎯 WEAK SPOT 2.5x (Persona 5 Razor Slanted Parallelogram) */}
          {activeEvent.isWeakSpotHit && (
            <div
              className="relative p-[2.5px] bg-black filter drop-shadow-[3px_3px_0_#000] -skew-x-12"
              style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
            >
              <div
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500 flex items-center gap-1.5 text-black font-black tracking-wider text-xs sm:text-sm"
                style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
              >
                <Target className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-anime-stroke-thin text-white italic">WEAK SPOT 2.5x</span>
              </div>
            </div>
          )}

          {/* 💥 BREAK! GROGGY (Shattered Sawtooth Impact Badge) */}
          {activeEvent.isBossBreak && (
            <div
              className="relative p-[2.5px] bg-black filter drop-shadow-[3px_3px_0_#000] -skew-x-12"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 94% 50%, 100% 100%, 0% 100%, 6% 50%)' }}
            >
              <div
                className="px-4 py-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 flex items-center gap-1.5 text-black font-black tracking-wider text-xs sm:text-sm"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 94% 50%, 100% 100%, 0% 100%, 6% 50%)' }}
              >
                <ShieldAlert className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-anime-stroke-thin text-yellow-100 italic">BREAK! GROGGY</span>
              </div>
            </div>
          )}

          {/* ⚡ EXTRA STRIKE (Speed Ribbon) */}
          {activeEvent.isExtraStrike && (
            <div
              className="relative p-[2px] bg-black filter drop-shadow-[2px_2px_0_#000] -skew-x-12"
              style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
            >
              <div
                className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-mono font-black text-xs sm:text-sm flex items-center gap-1"
                style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
              >
                <span>⚡ 신속 연격 +35%</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            2. MEGA ARCADE DAMAGE ROLLER (3D Comic Extrusion & Slanted Typography)
            ========================================================================= */}
        <div className="relative pointer-events-none my-1 flex flex-col items-center">
          
          {/* Comic Speedline Shard Backdrop on Big Hits */}
          {isBigHit && (
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -skew-x-12 animate-pulse pointer-events-none -z-10" />
          )}

          <div
            className={`font-mono font-black italic tracking-tighter -skew-x-12 text-anime-3d-shadow flex items-baseline justify-center select-none ${
              activeEvent.isCrit
                ? 'text-5xl sm:text-7xl md:text-8xl text-yellow-300'
                : isBigHit
                ? 'text-4xl sm:text-6xl md:text-7xl text-amber-300'
                : 'text-3xl sm:text-5xl md:text-6xl text-white'
            }`}
          >
            {/* 3D Stroke Number with Radiant Core */}
            <span
              className="text-anime-stroke-thick bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-300 to-amber-500"
            >
              {displayNumber.toLocaleString()}
            </span>

            {/* TOTAL Label Badge */}
            <span className="text-base sm:text-2xl text-amber-200 ml-2 font-cinzel font-black not-italic tracking-wider uppercase bg-black px-2.5 py-0.5 border-2 border-amber-400 -skew-x-6 text-anime-stroke-thin shadow-lg">
              TOTAL
            </span>
          </div>

          {/* Underline Hard Slashed Energy Ray */}
          {isBigHit && (
            <div className="w-[110%] h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-1 shadow-[0_0_14px_rgba(251,191,36,0.9)] -skew-x-12" />
          )}
        </div>

        {/* =========================================================================
            3. BOTTOM MULTI-KILL & CHAIN COMBO COUNTER (Slanted Comic Sawtooth)
            ========================================================================= */}
        <div className="flex items-center gap-2.5 mt-2 pointer-events-none">
          
          {/* 💀 OVERKILL ROULETTE BADGE */}
          {activeEvent.overkillCount > 0 && (
            <div
              className="relative p-[2.5px] bg-black filter drop-shadow-[3px_3px_0_#000] -skew-x-12 animate-bounce"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 92% 50%, 100% 100%, 0% 100%, 8% 50%)' }}
            >
              <div
                className="px-3.5 py-1 bg-gradient-to-r from-orange-600 via-red-600 to-rose-700 text-white font-mono font-black text-xs sm:text-sm flex items-center gap-1.5"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 92% 50%, 100% 100%, 0% 100%, 8% 50%)' }}
              >
                <Skull className="w-4 h-4 text-yellow-300" />
                <span className="text-anime-stroke-thin italic">OVERKILL x{activeEvent.overkillCount}</span>
              </div>
            </div>
          )}

          {/* 🔥 CHAIN COMBO BADGE */}
          {activeEvent.chainCount >= 2 && (
            <div
              className="relative p-[2.5px] bg-black filter drop-shadow-[3px_3px_0_#000] -skew-x-12"
              style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
            >
              <div
                className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-mono font-black text-xs sm:text-sm flex items-center gap-1.5"
                style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
              >
                <Flame className="w-4 h-4 text-red-600 fill-current" />
                <span className="text-anime-stroke-thin text-white italic">CHAIN x{activeEvent.chainCount}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

CombatJackpotOverlay.displayName = 'CombatJackpotOverlay';
