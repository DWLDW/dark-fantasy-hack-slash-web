import React, { useState, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { isSkillUnlocked } from '../../data/skills';
import { equippedCompareHint } from '../../state/helpers/dungeonEventHelper';
import { MiniRoomGraph } from '../layout/MiniRoomGraph';
import { Monster, Skill } from '../../types/game';
import { playHeartbeatSound } from '../../utils/audio';
import {
  Swords,
  Flame,
  Shield,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  Crown,
  Gift,
  Sun,
  Activity,
  Crosshair,
  Target
} from 'lucide-react';

export const BattleView: React.FC = React.memo(() => {
  const {
    monsters,
    playerLane,
    setPlayerLane,
    selectedSkill,
    selectSkillOrExecute,
    equippedSkills,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    hordeTimelinePercent,
    floatingDamages,
    chainCount,
    maxChainThisRoom,
    preview,
    bestLaneHint,
    combatLogs,
    playerStats,
    skillLevels,
    consumables,
    useConsumable,
    abandonDungeon,
    equipment,
    equipItem,
    currentDungeon,
    currentRoomId,
    selectNextRoom,
    pendingExitRoomId,
    dungeonBuffs,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    currentDifficulty,
    latestRoomLootEvent
  } = useGame();

  const [showLogs, setShowLogs] = useState(false);
  const [dyingMonsterIds, setDyingMonsterIds] = useState<Set<string>>(new Set());
  const [chainMilestone, setChainMilestone] = useState<{ label: string; color: string; key: number } | null>(null);
  const [shakeClass, setShakeClass] = useState('');

  // Life & Rage Orb floating feedback tracking
  const prevHpRef = React.useRef(playerStats.hp);
  const prevRageRef = React.useRef(playerStats.rage);
  const [lifeOrbFloater, setLifeOrbFloater] = useState<{ text: string; type: 'damage' | 'heal'; id: number } | null>(null);
  const [rageOrbFloater, setRageOrbFloater] = useState<{ text: string; type: 'spend' | 'gain'; id: number } | null>(null);

  const isLowHp = playerStats.hp > 0 && playerStats.hp / Math.max(1, playerStats.maxHp) < 0.25;

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
      setLifeOrbFloater({ text: `${diff} HP`, type: 'damage', id: Date.now() });
    } else if (diff > 0 && prevHpRef.current > 0) {
      setLifeOrbFloater({ text: `+${diff} HP`, type: 'heal', id: Date.now() });
    }
    prevHpRef.current = playerStats.hp;
  }, [playerStats.hp]);

  useEffect(() => {
    const diff = playerStats.rage - prevRageRef.current;
    if (diff < 0) {
      setRageOrbFloater({ text: `${diff} 분노`, type: 'spend', id: Date.now() });
    } else if (diff > 0) {
      setRageOrbFloater({ text: `+${diff} 분노`, type: 'gain', id: Date.now() });
    }
    prevRageRef.current = playerStats.rage;
  }, [playerStats.rage]);

  useEffect(() => {
    if (!lifeOrbFloater) return;
    const t = setTimeout(() => setLifeOrbFloater(null), 1000);
    return () => clearTimeout(t);
  }, [lifeOrbFloater]);

  useEffect(() => {
    if (!rageOrbFloater) return;
    const t = setTimeout(() => setRageOrbFloater(null), 1000);
    return () => clearTimeout(t);
  }, [rageOrbFloater]);


  const laneMonsters: Record<number, Monster[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  monsters.forEach(m => {
    if (laneMonsters[m.lane]) {
      laneMonsters[m.lane].push(m);
    }
  });

  Object.keys(laneMonsters).forEach(k => {
    laneMonsters[parseInt(k)].sort((a, b) => a.depth - b.depth);
  });

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const isEventRoom = currentRoom && (currentRoom.type === 'start' || currentRoom.type === 'treasure' || currentRoom.type === 'shrine' || currentRoom.type === 'rune');
  const activeBoss = monsters.find(m => m.rank === 'boss' && m.hp > 0);
  const isBossEncounter = currentRoom?.type === 'boss' || !!activeBoss;

  // Chain Milestone Banner Effect
  useEffect(() => {
    if (chainCount >= 100) {
      setChainMilestone({ label: '💀 APOCALYPSE! 💀', color: 'from-purple-600 via-red-600 to-amber-500', key: Date.now() });
    } else if (chainCount >= 50) {
      setChainMilestone({ label: '☠️ ANNIHILATION! ☠️', color: 'from-red-700 via-orange-600 to-yellow-500', key: Date.now() });
    } else if (chainCount >= 25) {
      setChainMilestone({ label: '🔥 CARNAGE! 🔥', color: 'from-red-600 via-rose-500 to-orange-500', key: Date.now() });
    } else if (chainCount >= 10) {
      setChainMilestone({ label: '⚔️ MASSACRE! ⚔️', color: 'from-amber-600 via-orange-500 to-red-500', key: Date.now() });
    } else {
      setChainMilestone(null);
    }
  }, [chainCount]);

  // Screen Shake Effect
  useEffect(() => {
    if (chainCount >= 25) {
      setShakeClass('animate-shake-heavy');
    } else if (chainCount >= 10) {
      setShakeClass('animate-shake-medium');
    } else if (chainCount >= 5) {
      setShakeClass('animate-shake-light');
    } else {
      setShakeClass('');
      return;
    }
    const timer = setTimeout(() => setShakeClass(''), 500);
    return () => clearTimeout(timer);
  }, [chainCount]);

  // Track dying monsters for death animation
  useEffect(() => {
    const allMonsterIds = new Set(monsters.map(m => m.id));
    setDyingMonsterIds(prev => {
      const stillDying = new Set<string>();
      prev.forEach(id => {
        if (!allMonsterIds.has(id)) stillDying.add(id);
      });
      return stillDying;
    });
  }, [monsters]);

  // Mark monsters as dying when floatingDamages show fatal hits
  useEffect(() => {
    const fatalIds = floatingDamages.filter(d => d.isFatal).map(d => d.id.split('_')[1]);
    if (fatalIds.length > 0) {
      setDyingMonsterIds(prev => {
        const next = new Set(prev);
        fatalIds.forEach(id => {
          if (monsters.some(m => m.id === id)) next.add(id);
        });
        return next;
      });
    }
  }, [floatingDamages, monsters]);

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-3 py-1 space-y-1.5 select-none pb-12 sm:pb-20 overflow-x-hidden">
      {/* Low HP Red Vignette Screen Pulse */}
      {isLowHp && (
        <div className="fixed inset-0 pointer-events-none border-4 sm:border-8 border-blood-600/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.5)] z-30 animate-pulse" />
      )}

      {/* 1. Top Header: Mini Room Graph + Wait ATB Timeline + Chain Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-center">
        <div className="lg:col-span-7">
          <MiniRoomGraph />
        </div>

        <div className="lg:col-span-5 bg-iron-900 border border-iron-750 rounded p-1.5 sm:p-2 flex items-center justify-between shadow">
          {/* Wait ATB Horde Timeline */}
          <div className="flex-1 pr-2 sm:pr-3 border-r border-iron-750">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-gray-300 font-bold mb-0.5">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blood-400" />
                {isEnemyTurn ? <span className="text-blood-400 animate-pulse font-black">적 반격!</span> : 'Wait ATB'}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400">{isEnemyTurn ? 'STRIKE' : '대기'}</span>
            </div>
            <div className="w-full bg-iron-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-iron-700">
              <div
                className={`h-full transition-all duration-300 ${
                  isEnemyTurn
                    ? 'bg-gradient-to-r from-blood-600 to-blood-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : 'bg-gradient-to-r from-blue-700 to-blue-500'
                }`}
                style={{ width: `${hordeTimelinePercent}%` }}
              />
            </div>
          </div>

          {/* Action Chain Counter & Reset */}
          <div className="pl-2 sm:pl-3 flex items-center gap-1.5 sm:gap-2.5">
            <div className="text-center">
              <div className="text-[9px] text-gray-400 font-mono font-bold">1회 처치</div>
              <div className={`font-cinzel font-black text-sm sm:text-lg ${chainCount > 0 ? 'text-amber-300 animate-chain-pop' : 'text-gray-500'}`}>
                {chainCount > 0 ? `x${chainCount}` : 'x0'}
              </div>
            </div>

            <span />
          </div>
        </div>
      </div>

      
      {/* Active Dungeon Shrine Buffs Banner */}
      {dungeonBuffs.length > 0 && (
        <div className="bg-iron-950 border border-purple-500/60 rounded px-2.5 py-1 flex items-center gap-2 overflow-x-auto text-[10px] sm:text-xs text-purple-200 font-mono shadow">
          <span className="font-bold flex items-center gap-1 flex-shrink-0 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> 성소 축복:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {dungeonBuffs.map(b => (
              <span key={b.id} className="bg-purple-950 px-1.5 py-0.5 rounded border border-purple-700 flex items-center gap-1">
                <span>{b.icon}</span>
                <strong>{b.name}</strong> ({b.description})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Boss Encounter Header Bar */}
      {activeBoss && (
        <div className="bg-gradient-to-r from-red-950 via-iron-950 to-red-950 border-2 border-red-600/90 rounded-lg p-2.5 sm:p-3 shadow-[0_0_30px_rgba(220,38,38,0.5)] space-y-1.5 animate-boss-pulse relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-900/90 border border-amber-400 text-amber-300 font-cinzel font-black text-[10px] sm:text-xs tracking-wider shadow flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>👑 DIABOLIC BOSS</span>
              </span>
              <span className="font-cinzel text-base sm:text-lg font-black text-amber-300 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {activeBoss.name}
              </span>
            </div>
            <div className="text-right font-mono font-bold text-xs sm:text-sm text-red-200">
              <span>HP {activeBoss.hp} / {activeBoss.maxHp}</span>
              <span className="text-amber-400 ml-1.5 font-black">
                ({Math.round((activeBoss.hp / activeBoss.maxHp) * 100)}%)
              </span>
              <span className="text-gray-400 text-[10px] sm:text-xs ml-1.5">
                [방어 {activeBoss.defense}]
              </span>
            </div>
          </div>

          <div className="w-full bg-iron-950 h-3 sm:h-3.5 rounded-full overflow-hidden border border-red-700/80 shadow-inner">
            <div
              className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.9)]"
              style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-1 text-[10px] sm:text-[11px] font-mono">
            <div className="text-amber-300 font-bold flex items-center gap-1.5 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/80">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 animate-pulse" />
              <span>
                {activeBoss.bossGimmick ||
                  (activeBoss.hp / activeBoss.maxHp <= 0.3
                    ? '⚠️ 페이즈 2: 광폭화 상태! 공격력 대폭 증가'
                    : '⚠️ 페이즈 1: 화염 폭풍 준비중')}
              </span>
            </div>
            <div className="text-red-300/80 text-[10px] font-mono">
              전장 위치: <strong className="text-amber-300">L{activeBoss.lane + 1} 레인</strong>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Battlefield Box (Clean Surface Separation) */}
      <div className={`bg-iron-950 rounded-lg p-1.5 sm:p-2.5 relative overflow-visible transition-all duration-300 flex flex-col gap-1.5 ${
        isBossEncounter
          ? 'border-2 border-red-600/90 shadow-[0_0_35px_rgba(220,38,38,0.5)] ring-2 ring-red-500/40'
          : 'border-2 border-brass-500/80 shadow-2xl'
      } ${isAttacking ? 'animate-hit-shake' : ''} ${shakeClass}`}>
        {isBossEncounter ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/60 via-red-950/20 to-iron-950/95 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-red-600/20 via-red-900/10 to-transparent pointer-events-none animate-pulse" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-blood-950/20 via-transparent to-iron-950/90 pointer-events-none" />
        )}

        {/* Chain Kill Milestone Banner Overlay */}
        {chainMilestone && (
          <div
            key={chainMilestone.key}
            className={`absolute top-1/2 left-1/2 z-50 animate-chain-banner flex flex-col items-center`}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className={`bg-gradient-to-r ${chainMilestone.color} px-6 py-3 rounded-lg shadow-2xl border-2 border-white/30`}>
              <div className="font-cinzel font-black text-xl sm:text-3xl text-white tracking-widest drop-shadow-lg whitespace-nowrap">
                {chainMilestone.label}
              </div>
              <div className="text-center text-white/80 font-mono font-bold text-sm mt-0.5">
                x{chainCount} CHAIN KILL
              </div>
            </div>
          </div>
        )}

        {/* Screen Flash for x25+ kills */}
        {chainCount >= 25 && shakeClass && (
          <div className="absolute inset-0 z-40 animate-screen-flash bg-white/20 rounded-lg" />
        )}

        {/* Real-time Preview Banner (Active during Combat) */}
        {!isCleared && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 bg-iron-900 px-2 py-1 rounded border border-iron-700 text-[10px] sm:text-xs font-mono shadow">
            <div className="flex items-center gap-2">
              <span className="text-brass-300 font-bold flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-amber-400" />
                <span>{selectedSkill.name.split(' ')[0]} [{selectedSkill.hotkey}]</span>

              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-200">
                타격: <strong className="text-brass-200 font-black">{preview.totalDamage}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {preview.chainCount > 0 ? (
                <span className="text-emerald-300 bg-emerald-950/70 border border-emerald-500 px-1.5 py-0.2 rounded font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-blood-400" />
                  <span>예상 {preview.chainCount}처치 (치명 미포함)</span>
                </span>
              ) : (
                <span className="text-gray-400">처치 0</span>
              )}
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">
                저지점: <strong className="text-blood-300 font-black">{preview.stopperId ? `L${monsters.find(m => m.id === preview.stopperId)?.lane ? monsters.find(m => m.id === preview.stopperId)!.lane + 1 : '전열'}` : '없음 (전체 관통)'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Battlefield Area: Active 5-Lane Monster Grid OR Full Hero Loot Reveal Overlay */}
        {isCleared ? (
          <div className="w-full min-h-[220px] sm:min-h-[280px] flex flex-col justify-center items-center relative z-20 py-2">
            {latestRoomLootEvent ? (
              /* 🔥 FULL HERO LOOT REVEAL OVERLAY (몬스터창을 완전히 뒤덮는 득템 연출) */
              <div className="w-full p-4 sm:p-6 bg-gradient-to-b from-iron-900/98 via-iron-950/98 to-amber-950/95 border-2 border-amber-400 rounded-xl shadow-[0_0_50px_rgba(251,191,36,0.35)] space-y-4 animate-fade-in text-center ring-1 ring-amber-300/60">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-bounce">
                    {latestRoomLootEvent.type === 'treasure' ? '🎁' : latestRoomLootEvent.type === 'rune' ? '🔮' : '☀️'}
                  </div>
                  <h3 className="text-base sm:text-xl font-cinzel font-black text-amber-200 tracking-wider flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>[{latestRoomLootEvent.title}] 획득 완료!</span>
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-400 font-mono font-bold">
                    ✓ 모든 전리품이 소지품 가방에 안전하게 수납되었습니다.
                  </p>
                </div>

                {/* Acquired Loot Cards Grid */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                  {latestRoomLootEvent.gold !== undefined && (
                    <div className="px-3 py-2 rounded-lg bg-iron-900 border-2 border-yellow-500 text-yellow-300 font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                      <span>💰 +{latestRoomLootEvent.gold.toLocaleString()} G</span>
                    </div>
                  )}
                  {latestRoomLootEvent.shards !== undefined && (
                    <div className="px-3 py-2 rounded-lg bg-iron-900 border-2 border-purple-500 text-purple-300 font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                      <span>💎 +{latestRoomLootEvent.shards} 샤드</span>
                    </div>
                  )}
                  {latestRoomLootEvent.runeName && (
                    <div className="px-3 py-2 rounded-lg bg-purple-950/90 border-2 border-purple-400 text-purple-200 font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md animate-pulse">
                      <span>🔮 [{latestRoomLootEvent.runeName} 룬] x{latestRoomLootEvent.count || 1}</span>
                    </div>
                  )}
                  {latestRoomLootEvent.items && latestRoomLootEvent.items.map((it, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (it.isIdentified === false) return;
                        equipItem(it);
                      }}
                      className={`px-3 py-2 rounded-lg border-2 font-mono font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-md ${
                        it.rarity === 'unique' || it.rarity === 'legendary'
                          ? 'bg-orange-950/90 border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.5)]'
                          : it.rarity === 'rare'
                          ? 'bg-yellow-950/90 border-yellow-400 text-yellow-200'
                          : it.rarity === 'magic'
                          ? 'bg-blue-950/90 border-blue-400 text-blue-200'
                          : 'bg-iron-900 border-iron-500 text-gray-200'
                      }`}
                    >
                      <span>⚔️ {it.name}</span>
                      <span className="text-[10px] text-emerald-300 font-bold">{equippedCompareHint(it, equipment)}</span>
                      <span className="text-[9px] text-gray-400 font-normal">
                        {it.isIdentified === false ? '감정 필요' : '클릭 장착'}
                      </span>
                    </button>
                  ))}
                  {latestRoomLootEvent.buffName && (
                    <div className="px-3 py-2 rounded-lg bg-blue-950/90 border-2 border-blue-400 text-blue-200 font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                      <span>☀️ [{latestRoomLootEvent.buffName}]: {latestRoomLootEvent.buffDesc}</span>
                    </div>
                  )}
                </div>

                {/* Big Next Room Push Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  {currentRoom?.connections.map(nextId => {
                    const nRoom = currentDungeon.rooms.find(r => r.id === nextId);
                    if (!nRoom) return null;
                    const selected = pendingExitRoomId === nextId || (pendingExitRoomId == null && nextId === currentRoom.connections[0]);
                    return (
                      <button
                        key={nextId}
                        onClick={() => selectNextRoom(nextId)}
                        className={`px-6 py-3 font-black rounded-xl text-xs sm:text-sm md:text-base shadow-2xl transition transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                          selected
                            ? 'bg-gradient-to-r from-brass-600 via-amber-500 to-brass-500 text-iron-950 ring-2 ring-amber-200'
                            : 'bg-iron-900 border border-iron-600 text-gray-200'
                        }`}
                      >
                        <span>{nRoom.revealed ? nRoom.title : '?'} {selected ? '[Space]' : ''}</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !roomEventClaimed && (currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') ? (
              /* EVENT ROOM UNCLAIMED HERO CARD */
              <div className="w-full p-4 sm:p-6 bg-iron-950/95 border-2 border-amber-400 rounded-xl shadow-2xl space-y-3 text-center animate-fade-in">
                {currentRoom.type === 'treasure' && (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-900/60 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-bounce">
                      🎁
                    </div>
                    <h3 className="text-base sm:text-xl font-cinzel font-black text-amber-200">
                      {currentRoom.title} (황금 보물 상자)
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
                      황금 궤짝을 발견했습니다. [Space]로 열어 골드와 장비를 획득하세요.
                    </p>
                    <button
                      onClick={claimTreasure}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-iron-950 font-black text-xs sm:text-sm md:text-base rounded-xl shadow-2xl ring-2 ring-amber-200 transition transform active:scale-95 animate-pulse cursor-pointer"
                    >
                      🎁 황금 궤짝 개봉하기 [Space]
                    </button>
                  </div>
                )}

                {currentRoom.type === 'rune' && (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-purple-900/60 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(192,132,252,0.6)] animate-pulse">
                      🔮
                    </div>
                    <h3 className="text-base sm:text-xl font-cinzel font-black text-purple-200">
                      {currentRoom.title} (고대 룬의 제단)
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
                      룬 제단을 점거한 적을 물리쳤습니다! 기도를 올려 고대 룬을 직접 연성하세요.
                    </p>
                    <button
                      onClick={claimRuneAltar}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-xs sm:text-sm md:text-base rounded-xl shadow-2xl ring-2 ring-purple-300 transition transform active:scale-95 animate-pulse cursor-pointer"
                    >
                      🔮 제단 기도 & 룬 연성하기 [Space]
                    </button>
                  </div>
                )}

                {currentRoom.type === 'shrine' && (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-blue-900/60 border-2 border-blue-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(96,165,250,0.6)] animate-spin-slow">
                      ☀️
                    </div>
                    <h3 className="text-base sm:text-xl font-cinzel font-black text-blue-200">
                      {currentRoom.title} (축복의 성소)
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
                      원하는 성소의 축복을 선택하여 이번 던전 탐험 동안 강력한 버프를 받으세요.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto font-mono">
                      <button
                        onClick={() => claimShrine('fortune')}
                        className="p-3 bg-iron-900 hover:bg-amber-950/60 border-2 border-amber-500 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                      >
                        <div className="font-black text-amber-300 text-xs sm:text-sm">☀️ 태양의 성소 [Space]</div>
                        <div className="text-[11px] text-gray-300">매직 발견(MF) +35%</div>
                      </button>
                      <button
                        onClick={() => claimShrine('crit')}
                        className="p-3 bg-iron-900 hover:bg-rose-950/60 border-2 border-rose-500 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                      >
                        <div className="font-black text-rose-300 text-xs sm:text-sm">🩸 피의 성소</div>
                        <div className="text-[11px] text-gray-300">HP 100% 완충 & 치명 +15%</div>
                      </button>
                      <button
                        onClick={() => claimShrine('defense')}
                        className="p-3 bg-iron-900 hover:bg-blue-950/60 border-2 border-blue-500 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                      >
                        <div className="font-black text-blue-300 text-xs sm:text-sm">🛡️ 강철의 성소</div>
                        <div className="text-[11px] text-gray-300">방어 +50 & DR +10%</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NORMAL ROOM CLEARED BANNER */
              <div className="w-full p-4 sm:p-6 bg-iron-950/95 border-2 border-brass-400 rounded-xl shadow-2xl space-y-3 text-center animate-fade-in">
                <h3 className="text-base sm:text-lg font-cinzel font-black text-brass-200 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>🏆 룸 소탕 완료! 다음 경로를 선택하세요:</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {currentRoom?.connections.map(nextId => {
                    const nRoom = currentDungeon.rooms.find(r => r.id === nextId);
                    if (!nRoom) return null;
                    const selected = pendingExitRoomId === nextId || (pendingExitRoomId == null && nextId === currentRoom.connections[0]);
                    return (
                      <button
                        key={nextId}
                        onClick={() => selectNextRoom(nextId)}
                        className={`px-5 py-2.5 font-black rounded-lg shadow-xl border transition transform active:scale-95 flex items-center gap-2 cursor-pointer ${
                          selected
                            ? 'bg-gradient-to-r from-brass-600 to-amber-600 text-white border-brass-300'
                            : 'bg-iron-900 text-gray-300 border-iron-600'
                        }`}
                      >
                        <span>{nRoom.revealed ? nRoom.title : '?'} {selected ? '[Space]' : ''}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 sm:gap-2 min-h-[185px] sm:min-h-[260px] relative">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const isPlayerInLane = playerLane === laneIdx;
            const laneList = laneMonsters[laneIdx] || [];
            const hasBoss = laneList.some(m => m.rank === 'boss');
            const isWhirlwind = selectedSkill.route === 'radius';
            const isCleave = selectedSkill.route === 'branch' && Math.abs(laneIdx - playerLane) <= 1;
            const isLineOrSingle = (selectedSkill.route === 'line' || selectedSkill.route === 'single') && isPlayerInLane;
            const isLaneTargeted = isWhirlwind || isCleave || isLineOrSingle || preview.targetsHit.some(t => t.lane === laneIdx);
            const laneHitTargets = laneList.filter(m => preview.targetsHit.some(t => t.monsterId === m.id));
            const laneFatalHits = laneList.filter(m => preview.targetsHit.find(t => t.monsterId === m.id)?.isFatal).length;
            const hasHitsInLane = laneHitTargets.length > 0;

            return (
              <div
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx)}
                className={`flex flex-col justify-between items-center p-1 sm:p-1.5 rounded-lg border-2 transition cursor-pointer relative overflow-visible ${
                  hasBoss
                    ? isPlayerInLane
                      ? 'bg-red-950/80 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                      : 'bg-red-950/40 border-red-600/90 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : isPlayerInLane
                    ? 'bg-iron-900/90 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_15px_rgba(222,178,67,0.3)]'
                    : isWhirlwind
                    ? 'bg-sky-950/30 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : isCleave
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : isLaneTargeted
                    ? 'bg-iron-900/60 border-blood-700/80'
                    : 'bg-iron-900/40 border-iron-800 hover:border-iron-700'
                }`}
              >
                {/* Lane Header */}
                <div className={`w-full py-0.5 px-0.5 text-center rounded text-[9px] sm:text-[10px] font-mono font-black mb-0.5 sm:mb-1 flex items-center justify-center gap-1 transition ${
                  hasBoss
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black shadow-[0_0_12px_rgba(239,68,68,0.8)] border border-amber-300 animate-pulse'
                    : isPlayerInLane
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-iron-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.6)] ring-1 ring-amber-200'
                    : 'bg-iron-950 text-gray-400 border border-iron-800'
                }`}>
                  <span>{hasBoss ? '👑 L3 BOSS' : `L${laneIdx + 1}`}</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-bold ${
                    hasBoss
                      ? 'bg-black/40 text-amber-300'
                      : isPlayerInLane
                      ? 'bg-iron-950/25 text-iron-950 font-black'
                      : laneList.length > 0
                      ? 'bg-iron-800 text-amber-300 border border-iron-700'
                      : 'text-gray-600'
                  }`}>
                    {laneList.length > 0 ? `${laneList.length}👹` : '0'}
                  </span>
                  {isPlayerInLane && <span className="text-[10px] font-black animate-bounce">▼</span>}
                  {!isPlayerInLane && bestLaneHint === laneIdx && laneList.length > 0 && (
                    <span className="text-[9px] font-black text-emerald-300">↑</span>
                  )}
                </div>

                {/* Queue / Stack & Hit Preview Indicator (Top of Lane) */}
                {laneList.length > 0 && (
                  <div className="w-full space-y-0.5 mb-1 z-10">
                    {/* Skill Attack Preview Badge */}
                    {hasHitsInLane && (
                      <div className={`w-full text-center py-0.5 px-0.5 rounded text-[8px] sm:text-[9px] font-mono font-black border transition shadow-sm ${
                        laneFatalHits === laneList.length
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-300 text-white shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse'
                          : laneFatalHits > 0
                          ? 'bg-amber-950/90 border-amber-500 text-amber-200 animate-pulse'
                          : 'bg-iron-900 border-iron-700 text-gray-300'
                      }`}>
                        {laneFatalHits === laneList.length
                          ? `💥 ${laneList.length}/${laneList.length} 전멸`
                          : laneFatalHits > 0
                          ? `⚔️ ${laneFatalHits}/${laneList.length} 처치`
                          : `🎯 ${laneHitTargets.length}타격 (0처치)`}
                      </div>
                    )}

                    {/* Rear Queue Stack Indicator */}
                    {laneList.length >= 2 && (
                      <div className="w-full bg-iron-950/90 border border-iron-800 rounded px-1 py-0.5 text-[7px] sm:text-[8px] font-mono text-gray-300 flex items-center justify-between shadow-sm">
                        <span className="text-amber-400 font-bold truncate">
                          후열 {laneList.length - 1}마리 대기
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                          {Array.from({ length: Math.min(4, laneList.length - 1) }).map((_, i) => (
                            <span key={i} className="text-[6px] sm:text-[7px]">●</span>
                          ))}
                          {laneList.length - 1 > 4 && <span className="text-[6px]">+</span>}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Monster Queue in this Lane */}
                <div className="w-full flex-1 flex flex-col-reverse justify-start gap-1 relative">
                  {laneList.map(m => {
                    const hitInfo = preview.targetsHit.find(t => t.monsterId === m.id);
                    const isTargeted = !!hitInfo;
                    const isPredictedKill = hitInfo?.isFatal;
                    const isOverkillResidual = hitInfo?.isOverkillHit;
                    const isStopper = preview.stopperId === m.id;
                    const isDying = dyingMonsterIds.has(m.id);
                    const monsterDmgPopups = floatingDamages.filter(d => d.id.includes(m.id));
                    const isBoss = m.rank === 'boss';
                    const isElite = m.rank === 'elite';
                    const isChampion = m.rank === 'champion';

                    return (
                      <div
                        key={m.id}
                        className={`w-full rounded p-1 sm:p-1.5 border transition-all relative overflow-visible shadow ${
                          isDying
                            ? 'animate-death-shrink'
                            : isPredictedKill
                            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white text-[10px] sm:text-[12px] ring-1 sm:ring-2 ring-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
                            : isTargeted
                            ? 'bg-red-950/80 border-2 border-red-500 ring-2 ring-red-500/80 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                            : isBoss
                            ? 'ring-2 ring-amber-400 bg-gradient-to-b from-red-950 via-iron-950 to-red-950 text-amber-200 shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-red-500 animate-boss-pulse'
                            : isStopper
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-300 text-[9px] sm:text-[11px] ring-1 ring-yellow-300'
                            : isElite
                            ? 'bg-blood-950 border-blood-500 text-yellow-200 text-[9px] sm:text-[10px]'
                            : isChampion
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200 text-[9px] sm:text-[10px]'
                            : 'bg-iron-950 border-iron-750 text-gray-200 text-[9px] sm:text-[10px]'
                        } ${isOverkillResidual && !isDying ? 'animate-overkill-glow' : ''}`}
                      >
                        {/* Floating Damage Popups */}
                        {monsterDmgPopups.map(dp => (
                          <div
                            key={dp.id}
                            className={`absolute -top-1 left-1/2 -translate-x-1/2 z-30 font-mono font-black whitespace-nowrap ${
                              dp.isCrit
                                ? 'text-amber-300 text-sm sm:text-base animate-crit-dmg drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                : dp.isOverkill
                                ? 'text-orange-400 text-[11px] sm:text-xs animate-float-dmg drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]'
                                : 'text-white text-[10px] sm:text-xs animate-float-dmg drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                            }`}
                          >
                            {dp.isCrit && <span className="text-[8px] text-yellow-200 block text-center">CRITICAL!</span>}
                            {dp.isOverkill && <span className="text-[8px] text-orange-200 block text-center">OVERKILL</span>}
                            -{dp.damage}
                            {dp.isFatal && <span className="text-blood-300 ml-0.5">💀</span>}
                          </div>
                        ))}

                        {/* Monster Card Details */}
                        {isBoss ? (
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black leading-tight border-b border-red-800/80 pb-0.5 mb-0.5">
                            <span className="truncate text-amber-300 font-cinzel font-black tracking-wide">
                              {m.name.split(' ')[0]}
                            </span>
                            <span className="bg-gradient-to-r from-amber-500 to-red-600 border border-amber-300 text-iron-950 text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-cinzel font-black flex items-center gap-0.5 shadow flex-shrink-0 animate-pulse">
                              👑 BOSS
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black truncate leading-tight">
                            <span className="truncate">{m.name.split(' ')[0]}</span>
                            <span className="text-[10px] sm:text-[12px] filter drop-shadow-sm flex-shrink-0">
                              {isElite ? '👑' : isChampion ? '⭐' : m.name.includes('방패') ? '🛡️' : m.name.includes('궁수') ? '🏹' : '👹'}
                            </span>
                          </div>
                        )}

                        {/* HP Bar */}
                        <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-mono text-gray-300 mt-0.5 leading-none">
                          <span>HP {m.hp}</span>
                          <span className="text-gray-400">방{m.defense}</span>
                        </div>
                        <div className={`w-full bg-iron-950 rounded-full overflow-hidden border mt-0.5 ${
                          isBoss ? 'h-1.5 sm:h-2 border-red-700/80 shadow-inner' : 'h-1 sm:h-1.5 border-iron-750'
                        }`}>
                          <div
                            className={`h-full transition-all duration-200 ${
                              isBoss
                                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : m.hp / m.maxHp < 0.25
                                ? 'bg-red-500'
                                : m.hp / m.maxHp < 0.5
                                ? 'bg-orange-500'
                                : 'bg-blood-500'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))}%` }}
                          />
                        </div>

                        {/* Prediction & Targeting Badges */}
                        {isPredictedKill ? (
                          <div className="text-[7px] sm:text-[8px] font-black text-blood-200 uppercase mt-0.5 bg-blood-950 px-0.5 rounded text-center border border-blood-700">
                            {isOverkillResidual ? '오버킬 관통' : '처치 예상'}
                          </div>
                        ) : isTargeted ? (
                          <div className="text-[7px] sm:text-[8px] font-black text-red-200 uppercase mt-0.5 bg-red-950 px-0.5 rounded text-center border border-red-500 animate-pulse">
                            🎯 피격 (-{hitInfo.damage})
                          </div>
                        ) : null}

                        {m.isFrozen && (
                          <div className="text-[7px] sm:text-[8px] font-black text-sky-200 uppercase mt-0.5 bg-sky-950 px-0.5 rounded text-center border border-sky-600 animate-pulse">
                            ❄️ 빙결(행동불가)
                          </div>
                        )}
                        {isStopper && (
                          <div className="text-[7px] sm:text-[8px] font-black text-amber-200 uppercase mt-0.5 bg-amber-950 px-0.5 rounded text-center border border-amber-700">
                            🛡️ 체인 저지점
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>


                {/* Bottom Lane Selector Indicator */}
                <div className="w-full mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayerLane(laneIdx);
                    }}
                    className={`w-full py-0.5 text-[8px] sm:text-[9px] font-mono font-bold rounded border transition cursor-pointer ${
                      isPlayerInLane
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-iron-950 border-amber-300 font-black shadow'
                        : 'bg-iron-950 text-gray-400 border-iron-800 hover:border-iron-700 hover:text-gray-200'
                    }`}
                  >
                    {isPlayerInLane ? '선택됨' : '선택'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>


      {/* 3. Diablo-style Bottom Action Dock: Left Red Life Flask + Center Skills/Belt + Right Amber Rage Flask */}
      <div className="bg-iron-950/98 border-2 border-brass-500/90 rounded-xl p-2 sm:p-2.5 shadow-2xl space-y-1.5 select-none relative overflow-visible">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* LEFT: Red Life Globe / Flask Orb */}
          <div className="flex flex-col items-center flex-shrink-0 relative">
            {lifeOrbFloater && (
              <div
                key={lifeOrbFloater.id}
                className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-50 font-mono font-black text-xs sm:text-sm md:text-base pointer-events-none animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,1)] px-2 py-0.5 rounded-md whitespace-nowrap ${
                  lifeOrbFloater.type === 'damage'
                    ? 'text-red-300 bg-red-950/95 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] ring-1 ring-red-400'
                    : 'text-emerald-300 bg-emerald-950/95 border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)] ring-1 ring-emerald-300'
                }`}
              >
                {lifeOrbFloater.text}
              </div>
            )}
            <div className={`relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-iron-950 border-2 sm:border-3 ${
              isLowHp
                ? 'border-red-500 ring-4 ring-blood-500 shadow-[0_0_30px_rgba(239,68,68,0.95)] animate-pulse'
                : 'border-blood-600/90 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
            } overflow-hidden flex items-center justify-center transition ${
              lifeOrbFloater?.type === 'damage' ? 'ring-2 ring-red-500 scale-105' : ''
            }`}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blood-900 via-red-600 to-rose-500 transition-all duration-300 ease-out"
                style={{ height: `${Math.max(0, Math.min(100, (playerStats.hp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
              >
                <div className="w-full h-1.5 bg-rose-300/60 blur-[1px] animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/60 pointer-events-none" />
              <div className="relative z-10 text-center font-mono leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <div className="text-[8px] sm:text-[9px] font-black text-rose-200 tracking-wider">LIFE</div>
                <div className="text-xs sm:text-sm md:text-base font-black text-white">
                  {playerStats.hp}
                </div>
                <div className="text-[7px] sm:text-[8px] text-rose-200/80 font-bold hidden sm:block">
                  /{playerStats.maxHp}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-blood-400 font-bold mt-0.5 hidden sm:inline">생명력(HP)</span>
          </div>

          {/* CENTER: Skills Grid & Primary Attack Button & Quick Consumables Belt */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-1 min-w-0">
                {equippedSkills.map(skill => {
                  const isSelected = selectedSkill.id === skill.id;
                  const sLevel = skillLevels[skill.id] || 1;
                  const unlocked = isSkillUnlocked(skill.id, playerStats.level);
                  const canAfford = playerStats.rage >= skill.rageCost;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => { if (isCleared || totalMonsters === 0 || !unlocked) return; selectSkillOrExecute(skill); }}
                      disabled={isAttacking || isEnemyTurn || !unlocked}
                      className={`p-1 sm:p-1.5 rounded-lg border text-left flex flex-col justify-between transition relative shadow cursor-pointer ${
                        !unlocked
                          ? 'bg-iron-950 border-iron-800 text-gray-600 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blood-950 border-brass-400 text-brass-100 ring-2 ring-brass-400 shadow-[0_0_10px_rgba(222,178,67,0.5)] scale-[1.02]'
                          : canAfford
                          ? 'bg-iron-900 border-iron-700 text-gray-100 hover:bg-iron-850 hover:border-iron-600'
                          : 'bg-iron-950/70 border-iron-800 text-gray-500 opacity-60'
                      }`}
                      title={unlocked ? `${skill.name} (클릭 시 선택, 재클릭 시 즉시 시전)` : `Lv.${skill.unlockLevel} 해금`}
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-xs font-black font-cinzel leading-tight">
                        <span className="truncate">{unlocked ? skill.name.split(' ')[0] : '잠김'}</span>
                        <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1 rounded ${
                          isSelected ? 'bg-brass-400 text-iron-950' : 'bg-iron-950 text-gray-400'
                        }`}>
                          {unlocked ? `[${skill.hotkey}]` : `Lv.${skill.unlockLevel}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-gray-300 mt-0.5">
                        <span className={`font-bold ${canAfford ? 'text-amber-300' : 'text-blood-400'}`}>
                          분노 {skill.rageCost > 0 ? skill.rageCost : '0'}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold bg-iron-950 px-1 rounded">
                          Lv.{sLevel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (isCleared) {
                    const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');
                    if (isEventRoom && !roomEventClaimed) {
                      if (currentRoom.type === 'treasure') claimTreasure();
                      else if (currentRoom.type === 'rune') claimRuneAltar();
                      else if (currentRoom.type === 'shrine') claimShrine('fortune');
                      return;
                    }
                    if (currentRoom && currentRoom.connections && currentRoom.connections.length > 0) {
                      const cons = currentRoom.connections;
                      const nextId = (pendingExitRoomId && cons.includes(pendingExitRoomId)) ? pendingExitRoomId : cons[0];
                      selectNextRoom(nextId);
                    }
                  } else {
                    executeAttack();
                  }
                }}
                disabled={isAttacking || isEnemyTurn}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-black text-xs md:text-sm flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 flex-shrink-0 cursor-pointer ${
                  isCleared
                    ? 'bg-gradient-to-r from-brass-600 to-amber-600 hover:from-brass-500 hover:to-amber-500 text-white ring-2 ring-brass-400 shadow-[0_0_15px_rgba(222,178,67,0.6)] animate-pulse'
                    : isEnemyTurn
                    ? 'bg-blood-950 text-blood-300 border-2 border-blood-600 cursor-wait'
                    : isAttacking
                    ? 'bg-amber-700 text-white animate-pulse'
                    : 'bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white ring-2 ring-blood-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isAttacking
                      ? '처치 중...'
                      : isEnemyTurn
                      ? '적 반격...'
                      : isCleared
                      ? ((currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') && !roomEventClaimed ? '보상 획득' : '다음 룸')
                      : '공격'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-amber-200/90 font-bold">[Space]</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 border-t border-iron-800 text-[10px] sm:text-xs font-mono">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {consumables.map(item => (
                  <button
                    key={item.id}
                    onClick={() => useConsumable(item.id)}
                    disabled={item.count <= 0}
                    className={`px-2 py-0.5 rounded border flex items-center gap-1 transition shadow-sm cursor-pointer ${
                      item.count > 0
                        ? 'bg-iron-900 border-iron-700 text-gray-200 hover:border-amber-400 hover:text-white'
                        : 'bg-iron-950 text-gray-600 border-iron-850 opacity-40 cursor-not-allowed'
                    }`}
                    title={`${item.name} (${item.description}) [${item.hotkey}]`}
                  >
                    <span className="font-black text-amber-400">[{item.hotkey}]</span>
                    <span className="truncate max-w-[70px] sm:max-w-none">{item.name}</span>
                    <span className="font-black text-amber-300">x{item.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-[10px] text-gray-400 hover:text-gray-200 underline font-sans cursor-pointer"
                >
                  {showLogs ? '로그 닫기' : '전투 로그'}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('원정을 포기하면 이번 런 전리품을 잃습니다. 마을로 돌아갈까요?')) {
                      abandonDungeon();
                    }
                  }}
                  className="px-2 py-0.5 bg-blood-950/80 hover:bg-blood-900 border border-blood-800 text-blood-300 hover:text-white rounded text-[10px] font-bold transition shadow cursor-pointer"
                >
                  마을 귀환
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Amber Rage Flask Orb */}
          <div className="flex flex-col items-center flex-shrink-0 relative">
            {rageOrbFloater && (
              <div
                key={rageOrbFloater.id}
                className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-50 font-mono font-black text-xs sm:text-sm md:text-base pointer-events-none animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,1)] px-2 py-0.5 rounded-md whitespace-nowrap ${
                  rageOrbFloater.type === 'spend'
                    ? 'text-orange-300 bg-orange-950/95 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.9)] ring-1 ring-orange-400'
                    : 'text-amber-300 bg-amber-950/95 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] ring-1 ring-amber-300'
                }`}
              >
                {rageOrbFloater.text}
              </div>
            )}
            <div className={`relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-iron-950 border-2 sm:border-3 border-amber-500/90 shadow-[0_0_20px_rgba(251,191,36,0.5)] overflow-hidden flex items-center justify-center transition ${
              rageOrbFloater ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900 via-orange-600 to-yellow-400 transition-all duration-300 ease-out"
                style={{ height: `${Math.max(0, Math.min(100, (playerStats.rage / Math.max(1, playerStats.maxRage)) * 100))}%` }}
              >
                <div className="w-full h-1.5 bg-yellow-200/60 blur-[1px] animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/60 pointer-events-none" />
              <div className="relative z-10 text-center font-mono leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <div className="text-[8px] sm:text-[9px] font-black text-yellow-200 tracking-wider">RAGE</div>
                <div className="text-xs sm:text-sm md:text-base font-black text-white">
                  {playerStats.rage}
                </div>
                <div className="text-[7px] sm:text-[8px] text-amber-200/80 font-bold hidden sm:block">
                  /{playerStats.maxRage}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-400 font-bold mt-0.5 hidden sm:inline">분노(RAGE)</span>
          </div>

        </div>

        {/* Optional Collapsible Combat Log */}
        {showLogs && (
          <div className="mt-1 bg-iron-950 p-2 rounded border border-iron-800 max-h-28 overflow-y-auto space-y-0.5 font-mono text-[9px] text-gray-300">
            {combatLogs.slice(-15).map(log => (
              <div key={log.id} className="leading-tight">
                <span className="text-gray-500">[{log.timestamp}]</span> {log.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
BattleView.displayName = 'BattleView';
