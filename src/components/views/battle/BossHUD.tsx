import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Crown, AlertTriangle, Target, ShieldAlert, Zap, Flame, Skull } from 'lucide-react';

const getBossIllustration = (bossName: string, dungeonId: string): string => {
  const n = (bossName || '').toLowerCase();
  const d = (dungeonId || '').toLowerCase();

  // Act 1: Andariel, Countess, Smith, Blood Raven
  if (n.includes('안다리엘') || n.includes('andariel') || n.includes('카운테스') || n.includes('스미스') || n.includes('레이븐') || d.includes('act1') || d.includes('cathedral')) {
    return '/images/ui/boss_andariel.webp';
  }
  // Act 2: Duriel, Radament, Summoner
  if (n.includes('듀리엘') || n.includes('duriel') || n.includes('라다먼트') || n.includes('소환술사') || d.includes('act2') || d.includes('tomb')) {
    return '/images/ui/boss_duriel.webp';
  }
  // Act 3: Mephisto, High Council, Ismail, Geleb, Bremm
  if (n.includes('메피스토') || n.includes('mephisto') || n.includes('카운실') || n.includes('이스마일') || n.includes('겔레브') || n.includes('트라빈칼') || d.includes('act3') || d.includes('kurast') || d.includes('durance')) {
    return '/images/ui/boss_mephisto.webp';
  }
  // Act 4: Diablo, Izual, Hephasto
  if (n.includes('디아블로') || n.includes('diablo') || n.includes('이자주얼') || n.includes('헤파스토') || d.includes('act4') || d.includes('chaos')) {
    return '/images/ui/boss_diablo.webp';
  }
  // Act 5: Baal, Ancients, Nihlathak
  if (n.includes('바알') || n.includes('baal') || n.includes('고대인') || n.includes('코를릭') || n.includes('탈릭') || n.includes('마독') || n.includes('나흘라탁') || d.includes('act5') || d.includes('worldstone')) {
    return '/images/ui/boss_baal.webp';
  }
  return '/images/ui/boss_diablo.webp';
};

/**
 * BossHUD — Massive Cinematic Boss Battle Stage.
 * Renders an unmasked, massive full-body/bust boss illustration taking up the upper battle arena,
 * featuring heavy abyssal health bar, break gauge, dynamic hit flash, and weak lane command center.
 */
