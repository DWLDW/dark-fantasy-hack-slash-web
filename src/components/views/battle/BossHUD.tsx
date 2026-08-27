import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { getActTheme } from '../../../utils/actThemes';
import { Crown, Shield, Flame, Skull, Swords, AlertTriangle, Zap, Sparkles, Target, ShieldAlert } from 'lucide-react';
import { BossPixelPortrait } from '../../fx/BossPixelPortrait';

/**
 * BossHUD — Dedicated high-impact boss battle HUD.
 * Features distinct abyssal crimson/purple health bar, stagger break gauge, weak lane targeting, and enrage state.
 */
export const BossHUD: React.FC = React.memo(() => {
  const {
    monsters,
    currentDungeon,
    currentRoomId,
    bossTurnCount,
    bossGuardActive,
    playerLane,
    setPlayerLane
  } = useGame();

  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const isBossRoom = currentRoom?.type === 'boss';
  const boss = monsters.find(m => m.rank === 'boss' && m.hp > 0);
  const actTheme = useMemo(() => getActTheme(currentDungeon.id), [currentDungeon.id]);

  if (!isBossRoom || !boss) return null;

  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  const isEnraged = hpPercent <= 30;
  const isLowHp = hpPercent <= 50;
  const bossDisplayName = boss.name.replace(/^👑\s*/, '').replace(/^우두머리:\s*/, '');
  const chargePercent = boss.intent?.chargePercent || 0;

  // Stagger break gauge
  const isCharging = Boolean(boss.isChargingUltimate && (boss.bossStaggerHp || 0) > 0);
  const staggerPercent = isCharging && boss.bossStaggerMaxHp
    ? Math.max(0, Math.min(100, ((boss.bossStaggerHp || 0) / boss.bossStaggerMaxHp) * 100))
    : 0;

  const isGroggy = Boolean(boss.isGroggy);
  const hasWeakLane = boss.bossWeakLane !== undefined;
  const isPlayerOnWeakLane = hasWeakLane && boss.bossWeakLane === playerLane;

  // Element badge styling & aura
  const elementBadge = (() => {
    switch (boss.element) {
      case 'fire':
        return {
          text: '🔥 지옥불',
          badge: 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
          hpGradient: 'from-amber-600 via-rose-600 to-red-700',
          auraColor: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]'
        };
      case 'cold':
        return {
          text: '❄️ 혹한',
          badge: 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.5)]',
          hpGradient: 'from-cyan-400 via-sky-600 to-blue-800',
          auraColor: 'shadow-[0_0_25px_rgba(6,182,212,0.4)]'
        };
      case 'lightning':
        return {
          text: '⚡ 뇌전',
          badge: 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
          hpGradient: 'from-yellow-300 via-amber-500 to-yellow-700',
          auraColor: 'shadow-[0_0_25px_rgba(251,191,36,0.4)]'
        };
      case 'poison':
        return {
          text: '🧪 맹독',
          badge: 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
          hpGradient: 'from-emerald-400 via-teal-600 to-emerald-800',
          auraColor: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]'
        };
      case 'void':
        return {
          text: '🔮 공허',
          badge: 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
          hpGradient: 'from-purple-400 via-fuchsia-600 to-indigo-900',
          auraColor: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]'
        };
      default:
        return {
          text: '⚔️ 물리',
          badge: 'bg-stone-900/90 border-stone-500 text-stone-300 shadow-[0_0_8px_rgba(168,162,158,0.5)]',
          hpGradient: 'from-orange-400 via-red-600 to-stone-800',
          auraColor: 'shadow-[0_0_25px_rgba(239,68,68,0.3)]'
        };
    }
  })();

  return (
    <div
      className={`relative rounded-lg border p-1 sm:p-1.5 shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 mb-1 ${

        isGroggy
          ? 'bg-yellow-950/90 border-yellow-400 ring-1 ring-yellow-400/80 animate-pulse'
          : isCharging
          ? 'bg-red-950 border-red-500 ring-1 ring-red-500/90 animate-pulse'
          : isEnraged
          ? 'bg-red-950/90 border-red-800'
          : bossGuardActive
          ? 'bg-blue-950/90 border-blue-600'
          : 'bg-iron-950/95 border-iron-800'
      }`}
    >
      {/* Horizontal Ultra-Compact Layout: Left Avatar | Center HP/Break | Right Weakness/Intent */}
      <div className="flex items-center gap-2">
        {/* Left: Compact Boss Portrait (40px) */}
        <div
          onClick={() => setPlayerLane(boss.lane)}
          className={`relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition transform hover:scale-105 cursor-pointer overflow-hidden p-0.5 ${
            isGroggy
              ? 'bg-yellow-950 border-yellow-400'
              : isCharging
              ? 'bg-red-950 border-red-400 ring-1 ring-red-400 animate-pulse'
              : 'bg-iron-950 border-amber-500/60'
          }`}
          title="클릭 시 보스 전면 레인으로 조준"
        >
          <BossPixelPortrait
            name={boss.name}
            element={boss.element}
            signatureKey={boss.bossSignatureKey}
            isEnraged={isEnraged}
            isGroggy={isGroggy}
            isCharging={isCharging}
            size={36}
          />
          {isCharging && (
            <span className="absolute bottom-0 inset-x-0 text-[7px] bg-red-600 text-white font-black text-center leading-tight">
              CAST
            </span>
          )}
        </div>

        {/* Center: Name & Compact HP Bar & Stagger */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Boss Name + Element + Intent Chips */}
          <div className="flex items-center justify-between gap-1 leading-none">
            <div className="flex items-center gap-1 min-w-0">
              <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="font-cinzel font-black text-xs text-amber-200 truncate">
                {bossDisplayName}
              </span>
              <span className={`px-1 py-0.2 rounded text-[8px] font-mono font-bold border ${elementBadge.badge}`}>
                {elementBadge.text}
              </span>
              {isGroggy && (
                <span className="px-1 py-0.2 rounded text-[8px] font-black bg-yellow-500 text-iron-950 animate-pulse">
                  💫그로기
                </span>
              )}
            </div>

            {/* Boss Incoming Skill */}
            {boss.intent?.skillName ? (
              <span className="text-[9px] font-mono text-rose-300 font-bold truncate max-w-[120px]">
                ⚔️ {boss.intent.skillName}
              </span>
            ) : (
              <span className="text-[9px] font-mono text-gray-400">
                🛡️{boss.defense}
              </span>
            )}
          </div>

          {/* Abyssal Boss Health Bar */}
          <div className="relative w-full bg-iron-950 rounded-full overflow-hidden border border-amber-500/80 h-3.5 shadow-inner">
            <div
              className={`h-full transition-all duration-300 relative bg-gradient-to-r ${
                isGroggy
                  ? 'from-yellow-400 via-amber-500 to-yellow-600'
                  : isEnraged
                  ? 'from-red-600 via-rose-500 to-amber-500'
                  : elementBadge.hpGradient
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[9px] text-white drop-shadow">
              {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()} ({Math.round(hpPercent)}%)
            </div>
          </div>

          {/* Stagger BREAK Bar if charging */}
          {isCharging && (
            <div className="w-full bg-iron-950 rounded-full h-1.5 border border-red-500 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
                style={{ width: `${staggerPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Right: Weak Lane / Threat Indicator */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {hasWeakLane && (
            <button
              onClick={() => setPlayerLane(boss.bossWeakLane!)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition cursor-pointer flex items-center gap-0.5 ${
                isPlayerOnWeakLane
                  ? 'bg-emerald-600 text-white border-emerald-300 shadow animate-pulse'
                  : 'bg-rose-950 text-rose-300 border-rose-500 hover:bg-rose-900'
              }`}
            >
              <Target className="w-2.5 h-2.5" />
              <span>약점 {boss.bossWeakLane! + 1}번</span>
            </button>
          )}

          {boss.bossTelegraphLanes && boss.bossTelegraphLanes.length > 0 && (
            <span className="text-[8px] font-mono font-black bg-red-600 text-white px-1 py-0.2 rounded border border-red-300 animate-pulse">
              ⚠️위험: {boss.bossTelegraphLanes.map(l => `${l + 1}번`).join(',')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

BossHUD.displayName = 'BossHUD';

