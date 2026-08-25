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
      className={`relative rounded-xl border-2 p-2.5 sm:p-3 shadow-2xl transition-all duration-300 overflow-hidden ${elementBadge.auraColor} ${
        isGroggy
          ? 'bg-gradient-to-r from-yellow-950/90 via-iron-950 to-yellow-950/90 border-yellow-400 ring-2 ring-yellow-400/80 animate-pulse'
          : isCharging
          ? 'bg-gradient-to-r from-red-950 via-blood-950 to-red-950 border-red-500 ring-2 ring-red-500/90 animate-boss-enrage'
          : isEnraged
          ? 'animate-boss-enrage bg-gradient-to-r from-red-950 via-iron-950 to-red-950 border-red-500'
          : bossGuardActive
          ? 'animate-boss-guard bg-gradient-to-r from-blue-950/90 via-iron-950 to-blue-950/90 border-blue-400'
          : `${actTheme.containerBg} ${actTheme.bossHudGlow}`
      }`}
    >
      {/* Ambient Act Atmospheric Glow */}
      <div className={`absolute inset-0 pointer-events-none opacity-35 ${
        isCharging ? 'bg-gradient-to-t from-red-600/40 via-transparent to-transparent' : actTheme.ambientGlow
      }`} />

      {/* ═══ TOP ROW: Boss Pixel Portrait + Name + Badges + Stats ═══ */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-2.5">
        {/* 👾 Big Retro Pixel Boss Portrait Space */}
        <div
          onClick={() => setPlayerLane(boss.lane)}
          className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition transform hover:scale-105 cursor-pointer overflow-hidden p-1 ${
            isGroggy
              ? 'bg-yellow-950/90 border-yellow-400 shadow-[0_0_25px_rgba(251,191,36,0.9)] ring-2 ring-yellow-300'
              : isCharging
              ? 'bg-red-950/95 border-red-400 shadow-[0_0_35px_rgba(239,68,68,0.9)] ring-2 ring-red-400 animate-pulse'
              : isEnraged
              ? 'bg-red-950/90 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.8)]'
              : 'bg-iron-950/95 border-amber-500/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
          }`}
          title="클릭 시 보스 전면 레인으로 즉시 이동"
        >
          <BossPixelPortrait
            name={boss.name}
            element={boss.element}
            signatureKey={boss.bossSignatureKey}
            isEnraged={isEnraged}
            isGroggy={isGroggy}
            isCharging={isCharging}
            size={76}
          />
          {isEnraged && !isGroggy && (
            <span className="absolute top-1 right-1 text-xs animate-bounce bg-red-600 text-white font-black px-1 rounded border border-red-300">⚡광란</span>
          )}
          {isCharging && (
            <span className="absolute bottom-1 inset-x-1 text-[9px] bg-red-600 text-white font-black text-center py-0.5 rounded border border-white animate-pulse">
              CASTING!
            </span>
          )}
        </div>

        {/* Boss Name & Tactical Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <h3 className={`font-cinzel font-black text-sm sm:text-lg tracking-wide truncate ${
              isGroggy
                ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                : isCharging
                ? 'text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]'
                : isEnraged
                ? 'text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : 'text-amber-200'
            }`}>
              {bossDisplayName}
            </h3>
            <span className="text-[10px] sm:text-xs text-amber-400 font-mono font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/60">
              Act {actTheme.act}
            </span>
          </div>

          {/* Interactive Badges */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {/* Element Attribute */}
            <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border font-mono ${elementBadge.badge}`}>
              {elementBadge.text}
            </span>

            {/* Groggy Status Badge */}
            {isGroggy && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-yellow-500 text-iron-950 border border-yellow-200 shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse flex items-center gap-0.5">
                <span>💫 그로기 (받는 피해 +50%)</span>
              </span>
            )}

            {/* Ultimate Charging Status Badge */}
            {isCharging && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-red-600 text-white border border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3 text-yellow-300" />
                <span>멸망기 차징 중! (저지 필요)</span>
              </span>
            )}

            {/* Weak Lane Badge */}
            {hasWeakLane && (
              <button
                onClick={() => setPlayerLane(boss.bossWeakLane!)}
                className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black border transition cursor-pointer flex items-center gap-1 ${
                  isPlayerOnWeakLane
                    ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse'
                    : 'bg-rose-950 text-rose-300 border-rose-500 hover:bg-rose-900'
                }`}
                title="클릭 시 약점 레인으로 즉시 이동"
              >
                <Target className="w-3 h-3" />
                <span>약점: {boss.bossWeakLane! + 1}번 레인 {isPlayerOnWeakLane ? '✓ 조준됨' : '(클릭 이동)'}</span>
              </button>
            )}

            {/* Enrage Tag */}
            {isEnraged && !isGroggy && (
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-red-600 text-white border border-red-300 animate-pulse">
                ⚡ 광란 (ATK +50%)
              </span>
            )}

            {/* Guard Active Notice */}
            {bossGuardActive && !isGroggy && (
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-blue-600 text-white border border-blue-300 animate-pulse">
                🛡️ 결계 가동 (피해 -70%)
              </span>
            )}
          </div>
        </div>

        {/* Boss Stats Readout */}
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5 text-[10px] sm:text-[11px] font-mono">
          <span className="flex items-center gap-1 text-rose-300" title="공격력">
            <Swords className="w-3 h-3" />
            <span className="font-black">{boss.intent.damage || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-blue-300" title="방어력">
            <Shield className="w-3 h-3" />
            <span className="font-black">{boss.defense}</span>
          </span>
          {chargePercent > 0 && (
            <span className={`flex items-center gap-1 font-black ${
              chargePercent >= 75 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
            }`} title="공격 충전 게이지">
              <Zap className="w-3 h-3" />
              <span>{chargePercent}%</span>
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Abyssal Boss Health Bar with Emblems */}
      <div className="relative z-10 mb-2">
        <div className="relative w-full bg-iron-950 rounded-full overflow-hidden border-2 border-amber-500/80 h-5 sm:h-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]">
          {/* Phase Markers */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-purple-400/70 z-10" style={{ left: '50%' }} title="50% 하수인 소환" />
          <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400/90 z-10" style={{ left: '30%' }} title="30% 광란 페이즈" />

          {/* Abyssal Gradient Health Fill */}
          <div
            className={`h-full transition-all duration-500 relative bg-gradient-to-r ${
              isGroggy
                ? 'from-yellow-400 via-amber-500 to-yellow-600 animate-pulse'
                : isEnraged
                ? 'from-red-600 via-rose-500 to-amber-500 animate-boss-hp-shimmer'
                : elementBadge.hpGradient
            }`}
            style={{ width: `${hpPercent}%` }}
          >
            {/* Top Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30" />
            {/* Gothic Rune Shimmer Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent animate-pulse" />
          </div>

          {/* HP Value Label Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-black text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-white flex items-center gap-1">
              <span>{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
              <span className="text-[9px] sm:text-[10px] text-amber-200 font-bold ml-1">
                ({Math.round(hpPercent)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Phase Legend */}
        <div className="flex justify-between mt-0.5 text-[8px] font-mono text-gray-400 px-1 relative">
          <span>HP 100%</span>
          <span className="text-purple-400 font-bold" style={{ position: 'absolute', left: '46%' }}>50% 소환</span>
          <span className="text-amber-400 font-bold" style={{ position: 'absolute', left: '26%' }}>30% ⚡광란</span>
          <span>0%</span>
        </div>
      </div>

      {/* Row 3: Stagger BREAK Counter Bar (When Charging Ultimate) */}
      {isCharging && (
        <div className="relative z-10 mb-1.5 p-1.5 rounded-lg border-2 border-red-500 bg-red-950/90 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-black text-yellow-200 mb-1">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>[BREAK 저지 게이지] 방패 강타(250% 저지) 또는 공격으로 파괴하세요!</span>
            </span>
            <span className="text-amber-300">{boss.bossStaggerHp} / {boss.bossStaggerMaxHp}</span>
          </div>
          <div className="w-full bg-iron-950 rounded-full h-2 border border-yellow-500/80 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-red-500 transition-all duration-300"
              style={{ width: `${staggerPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Row 4: Tactical Notice & Gimmick Countdown */}
      {!isCharging && !isGroggy && (
        <div className="relative z-10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono bg-iron-950/85 px-2 py-1 rounded-lg border border-iron-800 text-gray-300">
          <span className="flex items-center gap-1 text-amber-200 truncate">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>멸망기 차징까지 {(() => { const r = 3 - (bossTurnCount % 3); return r === 3 ? 3 : r; })()}턴 · 약점 노출까지 {(() => { const r = 4 - (bossTurnCount % 4); return r === 4 ? 4 : r; })()}턴</span>
          </span>
          <span className="text-gray-400 flex-shrink-0 font-bold ml-2">
            턴 #{bossTurnCount}
          </span>
        </div>
      )}

      {/* Row 5: Active Danger Lane Telegraph Strip */}
      {boss.bossTelegraphLanes && boss.bossTelegraphLanes.length > 0 && (
        <div className="relative z-10 mt-1.5 flex items-center justify-between text-[9px] sm:text-[10px] font-mono bg-gradient-to-r from-red-950/95 via-red-900/90 to-red-950/95 px-2 py-1 rounded-lg border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
          <span className="flex items-center gap-1 text-red-200 font-black truncate">
            ⚠️ 위험 표식 레인:
            <span className="bg-red-600 text-white font-black px-1 rounded border border-red-300 flex gap-1">
              {boss.bossTelegraphLanes.map(l => <span key={l}>{l + 1}번</span>)}
            </span>
            <span className="text-yellow-200 hidden sm:inline">— 해당 레인에 서 있으면 보스의 충격파에 맞습니다!</span>
          </span>
          <span className="text-red-300 flex-shrink-0 font-bold ml-2">즉시 회피!</span>
        </div>
      )}
    </div>
  );
});

BossHUD.displayName = 'BossHUD';
