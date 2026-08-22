import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { Shield, Flame, Coins, Sparkles, MapPin, Home, RotateCcw, AlertTriangle } from 'lucide-react';

export const TopHUD: React.FC = () => {
  const { playerStats, viewMode, currentDungeon, setViewMode, resetGameSave } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const ragePercent = Math.max(0, Math.min(100, (playerStats.rage / playerStats.maxRage) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerStats.exp / playerStats.maxExp) * 100));

  return (
    <>
      <header className="bg-iron-950 border-b border-iron-750 px-2 sm:px-3 py-1.5 sm:py-2 text-xs md:text-sm select-none sticky top-0 z-40 shadow-xl overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
          {/* Left: Player Level & Class & Exp & Quick Reset */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            <div className="flex flex-col items-center justify-center min-w-[34px] sm:min-w-[40px] h-8 sm:h-9 px-1 bg-iron-900 border-2 border-brass-400 rounded shadow">
              <span className="text-[8px] font-mono text-blood-400 font-black leading-none uppercase">LV</span>
              <span className="font-cinzel font-black text-brass-200 text-xs sm:text-base leading-none mt-0.5">{playerStats.level}</span>
            </div>

            {/* Reset Button next to Level Badge */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1 sm:p-1.5 bg-blood-950/80 hover:bg-blood-900 border border-blood-700/80 text-blood-300 hover:text-white rounded shadow transition flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold"
              title="캐릭터 세이브 초기화 (Lv 1 리셋)"
            >
              <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">초기화</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 font-cinzel font-bold text-gray-100 text-xs sm:text-sm tracking-wide">
                <span>광전사</span>
                {playerStats.statPoints > 0 && (
                  <span className="bg-amber-500/30 text-amber-200 border border-amber-400 text-[10px] px-1 py-0.2 rounded font-bold animate-pulse">
                    +{playerStats.statPoints}P
                  </span>
                )}
              </div>
              {/* Exp bar */}
              <div className="w-20 sm:w-32 md:w-36 bg-iron-900 h-1 sm:h-1.5 rounded-full overflow-hidden mt-0.5 sm:mt-1 border border-iron-700">
                <div
                  className="bg-purple-400 h-full transition-all duration-300 shadow-[0_0_6px_rgba(192,132,252,0.8)]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: HP & Rage Bars */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-[200px] sm:max-w-xs md:max-w-md justify-center">
            {/* HP */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-blood-300 font-bold mb-0.5">
                <span className="flex items-center gap-0.5">
                  <Shield className="w-3 h-3 text-blood-400" /> HP
                </span>
                <span className="text-white text-[9px] sm:text-xs">{playerStats.hp}/{playerStats.maxHp}</span>
              </div>
              <div className="w-full bg-iron-900 h-2 sm:h-3 rounded overflow-hidden border border-iron-700 relative shadow-inner">
                <div
                  className="bg-gradient-to-r from-blood-700 via-blood-600 to-blood-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Rage */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-amber-300 font-bold mb-0.5">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-400" /> Rage
                </span>
                <span className="text-white text-[9px] sm:text-xs">{playerStats.rage}/{playerStats.maxRage}</span>
              </div>
              <div className="w-full bg-iron-900 h-2 sm:h-3 rounded overflow-hidden border border-iron-700 relative shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                  style={{ width: `${ragePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Currencies & Location */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 font-mono">
            {/* Gold */}
            <div className="flex items-center space-x-1 text-brass-200 bg-iron-900 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border border-brass-600/60 shadow">
              <Coins className="w-3.5 h-3.5 text-brass-400" />
              <span className="font-bold text-[11px] sm:text-sm">{playerStats.gold.toLocaleString()}G</span>
            </div>

            {/* Shards */}
            <div className="hidden sm:flex items-center space-x-1.5 text-purple-200 bg-iron-900 px-2.5 py-1 rounded border border-purple-600/60 shadow">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs md:text-sm">{playerStats.shards}</span>
            </div>

            {/* Quick Location Badge */}
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-iron-850 rounded border border-iron-700 text-gray-200 font-medium">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">
                {viewMode === 'town' ? '로그 캠프' : viewMode === 'dungeon_select' ? '던전 관문' : currentDungeon.name}
              </span>
              <span className="md:hidden">
                {viewMode === 'town' ? '마을' : viewMode === 'dungeon_select' ? '관문' : '던전'}
              </span>
            </div>

            {/* Mode Switcher Shortcut */}
            {viewMode !== 'town' && (
              <button
                onClick={() => setViewMode('town')}
                className="px-2.5 py-1 bg-iron-850 hover:bg-iron-750 border border-brass-600/60 rounded text-brass-200 text-xs flex items-center gap-1 transition shadow font-bold"
                title="마을로 즉시 이동"
              >
                <Home className="w-3.5 h-3.5 text-brass-400" />
                <span className="hidden sm:inline">마을</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Reset Modal Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-iron-950 border-2 border-blood-500 rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4 animate-scale-in select-none">
            <div className="flex items-center gap-2.5 text-blood-300 border-b border-blood-800 pb-2.5">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <h3 className="font-cinzel font-black text-base text-white">캐릭터 데이터 완전 초기화</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              정말로 캐릭터를 초기화하시겠습니까?<br />
              <span className="text-amber-300 font-bold">레벨 1, 기본 장비, 기본 룬, 초기 스탯</span>으로 완전히 리셋되며 되돌릴 수 없습니다.
            </p>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-iron-800">
              <button
                onClick={() => { resetGameSave(); setShowResetConfirm(false); }}
                className="px-4 py-2 bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-black text-xs rounded-lg shadow transition"
              >
                초기화 확인 (Lv 1 시작)
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 bg-iron-800 hover:bg-iron-700 text-gray-300 font-bold text-xs rounded-lg transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
