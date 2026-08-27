import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Crown, AlertTriangle, Target, ShieldAlert } from 'lucide-react';

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
 * BossHUD — Dedicated high-impact arcade boss battle HUD.
 * Features massive 100px+ boss portrait, wide 70% opacity boss banner, 2-tier health bar, break gauge, and weak lane targeting.
 */
export const BossHUD: React.FC = React.memo(() => {
  const {
    monsters,
    currentDungeon,
    currentRoomId,
    bossGuardActive,
    playerLane,
    setPlayerLane
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
          badge: 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.6)]',
          hpGradient: 'from-amber-500 via-rose-600 to-red-700',
        };
      case 'cold':
        return {
          text: '❄️ 혹한',
          badge: 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.6)]',
          hpGradient: 'from-cyan-400 via-sky-600 to-blue-800',
        };
      case 'lightning':
        return {
          text: '⚡ 뇌전',
          badge: 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
          hpGradient: 'from-yellow-300 via-amber-500 to-yellow-700',
        };
      case 'poison':
        return {
          text: '🧪 맹독',
          badge: 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
          hpGradient: 'from-emerald-400 via-teal-600 to-emerald-800',
        };
      case 'void':
        return {
          text: '🔮 공허',
          badge: 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.6)]',
          hpGradient: 'from-purple-400 via-fuchsia-600 to-indigo-900',
        };
      default:
        return {
          text: '⚔️ 물리',
          badge: 'bg-stone-900/90 border-stone-500 text-stone-300 shadow-[0_0_10px_rgba(168,162,158,0.6)]',
          hpGradient: 'from-orange-400 via-red-600 to-stone-800',
        };
    }
  })();

  return (
    <div
      className={`relative rounded-xl border-2 p-2 sm:p-2.5 shadow-2xl transition-all duration-300 overflow-hidden flex-shrink-0 mb-1 select-none min-h-[96px] sm:min-h-[110px] ${
        isGroggy
          ? 'bg-yellow-950/95 border-yellow-400 ring-2 ring-yellow-400/80 shadow-[0_0_35px_rgba(251,191,36,0.7)] animate-pulse'
          : isCharging
          ? 'bg-red-950 border-red-500 ring-2 ring-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-pulse'
          : isEnraged
          ? 'bg-red-950/95 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.6)]'
          : bossGuardActive
          ? 'bg-blue-950/95 border-blue-500'
          : 'bg-iron-950 border-brass-500/80 shadow-[0_0_25px_rgba(0,0,0,0.9)]'
      }`}
    >
      {/* 👹 Massive Wide Boss Background Artwork Layer (High Visibility 65%) */}
      <div
        className={`absolute inset-0 bg-cover bg-right sm:bg-center transition-all duration-500 pointer-events-none filter contrast-125 saturate-125 ${
          isGroggy
            ? 'opacity-65 brightness-125'
            : isCharging
            ? 'opacity-75 brightness-125 saturate-150'
            : isEnraged
            ? 'opacity-60 brightness-110 saturate-150'
            : 'opacity-55 brightness-100'
        }`}
        style={{ backgroundImage: `url(${bossArtwork})` }}
      />
      {/* Dynamic Dark Vignette Gradient for Perfect Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-iron-950 via-iron-950/85 to-transparent pointer-events-none" />

      {/* Horizontal Layout: Left Massive Portrait Card | Right Boss Combat Command Center */}
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5 h-full">
        {/* Left: Massive Boss Portrait Card (85px ~ 96px) */}
        <div
          onClick={() => setPlayerLane(boss.lane)}
          className={`relative flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-xl flex items-center justify-center border-2 transition transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden shadow-2xl p-0.5 group ${
            isGroggy
              ? 'bg-yellow-950 border-yellow-400 ring-2 ring-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
              : isCharging
              ? 'bg-red-950 border-red-400 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse'
              : isEnraged
              ? 'bg-red-950 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-iron-950 border-amber-400/90 hover:border-amber-300 ring-1 ring-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
          }`}
          title="클릭 시 보스 전면 레인으로 즉시 타겟 조준"
        >
          <img
            src={bossArtwork}
            alt={boss.name}
            className="w-full h-full object-cover rounded-lg filter contrast-125 group-hover:brightness-110 transition-all duration-300"
          />
          {isCharging && (
            <span className="absolute bottom-0 inset-x-0 text-[9px] sm:text-[10px] bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-black text-center py-0.5 leading-tight tracking-wider shadow">
              CAST
            </span>
          )}
          {isEnraged && !isCharging && (
            <span className="absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] bg-red-800/95 text-amber-300 font-black text-center py-0.2 leading-tight">
              광폭화
            </span>
          )}
          {isGroggy && (
            <span className="absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] bg-yellow-500 text-iron-950 font-black text-center py-0.2 leading-tight">
              그로기
            </span>
          )}
        </div>

        {/* Right: Boss Name, 2-Tier Health Bar, Break Counter & Threat Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1.5">
          {/* Row 1: Boss Title + Name + Element Badge + Target Weakness Button */}
          <div className="flex items-center justify-between gap-1.5 leading-none flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 filter drop-shadow" />
              <span className="font-cinzel font-black text-xs sm:text-sm text-amber-100 truncate tracking-wide drop-shadow">
                {bossDisplayName}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-black border shadow ${elementBadge.badge}`}>
                {elementBadge.text}
              </span>
              {boss.defense > 0 && (
                <span className="text-[10px] font-mono text-gray-300 bg-iron-900/80 px-1.5 py-0.5 rounded border border-iron-750 font-bold hidden sm:inline">
                  🛡️ 방어 {boss.defense}
                </span>
              )}
            </div>

            {/* Right: Weak Lane Target Button or Incoming Skill */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasWeakLane && (
                <button
                  onClick={() => setPlayerLane(boss.bossWeakLane!)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black border transition cursor-pointer flex items-center gap-1 shadow active:scale-95 ${
                    isPlayerOnWeakLane
                      ? 'bg-emerald-600 text-white border-emerald-300 ring-1 ring-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse'
                      : 'bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-500'
                  }`}
                  title="보스의 취약 약점 레인으로 즉시 이동하여 2배 치명타를 가합니다"
                >
                  <Target className="w-3 h-3" />
                  <span>약점 {boss.bossWeakLane! + 1}번</span>
                </button>
              )}

              {boss.intent?.skillName && (
                <span className="text-[10px] font-mono text-rose-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-700/80 font-bold truncate max-w-[130px] hidden sm:inline">
                  ⚔️ {boss.intent.skillName}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Heavy 2-Tier Abyssal Boss Health Bar (Height 18px) */}
          <div className="relative w-full bg-iron-950 rounded-full overflow-hidden border-2 border-amber-500/90 h-4.5 sm:h-5 shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]">
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
            {/* Health Numeric String in High-Contrast Centered Badge */}
            <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[10px] sm:text-xs text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] tracking-wider">
              {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()} ({Math.round(hpPercent)}%)
            </div>
          </div>

          {/* Row 3: Stagger BREAK Gauge & Threat Alerts */}
          {isCharging && (
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] font-mono font-black text-red-300">
                <span className="flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  전멸기 충전 중! (타격하여 BREAK)
                </span>
                <span>{boss.bossStaggerHp || 0} / {boss.bossStaggerMaxHp || 0}</span>
              </div>
              <div className="w-full bg-iron-950 rounded-full h-2 border border-red-500 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 transition-all duration-300 animate-pulse"
                  style={{ width: `${staggerPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Row 4: Telegraph Threat Alert Banner for Mobile */}
          {boss.bossTelegraphLanes && boss.bossTelegraphLanes.length > 0 && !isCharging && (
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-300">
              <span className="text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" />
                위험 공격 범위:
              </span>
              <span className="text-amber-300 font-black bg-red-950/80 px-1.5 py-0.2 rounded border border-red-700">
                {boss.bossTelegraphLanes.map(l => `${l + 1}번 레인`).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BossHUD.displayName = 'BossHUD';

