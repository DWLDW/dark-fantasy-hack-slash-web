import React from 'react';
import { useGame } from '../../state/gameStore';
import { Shield, Flame, Coins, Sparkles, MapPin, Home, Settings, Trophy, User } from 'lucide-react';

// Compact number formatter for mobile currency display (e.g. 1.2M, 15.4k)
const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
};

export const TopHUD: React.FC = React.memo(() => {
  const {
    playerStats,
    viewMode,
    currentDungeon,
    setViewMode,
    isLevelUpAnimated,
    openModal,
    abandonDungeon,
    currentUser,
  } = useGame();

  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const ragePercent = Math.max(0, Math.min(100, (playerStats.rage / playerStats.maxRage) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerStats.exp / playerStats.maxExp) * 100));

  return (
    <header className="bg-gradient-to-b from-iron-900 via-iron-950 to-void border-b border-brass-600/40 px-1.5 sm:px-3 h-10 select-none sticky top-0 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center overflow-x-hidden flex-shrink-0">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-1 sm:gap-3 flex-nowrap">
        
        {/* Left Section: Level, Stats Alert, EXP & Micro-Utility Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          
          {/* Level Badge (Integrated Mini EXP Bar & Modal Trigger) */}
          <button
            onClick={() => openModal('character')}
            className={`flex flex-col items-center justify-center min-w-[30px] sm:min-w-[36px] h-7 sm:h-8 px-1 rounded shadow transition-all duration-300 relative cursor-pointer active:scale-95 overflow-hidden ${
              isLevelUpAnimated
                ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 border border-white ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce text-iron-950'
                : 'bg-iron-900/90 border border-brass-500/70 hover:border-brass-400'
            }`}
            title={`캐릭터 정보 (LV ${playerStats.level}) - EXP: ${playerStats.exp.toLocaleString()}/${playerStats.maxExp.toLocaleString()} (${expPercent.toFixed(1)}%)`}
          >
            <div className="flex items-center gap-0.5 leading-none">
              <span className={`text-[7px] sm:text-[8px] font-mono font-black ${
                isLevelUpAnimated ? 'text-iron-950' : 'text-blood-400'
              }`}>
                LV
              </span>
              <span className={`font-cinzel font-black text-[11px] sm:text-xs leading-none ${
                isLevelUpAnimated ? 'text-iron-950' : 'text-brass-200'
              }`}>
                {playerStats.level}
              </span>
            </div>

            {/* Micro EXP bar inside badge on mobile */}
            <div className="w-full bg-iron-950 h-1 rounded-full overflow-hidden mt-0.5 border border-iron-700/50 sm:hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>

            {isLevelUpAnimated && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-iron-950 text-[7px] font-black px-1 rounded-full whitespace-nowrap shadow border border-white animate-pulse">
                UP!
              </div>
            )}
          </button>

          {/* Stat Points Alert Badge */}
          {playerStats.statPoints > 0 && (
            <button
              onClick={() => openModal('character')}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 text-[9px] sm:text-[10px] h-7 px-1.5 rounded font-black border border-amber-200 shadow flex items-center gap-0.5 cursor-pointer active:scale-95 animate-pulse flex-shrink-0"
              title={`미분배 스탯 포인트: ${playerStats.statPoints}P (클릭하여 분배)`}
            >
              +{playerStats.statPoints}P
            </button>
          )}

          {/* Desktop-only Class Name & Expanded EXP Bar */}
          <div className="hidden sm:flex flex-col justify-center min-w-0">
            <div className="font-cinzel font-bold text-gray-200 text-xs tracking-wide leading-tight">
              광전사
            </div>
            <div
              className="w-20 md:w-28 bg-iron-950 h-1.5 rounded-full overflow-hidden mt-0.5 border border-iron-700 relative shadow-inner"
              title={`경험치: ${playerStats.exp.toLocaleString()} / ${playerStats.maxExp.toLocaleString()} (${expPercent.toFixed(1)}%)`}
            >
              <div
                className="bg-purple-500 h-full transition-all duration-300 shadow-[0_0_6px_rgba(192,132,252,0.8)]"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          {/* Micro Toolbar: Achievements, Auth/Profile, Settings */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-iron-950/80 p-0.5 rounded-md border border-iron-800 flex-shrink-0">
            {/* Achievements */}
            <button
              onClick={() => openModal('achievement')}
              className="w-7 h-7 sm:w-8 sm:h-7 bg-iron-900/90 hover:bg-iron-800 border border-amber-500/40 text-amber-300 hover:text-white rounded flex items-center justify-center gap-1 text-xs font-mono font-bold cursor-pointer active:scale-95 transition"
              title="성역의 위업 (업적 및 보상)"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="hidden xl:inline text-[11px]">업적</span>
            </button>

            {/* Auth / Profile */}
            <button
              onClick={() => openModal('auth')}
              className={`w-7 h-7 sm:w-8 sm:h-7 rounded flex items-center justify-center gap-1 text-xs font-mono font-bold cursor-pointer active:scale-95 transition ${
                currentUser
                  ? 'bg-amber-950/60 hover:bg-amber-900/80 border border-amber-400/60 text-amber-300 hover:text-white'
                  : 'bg-iron-900/90 hover:bg-iron-800 border border-iron-700 text-gray-300 hover:text-white'
              }`}
              title={currentUser ? `계정: ${currentUser.displayName} (클라우드 동기화 됨)` : "계정 로그인 / 회원가입"}
            >
              <div className="relative">
                <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {currentUser && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-iron-950 animate-pulse" />
                )}
              </div>
              <span className="hidden xl:inline truncate max-w-[50px] text-[11px]">
                {currentUser ? currentUser.displayName : '로그인'}
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={() => openModal('settings')}
              className="w-7 h-7 sm:w-8 sm:h-7 bg-iron-900/90 hover:bg-iron-800 border border-brass-600/40 text-brass-300 hover:text-white rounded flex items-center justify-center gap-1 text-xs font-mono font-bold cursor-pointer active:scale-95 transition"
              title="게임 설정 & 세이브 백업/복원"
            >
              <Settings className="w-3.5 h-3.5 text-brass-400 flex-shrink-0" />
              <span className="hidden xl:inline text-[11px]">설정</span>
            </button>
          </div>
        </div>

        {/* Center Section: HP & Rage Bars (Desktop / Tablet Only: md+) */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-1 max-w-xs lg:max-w-md justify-center mx-2 min-w-0">
          {/* HP */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-center text-[10px] font-mono text-blood-300 font-bold mb-0.5 leading-none">
              <span className="flex items-center gap-0.5">
                <Shield className="w-3 h-3 text-blood-400" /> HP
              </span>
              <span className="text-white text-[10px]">{playerStats.hp}/{playerStats.maxHp}</span>
            </div>
            <div className="w-full bg-iron-950 h-2 rounded-full overflow-hidden border border-blood-900/80 relative shadow-inner">
              <div
                className="bg-gradient-to-r from-blood-700 to-rose-500 h-full transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Rage */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-center text-[10px] font-mono text-amber-300 font-bold mb-0.5 leading-none">
              <span className="flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-400" /> Rage
              </span>
              <span className="text-white text-[10px]">{playerStats.rage}/{playerStats.maxRage}</span>
            </div>
            <div className="w-full bg-iron-950 h-2 rounded-full overflow-hidden border border-amber-900/80 relative shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-300"
                style={{ width: `${ragePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Currencies, Location & Town Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 font-mono flex-shrink-0">
          
          {/* Gold Badge */}
          <div
            className="flex items-center gap-1 text-brass-200 bg-iron-950/80 px-1.5 sm:px-2 h-7 rounded border border-brass-600/50 shadow"
            title={`보유 골드: ${playerStats.gold.toLocaleString()} Gold`}
          >
            <Coins className="w-3.5 h-3.5 text-brass-400 flex-shrink-0" />
            <span className="font-black text-[11px] sm:text-xs leading-none">
              <span className="sm:hidden">{formatCompactNumber(playerStats.gold)}</span>
              <span className="hidden sm:inline">{playerStats.gold.toLocaleString()}G</span>
            </span>
          </div>

          {/* Shards Badge */}
          <div
            className="flex items-center gap-1 text-purple-200 bg-iron-950/80 px-1.5 sm:px-2 h-7 rounded border border-purple-600/50 shadow"
            title={`보유 영혼 파편: ${playerStats.shards.toLocaleString()} Shards`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="font-black text-[11px] sm:text-xs leading-none">
              {formatCompactNumber(playerStats.shards)}
            </span>
          </div>

          {/* Quick Location Badge (Large screens only) */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] px-2 h-7 bg-iron-900 rounded border border-iron-700 text-gray-200 font-medium">
            <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
            <span className="truncate max-w-[100px]">
              {viewMode === 'town' ? '로그 캠프' : viewMode === 'dungeon_select' ? '던전 관문' : currentDungeon.name}
            </span>
          </div>

          {/* Mode Switcher / Town / Abandon Button */}
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
              className={`h-7 px-1.5 sm:px-2 rounded text-xs flex items-center justify-center gap-1 transition shadow font-bold cursor-pointer active:scale-95 flex-shrink-0 ${
                viewMode === 'battle'
                  ? 'bg-blood-950/80 hover:bg-blood-900 border border-blood-500/80 text-blood-200'
                  : 'bg-iron-850 hover:bg-iron-750 border border-brass-600/60 text-brass-200'
              }`}
              title={viewMode === 'battle' ? "원정 포기하고 마을로 귀환" : "마을로 이동"}
            >
              <Home className="w-3.5 h-3.5 text-brass-400 flex-shrink-0" />
              <span className="hidden sm:inline text-[11px]">
                {viewMode === 'battle' ? '포기' : '마을'}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
});

TopHUD.displayName = 'TopHUD';
