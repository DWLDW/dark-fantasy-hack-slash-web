import React from 'react';
import { useGame } from '../../state/gameStore';
import { Shield, Flame, Coins, Sparkles, MapPin, Swords, Home } from 'lucide-react';

export const TopHUD: React.FC = () => {
  const { playerStats, viewMode, currentDungeon, setViewMode } = useGame();

  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const ragePercent = Math.max(0, Math.min(100, (playerStats.rage / playerStats.maxRage) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerStats.exp / playerStats.maxExp) * 100));

  return (
    <header className="bg-iron-950 border-b border-iron-750 px-3 py-2 text-xs md:text-sm select-none sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Player Level & Class & Exp */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-iron-900 border-2 border-brass-400 rounded font-cinzel font-bold text-brass-200 text-sm md:text-base shadow">
            {playerStats.level}
            <div className="absolute -bottom-1.5 text-[10px] bg-blood-900 text-blood-200 px-1 rounded border border-blood-600 font-bold">
              Lv
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 font-cinzel font-bold text-gray-100 text-sm tracking-wide">
              <span>광전사 (Warrior)</span>
              {playerStats.statPoints > 0 && (
                <span className="bg-amber-500/30 text-amber-200 border border-amber-400 text-xs px-1.5 py-0.5 rounded font-bold animate-pulse">
                  +{playerStats.statPoints}P
                </span>
              )}
            </div>
            {/* Exp bar */}
            <div className="w-28 md:w-36 bg-iron-900 h-1.5 rounded-full overflow-hidden mt-1 border border-iron-700">
              <div
                className="bg-purple-400 h-full transition-all duration-300 shadow-[0_0_6px_rgba(192,132,252,0.8)]"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: HP & Rage Bars */}
        <div className="flex items-center space-x-4 md:space-x-6 flex-1 max-w-xs md:max-w-md justify-center">
          {/* HP */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center text-xs font-mono text-blood-300 font-bold mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blood-400" /> HP
              </span>
              <span className="text-white">{playerStats.hp} / {playerStats.maxHp}</span>
            </div>
            <div className="w-full bg-iron-900 h-3 md:h-3.5 rounded overflow-hidden border border-iron-700 relative shadow-inner">
              <div
                className="bg-gradient-to-r from-blood-700 via-blood-600 to-blood-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Rage */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center text-xs font-mono text-amber-300 font-bold mb-0.5">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Rage
              </span>
              <span className="text-white">{playerStats.rage} / {playerStats.maxRage}</span>
            </div>
            <div className="w-full bg-iron-900 h-3 md:h-3.5 rounded overflow-hidden border border-iron-700 relative shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                style={{ width: `${ragePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Currencies & Location */}
        <div className="flex items-center space-x-3 font-mono">
          {/* Gold */}
          <div className="flex items-center space-x-1.5 text-brass-200 bg-iron-900 px-2.5 py-1 rounded border border-brass-600/60 shadow">
            <Coins className="w-4 h-4 text-brass-400" />
            <span className="font-bold text-xs md:text-sm">{playerStats.gold.toLocaleString()} G</span>
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
  );
};
