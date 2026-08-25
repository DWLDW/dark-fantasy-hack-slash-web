import React, { useEffect, useState } from 'react';
import { Zap, Swords, Skull } from 'lucide-react';

export interface ExtraTurnEvent {
  id: string;
  reason: 'execute' | 'momentum';
  timestamp: number;
}

interface ExtraTurnCutinProps {
  event: ExtraTurnEvent | null;
}

export const ExtraTurnCutin: React.FC<ExtraTurnCutinProps> = React.memo(({ event }) => {
  const [active, setActive] = useState<ExtraTurnEvent | null>(null);

  useEffect(() => {
    if (!event) return;
    setActive(event);
    const t = setTimeout(() => setActive(null), 1400);
    return () => clearTimeout(t);
  }, [event]);

  if (!active) return null;

  const isExecute = active.reason === 'execute';

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center select-none overflow-hidden" aria-hidden>
      {/* Background Shockwave Flash Strip */}
      <div className="absolute inset-x-0 h-28 bg-gradient-to-r from-transparent via-amber-500/25 to-transparent animate-pulse" />

      {/* ⚡ Diagonal Golden Lightning Cut-in Banner */}
      <div
        key={active.id}
        className="relative animate-extra-turn-cutin flex flex-col items-center justify-center px-6 py-2 rounded-xl bg-gradient-to-r from-iron-950 via-amber-950/95 to-iron-950 border-y-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] max-w-md w-full text-center"
      >
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-black text-amber-300 tracking-widest uppercase">
          {isExecute ? (
            <>
              <Skull className="w-3.5 h-3.5 text-red-500" />
              <span>처형 격살 성공 · 반격 무효화</span>
              <Skull className="w-3.5 h-3.5 text-red-500" />
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>신속 모멘텀 100% 돌파</span>
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            </>
          )}
        </div>

        {/* 💥 Main Big Title: 1 MORE! EXTRA TURN */}
        <div className="flex items-center justify-center gap-2 my-0.5">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 fill-current animate-bounce" />
          <h2 className="font-cinzel font-black text-xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_0_20px_rgba(251,191,36,1)] tracking-wider">
            1 MORE! EXTRA TURN
          </h2>
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 fill-current animate-bounce" />
        </div>

        {/* Sub Instruction Tag */}
        <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-amber-200/90">
          <Swords className="w-3 h-3 text-amber-400" />
          <span>즉시 다음 공격을 시전하세요! [Space]</span>
        </div>
      </div>
    </div>
  );
});

ExtraTurnCutin.displayName = 'ExtraTurnCutin';
