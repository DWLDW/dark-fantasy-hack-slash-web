import React, { useState, useEffect } from 'react';
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

  const isLowHp = playerStats.hp > 0 && playerStats.hp / Math.max(1, playerStats.maxHp) <= 0.25;

  useEffect(() => {
    if (!isLowHp) return;
    playHeartbeatSound();
    const interval = setInterval(() => {
      playHeartbeatSound();
    }, 1200);
    return () => clearInterval(interval);
  }, [isLowHp]);

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
    <div className="max-w-7xl mx-auto px-1 sm:px-3 py-1 space-y-1.5 select-none pb-14 sm:pb-16 overflow-x-hidden relative font-sans">
      {/* Low HP Danger Red Alert Screen Vignette */}
      {isLowHp && (
        <div className="fixed inset-0 pointer-events-none border-4 sm:border-8 border-blood-600/50 shadow-[inset_0_0_60px_rgba(239,68,68,0.5)] z-30 animate-pulse" />
      )}

      {/* 1. Top Header: Mini Room Graph + Wait ATB Timeline + Chain Banner + Safe Town Return */}
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

      {/* Low HP Warning Danger Banner */}
      {isLowHp && (
        <div className="w-full py-1 px-3 rounded bg-blood-950/90 border border-blood-500 text-blood-200 text-xs font-mono font-bold text-center animate-pulse flex items-center justify-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-blood-400" />
          <span>⚠️ 생명력 위험 (25% 이하)! [1] HP 물약을 복용하여 체력을 회복하세요!</span>
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
                        <span>방어 {m.defense}</span>
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
                    <div className="text-[10px] text-gray-300">매직 발견(MF) +35%</div>
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

      {/* 3. Compact 2-Row Bottom Battle Control Dashboard */}
      <div className="bg-iron-950/98 border-2 border-iron-750 rounded-xl p-2 sm:p-2.5 shadow-2xl space-y-2 select-none">
        {/* ROW 1: 4 Skills (Q W E R) + Big Action Attack / Next Room Button (Space) */}
        <div className="flex items-stretch gap-1.5 sm:gap-2">
          <div className="grid grid-cols-4 gap-1.5 flex-1 min-w-0">
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
                  className={`p-1.5 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition relative shadow cursor-pointer ${
                    !unlocked
                      ? 'bg-iron-950/80 border-iron-850 text-gray-600 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blood-950 border-brass-400 text-brass-100 ring-2 ring-brass-400 shadow-[0_0_12px_rgba(222,178,67,0.5)] scale-[1.02]'
                      : canAfford
                      ? 'bg-iron-900 border-iron-700 text-gray-100 hover:bg-iron-850 hover:border-iron-600'
                      : 'bg-iron-950/70 border-iron-800 text-gray-500 opacity-60'
                  }`}
                  title={unlocked ? `${skill.name} (클릭 시 락온 및 시전)` : `Lv.${skill.unlockLevel} 해금`}
                >
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-black font-cinzel leading-tight">
                    <span className="truncate">{unlocked ? skill.name.split(' ')[0] : '잠김'}</span>
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-brass-400 text-iron-950' : 'bg-iron-950 text-amber-400 border border-iron-750'
                    }`}>
                      {unlocked ? `[${skill.hotkey}]` : `Lv.${skill.unlockLevel}`}
                    </span>
                  </div>

                  {unlocked && (
                    <div className="text-[9px] sm:text-[10px] font-mono text-amber-300 font-black truncate my-0.5">
                      {dmgText}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-300">
                    <span className={`font-bold ${canAfford ? 'text-amber-300' : 'text-blood-400'}`}>
                      분노 {skill.rageCost > 0 ? skill.rageCost : '0'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold bg-iron-950 px-1 rounded border border-iron-800">
                      Lv.{sLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big Action Button (Space) */}
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
            className={`px-4 sm:px-6 py-2 rounded-lg font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 flex-shrink-0 cursor-pointer min-w-[90px] sm:min-w-[120px] ${
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
              <Swords className="w-4 h-4 text-amber-300" />
              <span className="truncate">
                {isAttacking
                  ? '처치 중...'
                  : isEnemyTurn
                  ? '적 반격...'
                  : isCleared
                  ? ((currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') && !roomEventClaimed ? '보상 획득' : '다음 룸')
                  : '공격'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-200/90 font-bold">[Space]</span>
          </button>
        </div>

        {/* ROW 2: HP Bar (Left) / Consumables 1 2 3 4 (Center) / Rage Bar & Logs (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1 border-t border-iron-800">
          {/* HP Bar (4 Cols) */}
          <div className="sm:col-span-4 space-y-0.5">
            <div className="flex justify-between items-center text-[10px] font-mono leading-none">
              <span className="font-black text-rose-300 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" /> HP {playerStats.hp}/{playerStats.maxHp}
                {(playerStats.shield || 0) > 0 && (
                  <span className="text-cyan-300 font-bold bg-cyan-950 px-1 rounded border border-cyan-500/50">
                    🛡️+{playerStats.shield}
                  </span>
                )}
              </span>
              <span className="text-gray-400 font-bold">{Math.round((playerStats.hp / Math.max(1, playerStats.maxHp)) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-iron-950 rounded-full overflow-hidden border border-iron-700 relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-rose-600 to-red-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (playerStats.hp / Math.max(1, playerStats.maxHp)) * 100))}%` }}
              />
              {(playerStats.shield || 0) > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-600 to-sky-400 opacity-80 transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(0, Math.min(100, ((playerStats.shield || 0) / Math.max(1, playerStats.maxHp)) * 100))}%` }}
                />
              )}
            </div>
          </div>

          {/* Consumables Quick Belt 1 2 3 4 (4 Cols) */}
          <div className="sm:col-span-4 flex items-center justify-center gap-1 font-mono">
            {consumables.map(item => (
              <button
                key={item.id}
                onClick={() => useConsumable(item.id)}
                disabled={item.count <= 0}
                className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer ${
                  item.count > 0
                    ? 'bg-iron-900 border-iron-700 text-gray-200 hover:border-amber-400 hover:text-white'
                    : 'bg-iron-950 text-gray-600 border-iron-850 opacity-40 cursor-not-allowed'
                }`}
                title={`${item.name} (${item.description}) [${item.hotkey}]`}
              >
                <span className="font-black text-amber-400">[{item.hotkey}]</span>
                <span className="truncate max-w-[45px] sm:max-w-none">{item.name.split(' ')[0]}</span>
                <span className="font-black text-amber-300">x{item.count}</span>
              </button>
            ))}
          </div>

          {/* Rage Bar & Combat Logs Toggle (4 Cols) */}
          <div className="sm:col-span-4 space-y-0.5">
            <div className="flex justify-between items-center text-[10px] font-mono leading-none">
              <span className="font-black text-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> 분노 {playerStats.rage}/{playerStats.maxRage}
              </span>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                {showLogs ? '로그 닫기' : '로그 보기'}
              </button>
            </div>
            <div className="w-full h-3 bg-iron-950 rounded-full overflow-hidden border border-iron-700 relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 transition-all duration-200 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (playerStats.rage / Math.max(1, playerStats.maxRage)) * 100))}%` }}
              />
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
