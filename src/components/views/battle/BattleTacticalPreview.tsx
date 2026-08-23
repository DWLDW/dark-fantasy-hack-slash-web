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
    ? `L${stopperMonster.lane !== undefined ? stopperMonster.lane + 1 : '전열'}`
    : '없음 (전체 관통)';

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 bg-iron-900/95 px-2.5 py-1 rounded-lg border border-iron-700 text-[10px] sm:text-xs font-mono shadow select-none">
      <div className="flex items-center gap-2">
        <span className="text-brass-300 font-bold flex items-center gap-1">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>{selectedSkill.name.split(' ')[0]} [{selectedSkill.hotkey}]</span>
        </span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-200">
          타격: <strong className="text-brass-200 font-black">{preview.totalDamage}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {preview.chainCount > 0 ? (
          <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-500 px-1.5 py-0.2 rounded font-bold flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 text-blood-400" />
            <span>예상 {preview.chainCount}처치 (치명 미포함)</span>
          </span>
        ) : (
          <span className="text-gray-400">처치 0</span>
        )}
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">
          저지점: <strong className="text-blood-300 font-black">{stopperText}</strong>
        </span>
      </div>
    </div>
  );
});

BattleTacticalPreview.displayName = 'BattleTacticalPreview';
