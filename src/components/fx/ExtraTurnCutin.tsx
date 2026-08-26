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
    <div className="absolute inset-0 pointer-events-none z-50 flex items-start justify-center pt-16 sm:pt-20 select-none overflow-hidden" aria-hidden>
      {/* ⚡ Top Sleek Lightning Cut-in Banner (Zero Center Masking) */}
      <div
        key={active.id}
        className="relative animate-extra-turn-cutin flex flex-col items-center justify-center px-4 sm:px-6 py-1.5 rounded-xl bg-black/80 border border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] max-w-sm sm:max-w-md w-auto text-center"
      >
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-black text-amber-300 tracking-widest uppercase">
          {isExecute ? (
            <>
              <Skull className="w-3 h-3 text-red-500" />
              <span>처형 격살 성공 · 반격 무효화</span>
              <Skull className="w-3 h-3 text-red-500" />
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>신속 모멘텀 100% 돌파</span>
              <Zap className="w-3 h-3 text-yellow-400" />
            </>
          )}
        </div>

        {/* 💥 Main Title: 1 MORE! EXTRA TURN */}
        <div className="flex items-center justify-center gap-1.5 my-0.5">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-current animate-bounce" />
          <h2 className="font-cinzel font-black text-base sm:text-xl text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wider">
            ⚡ 1 MORE! EXTRA TURN ⚡
          </h2>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-current animate-bounce" />
        </div>

        {/* Sub Instruction Tag */}
        <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-amber-200">
          <Swords className="w-2.5 h-2.5 text-amber-400" />
          <span>즉시 추가 연속 공격 시전 [Space]</span>
        </div>
      </div>
    </div>
  );
});

ExtraTurnCutin.displayName = 'ExtraTurnCutin';
