import React, { useState, useEffect } from 'react';
import { useGame } from '../../../state/gameStore';
import { X, BookOpen, ScrollText } from 'lucide-react';

interface BattleStatusDockProps {
  expectedIncomingDmg: number;
  isLowHp: boolean;
  lifeFloater: { text: string; type: 'damage' | 'heal'; id: number } | null;
  rageFloater: { text: string; type: 'spend' | 'gain'; id: number } | null;
}

const POTION_ICONS: Record<string, string> = {
  c_hp: '❤️',
  c_iron: '🛡️',
  c_rage: '⚡',
  c_poison: '🧪'
};

const POTION_SHORT_NAMES: Record<string, string> = {
  c_hp: '체력',
  c_iron: '철갑',
  c_rage: '활력',
  c_poison: '맹독'
};

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

  // Close log popup on Escape key
  useEffect(() => {
    if (!showLogs) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowLogs(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogs]);

  return (
    <div className="space-y-1.5 select-none font-sans flex-shrink-0 relative">
      
      {/* 📜 Full-Screen Backdrop & Scrollable Combat Logs Modal Popup */}
      {showLogs && (
        <div
          onClick={() => setShowLogs(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-iron-950 border-2 border-brass-500 rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-3 relative animate-scale-in text-gray-200 select-none"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-iron-750 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500 flex items-center justify-center text-amber-400 shadow flex-shrink-0">
                  <ScrollText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-sm sm:text-base text-white tracking-wide">
                    실시간 전투 기록 (Combat Logs)
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    최근 {combatLogs.length}개의 전투 이벤트 기록
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowLogs(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Logs Container */}
            <div className="flex-1 overflow-y-auto max-h-[55vh] space-y-1.5 pr-1 font-mono text-xs leading-relaxed">
              {combatLogs.length === 0 ? (
                <div className="text-gray-500 py-8 text-center">전투 기록이 없습니다.</div>
              ) : (
                combatLogs.slice(-30).map(log => (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-iron-900/80 border border-iron-800 flex items-start gap-2 hover:border-iron-700 transition"
                  >
                    <span className="text-gray-500 font-bold text-[10px] flex-shrink-0 mt-0.5">
                      [{log.timestamp}]
                    </span>
                    <span className={`flex-1 ${
                      log.type === 'loot'
                        ? 'text-amber-300 font-bold'
                        : log.type === 'chain'
                        ? 'text-purple-300 font-bold'
                        : log.type === 'system'
                        ? 'text-cyan-300'
                        : 'text-gray-200'
                    }`}>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-iron-800 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">단축키 [Esc] 키로 닫기</span>
              <button
                onClick={() => setShowLogs(false)}
                className="px-4 py-1.5 rounded-lg bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-200 hover:text-white text-xs font-mono font-bold transition shadow cursor-pointer"
              >
                닫기 [Esc]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROW 2: Strictly Fixed Horizontal Dual Gauges (ㅡ LIFE / RAGE) & Consumables Quick Belt */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 border-t border-iron-800 items-center">
        
        {/* Gauges Column (Rock-Solid Fixed ㅡ Horizontal Bars) */}
        <div className="md:col-span-7 space-y-1 relative">
          
          {/* LIFE Gauge Bar (Strictly Fixed Height, Zero Shift) */}
          <div className="relative">
            {lifeFloater && (
              <div
                key={lifeFloater.id}
                className={`absolute -top-5 right-2 z-40 font-mono font-black text-xs pointer-events-none animate-bounce drop-shadow px-2 py-0.2 rounded ${
                  lifeFloater.type === 'damage'
                    ? 'text-red-300 bg-red-950/95 border border-red-500'
                    : 'text-emerald-300 bg-emerald-950/95 border border-emerald-400'
                }`}
              >
                {lifeFloater.text}
              </div>
            )}

            <div className={`w-full h-7 sm:h-8 rounded-lg bg-iron-950 border-2 relative overflow-hidden flex items-center justify-between px-2.5 shadow-inner transition-colors duration-200 ${
              isLowHp
                ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.85)]'
                : 'border-red-800/80 shadow-[0_0_10px_rgba(220,38,38,0.25)]'
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

              {/* 1. Left Label Slot (Strictly Fixed 70px) */}
              <div className="relative z-10 font-mono font-black text-xs text-rose-100 flex items-center gap-1 drop-shadow w-[70px] flex-shrink-0">
                <span>❤️ LIFE</span>
                {shieldAmount > 0 && (
                  <span className="text-[9px] text-cyan-300 font-bold bg-cyan-950/90 px-1 rounded border border-cyan-600">
                    +🛡️
                  </span>
                )}
              </div>

              {/* 2. Center Status Slot */}
              <div className="relative z-10 font-mono font-bold text-[9px] text-center flex-1 truncate px-1">
                {expectedIncomingDmg > 0 && !isCleared ? (
                  <span className="text-red-200 bg-red-950/90 px-1.5 py-0.2 rounded border border-red-500 animate-pulse">
                    피격 -{expectedIncomingDmg}
                  </span>
                ) : shieldAmount > 0 ? (
                  <span className="text-cyan-300 font-mono">
                    쉴드 {shieldAmount}
                  </span>
                ) : null}
              </div>

              {/* 3. Right Value Slot (Strictly Fixed 90px, Zero Shift) */}
              <div className="relative z-10 font-mono font-black text-xs sm:text-sm text-white drop-shadow w-[90px] text-right flex-shrink-0">
                {playerStats.hp} <span className="text-[10px] text-rose-200/80 font-bold">/ {playerStats.maxHp}</span>
              </div>
            </div>
          </div>

          {/* RAGE Gauge Bar (Strictly Fixed Height, Zero Shift) */}
          <div className="relative">
            {rageFloater && (
              <div
                key={rageFloater.id}
                className="absolute -top-5 right-2 z-40 font-mono font-black text-xs pointer-events-none animate-bounce drop-shadow px-2 py-0.2 rounded text-amber-300 bg-amber-950/95 border border-amber-500"
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

              {/* 1. Left Label Slot (Strictly Fixed 70px) */}
              <div className="relative z-10 font-mono font-black text-xs text-amber-100 flex items-center gap-1 drop-shadow w-[70px] flex-shrink-0">
                <span>🔥 RAGE</span>
              </div>

              {/* 2. Center Status Slot */}
              <div className="relative z-10 font-mono text-[9px] text-amber-200/70 text-center flex-1 truncate px-1">
                {playerStats.rage >= playerStats.maxRage ? '⚡ MAX RAGE' : ''}
              </div>

              {/* 3. Right Value Slot (Strictly Fixed 90px, Zero Shift) */}
              <div className="relative z-10 font-mono font-black text-xs sm:text-sm text-white drop-shadow w-[90px] text-right flex-shrink-0">
                {playerStats.rage} <span className="text-[10px] text-amber-200/80 font-bold">/ {playerStats.maxRage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumables Quick Belt (소모품 1 2 3 4) Column */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-1 font-mono">
          <div className="grid grid-cols-4 gap-1.5 h-full">
            {consumables.map(item => {
              const icon = POTION_ICONS[item.id] || '🧪';
              const shortName = POTION_SHORT_NAMES[item.id] || item.name.replace(' 포션', '');

              return (
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
                    <span className="text-amber-400">[{item.hotkey}]</span>
                    <span className={`${item.count > 0 ? 'text-amber-300' : 'text-gray-600'}`}>x{item.count}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-200 truncate mt-0.5 flex items-center gap-0.5">
                    <span>{icon}</span>
                    <span>{shortName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-0.5">
            <span>단축키 [1~4]</span>
            <button
              onClick={() => setShowLogs(true)}
              className={`px-2 py-0.5 rounded border transition cursor-pointer text-[10px] flex items-center gap-1 ${
                showLogs
                  ? 'bg-amber-500 text-iron-950 font-black border-amber-400'
                  : 'bg-iron-900 text-gray-300 border-iron-750 hover:text-white'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>전투 로그</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

BattleStatusDock.displayName = 'BattleStatusDock';