export const BossHUD: React.FC = React.memo(() => {
  const {
    monsters,
    currentDungeon,
    currentRoomId,
    bossGuardActive,
    playerLane,
    setPlayerLane,
    isAttacking
  } = useGame();

  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const isBossRoom = currentRoom?.type === 'boss';
  const boss = monsters.find(m => m.rank === 'boss' && m.hp > 0);

  const bossArtwork = useMemo(() => {
    if (!boss) return '/images/ui/boss_diablo.webp';
    return getBossIllustration(boss.name, currentDungeon.id);
  }, [boss?.name, currentDungeon.id]);

  if (!isBossRoom || !boss) return null;

  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  const isEnraged = hpPercent <= 30;
  const bossDisplayName = boss.name.replace(/^👑\s*/, '').replace(/^우두머리:\s*/, '');

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
          badge: 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.7)]',
          hpGradient: 'from-amber-500 via-rose-600 to-red-700',
          glowColor: 'rgba(239,68,68,0.4)'
        };
      case 'cold':
        return {
          text: '❄️ 혹한',
          badge: 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.7)]',
          hpGradient: 'from-cyan-400 via-sky-600 to-blue-800',
          glowColor: 'rgba(6,182,212,0.4)'
        };
      case 'lightning':
        return {
          text: '⚡ 뇌전',
          badge: 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.7)]',
          hpGradient: 'from-yellow-300 via-amber-500 to-yellow-700',
          glowColor: 'rgba(251,191,36,0.4)'
        };
      case 'poison':
        return {
          text: '🧪 맹독',
          badge: 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
          hpGradient: 'from-emerald-400 via-teal-600 to-emerald-800',
          glowColor: 'rgba(16,185,129,0.4)'
        };
      case 'void':
        return {
          text: '🔮 공허',
          badge: 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.7)]',
          hpGradient: 'from-purple-400 via-fuchsia-600 to-indigo-900',
          glowColor: 'rgba(168,85,247,0.4)'
        };
      default:
        return {
          text: '⚔️ 물리',
          badge: 'bg-stone-900/90 border-stone-500 text-stone-300 shadow-[0_0_12px_rgba(168,162,158,0.7)]',
          hpGradient: 'from-orange-400 via-red-600 to-stone-800',
          glowColor: 'rgba(239,68,68,0.3)'
        };
    }
  })();

  return (
    <div
      className={`relative w-full rounded-2xl border-2 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between mb-1 select-none flex-shrink-0 ${
        isGroggy
          ? 'bg-yellow-950/95 border-yellow-400 ring-2 ring-yellow-400/90 shadow-[0_0_40px_rgba(251,191,36,0.8)]'
          : isCharging
          ? 'bg-red-950/95 border-red-500 ring-2 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,0.9)] animate-pulse'
          : isEnraged
          ? 'bg-red-950/90 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.7)]'
          : 'bg-iron-950/95 border-brass-500/80 shadow-[0_0_30px_rgba(0,0,0,0.95)]'
      }`}
      style={{ height: 'clamp(220px, 36vh, 310px)' }}
    >
      {/* 👹 Massive Full-Presence Boss Illustration (Unmasked, 100% Whole Body with Horns & Aura) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center pt-2 pb-6">
        <img
          src={bossArtwork}
          alt={boss.name}
          className={`h-full w-auto max-h-[210px] sm:max-h-[250px] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,1)] transition-all duration-500 ${
            isAttacking
              ? 'brightness-150 saturate-200 scale-105 filter drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]'
              : isGroggy
              ? 'brightness-125 saturate-150 contrast-125'
              : isCharging
              ? 'brightness-130 saturate-200 contrast-125 animate-pulse'
              : isEnraged
              ? 'brightness-110 saturate-150 contrast-125'
              : 'brightness-100 saturate-125 contrast-110'
          }`}
        />
        {/* Subtle Dark Bottom Gradient for Bar Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-iron-950/90 via-transparent to-iron-950/70 pointer-events-none" />
      </div>

      {/* Top Overlay: Boss Title, Elements & Threat Status */}
      <div className="relative z-10 px-3 pt-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-lg border border-amber-400/80 backdrop-blur-md shadow-lg">
            <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <span className="font-cinzel font-black text-sm sm:text-base text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide">
              {bossDisplayName}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-black border backdrop-blur-md shadow-lg ${elementBadge.badge}`}>
            {elementBadge.text}
          </span>

          {boss.defense > 0 && (
            <span className="text-[10px] font-mono text-gray-200 bg-black/70 px-2 py-0.5 rounded-lg border border-iron-700 font-bold backdrop-blur-sm hidden sm:inline">
              🛡️ 방어 {boss.defense}
            </span>
          )}
        </div>

        {/* Right Status Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isCharging && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white border border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              전멸기 시전 중!
            </span>
          )}

          {isGroggy && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-yellow-500 to-amber-400 text-iron-950 border border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-iron-950" />
              그로기 (피해 200%)
            </span>
          )}

          {isEnraged && !isCharging && !isGroggy && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-red-950/90 text-red-300 border border-red-500 shadow animate-pulse flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              광폭화 (공격력 +50%)
            </span>
          )}
        </div>
      </div>

      {/* Bottom Command Dock: Giant Health Bar + Break Counter + Weak Lane Attack Action */}
      <div className="relative z-10 px-3 pb-2 pt-1 space-y-1.5 bg-gradient-to-t from-iron-950 via-iron-950/90 to-transparent">
        {/* Massive 22px Abyssal Boss Health Bar */}
        <div className="relative w-full bg-black/90 rounded-full overflow-hidden border-2 border-amber-400/90 h-5 sm:h-6 shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
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
          {/* High-Contrast Bold Health Text */}
          <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wider">
            {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()} ({Math.round(hpPercent)}%)
          </div>
        </div>

        {/* Sub-bar: BREAK Stagger Gauge (if charging) & Quick Tactical Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {isCharging ? (
            <div className="flex-1 min-w-[200px] flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-red-300 flex-shrink-0 animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                BREAK:
              </span>
              <div className="flex-1 bg-black/80 rounded-full h-2.5 border border-red-500 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 transition-all duration-300 animate-pulse"
                  style={{ width: `${staggerPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-300 flex-shrink-0">
                {boss.bossStaggerHp || 0}/{boss.bossStaggerMaxHp || 0}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-300">
              {boss.intent?.skillName ? (
                <span className="text-rose-300 bg-black/70 px-2 py-0.5 rounded border border-red-700/80 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  다음 공격: <strong className="text-white">{boss.intent.skillName}</strong>
                </span>
              ) : (
                <span className="text-gray-400">보스 전면 레인에서 집중 화력을 퍼부으세요!</span>
              )}
            </div>
          )}

          {/* Right: Weak Lane Target Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasWeakLane && (
              <button
                onClick={() => setPlayerLane(boss.bossWeakLane!)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black border transition cursor-pointer flex items-center gap-1 shadow-lg active:scale-95 ${
                  isPlayerOnWeakLane
                    ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse'
                    : 'bg-rose-950 hover:bg-rose-900 text-rose-100 border-rose-500'
                }`}
                title="보스의 취약 약점 레인으로 즉시 이동하여 2배 치명타를 가합니다"
              >
                <Target className="w-3.5 h-3.5" />
                <span>약점 {boss.bossWeakLane! + 1}번 레인 타격</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

BossHUD.displayName = 'BossHUD';


