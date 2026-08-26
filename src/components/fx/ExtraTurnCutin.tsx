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
    <div className="absolute inset-0 pointer-events-none z-50 flex items-start justify-center pt-14 sm:pt-16 select-none overflow-hidden" aria-hidden>
      {/* ⚡ 100% Transparent Zero-Box Floating Notification */}
      <div
        key={active.id}
        className="relative animate-extra-turn-cutin flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-iron-950 font-black text-xs sm:text-sm tracking-wider border border-white/80 shadow-md"
      >
        <Zap className="w-3.5 h-3.5 text-red-600 fill-current animate-bounce" />
        <span>⚡ 1 MORE! EXTRA TURN (연속 공격)</span>
        <Zap className="w-3.5 h-3.5 text-red-600 fill-current animate-bounce" />
      </div>
    </div>
  );
});

ExtraTurnCutin.displayName = 'ExtraTurnCutin';
