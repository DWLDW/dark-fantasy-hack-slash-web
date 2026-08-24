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
    <div className="flex flex-wrap items-center justify-between gap-1.5 bg-iron-900/95 px-2.5 py-1.5 rounded-lg border border-iron-700 text-xs sm:text-sm font-mono shadow select-none flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-brass-300 font-black flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span>{selectedSkill.name.split(' ')[0]} [{selectedSkill.hotkey}]</span>
        </span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-200">
          타격: <strong className="text-brass-200 font-black text-sm">{preview.appliedDamage}</strong>
          {preview.totalDamage > preview.appliedDamage && (
            <span className="text-purple-300/80 text-[10px] ml-1">+오버킬 {preview.totalDamage - preview.appliedDamage}</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {preview.chainCount > 0 ? (
          <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-500 px-2 py-0.5 rounded font-black flex items-center gap-1 animate-pulse text-xs">
            <Flame className="w-3.5 h-3.5 text-blood-400" />
            <span>예상 {preview.chainCount}처치</span>
          </span>
        ) : (
          <span className="text-gray-400 text-xs">처치 0</span>
        )}
        <span className="text-gray-500">|</span>
        <span className="text-gray-400 text-xs">
          저지점: <strong className="text-blood-300 font-black">{stopperText}</strong>
        </span>
      </div>
    </div>
  );
});

BattleTacticalPreview.displayName = 'BattleTacticalPreview';
