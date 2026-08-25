import React from 'react';
import { useGame } from '../../../state/gameStore';
import { Crosshair, Flame } from 'lucide-react';

export const BattleTacticalPreview: React.FC = React.memo(() => {
  const {
    monsters,
    selectedSkill,
    preview
  } = useGame();

  const isCleared = monsters.length === 0;
  if (isCleared) return null;

  const stopperMonster = preview.stopperId ? monsters.find(m => m.id === preview.stopperId) : null;
  const stopperText = stopperMonster
    ? `${(stopperMonster.lane ?? 0) + 1}열`
    : '전체관통';

  return (
    <div className="w-full flex items-center justify-between gap-1 px-2 py-0.5 bg-iron-950/70 rounded border border-iron-800 text-[10px] sm:text-[11px] font-mono select-none flex-shrink-0">
      <div className="flex items-center gap-1.5 truncate">
        <span className="text-amber-300 font-bold flex items-center gap-1 flex-shrink-0">
          <Crosshair className="w-3 h-3 text-amber-400" />
          <span>{selectedSkill.name.split(' ')[0]}</span>
        </span>
        <span className="text-gray-300 flex-shrink-0">
          피해 <strong>{preview.appliedDamage}</strong>
          {preview.totalDamage > preview.appliedDamage && (
            <span className="text-purple-300 text-[9px] ml-0.5">(+{preview.totalDamage - preview.appliedDamage})</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {preview.chainCount > 0 ? (
          <span className="text-emerald-300 font-black flex items-center gap-0.5 animate-pulse">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{preview.chainCount}처치 예상</span>
          </span>
        ) : (
          <span className="text-gray-500">0처치</span>
        )}
        <span className="text-gray-400 text-[9px]">
          저지: <strong className="text-rose-300">{stopperText}</strong>
        </span>
      </div>
    </div>
  );
});

BattleTacticalPreview.displayName = 'BattleTacticalPreview';
