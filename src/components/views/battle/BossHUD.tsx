import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { getActTheme } from '../../../utils/actThemes';
import { Crown, Shield, Flame, Skull, Swords, AlertTriangle, Zap, Sparkles } from 'lucide-react';

/**
 * BossHUD — Dedicated boss status panel rendered above the 5-lane battlefield
 * Displays rich boss signature skills, phase markers, act theme styles, and tactical countdowns.
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
  const actTheme = useMemo(() => getActTheme(currentDungeon.id), [currentDungeon.id]);

  // Determine boss gimmick & signature details
  const gimmickInfo = useMemo(() => {
    if (!boss) return null;
    const sigKey = boss.bossSignatureKey || '';
    const gText = boss.bossGimmick || '';

    // Signature 1: Poison Nova (Andariel)
    if (sigKey === 'poison_nova') {
      const interval = 3;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🦂',
        label: '맹독 분사 (Poison Nova)',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '보호막 즉시 부식 + 전장 맹독 DoT 살포',
        color: 'from-emerald-600 via-teal-500 to-green-400',
        bgColor: 'bg-emerald-950/85',
        borderColor: 'border-emerald-500',
        isImminent: turnsUntil <= 1
      };
    }

    // Signature 2: Holy Freeze Charge (Duriel)
    if (sigKey === 'holy_freeze_charge') {
      const interval = 3;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🪲',
        label: '결빙 오라 & 흉포한 돌진',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '회피율 0% 억제 + 2.2배 관통 돌진타',
        color: 'from-cyan-600 via-blue-500 to-sky-400',
        bgColor: 'bg-cyan-950/85',
        borderColor: 'border-cyan-500',
        isImminent: turnsUntil <= 1
      };
    }

    // Signature 3: Lightning Pylon (Mephisto)
    if (sigKey === 'lightning_pylon') {
      const interval = 4;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '💀',
        label: '증오의 뇌격 방패',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '받는 피해 70% 감소 결계 + 전격 방출',
        color: 'from-amber-500 via-yellow-400 to-blue-500',
        bgColor: 'bg-blue-950/85',
        borderColor: 'border-yellow-400',
        isImminent: turnsUntil <= 1
      };
    }

    // Signature 4: Red Lightning Hose (Diablo)
    if (sigKey === 'red_lightning_hose') {
      const interval = 3;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '👹',
        label: '붉은 번개 숨결 (Red Lightning)',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '보호막 소각 + 2.5배 파멸의 지옥불 피해',
        color: 'from-red-600 via-orange-500 to-yellow-400',
        bgColor: 'bg-red-950/90',
        borderColor: 'border-red-500',
        isImminent: turnsUntil <= 1
      };
    }

    // Signature 5: Ancients Whirlwind (3 Ancients)
    if (sigKey === 'ancients_whirlwind') {
      const interval = 4;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '⚔️',
        label: '3인의 강철 방진 태세',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '탈릭·코릭·마다크 강철 결속 피해 70% 차단',
        color: 'from-amber-600 via-zinc-400 to-yellow-500',
        bgColor: 'bg-stone-900/90',
        borderColor: 'border-amber-400',
        isImminent: turnsUntil <= 1
      };
    }

    // Signature 6: Vile Clone & Rage Burn (Baal)
    if (sigKey === 'vile_clone_burn') {
      const interval = 3;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🐙',
        label: '파멸의 분노 소각 & 촉수',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '플레이어 분노 50% 소각 + 촉수 타격',
        color: 'from-purple-600 via-indigo-500 to-blue-400',
        bgColor: 'bg-purple-950/90',
        borderColor: 'border-purple-500',
        isImminent: turnsUntil <= 1
      };
    }

    // Summon based bosses (HP <= 50%)
    if (gText.includes('소환') || sigKey.includes('summon') || sigKey.includes('raise') || sigKey.includes('barrage')) {
      const bossHpPercent = (boss.hp / boss.maxHp) * 100;
      return {
        icon: '💀',
        label: '하수인 증원 의식',
        countdown: bossHpPercent > 50 ? `HP ≤50% 시` : '발동 완료!',
        progress: Math.max(0, 100 - (bossHpPercent / 50) * 100),
        description: 'HP 50% 이하 도달 시 전열에 정예 호위병 2마리 소환',
        color: 'from-purple-600 to-violet-400',
        bgColor: 'bg-purple-950/80',
        borderColor: 'border-purple-500',
        isImminent: bossHpPercent <= 55 && bossHpPercent > 50
      };
    }

    // Guard based bosses (Every 4 turns)
    if (gText.includes('방어') || sigKey.includes('shield') || sigKey.includes('drain') || sigKey.includes('web') || sigKey.includes('gaze')) {
      const interval = 4;
      const turnsUntil = interval - (bossTurnCount % interval);
      const progress = ((bossTurnCount % interval) / interval) * 100;
      return {
        icon: '🛡️',
        label: '방어 태세',
        countdown: turnsUntil === interval ? `${interval}턴 후` : `${turnsUntil}턴 후`,
        progress,
        description: '받는 피해 70% 감소 (1턴)',
        color: 'from-blue-600 to-cyan-400',
        bgColor: 'bg-blue-950/80',
        borderColor: 'border-blue-500',
        isImminent: turnsUntil <= 1
      };
    }

    // Default: Roar attack (Every 3 turns)
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
  }, [boss, bossTurnCount]);

  if (!isBossRoom || !boss) return null;

  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  const isEnraged = hpPercent <= 30;
  const isLowHp = hpPercent <= 50;
  const bossDisplayName = boss.name.replace(/^👑\s*/, '').replace(/^우두머리:\s*/, '');
  const chargePercent = boss.intent?.chargePercent || 0;

  // Element badge styling
  const elementBadge = (() => {
    switch (boss.element) {
      case 'fire': return { text: '🔥 화염', color: 'bg-red-950/80 border-red-500 text-red-300' };
      case 'cold': return { text: '❄️ 냉기', color: 'bg-cyan-950/80 border-cyan-400 text-cyan-200' };
      case 'lightning': return { text: '⚡ 번개', color: 'bg-amber-950/80 border-amber-400 text-amber-200' };
      case 'poison': return { text: '🧪 맹독', color: 'bg-emerald-950/80 border-emerald-400 text-emerald-200' };
      case 'void': return { text: '🔮 공허', color: 'bg-purple-950/80 border-purple-400 text-purple-200' };
      default: return { text: '⚔️ 물리', color: 'bg-stone-900/80 border-stone-500 text-stone-300' };
    }
  })();

  return (
    <div
      className={`relative rounded-xl border-2 p-2.5 sm:p-3 shadow-2xl transition-all duration-300 overflow-hidden ${
        isEnraged
          ? 'animate-boss-enrage bg-gradient-to-r from-red-950 via-iron-950 to-red-950 border-red-500'
          : bossGuardActive
          ? 'animate-boss-guard bg-gradient-to-r from-blue-950/90 via-iron-950 to-blue-950/90 border-blue-400'
          : `${actTheme.containerBg} ${actTheme.bossHudGlow}`
      }`}
    >
      {/* Ambient Act Atmospheric Glow */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 ${
        isEnraged ? 'bg-gradient-to-t from-red-600/40 via-transparent to-transparent' : actTheme.ambientGlow
      }`} />

      {/* Row 1: Boss Icon + Name + Element + Enrage Tags */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 mb-2">
        {/* Boss High-Quality Icon Box */}
        <div className={`relative flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-xl ${
          isEnraged
            ? 'bg-red-900 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
            : 'bg-iron-900/90 border-amber-500/80 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
        }`}>
          <span>{boss.icon || '👑'}</span>
          {isEnraged && (
            <span className="absolute -top-1 -right-1 text-[11px] animate-pulse">⚡</span>
          )}
        </div>

        {/* Boss Name & Dynamic Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <h3 className={`font-cinzel font-black text-sm sm:text-base truncate ${
              isEnraged ? 'text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-amber-200'
            }`}>
              {bossDisplayName}
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Act {actTheme.act}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {/* Element Attribute Badge */}
            <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold border font-mono ${elementBadge.color}`}>
              {elementBadge.text}
            </span>

            {/* Enrage Tag */}
            {isEnraged && (
              <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-red-600 text-white border border-red-300 animate-pulse">
                ⚡ 광란! ATK +50%
              </span>
            )}

            {/* Guard Active Notice */}
            {bossGuardActive && (
              <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-blue-600 text-white border border-blue-300 animate-pulse">
                🛡️ 방어 태세 가동 (피해 -70%)
              </span>
            )}
          </div>
        </div>

        {/* Boss Stats Quick Readout */}
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5 text-[10px] sm:text-[11px] font-mono">
          <span className="flex items-center gap-1 text-rose-300">
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

      {/* Row 2: Boss HP Bar with Phase Thresholds */}
      <div className="relative z-10 mb-2">
        <div className="relative w-full bg-iron-950 rounded-full overflow-hidden border-2 border-iron-700 h-4 sm:h-5 shadow-inner">
          {/* Phase marker at 30% (Enrage) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
            style={{ left: '30%' }}
          />
          {/* Phase marker at 50% (Summon/Phase 2) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-purple-400/60 z-10"
            style={{ left: '50%' }}
          />

          {/* HP Fill Gradient */}
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
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent" />
          </div>

          {/* HP Number Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono font-black text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] ${
              isEnraged ? 'text-amber-200' : 'text-white'
            }`}>
              {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}
              <span className="text-[8px] sm:text-[9px] text-gray-300 ml-1.5 font-bold">
                ({Math.round(hpPercent)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Phase Labels */}
        <div className="flex justify-between mt-0.5 text-[8px] font-mono text-gray-500 px-1 relative">
          <span>HP 100%</span>
          <span className="text-purple-400 font-bold" style={{ position: 'absolute', left: '47%' }}>50% 소환</span>
          <span className="text-amber-400 font-bold" style={{ position: 'absolute', left: '26%' }}>30%⚡광란</span>
          <span>0</span>
        </div>
      </div>

      {/* Row 3: Signature Gimmick Tactical Countdown Bar */}
      {gimmickInfo && (
        <div className={`relative z-10 flex items-center gap-2 rounded-lg p-1.5 border ${gimmickInfo.bgColor} ${gimmickInfo.borderColor} ${
          gimmickInfo.isImminent ? 'animate-gimmick-warning' : ''
        }`}>
          <span className="text-lg flex-shrink-0">{gimmickInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mb-0.5">
              <span className="font-black text-white truncate">{gimmickInfo.label}</span>
              <span className={`font-bold flex-shrink-0 ${
                gimmickInfo.isImminent ? 'text-red-300 animate-pulse font-black' : 'text-gray-300'
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
            <div className="text-[8px] text-gray-300 mt-0.5 font-mono truncate">
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
