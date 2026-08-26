import React from 'react';
import { useGame } from '../../state/gameStore';
import { Shield, Flame, Coins, Sparkles, MapPin, Home, Settings, Trophy, User } from 'lucide-react';

export const TopHUD: React.FC = React.memo(() => {
  const { playerStats, viewMode, currentDungeon, setViewMode, isLevelUpAnimated, openModal, abandonDungeon, currentUser } = useGame();

  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const ragePercent = Math.max(0, Math.min(100, (playerStats.rage / playerStats.maxRage) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerStats.exp / playerStats.maxExp) * 100));

  return (
    <>
      <header className="bg-gradient-to-b from-iron-900 to-iron-950 border-b-2 border-brass-600/50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs md:text-sm select-none sticky top-0 z-40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
          {/* Left: Player Level & Class & Exp & Settings & Quick Reset */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Level Badge */}
            <div className={`flex flex-col items-center justify-center min-w-[34px] sm:min-w-[40px] h-8 sm:h-9 px-1 rounded shadow transition-all duration-300 relative ${
              isLevelUpAnimated
                ? 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 border-2 border-white ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,1)] scale-110 animate-bounce text-iron-950'
                : 'bg-iron-900 border-2 border-brass-400'
            }`}>
              <span className={`text-[8px] font-mono font-black leading-none uppercase ${
                isLevelUpAnimated ? 'text-iron-950' : 'text-blood-400'
              }`}>
                LV
              </span>
              <span className={`font-cinzel font-black text-xs sm:text-base leading-none mt-0.5 ${
                isLevelUpAnimated ? 'text-iron-950 font-black' : 'text-brass-200'
              }`}>
                {playerStats.level}
              </span>

              {isLevelUpAnimated && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-iron-950 text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-white animate-pulse">
                  LEVEL UP!
                </div>
              )}
            </div>

            {/* Achievements Button */}
            <button
              onClick={() => openModal('achievement')}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 min-h-[32px] sm:min-h-[36px] bg-iron-900 hover:bg-iron-800 border border-amber-500/60 text-amber-300 hover:text-white rounded shadow transition flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold cursor-pointer active:scale-95"
              title="성역의 위업 (업적 및 보상)"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">업적</span>
            </button>

            {/* Auth / Profile Button */}
            <button
              onClick={() => openModal('auth')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 min-h-[32px] sm:min-h-[36px] rounded shadow transition flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold cursor-pointer active:scale-95 ${
                currentUser
                  ? 'bg-gradient-to-r from-amber-950 to-iron-900 border border-amber-400 text-amber-300 hover:text-white'
                  : 'bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-300 hover:text-white'
              }`}
              title={currentUser ? `계정: ${currentUser.displayName} (클라우드 동기화 됨)` : "계정 로그인 / 회원가입 (클라우드 세이브)"}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline truncate max-w-[70px]">
                {currentUser ? currentUser.displayName : '로그인'}
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => openModal('settings')}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 min-h-[32px] sm:min-h-[36px] bg-iron-900 hover:bg-iron-800 border border-brass-600/60 text-brass-300 hover:text-white rounded shadow transition flex items-center justify-center gap-1 text-[10px] sm:text-xs font-mono font-bold cursor-pointer active:scale-95"
              title="게임 설정 & 세이브 백업/복원"
            >
              <Settings className="w-3.5 h-3.5 text-brass-400" />
              <span className="hidden sm:inline">설정</span>
            </button>

            <div className="flex items-center gap-1.5">
              <img
                src="/images/player/berserker_idle.png"
                alt=""
                className="pixel-sprite hidden sm:block h-8 w-auto drop-shadow"
                draggable={false}
              />
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 font-cinzel font-bold text-gray-100 text-xs sm:text-sm tracking-wide">
                <span>광전사</span>
                {playerStats.statPoints > 0 && (
                  <span className="bg-amber-500/30 text-amber-200 border border-amber-400 text-[10px] px-1 py-0.5 rounded font-bold animate-pulse">
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
              <div className="w-full bg-iron-900 h-2.5 sm:h-3.5 rounded overflow-hidden border border-blood-900 relative shadow-inner">
                <div
                  className="bg-gradient-to-r from-blood-700 to-rose-500 h-full transition-all duration-300"
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
                <span className="text-white text-[9px] sm:text-xs font-black">{playerStats.rage}/{playerStats.maxRage}</span>
              </div>
              <div className="w-full bg-iron-900 h-2.5 sm:h-3.5 rounded overflow-hidden border border-amber-900 relative shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-300"
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

            {/* Shards (모바일에서도 골드와 함께 상시 노출) */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-purple-200 bg-iron-900 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border border-purple-600/60 shadow">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="font-bold text-[11px] sm:text-sm">{playerStats.shards}</span>
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
                onClick={() => {
                  if (viewMode === 'battle') {
                    if (!window.confirm('원정을 포기하면 이번 런 전리품을 잃습니다. 계속할까요?')) return;
                    abandonDungeon();
                    return;
                  }
                  setViewMode('town');
                }}
                className="px-2.5 py-1 min-h-[32px] sm:min-h-[36px] bg-iron-850 hover:bg-iron-750 border border-brass-600/60 rounded text-brass-200 text-xs flex items-center justify-center gap-1 transition shadow font-bold cursor-pointer active:scale-95"
                title="마을로 즉시 이동"
              >
                <Home className="w-3.5 h-3.5 text-brass-400" />
                <span className="hidden sm:inline">마을</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
});
TopHUD.displayName = 'TopHUD';

