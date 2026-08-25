import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { playHeartbeatSound } from '../../utils/audio';
import { getActTheme } from '../../utils/actThemes';
import { BattleHeader } from './battle/BattleHeader';
import { BattleTacticalPreview } from './battle/BattleTacticalPreview';
import { BossHUD } from './battle/BossHUD';
import { BossSkillCutin } from './battle/BossSkillCutin';
import { PlayerHitFlash } from './battle/PlayerHitFlash';
import { BattleFieldLanes } from './battle/BattleFieldLanes';
import { BattleSkillsBar } from './battle/BattleSkillsBar';
import { BattleStatusDock } from './battle/BattleStatusDock';

export const BattleView: React.FC = React.memo(() => {
  const {
    monsters,
    floatingDamages,
    playerStats,
    totalStats,
    isEnemyTurn,
    currentDungeon,
    isAttacking,
    chainCount
  } = useGame();

  const actTheme = useMemo(() => getActTheme(currentDungeon.id), [currentDungeon.id]);

  const [dyingMonsterIds, setDyingMonsterIds] = useState<Set<string>>(new Set());

  // Life & Rage floating feedback tracking
  const prevHpRef = React.useRef(playerStats.hp);
  const prevRageRef = React.useRef(playerStats.rage);
  const [lifeFloater, setLifeFloater] = useState<{ text: string; type: 'damage' | 'heal'; id: number } | null>(null);
  const [rageFloater, setRageFloater] = useState<{ text: string; type: 'spend' | 'gain'; id: number } | null>(null);

  const isLowHp = playerStats.hp > 0 && playerStats.hp / Math.max(1, playerStats.maxHp) <= 0.25;

  useEffect(() => {
    if (!isLowHp) return;
    playHeartbeatSound();
    const interval = setInterval(() => {
      playHeartbeatSound();
    }, 1200);
    return () => clearInterval(interval);
  }, [isLowHp]);

  useEffect(() => {
    const diff = playerStats.hp - prevHpRef.current;
    if (diff < 0) {
      setLifeFloater({ text: `${diff} HP`, type: 'damage', id: Date.now() });
    } else if (diff > 0 && prevHpRef.current > 0) {
      setLifeFloater({ text: `+${diff} HP`, type: 'heal', id: Date.now() });
    }
    prevHpRef.current = playerStats.hp;
  }, [playerStats.hp]);

  useEffect(() => {
    const diff = playerStats.rage - prevRageRef.current;
    if (diff < 0) {
      setRageFloater({ text: `${diff} 분노`, type: 'spend', id: Date.now() });
    } else if (diff > 0 && prevRageRef.current > 0) {
      setRageFloater({ text: `+${diff} 분노`, type: 'gain', id: Date.now() });
    }
    prevRageRef.current = playerStats.rage;
  }, [playerStats.rage]);

  // Expected Incoming Damage calculation & Next HP preview
  const isCleared = monsters.length === 0;
  const expectedIncomingDmg = useMemo(() => {
    if (isCleared || isEnemyTurn) return 0;
    let totalDmg = 0;
    for (let l = 0; l < 5; l++) {
      const laneAlive = monsters.filter(m => m.lane === l && m.hp > 0).sort((a, b) => a.depth - b.depth);
      if (laneAlive.length > 0 && !laneAlive[0].isFrozen) {
        const m = laneAlive[0];
        const isElite = m.rank === 'elite' || m.rank === 'boss';
        let raw = m.intent.damage || (isElite ? 8 : 3);
        if (m.rank === 'boss' && m.maxHp > 0 && m.hp / m.maxHp <= 0.3) {
          raw = Math.floor(raw * 1.5);
        }
        const k = 100 + playerStats.level * 10;
        const defMult = k / (k + Math.max(0, totalStats.defense));
        const drMult = (100 - (totalStats.damageReduction || 0)) / 100;
        totalDmg += Math.max(1, Math.floor(raw * defMult * drMult));
      }
    }
    return totalDmg;
  }, [monsters, isCleared, isEnemyTurn, playerStats.level, totalStats.defense, totalStats.damageReduction]);

  // Mark monsters as dying when floatingDamages show fatal hits
  useEffect(() => {
    const fatalIds = floatingDamages.filter(d => d.isFatal).map(d => d.id.split('_')[1]);
    if (fatalIds.length > 0) {
      setDyingMonsterIds(prev => {
        const next = new Set(prev);
        fatalIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [floatingDamages, monsters]);

  const strikeShake = isAttacking
    ? (chainCount >= 25 ? 'animate-shake-heavy' : chainCount >= 10 ? 'animate-shake-medium' : 'animate-shake-light')
    : '';

  return (
    <div className={`w-full min-h-full transition-colors duration-500 rounded-xl p-1 sm:p-2 ${actTheme.bgGradient} ${strikeShake}`}>
      <div className="max-w-7xl mx-auto px-1 sm:px-2 py-1 space-y-2 select-none pb-20 sm:pb-24 overflow-x-hidden relative font-sans">
        {/* Low HP Red Vignette Screen Pulse */}
        {isLowHp && (
          <div className="fixed inset-0 pointer-events-none border-4 sm:border-8 border-blood-600/50 shadow-[inset_0_0_60px_rgba(239,68,68,0.5)] z-30 animate-pulse" />
        )}

        {/* Boss Signature Skill Cinematic Cut-in & Fullscreen Flash */}
        <BossSkillCutin />

        {/* Full-screen player damage feedback (vignette + floating number) */}
        <PlayerHitFlash />

        {/* Layer 1: Top Header Navigation & Status */}
        <BattleHeader />

      {/* Layer 1.5: Real-time Tactical Attack Preview Banner */}
      <BattleTacticalPreview />

      {/* Layer 1.7: Boss Dedicated HUD (boss rooms only) */}
      <BossHUD />

      {/* Layer 2: Main 5-Lane Battlefield Area */}
      <BattleFieldLanes dyingMonsterIds={dyingMonsterIds} />

      {/* Layer 3: Bottom Battle Control Dock */}
      <div className="bg-iron-950/95 border-2 border-brass-600/40 rounded-xl p-2.5 sm:p-3 shadow-2xl space-y-2 select-none ui-ornate">
        {/* ROW 1: Skills QWER & Attack Button */}
        <BattleSkillsBar />

        {/* ROW 2: Horizontal Dual Gauges (ㅡ LIFE / RAGE) & Consumables Quick Belt */}
        <BattleStatusDock
          expectedIncomingDmg={expectedIncomingDmg}
          isLowHp={isLowHp}
          lifeFloater={lifeFloater}
          rageFloater={rageFloater}
        />
      </div>
    </div>
    </div>
  );
});

BattleView.displayName = 'BattleView';
