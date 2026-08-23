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
    <div className="space-y-1.5 font-sans">
      {/* Top Header Grid: Mini Room Graph + Wait ATB + Chain + Safe Town Return */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-center">
        <div className="lg:col-span-7">
          <MiniRoomGraph />
        </div>

        <div className="lg:col-span-5 bg-iron-900/95 border border-iron-750 rounded-lg p-1.5 sm:p-2 flex items-center justify-between shadow gap-2">
          {/* Wait ATB Horde Timeline */}
          <div className="flex-1 pr-2 border-r border-iron-750">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-gray-300 font-bold mb-0.5">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blood-400" />
                {isEnemyTurn ? <span className="text-blood-400 animate-pulse font-black">적 반격!</span> : 'Wait ATB'}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400">{isEnemyTurn ? 'STRIKE' : '대기'}</span>
            </div>
            <div className="w-full bg-iron-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-iron-700">
              <div
                className={`h-full transition-all duration-300 ${
                  isEnemyTurn
                    ? 'bg-gradient-to-r from-blood-600 to-blood-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : 'bg-gradient-to-r from-blue-700 to-blue-500'
                }`}
                style={{ width: `${hordeTimelinePercent}%` }}
              />
            </div>
          </div>

          {/* Action Chain Counter */}
          <div className="text-center px-1">
            <div className="text-[9px] text-gray-400 font-mono font-bold">1회 처치</div>
            <div className={`font-cinzel font-black text-sm sm:text-base ${chainCount > 0 ? 'text-amber-300 animate-chain-pop' : 'text-gray-500'}`}>
              {chainCount > 0 ? `x${chainCount}` : 'x0'}
            </div>
          </div>

          {/* Safe Town Return Button */}
          <button
            onClick={() => {
              if (window.confirm('이번 원정을 포기하고 마을로 안전하게 귀환하시겠습니까? (미저장 전리품 몰수)')) {
                abandonDungeon();
              }
            }}
            className="px-2.5 py-1 bg-iron-950 hover:bg-iron-800 border border-iron-750 hover:border-red-500/70 text-gray-400 hover:text-red-300 rounded text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow flex-shrink-0"
            title="원정을 중단하고 마을로 안전하게 귀환합니다"
          >
            <Home className="w-3 h-3 text-amber-400" />
            <span>귀환</span>
          </button>
        </div>
      </div>

      {/* Active Dungeon Shrine Buffs Banner */}
      {dungeonBuffs.length > 0 && (
        <div className="bg-iron-950 border border-purple-500/60 rounded px-2.5 py-0.5 flex items-center gap-2 overflow-x-auto text-[10px] sm:text-xs text-purple-200 font-mono shadow">
          <span className="font-bold flex items-center gap-1 flex-shrink-0 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> 성소 축복:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {dungeonBuffs.map(b => (
              <span key={b.id} className="bg-purple-950 px-1.5 py-0.2 rounded border border-purple-700 flex items-center gap-1">
                <span>{b.icon}</span>
                <strong>{b.name}</strong> ({b.description})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BattleHeader.displayName = 'BattleHeader';
