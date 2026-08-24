import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Crown, Shield, Flame, Skull, Swords, AlertTriangle, Zap } from 'lucide-react';

/**
 * BossHUD — Dedicated boss status panel rendered above the 5-lane battlefield
 * Only renders when current room is a boss room and a boss monster exists.
 */
export const BossHUD: React.FC = React.memo(() => {
  const {
    monsters,
    currentDungeon,
    currentRoomId,
    bossTurnCount,
    bossGuardActive
  } = useGame();

  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const isBossRoom = currentRoom?.type === 'boss';
  const boss = monsters.find(m => m.rank === 'boss' && m.hp > 0);

  // Determine boss gimmick type from monster data
  const gimmickType = useMemo(() => {
    if (!boss?.bossGimmick) return null;
    const g = boss.bossGimmick;
    if (g.includes('포효')) return 'roar';
    if (g.includes('소환')) return 'summon';
    if (g.includes('피해') || g.includes('감소')) return 'guard';
    return null;
  }, [boss?.bossGimmick]);

  // Gimmick countdown calculations
  const gimmickInfo = useMemo(() => {
    if (!gimmickType) return null;

    if (gimmickType === 'roar') {
      const interval = 3;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🔥',
        label: '광역 포효',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '전 레인 광역 피해 + 보호막 파괴',
        color: 'from-orange-600 to-red-600',
        bgColor: 'bg-orange-950/80',
        borderColor: 'border-orange-500',
        isImminent: turnsUntil <= 1
      };
    }

    if (gimmickType === 'guard') {
      const interval = 4;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🛡️',
        label: '방어 태세',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '받는 피해 70% 감소 (1턴)',
        color: 'from-blue-600 to-cyan-500',
        bgColor: 'bg-blue-950/80',
        borderColor: 'border-blue-500',
        isImminent: turnsUntil <= 1
      };
    }

    if (gimmickType === 'summon') {
      const bossHpPercent = boss ? (boss.hp / boss.maxHp) * 100 : 100;
      return {
        icon: '💀',
        label: '하수인 소환',
        countdown: bossHpPercent > 50 ? `HP ≤50%` : '발동!',
        progress: Math.max(0, 100 - (bossHpPercent / 50) * 100),
        description: 'HP 50% 이하 시 하수인 2마리 소환',
        color: 'from-purple-600 to-violet-500',
        bgColor: 'bg-purple-950/80',
        borderColor: 'border-purple-500',
        isImminent: bossHpPercent <= 55
      };
    }

    return null;
  }, [gimmickType, bossTurnCount, boss]);

  if (!isBossRoom || !boss) return null;

  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  const isEnraged = hpPercent <= 30;
  const isLowHp = hpPercent <= 50;
  const bossDisplayName = boss.name.replace(/^👑\s*/, '').replace(/^우두머리:\s*/, '');
  const chargePercent = boss.intent?.chargePercent || 0;

  return (
    <div
      className={`relative rounded-xl border-2 p-2.5 sm:p-3 shadow-2xl transition-all duration-300 overflow-hidden ${
        isEnraged
          ? 'animate-boss-enrage bg-gradient-to-r from-red-950 via-iron-950 to-red-950 border-red-500'
          : bossGuardActive
          ? 'animate-boss-guard bg-gradient-to-r from-blue-950/80 via-iron-950 to-blue-950/80 border-blue-400'
          : 'bg-gradient-to-r from-iron-950 via-red-950/40 to-iron-950 border-amber-500/80'
      }`}
    >
      {/* Ambient background glow */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 ${
        isEnraged ? 'bg-gradient-to-t from-red-600/40 via-transparent to-transparent' : 'bg-gradient-to-t from-amber-600/20 via-transparent to-transparent'
      }`} />

      {/* Row 1: Boss Icon + Name + Stats */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 mb-2">
        {/* Boss Icon */}
        <div className={`relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-lg ${
          isEnraged
            ? 'bg-red-900 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
            : 'bg-iron-900 border-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
        }`}>
          <span>{boss.icon || '👑'}</span>
          {isEnraged && (
            <span className="absolute -top-1 -right-1 text-[10px] animate-pulse">⚡</span>
          )}
        </div>

        {/* Boss Name & Tags */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <h3 className={`font-cinzel font-black text-sm sm:text-base truncate ${
              isEnraged ? 'text-red-300' : 'text-amber-200'
            }`}>
              {bossDisplayName}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {/* Gimmick Tag */}
            {boss.bossGimmick && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${
                gimmickType === 'roar' ? 'bg-orange-950/80 border-orange-500 text-orange-300'
                : gimmickType === 'guard' ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                : 'bg-purple-950/80 border-purple-500 text-purple-300'
              }`}>
                {gimmickType === 'roar' ? '🔥 포효' : gimmickType === 'guard' ? '🛡️ 방어' : '💀 소환'}
              </span>
            )}
            {/* Enrage Tag */}
            {isEnraged && (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-red-600 text-white border border-red-300 animate-pulse">
                ⚡ 광란! +50% ATK
              </span>
            )}
            {/* Guard Active */}
            {bossGuardActive && (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-blue-600 text-white border border-blue-300 animate-pulse">
                🛡️ 방어 태세 발동!
              </span>
            )}
          </div>
        </div>

        {/* Boss Stats Compact */}
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5 text-[10px] sm:text-[11px] font-mono">
          <span className="flex items-center gap-1 text-red-300">
            <Swords className="w-3 h-3" />
            <span className="font-black">{boss.intent.damage || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-blue-300">
            <Shield className="w-3 h-3" />
            <span className="font-black">{boss.defense}</span>
          </span>
          {chargePercent > 0 && (
            <span className={`flex items-center gap-1 font-black ${
              chargePercent >= 75 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
            }`}>
              <Zap className="w-3 h-3" />
              <span>{chargePercent}%</span>
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Boss HP Bar (Large) */}
      <div className="relative z-10 mb-2">
        <div className="relative w-full bg-iron-950 rounded-full overflow-hidden border-2 border-iron-700 h-4 sm:h-5 shadow-inner">
          {/* Phase marker at 30% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400/60 z-10"
            style={{ left: '30%' }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-purple-400/40 z-10"
            style={{ left: '50%' }}
          />

          {/* HP Fill */}
          <div
            className={`h-full transition-all duration-500 relative ${
              isEnraged
                ? 'bg-gradient-to-r from-red-700 via-red-500 to-amber-500 animate-boss-hp-shimmer'
                : isLowHp
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-500'
                : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400'
            }`}
            style={{ width: `${hpPercent}%` }}
          >
            {/* Inner shimmer highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
          </div>

          {/* HP Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono font-black text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
              isEnraged ? 'text-amber-200' : 'text-white'
            }`}>
              {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}
              <span className="text-[8px] sm:text-[9px] text-gray-300 ml-1.5">
                ({Math.round(hpPercent)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Phase Labels */}
        <div className="flex justify-between mt-0.5 text-[8px] font-mono text-gray-500 px-1">
          <span>HP</span>
          <span className="text-purple-400" style={{ position: 'absolute', left: '48%' }}>50%</span>
          <span className="text-amber-400" style={{ position: 'absolute', left: '28%' }}>30%⚡광란</span>
          <span>0</span>
        </div>
      </div>

      {/* Row 3: Gimmick Countdown Bar */}
      {gimmickInfo && (
        <div className={`relative z-10 flex items-center gap-2 rounded-lg p-1.5 border ${gimmickInfo.bgColor} ${gimmickInfo.borderColor} ${
          gimmickInfo.isImminent ? 'animate-gimmick-warning' : ''
        }`}>
          <span className="text-base flex-shrink-0">{gimmickInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mb-0.5">
              <span className="font-black text-white truncate">{gimmickInfo.label}</span>
              <span className={`font-bold flex-shrink-0 ${
                gimmickInfo.isImminent ? 'text-red-300 animate-pulse' : 'text-gray-300'
              }`}>
                {gimmickInfo.countdown}
              </span>
            </div>
            <div className="w-full bg-iron-950 rounded-full overflow-hidden h-1.5 border border-iron-800">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${gimmickInfo.color}`}
                style={{ width: `${gimmickInfo.progress}%` }}
              />
            </div>
            <div className="text-[8px] text-gray-400 mt-0.5 font-mono truncate">
              {gimmickInfo.description}
            </div>
          </div>
          {gimmickInfo.isImminent && (
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse flex-shrink-0" />
          )}
        </div>
      )}
    </div>
  );
});

BossHUD.displayName = 'BossHUD';
