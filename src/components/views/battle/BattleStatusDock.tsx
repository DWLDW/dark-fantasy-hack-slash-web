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
    <div className="w-full space-y-1 select-none font-sans flex-shrink-0 relative pt-1 border-t border-iron-850">
      
      {/* 📜 Full-Screen Backdrop & Scrollable Combat Logs Modal Popup */}
      {showLogs && (
        <div
          onClick={() => setShowLogs(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-iron-950 border-2 border-brass-500 rounded-xl p-4 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-2 relative animate-scale-in text-gray-200 select-none"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-iron-750 pb-2">
              <div className="flex items-center gap-1.5">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel font-black text-sm text-white">실시간 전투 기록</h3>
              </div>
              <button
                onClick={() => setShowLogs(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Logs */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-1 pr-1 font-mono text-[11px] leading-relaxed">
              {combatLogs.length === 0 ? (
                <div className="text-gray-500 py-6 text-center">전투 기록이 없습니다.</div>
              ) : (
                combatLogs.slice(-30).map(log => (
                  <div
                    key={log.id}
                    className="p-1.5 rounded bg-iron-900/80 border border-iron-800 flex items-start gap-1.5"
                  >
                    <span className="text-gray-500 font-bold text-[9px] flex-shrink-0 mt-0.5">
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
              <span className="text-[10px] text-gray-500 font-mono">단축키 [Esc]</span>
              <button
                onClick={() => setShowLogs(false)}
                className="px-3 py-1 rounded bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-200 text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row: Compact Dual Gauges (Left 7 cols) & Potions (Right 5 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
        
        {/* Dual Gauges Column (Fixed Height Bars) */}
        <div className="sm:col-span-7 flex flex-col gap-1">
          
          {/* LIFE Bar */}
          <div className="relative">
            {lifeFloater && (
              <div
                key={lifeFloater.id}
                className={`absolute -top-4 right-2 z-40 font-mono font-black text-[9px] pointer-events-none animate-bounce px-1 rounded ${
                  lifeFloater.type === 'damage'
                    ? 'text-red-300 bg-red-950 border border-red-500'
                    : 'text-emerald-300 bg-emerald-950 border border-emerald-400'
                }`}
              >
                {lifeFloater.text}
              </div>
            )}

            <div className={`w-full h-5 sm:h-6 rounded bg-iron-950 border relative overflow-hidden flex items-center justify-between px-2 shadow-inner ${
              isLowHp ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]' : 'border-red-900/80'
            }`}>
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blood-900 to-red-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (expectedNextHp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
              />

              {dmgToHp > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-red-400/40 border-r border-red-300 animate-pulse transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (playerStats.hp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />
              )}

              {shieldAmount > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-cyan-600/80 border-r border-cyan-300 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (shieldAmount / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />
              )}

              <div className="relative z-10 font-mono font-bold text-xs text-rose-100 flex items-center gap-1.5">
                <span>❤️ 체력</span>
                {shieldAmount > 0 && <span className="text-[10px] text-cyan-300 font-bold">+🛡️{shieldAmount}</span>}
                {expectedIncomingDmg > 0 && (
                  <span className="text-[10px] text-amber-300 font-black px-1.5 py-0.2 rounded bg-red-950 border border-amber-400/80 shadow">
                    ⚠️ -{expectedIncomingDmg} 피격
                  </span>
                )}
              </div>

              <div className="relative z-10 font-mono font-black text-xs sm:text-sm text-white flex items-center gap-1">
                {expectedIncomingDmg > 0 && (
                  <span className="text-[10px] sm:text-xs text-orange-300 font-mono font-normal mr-0.5">
                    ({expectedNextHp})
                  </span>
                )}
                <span>{playerStats.hp}</span>
                <span className="text-[10px] sm:text-xs text-rose-200/80 font-normal">/ {playerStats.maxHp}</span>
              </div>
            </div>
          </div>

          {/* RAGE Bar */}
          <div className="relative">
            {rageFloater && (
              <div
                key={rageFloater.id}
                className="absolute -top-4 right-2 z-40 font-mono font-black text-[9px] pointer-events-none animate-bounce px-1 rounded text-amber-300 bg-amber-950 border border-amber-500"
              >
                {rageFloater.text}
              </div>
            )}

            <div className="w-full h-4 sm:h-5 rounded bg-iron-950 border border-amber-800/80 relative overflow-hidden flex items-center justify-between px-2 shadow-inner">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-900 via-amber-600 to-yellow-500 transition-all duration-200 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (playerStats.rage / Math.max(1, playerStats.maxRage)) * 100))}%` }}
              />

              <div className="relative z-10 font-mono font-bold text-[10px] text-amber-100 flex items-center gap-1">
                <span>🔥 분노</span>
              </div>

              <div className="relative z-10 font-mono font-black text-[11px] sm:text-xs text-white">
                {playerStats.rage} <span className="text-[10px] text-amber-200/80 font-normal">/ {playerStats.maxRage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumables Quick Belt & Combat Log Button (Right 5 cols) */}
        <div className="sm:col-span-5 flex items-center gap-1 font-mono">
          <div className="grid grid-cols-4 gap-1 flex-1">
            {consumables.map(item => {
              const icon = POTION_ICONS[item.id] || '🧪';
              const shortName = POTION_SHORT_NAMES[item.id] || item.name.replace(' 포션', '');

              return (
                <button
                  key={item.id}
                  onClick={() => useConsumable(item.id)}
                  disabled={item.count <= 0}
                  className={`p-0.5 sm:p-1 rounded border flex flex-col items-center justify-center transition shadow-sm cursor-pointer ${
                    item.count > 0
                      ? 'bg-iron-900 border-iron-750 text-gray-100 hover:border-amber-400 hover:bg-iron-850 active:scale-95'
                      : 'bg-iron-950 text-gray-600 border-iron-900 opacity-40 cursor-not-allowed'
                  }`}
                  title={`${item.name} [${item.hotkey}]`}
                >
                  <div className="flex items-center justify-between w-full text-[8px] font-black leading-none">
                    <span className="text-amber-400">{item.hotkey}</span>
                    <span className={item.count > 0 ? 'text-amber-300' : 'text-gray-600'}>x{item.count}</span>
                  </div>
                  <div className="text-[9px] font-bold text-gray-200 truncate flex items-center gap-0.5 mt-0.5 leading-none">
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{shortName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mini Combat Log Button */}
          <button
            onClick={() => setShowLogs(true)}
            className="p-1.5 rounded border border-iron-800 bg-iron-900 text-gray-400 hover:text-white hover:border-amber-400 transition cursor-pointer flex-shrink-0"
            title="실시간 전투 로그 보기"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

BattleStatusDock.displayName = 'BattleStatusDock';
