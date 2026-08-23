import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { isSkillUnlocked, getSkillDamageText } from '../../data/skills';
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
  Heart,
  RotateCcw,
  BookOpen,
  Home,
  Check,
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
    totalStats,
    skillRunes,
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
    selectedShrineType,
    setSelectedShrineType,
    cycleShrineSelection,
    currentDifficulty,
    latestRoomLootEvent
  } = useGame();

  const [showLogs, setShowLogs] = useState(false);
  const [dyingMonsterIds, setDyingMonsterIds] = useState<Set<string>>(new Set());
  const [chainMilestone, setChainMilestone] = useState<{ label: string; color: string; key: number } | null>(null);

  // Life & Rage Orb floating feedback tracking
  const prevHpRef = React.useRef(playerStats.hp);
  const prevRageRef = React.useRef(playerStats.rage);
  const [lifeOrbFloater, setLifeOrbFloater] = useState<{ text: string; type: 'damage' | 'heal'; id: number } | null>(null);
  const [rageOrbFloater, setRageOrbFloater] = useState<{ text: string; type: 'spend' | 'gain'; id: number } | null>(null);

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
    } else if (diff > 0 && prevRageRef.current > 0) {
      setRageOrbFloater({ text: `+${diff} 분노`, type: 'gain', id: Date.now() });
    }
    prevRageRef.current = playerStats.rage;
  }, [playerStats.rage]);

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const activeBoss = monsters.find(m => m.rank === 'boss' && m.hp > 0);

  // Expected Incoming Damage calculation & Next HP preview
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

  const shieldAmount = playerStats.shield || 0;
  const dmgToHp = Math.max(0, expectedIncomingDmg - shieldAmount);
  const expectedNextHp = Math.max(0, playerStats.hp - dmgToHp);

  // Chain Milestone Banner Effect
  useEffect(() => {
    if (chainCount >= 100) {
      setChainMilestone({ label: '💀 APOCALYPSE! 💀', color: 'from-purple-600 via-red-600 to-amber-500', key: Date.now() });
    } else if (chainCount >= 50) {
      setChainMilestone({ label: '☠️ ANNIHILATION! ☠️', color: 'from-red-700 via-orange-600 to-yellow-500', key: Date.now() });
    } else if (chainCount >= 25) {
      setChainMilestone({ label: '⚔️ MASSACRE! ⚔️', color: 'from-amber-600 to-yellow-400', key: Date.now() });
    } else if (chainCount >= 10) {
      setChainMilestone({ label: '🔥 RAMPAGE! 🔥', color: 'from-blood-600 to-amber-500', key: Date.now() });
    }
  }, [chainCount]);

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
    <div className="max-w-7xl mx-auto px-1 sm:px-3 py-1 space-y-1.5 select-none pb-12 sm:pb-20 overflow-x-hidden relative font-sans">
      {/* Low HP Red Vignette Screen Pulse */}
      {isLowHp && (
        <div className="fixed inset-0 pointer-events-none border-4 sm:border-8 border-blood-600/50 shadow-[inset_0_0_60px_rgba(239,68,68,0.5)] z-30 animate-pulse" />
      )}

      {/* 1. Top Header: Mini Room Graph + Wait ATB Timeline + Chain Counter + Safe Town Return */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-center">
        <div className="lg:col-span-7">
          <MiniRoomGraph />
        </div>

        <div className="lg:col-span-5 bg-iron-900 border border-iron-750 rounded p-1.5 sm:p-2 flex items-center justify-between shadow gap-2">
          {/* Wait ATB Horde Timeline */}
          <div className="flex-1 pr-2 border-r border-iron-750">
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

          {/* Action Chain Counter */}
          <div className="text-center px-1">
            <div className="text-[9px] text-gray-400 font-mono font-bold">1회 처치</div>
            <div className={`font-cinzel font-black text-sm sm:text-base ${chainCount > 0 ? 'text-amber-300 animate-chain-pop' : 'text-gray-500'}`}>
              {chainCount > 0 ? `x${chainCount}` : 'x0'}
            </div>
          </div>

          {/* Safe Town Return Button */}
          <button
            onClick={() => {
              if (window.confirm('이번 원정을 포기하고 마을로 안전하게 귀환하시겠습니까? (미저장 전리품 몰수)')) {
                abandonDungeon();
              }
            }}
            className="px-2 py-1 bg-iron-950 hover:bg-iron-800 border border-iron-750 hover:border-red-500/70 text-gray-400 hover:text-red-300 rounded text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow flex-shrink-0"
            title="원정을 중단하고 마을로 안전하게 귀환합니다"
          >
            <Home className="w-3 h-3 text-amber-400" />
            <span>귀환</span>
          </button>
        </div>
      </div>

      {/* Active Dungeon Shrine Buffs Banner */}
      {dungeonBuffs.length > 0 && (
        <div className="bg-iron-950 border border-purple-500/60 rounded px-2.5 py-0.5 flex items-center gap-2 overflow-x-auto text-[10px] sm:text-xs text-purple-200 font-mono shadow">
          <span className="font-bold flex items-center gap-1 flex-shrink-0 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> 성소 축복:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {dungeonBuffs.map(b => (
              <span key={b.id} className="bg-purple-950 px-1.5 py-0.2 rounded border border-purple-700 flex items-center gap-1">
                <span>{b.icon}</span>
                <strong>{b.name}</strong> ({b.description})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main 5-Lane Battlefield Area */}
      <div className="bg-iron-900/90 border-2 border-iron-750 rounded-xl p-2 sm:p-3 shadow-2xl relative min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
        {/* Active Boss Header Bar */}
        {activeBoss && (
          <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-blood-950/90 via-iron-950 to-blood-950/90 border border-blood-600/80 flex items-center justify-between gap-3 shadow">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <div className="text-xs sm:text-sm font-black text-amber-200">{activeBoss.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  방어력: {activeBoss.defense} · 공격력: {activeBoss.intent.damage || 25}
                </div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs sm:text-sm font-black text-rose-300">{activeBoss.hp.toLocaleString()} / {activeBoss.maxHp.toLocaleString()}</div>
              <div className="w-28 sm:w-36 h-2 bg-iron-950 rounded-full border border-iron-700 overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blood-600 to-rose-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5-Lane Grid Column Headers & Lane Targeting */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-1.5 font-mono text-[10px] sm:text-xs text-center">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const isCurrentLane = playerLane === laneIdx;
            const isBestLane = bestLaneHint === laneIdx;
            const laneMonsters = monsters.filter(m => m.lane === laneIdx && m.hp > 0);

            return (
              <button
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx)}
                className={`py-1 px-1 rounded transition border flex items-center justify-center gap-1 cursor-pointer ${
                  isCurrentLane
                    ? 'bg-blood-950 border-blood-500 text-white font-black shadow'
                    : isBestLane
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                    : 'bg-iron-950 border-iron-800 text-gray-400 hover:border-iron-600'
                }`}
              >
                {isCurrentLane && <Crosshair className="w-3 h-3 text-blood-400" />}
                <span>레인 {laneIdx + 1}</span>
                {laneMonsters.length > 0 && (
                  <span className="text-[9px] text-gray-400 font-bold">({laneMonsters.length})</span>
                )}
                {isBestLane && !isCurrentLane && <span className="text-[9px] text-amber-300 font-black">↑추천</span>}
              </button>
            );
          })}
        </div>

        {/* 5-Lane Monster Formations Grid */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 flex-1 items-stretch">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const laneMonsters = monsters.filter(m => m.lane === laneIdx && m.hp > 0).sort((a, b) => a.depth - b.depth);
            const isCurrentLane = playerLane === laneIdx;

            return (
              <div
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx)}
                className={`p-1 sm:p-1.5 rounded-lg border-2 flex flex-col justify-start space-y-1 transition relative cursor-pointer ${
                  isCurrentLane
                    ? 'bg-blood-950/30 border-blood-500/70 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-iron-950/60 border-iron-800/80 hover:border-iron-700'
                }`}
              >
                {laneMonsters.map((m, dIdx) => {
                  const isBoss = m.rank === 'boss';
                  const isElite = m.rank === 'elite';
                  const isDying = dyingMonsterIds.has(m.id);

                  return (
                    <div
                      key={m.id}
                      className={`p-1.5 rounded border transition relative ${
                        isDying
                          ? 'opacity-0 scale-75 bg-red-950 border-red-500 transition-all duration-300'
                          : isBoss
                          ? 'bg-gradient-to-r from-blood-950 via-iron-900 to-amber-950 border-amber-400 ring-1 ring-amber-400 shadow-md'
                          : isElite
                          ? 'bg-orange-950/70 border-orange-400 text-orange-100 shadow'
                          : dIdx === 0
                          ? 'bg-iron-850 border-iron-600 text-white'
                          : 'bg-iron-900 border-iron-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold leading-tight">
                        <span className="truncate">{m.name}</span>
                        <span className="font-mono text-[9px] text-gray-400">D{dIdx + 1}</span>
                      </div>

                      {/* HP Bar */}
                      <div className="w-full h-1.5 bg-iron-950 rounded-full overflow-hidden border border-iron-800 mt-1">
                        <div
                          className={`h-full transition-all duration-200 ${
                            isBoss ? 'bg-gradient-to-r from-amber-500 to-rose-500' : isElite ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-gray-400 mt-0.5">
                        <span>HP {m.hp}</span>
                        <span>공 {m.intent.damage || (isElite ? 14 : 6)}</span>
                      </div>
                    </div>
                  );
                })}

                {laneMonsters.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 font-mono">
                    소탕됨
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unclaimed Event Card (Treasure / Shrine / Rune Altar) */}
        {!roomEventClaimed && (currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') && isCleared && (
          <div className="my-2 p-3 bg-iron-950/95 border-2 border-amber-400 rounded-xl shadow-2xl space-y-2 text-center animate-fade-in">
            {currentRoom.type === 'treasure' && (
              <div className="space-y-2">
                <div className="text-2xl">🎁</div>
                <h3 className="font-cinzel font-black text-sm text-amber-200">{currentRoom.title}</h3>
                <button
                  onClick={claimTreasure}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-iron-950 font-black rounded-lg text-xs shadow transition transform active:scale-95 animate-pulse cursor-pointer"
                >
                  보물 상자 개봉하기 [Space]
                </button>
              </div>
            )}

            {currentRoom.type === 'rune' && (
              <div className="space-y-2">
                <div className="text-2xl">🔮</div>
                <h3 className="font-cinzel font-black text-sm text-purple-200">{currentRoom.title}</h3>
                <button
                  onClick={claimRuneAltar}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-black rounded-lg text-xs shadow transition transform active:scale-95 animate-pulse cursor-pointer"
                >
                  고대 룬 제단 기도 [Space]
                </button>
              </div>
            )}

            {currentRoom.type === 'shrine' && (
              <div className="space-y-2">
                <div className="text-xl font-black text-blue-200">{currentRoom.title}</div>
                <p className="text-[11px] text-gray-300 font-mono">
                  [←/→] 방향키로 축복 선택 · [Space] 키 또는 버튼 클릭으로 수령
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl mx-auto font-mono text-left">
                  {/* Fortune */}
                  <button
                    onClick={() => {
                      if (selectedShrineType === 'fortune') claimShrine('fortune');
                      else setSelectedShrineType('fortune');
                    }}
                    className={`p-2.5 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer ${
                      selectedShrineType === 'fortune'
                        ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.4)] scale-[1.02]'
                        : 'bg-iron-900 border-iron-750 opacity-70'
                    }`}
                  >
                    <div className="font-black text-amber-300 text-xs flex items-center justify-between">
                      <span>☀️ 태양의 축복</span>
                      {selectedShrineType === 'fortune' && <span className="text-[9px] bg-amber-500 text-iron-950 px-1 rounded font-black">[Space]</span>}
                    </div>
                    <div className="text-[10px] text-gray-300">희귀도 상승(MF) +35%</div>
                  </button>

                  {/* Crit */}
                  <button
                    onClick={() => {
                      if (selectedShrineType === 'crit') claimShrine('crit');
                      else setSelectedShrineType('crit');
                    }}
                    className={`p-2.5 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer ${
                      selectedShrineType === 'crit'
                        ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.4)] scale-[1.02]'
                        : 'bg-iron-900 border-iron-750 opacity-70'
                    }`}
                  >
                    <div className="font-black text-rose-300 text-xs flex items-center justify-between">
                      <span>🩸 피의 축복</span>
                      {selectedShrineType === 'crit' && <span className="text-[9px] bg-rose-500 text-white px-1 rounded font-black">[Space]</span>}
                    </div>
                    <div className="text-[10px] text-gray-300">HP 완충 & 치명 +15%</div>
                  </button>

                  {/* Defense */}
                  <button
                    onClick={() => {
                      if (selectedShrineType === 'defense') claimShrine('defense');
                      else setSelectedShrineType('defense');
                    }}
                    className={`p-2.5 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer ${
                      selectedShrineType === 'defense'
                        ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-400/80 shadow-[0_0_12px_rgba(96,165,250,0.4)] scale-[1.02]'
                        : 'bg-iron-900 border-iron-750 opacity-70'
                    }`}
                  >
                    <div className="font-black text-blue-300 text-xs flex items-center justify-between">
                      <span>🛡️ 강철의 축복</span>
                      {selectedShrineType === 'defense' && <span className="text-[9px] bg-blue-500 text-white px-1 rounded font-black">[Space]</span>}
                    </div>
                    <div className="text-[10px] text-gray-300">방어 +50 & DR +10%</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Responsive Bottom Battle Dock: Mobile puts QWER on Top (Row 1), Orbs below (Row 2); Desktop preserves 3-Col */}
      <div className="bg-iron-950/98 border-2 border-iron-750 rounded-xl p-2 sm:p-2.5 shadow-2xl space-y-2 select-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          {/* MOBILE ROW 1 / DESKTOP CENTER: Skills QWER + Action Attack Button */}
          <div className="w-full md:flex-1 order-1 md:order-2 space-y-1.5 min-w-0">
            <div className="flex items-stretch gap-1 sm:gap-2">
              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-1 min-w-0">
                {equippedSkills.map(skill => {
                  const isSelected = selectedSkill.id === skill.id;
                  const sLevel = skillLevels[skill.id] || 1;
                  const unlocked = isSkillUnlocked(skill.id, playerStats.level);
                  const canAfford = playerStats.rage >= skill.rageCost;
                  const dmgText = getSkillDamageText(skill, totalStats, sLevel, skillRunes[skill.id] || skill.activeRuneId);

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
                      title={unlocked ? `${skill.name} (클릭 시 스마트 타겟팅 락온, 재클릭 시 시전)` : `Lv.${skill.unlockLevel} 해금`}
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-xs font-black font-cinzel leading-tight">
                        <span className="truncate">{unlocked ? skill.name.split(' ')[0] : '잠김'}</span>
                        <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1 rounded ${
                          isSelected ? 'bg-brass-400 text-iron-950' : 'bg-iron-950 text-amber-400 border border-iron-750'
                        }`}>
                          {unlocked ? `[${skill.hotkey}]` : `Lv.${skill.unlockLevel}`}
                        </span>
                      </div>

                      {unlocked && (
                        <div className="text-[8px] sm:text-[9px] font-mono text-amber-300 font-black truncate my-0.5">
                          {dmgText}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-gray-300">
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

              {/* Space Action Button */}
              <button
                onClick={() => {
                  if (isCleared) {
                    const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');
                    if (isEventRoom && !roomEventClaimed) {
                      if (currentRoom.type === 'treasure') claimTreasure();
                      else if (currentRoom.type === 'rune') claimRuneAltar();
                      else if (currentRoom.type === 'shrine') claimShrine(selectedShrineType);
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
                className={`px-3 sm:px-4 py-2 rounded-lg font-black text-xs md:text-sm flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 flex-shrink-0 cursor-pointer min-w-[85px] sm:min-w-[100px] ${
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

            {/* Consumables Quick Belt (Desktop inside center column) */}
            <div className="hidden md:flex items-center justify-between gap-2 pt-1 border-t border-iron-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 flex-wrap">
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
                    <span>{item.name}</span>
                    <span className="font-black text-amber-300">x{item.count}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                {showLogs ? '로그 닫기' : '로그 보기'}
              </button>
            </div>
          </div>

          {/* MOBILE ROW 2 / DESKTOP SIDES: Life Orb (Left) & Consumables (Center Mobile) & Rage Orb (Right) */}
          <div className="w-full md:w-auto flex items-center justify-between md:contents order-2 md:order-1">
            {/* LEFT: Life Orb with Expected Damage & Lost Health Semi-Transparent Preview */}
            <div className="flex flex-col items-center relative flex-shrink-0">
              {lifeOrbFloater && (
                <div
                  key={lifeOrbFloater.id}
                  className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-50 font-mono font-black text-xs sm:text-sm pointer-events-none animate-bounce drop-shadow px-2 py-0.5 rounded-md whitespace-nowrap ${
                    lifeOrbFloater.type === 'damage'
                      ? 'text-red-300 bg-red-950/95 border-2 border-red-500'
                      : 'text-emerald-300 bg-emerald-950/95 border-2 border-emerald-400'
                  }`}
                >
                  {lifeOrbFloater.text}
                </div>
              )}

              {/* Expected Damage Floating Preview Badge */}
              {expectedIncomingDmg > 0 && !isCleared && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 bg-red-950/95 border border-red-500/80 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono text-red-200 font-bold whitespace-nowrap animate-pulse shadow">
                  피격 -{expectedIncomingDmg}
                </div>
              )}

              <div className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-iron-950 border-2 sm:border-3 ${
                isLowHp
                  ? 'border-red-500 ring-4 ring-blood-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse'
                  : 'border-blood-600/90 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
              } overflow-hidden flex items-center justify-center transition`}>
                
                {/* 1. Solid Remaining HP after anticipated hit */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blood-900 via-red-600 to-rose-500 transition-all duration-300 ease-out"
                  style={{ height: `${Math.max(0, Math.min(100, (expectedNextHp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />

                {/* 2. Semi-Transparent Flashing Red Bar: Expected Lost HP */}
                {dmgToHp > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500/40 border-t border-red-300/60 transition-all duration-300 ease-out animate-pulse"
                    style={{ height: `${Math.max(0, Math.min(100, (playerStats.hp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                  />
                )}

                {/* 3. Shield Barrier Overlay */}
                {shieldAmount > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-950 via-sky-600/80 to-cyan-400/90 transition-all duration-300 ease-out border-t-2 border-cyan-300"
                    style={{ height: `${Math.max(0, Math.min(100, (shieldAmount / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                  />
                )}

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/60 pointer-events-none" />
                <div className="relative z-10 text-center font-mono leading-none drop-shadow">
                  <div className="text-[7px] sm:text-[8px] font-black text-rose-200 tracking-wider">
                    {shieldAmount > 0 ? `🛡️+${shieldAmount}` : 'LIFE'}
                  </div>
                  <div className="text-[11px] sm:text-xs md:text-sm font-black text-white">
                    {playerStats.hp}
                  </div>
                  <div className="text-[7px] sm:text-[8px] text-rose-200/80 font-bold hidden sm:block">
                    /{playerStats.maxHp}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Consumables Belt in Row 2 */}
            <div className="flex items-center gap-1 md:hidden font-mono">
              {consumables.map(item => (
                <button
                  key={item.id}
                  onClick={() => useConsumable(item.id)}
                  disabled={item.count <= 0}
                  className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-0.5 ${
                    item.count > 0
                      ? 'bg-iron-900 border-iron-700 text-gray-200'
                      : 'bg-iron-950 text-gray-600 border-iron-850 opacity-40'
                  }`}
                >
                  <span className="font-bold text-amber-400">[{item.hotkey}]</span>
                  <span>x{item.count}</span>
                </button>
              ))}
            </div>

            {/* RIGHT: Rage Orb (order-3 on desktop) */}
            <div className="flex flex-col items-center relative flex-shrink-0 md:order-3">
              {rageOrbFloater && (
                <div
                  key={rageOrbFloater.id}
                  className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-50 font-mono font-black text-xs sm:text-sm pointer-events-none animate-bounce drop-shadow px-2 py-0.5 rounded-md whitespace-nowrap text-amber-300 bg-amber-950/95 border-2 border-amber-500"
                >
                  {rageOrbFloater.text}
                </div>
              )}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-iron-950 border-2 sm:border-3 border-amber-600/90 shadow-[0_0_15px_rgba(245,158,11,0.4)] overflow-hidden flex items-center justify-center transition">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-950 via-amber-600 to-yellow-400 transition-all duration-200 ease-out"
                  style={{ height: `${Math.max(0, Math.min(100, (playerStats.rage / Math.max(1, playerStats.maxRage)) * 100))}%` }}
                >
                  <div className="w-full h-1.5 bg-yellow-200/60 blur-[1px] animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-black/60 pointer-events-none" />
                <div className="relative z-10 text-center font-mono leading-none drop-shadow">
                  <div className="text-[7px] sm:text-[8px] font-black text-amber-200 tracking-wider">RAGE</div>
                  <div className="text-[11px] sm:text-xs md:text-sm font-black text-white">
                    {playerStats.rage}
                  </div>
                  <div className="text-[7px] sm:text-[8px] text-amber-200/80 font-bold hidden sm:block">
                    /{playerStats.maxRage}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Combat Logs Drawer */}
        {showLogs && (
          <div className="p-2 bg-iron-950 rounded border border-iron-800 max-h-24 overflow-y-auto font-mono text-[10px] text-gray-300 space-y-0.5 animate-fade-in">
            {combatLogs.slice(-6).map(log => (
              <div key={log.id} className="truncate">
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
