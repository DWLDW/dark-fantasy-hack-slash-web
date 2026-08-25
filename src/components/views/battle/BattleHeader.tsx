import React from 'react';
import { useGame } from '../../../state/gameStore';
import { MiniRoomGraph } from '../../layout/MiniRoomGraph';
import { Activity, Home, Sparkles } from 'lucide-react';

export const BattleHeader: React.FC = React.memo(() => {
  const {
    isEnemyTurn,
    hordeTimelinePercent,
    chainCount,
    abandonDungeon,
    dungeonBuffs
  } = useGame();

  return (
    <div className="w-full flex flex-col gap-1 font-sans select-none flex-shrink-0">
      {/* Ultra-Compact Top Header Bar (Fixed Height ~34-36px) */}
      <div className="w-full bg-iron-950/90 border border-brass-600/30 rounded-lg px-2 py-1 flex items-center justify-between gap-2 shadow-md">
        
        {/* Left: Slim MiniRoomGraph */}
        <div className="flex-shrink-0 min-w-0">
          <MiniRoomGraph />
        </div>

        {/* Center: Slim Swift Momentum Combo Gauge */}
        <div className="flex-1 max-w-xs flex items-center gap-1.5 px-2 border-x border-iron-800">
          <Activity className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-iron-900 h-1.5 sm:h-2 rounded-full overflow-hidden border border-iron-750">
              <div
                className={`h-full transition-all duration-300 ${
                  isEnemyTurn
                    ? 'bg-blood-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : hordeTimelinePercent >= 75
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${Math.min(100, hordeTimelinePercent)}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-300 flex-shrink-0">
            {hordeTimelinePercent >= 75 ? '⚡추가턴' : `${hordeTimelinePercent}%`}
          </span>
        </div>

        {/* Right: Chain Counter & Compact Return */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {chainCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500 text-amber-300 text-[10px] font-mono font-black animate-pulse">
              x{chainCount}
            </span>
          )}

          <button
            onClick={() => {
              if (window.confirm('이번 원정을 포기하고 마을로 귀환하시겠습니까? (미저장 전리품 몰수)')) {
                abandonDungeon();
              }
            }}
            className="p-1 sm:px-2 sm:py-0.5 bg-iron-900 hover:bg-iron-800 border border-iron-750 hover:border-red-500/70 text-gray-400 hover:text-red-300 rounded text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
            title="마을로 안전하게 귀환"
          >
            <Home className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">귀환</span>
          </button>
        </div>
      </div>

      {/* Active Dungeon Shrine Buffs Mini Pill (Only when present, compact 18px) */}
      {dungeonBuffs.length > 0 && (
        <div className="bg-iron-950/80 border border-purple-500/40 rounded px-2 py-0.5 flex items-center gap-1.5 overflow-x-auto text-[9px] text-purple-200 font-mono shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300 flex-shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {dungeonBuffs.map(b => (
              <span key={b.id} className="bg-purple-950/90 px-1.5 py-0.2 rounded border border-purple-700/60 flex items-center gap-1">
                <span>{b.icon}</span>
                <strong>{b.name}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BattleHeader.displayName = 'BattleHeader';
