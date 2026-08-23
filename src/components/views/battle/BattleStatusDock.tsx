import React, { useState } from 'react';
import { useGame } from '../../../state/gameStore';

interface BattleStatusDockProps {
  expectedIncomingDmg: number;
  isLowHp: boolean;
  lifeFloater: { text: string; type: 'damage' | 'heal'; id: number } | null;
  rageFloater: { text: string; type: 'spend' | 'gain'; id: number } | null;
}

export const BattleStatusDock: React.FC<BattleStatusDockProps> = React.memo(({
  expectedIncomingDmg,
  isLowHp,
  lifeFloater,
  rageFloater
}) => {
  const {
    playerStats,
    consumables,
    useConsumable,
    combatLogs,
    monsters
  } = useGame();

  const [showLogs, setShowLogs] = useState(false);
  const isCleared = monsters.length === 0;

  const shieldAmount = playerStats.shield || 0;
  const dmgToHp = Math.max(0, expectedIncomingDmg - shieldAmount);
  const expectedNextHp = Math.max(0, playerStats.hp - dmgToHp);

  return (
    <div className="space-y-2 select-none font-sans">
      {/* ROW 2: Horizontal Dual Gauges (ㅡ 형태 LIFE / RAGE) & Consumables Quick Belt */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 border-t border-iron-800">
        
        {/* Gauges Column (ㅡ Horizontal Bars) */}
        <div className="md:col-span-7 space-y-1.5 relative">
          {/* LIFE Gauge Bar (ㅡ 형태) */}
          <div className="relative">
            {lifeFloater && (
              <div
                key={lifeFloater.id}
                className={`absolute -top-6 right-2 z-50 font-mono font-black text-xs pointer-events-none animate-bounce drop-shadow px-2 py-0.2 rounded ${
                  lifeFloater.type === 'damage'
                    ? 'text-red-300 bg-red-950/95 border border-red-500'
                    : 'text-emerald-300 bg-emerald-950/95 border border-emerald-400'
                }`}
              >
                {lifeFloater.text}
              </div>
            )}

            <div className={`w-full h-7 sm:h-8 rounded-lg bg-iron-950 border-2 relative overflow-hidden flex items-center justify-between px-2.5 shadow-inner ${
              isLowHp
                ? 'border-red-500 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                : 'border-red-800/80 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
            }`}>
              {/* Solid Remaining HP Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blood-900 via-red-600 to-rose-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (expectedNextHp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
              />

              {/* Anticipated Lost HP Preview (Semi-Transparent Pulse) */}
              {dmgToHp > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-red-400/40 border-r-2 border-red-300 animate-pulse transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (playerStats.hp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />
              )}

              {/* Shield Barrier Overlay */}
              {shieldAmount > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-900/80 via-sky-600/80 to-cyan-400/90 border-r-2 border-cyan-200 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (shieldAmount / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />
              )}

              {/* Glass Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none" />

              {/* Content Overlay */}
              <div className="relative z-10 font-mono font-black text-xs text-rose-100 flex items-center gap-1.5 drop-shadow">
                <span>❤️ LIFE</span>
                {shieldAmount > 0 && (
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-1 rounded border border-cyan-600">
                    🛡️+{shieldAmount}
                  </span>
                )}
                {expectedIncomingDmg > 0 && !isCleared && (
                  <span className="text-[9px] text-red-200 font-bold bg-red-950/90 px-1 py-0.2 rounded border border-red-500 animate-pulse">
                    피격 -{expectedIncomingDmg}
                  </span>
                )}
              </div>

              <div className="relative z-10 font-mono font-black text-xs sm:text-sm text-white drop-shadow">
                {playerStats.hp} <span className="text-[10px] text-rose-200/80 font-bold">/ {playerStats.maxHp}</span>
              </div>
            </div>
          </div>

          {/* RAGE Gauge Bar (ㅡ 형태) */}
          <div className="relative">
            {rageFloater && (
              <div
                key={rageFloater.id}
                className="absolute -top-6 right-2 z-50 font-mono font-black text-xs pointer-events-none animate-bounce drop-shadow px-2 py-0.2 rounded text-amber-300 bg-amber-950/95 border border-amber-500"
              >
                {rageFloater.text}
              </div>
            )}

            <div className="w-full h-6 sm:h-7 rounded-lg bg-iron-950 border-2 border-amber-700/80 relative overflow-hidden flex items-center justify-between px-2.5 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              {/* Solid Rage Fill */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-950 via-amber-600 to-yellow-400 transition-all duration-200 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (playerStats.rage / Math.max(1, playerStats.maxRage)) * 100))}%` }}
              />

              {/* Glass Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none" />

              {/* Content Overlay */}
              <div className="relative z-10 font-mono font-black text-xs text-amber-100 flex items-center gap-1.5 drop-shadow">
                <span>🔥 RAGE</span>
              </div>

              <div className="relative z-10 font-mono font-black text-xs sm:text-sm text-white drop-shadow">
                {playerStats.rage} <span className="text-[10px] text-amber-200/80 font-bold">/ {playerStats.maxRage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumables Quick Belt (소모품 1 2 3 4) Column */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-1 font-mono">
          <div className="grid grid-cols-4 gap-1.5 h-full">
            {consumables.map(item => (
              <button
                key={item.id}
                onClick={() => useConsumable(item.id)}
                disabled={item.count <= 0}
                className={`p-1 sm:p-1.5 rounded-lg border flex flex-col items-center justify-center transition shadow cursor-pointer ${
                  item.count > 0
                    ? 'bg-iron-900/90 border-iron-750 text-gray-100 hover:border-amber-400 hover:bg-iron-850 active:scale-95'
                    : 'bg-iron-950 text-gray-600 border-iron-850 opacity-40 cursor-not-allowed'
                }`}
                title={`${item.name} (${item.description}) [${item.hotkey}]`}
              >
                <div className="flex items-center justify-between w-full text-[9px] font-black">
                  <span className="text-amber-400">[${item.hotkey}]</span>
                  <span className={`${item.count > 0 ? 'text-amber-300' : 'text-gray-600'}`}>x${item.count}</span>
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-gray-200 truncate mt-0.5">
                  {item.name.replace(' 포션', '')}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-0.5">
            <span>단축키 [1~4]</span>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="hover:text-white underline cursor-pointer text-[10px]"
            >
              {showLogs ? '로그 닫기' : '전투 로그'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Combat Logs Drawer */}
      {showLogs && (
        <div className="p-2 bg-iron-950 rounded border border-iron-800 max-h-24 overflow-y-auto font-mono text-[10px] text-gray-300 space-y-0.5 animate-fade-in">
          {combatLogs.slice(-6).map(log => (
            <div key={log.id} className="truncate">
              <span className="text-gray-500">[{log.timestamp}]</span> {log.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BattleStatusDock.displayName = 'BattleStatusDock';
