import React, { useMemo, useEffect } from 'react';
import { useGame } from '../../../state/gameStore';
import { Monster } from '../../../types/game';
import { Sparkles, Coins, Gem, ShieldCheck, ArrowRight, Crosshair } from 'lucide-react';
import { calculateItemScore } from '../../../utils/itemScoring';
import { getActTheme } from '../../../utils/actThemes';
import { getMonsterDamageRange } from '../../../state/helpers/combatActionHelper';
import { MonsterPortrait } from '../../fx/MonsterPortrait';
import { CombatFxLayer } from '../../fx/CombatFxLayer';
import { AtmosphereLayer } from '../../fx/AtmosphereLayer';
import { PlayerChampion } from '../../fx/PlayerChampion';

interface BattleFieldLanesProps {
  dyingMonsterIds: Set<string>;
}

export const BattleFieldLanes: React.FC<BattleFieldLanesProps> = React.memo(({ dyingMonsterIds }) => {
  const {
    monsters,
    playerLane,
    setPlayerLane,
    selectedSkill,
    preview,
    floatingDamages,
    roomCombatStats,
    currentDungeon,
    currentRoomId,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    selectedShrineType,
    setSelectedShrineType,
    cycleShrineSelection,
    latestRoomLootEvent,
    equipItem,
    equipment,
    isAttacking
  } = useGame();

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const actTheme = useMemo(() => getActTheme(currentDungeon.id), [currentDungeon.id]);

  // Dedicated Shrine Keyboard Listener
  useEffect(() => {
    const isShrineActive = !roomEventClaimed && currentRoom?.type === 'shrine' && isCleared;
    if (!isShrineActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.key) || e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        e.stopPropagation();
        cycleShrineSelection(-1);
        return;
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.key) || e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        e.stopPropagation();
        cycleShrineSelection(1);
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedShrineType('fortune');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedShrineType('crit');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedShrineType('defense');
        return;
      }
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        claimShrine(selectedShrineType);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [roomEventClaimed, currentRoom?.type, isCleared, cycleShrineSelection, setSelectedShrineType, claimShrine, selectedShrineType]);

  // Group monsters by 5 lanes (0, 1, 2, 3, 4)
  const laneMonsters = useMemo(() => {
    const map: Record<number, Monster[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    monsters.forEach(m => {
      if (m.hp > 0 && map[m.lane]) {
        map[m.lane].push(m);
      }
    });
    Object.keys(map).forEach(k => {
      map[parseInt(k)].sort((a, b) => a.depth - b.depth);
    });
    return map;
  }, [monsters]);

  const isBossRoom = currentRoom?.type === 'boss';
  const bossMonster = isBossRoom ? monsters.find(m => m.rank === 'boss' && m.hp > 0) : null;
  const bossIsDying = isBossRoom ? monsters.find(m => m.rank === 'boss' && dyingMonsterIds.has(m.id)) : null;

  // For boss rooms, filter boss out of lane grid
  const gridLaneMonsters = useMemo(() => {
    if (!isBossRoom) return laneMonsters;
    const filtered: Record<number, Monster[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    Object.entries(laneMonsters).forEach(([k, list]) => {
      filtered[parseInt(k)] = list.filter(m => m.rank !== 'boss');
    });
    return filtered;
  }, [laneMonsters, isBossRoom]);

  return (
    <div className={`${actTheme.containerBg} border-2 ${actTheme.borderColor} ${actTheme.glowShadow} rounded-xl p-1 sm:p-1.5 relative select-none font-sans flex flex-col justify-between overflow-hidden flex-1 min-h-[260px] sm:min-h-[340px] battlefield-stage`}>
      <AtmosphereLayer act={actTheme.act} theme={actTheme} />
      {!isCleared && <CombatFxLayer />}
      {isCleared ? (
        <div className="w-full h-full flex flex-col justify-center items-center relative z-20 p-1 sm:p-2">
          {latestRoomLootEvent ? (
            /* 🔥 HERO LOOT REVEAL OVERLAY WITH DROPPED ITEM CARDS */
            <div className="w-full h-full max-w-2xl p-2.5 sm:p-4 bg-gradient-to-b from-iron-950 via-iron-900 to-iron-950 border-2 border-amber-400 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.4)] space-y-2 animate-fade-in flex flex-col justify-between items-center text-center">
              
              {/* Loot Header & Currency Banner */}
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl">
                    {latestRoomLootEvent.type === 'treasure' ? '🎁' : latestRoomLootEvent.type === 'rune' ? '🔮' : '⚔️'}
                  </span>
                  <h3 className="text-sm sm:text-base font-cinzel font-black text-amber-200 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>[{latestRoomLootEvent.title}] 획득 전리품</span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </h3>
                </div>

                {/* Currency Rewards Row */}
                <div className="flex items-center justify-center gap-2.5 font-mono text-xs sm:text-sm flex-wrap">
                  {latestRoomLootEvent.gold !== undefined && latestRoomLootEvent.gold > 0 && (
                    <span className="px-3 py-1 rounded-lg bg-yellow-950/80 border border-yellow-500 text-yellow-300 font-bold flex items-center gap-1.5 shadow">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      <span>+{latestRoomLootEvent.gold.toLocaleString()} Gold</span>
                    </span>
                  )}
                  {latestRoomLootEvent.shards !== undefined && latestRoomLootEvent.shards > 0 && (
                    <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500 text-purple-300 font-bold flex items-center gap-1.5 shadow">
                      <Gem className="w-3.5 h-3.5 text-purple-400" />
                      <span>+{latestRoomLootEvent.shards} Shard</span>
                    </span>
                  )}
                  {latestRoomLootEvent.runeName && (
                    <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-400 text-purple-200 font-bold flex items-center gap-1.5 shadow">
                      <span>🔮 {latestRoomLootEvent.runeName} 룬 x{latestRoomLootEvent.count || 1}</span>
                    </span>
                  )}
                </div>

                {/* 📊 DPT Combat Efficiency Analysis Banner */}
                {roomCombatStats && roomCombatStats.totalDamage > 0 && (
                  <div className="w-full bg-iron-950/95 border border-brass-500/60 rounded-xl p-2 sm:p-2.5 shadow-lg flex items-center justify-around gap-2 text-center font-mono animate-fade-in">
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">⚔️ 턴당 피해 (DPT)</div>
                      <div className="text-sm sm:text-base font-black text-amber-300 drop-shadow">
                        {roomCombatStats.dpt.toLocaleString()} <span className="text-[10px] text-amber-200/80">/턴</span>
                      </div>
                    </div>
                    <div className="h-6 w-px bg-iron-800" />
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">💥 총 가한 피해</div>
                      <div className="text-xs sm:text-sm font-black text-orange-200">
                        {roomCombatStats.totalDamage.toLocaleString()}
                      </div>
                    </div>
                    <div className="h-6 w-px bg-iron-800" />
                    <div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">⚡ 실 전투 턴수</div>
                      <div className="text-xs sm:text-sm font-black text-cyan-300">
                        {roomCombatStats.turns}턴
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropped Items Grid (Clickable to Equip immediately) */}
              {latestRoomLootEvent.items && latestRoomLootEvent.items.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto px-1">
                  {latestRoomLootEvent.items.map(item => {
                    const isIdentified = item.isIdentified !== false;
                    const score = isIdentified ? calculateItemScore(item) : null;
                    const isEquipped = Object.values(equipment).some(eq => eq?.id === item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isIdentified && !isEquipped) equipItem(item);
                        }}
                        className={`p-2 rounded-xl border-2 flex items-center justify-between gap-2 transition text-left cursor-pointer shadow-md ${
                          isEquipped
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400'
                            : item.rarity === 'unique' || item.rarity === 'legendary'
                            ? 'bg-orange-950/50 border-orange-400 text-orange-200 hover:bg-orange-900/60'
                            : item.rarity === 'rare'
                            ? 'bg-yellow-950/40 border-yellow-400 text-yellow-200 hover:bg-yellow-900/60'
                            : 'bg-iron-950 border-iron-750 text-gray-200 hover:bg-iron-900'
                        }`}
                        title={isIdentified ? "클릭 시 즉시 장착" : "데커드 케인 감정 후 장착 가능"}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-black text-xs sm:text-sm truncate flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[9px] font-mono uppercase opacity-80 px-1.5 py-0.5 bg-iron-900 rounded border border-iron-800">
                              {item.slot}
                            </span>
                          </div>
                          {isIdentified && item.stats && (
                            <div className="text-[10px] sm:text-[11px] text-gray-300 font-mono flex items-center gap-2 mt-0.5 truncate">
                              {item.stats.minDmg !== undefined && (
                                <span className="text-brass-300 font-bold">공격 {item.stats.minDmg}~{item.stats.maxDmg}</span>
                              )}
                              {item.stats.defense !== undefined && (
                                <span className="text-blue-300">방어 {item.stats.defense}</span>
                              )}
                              {score !== null && (
                                <span className="text-amber-300 font-bold">전투력 {score}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Equip status button / badge */}
                        <div className="flex-shrink-0">
                          {isEquipped ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-500 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> 장착됨
                            </span>
                          ) : isIdentified ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                equipItem(item);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 font-black text-xs shadow transition cursor-pointer"
                            >
                              장착
                            </button>
                          ) : (
                            <span className="text-[10px] text-blood-300 font-mono">미확인</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-emerald-400 font-mono font-bold">
                  ✓ 모든 보상이 안전하게 수령되었습니다.
                </p>
              )}

              <div className="text-[11px] sm:text-xs font-mono text-gray-300 flex items-center gap-1.5 bg-iron-950/80 px-3 py-1 rounded-full border border-iron-800">
                <span>[Space] 키를 눌러 다음 방으로 이동하세요</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>
            </div>
          ) : currentRoom?.type === 'shrine' && !roomEventClaimed ? (
            /* ⛩️ INTERACTIVE SHRINE SELECTION OVERLAY */
            <div className="w-full h-full max-w-2xl p-3 sm:p-4 bg-gradient-to-b from-iron-950 via-purple-950/80 to-iron-950 border-2 border-purple-400 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.4)] space-y-2 animate-fade-in flex flex-col justify-between items-center text-center">
              
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-cinzel font-black text-purple-200 tracking-wider flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>신비로운 고대 성소의 축복</span>
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                </h3>
                <p className="text-xs text-gray-300 font-mono">
                  원하는 축복을 선택하세요 (단축키 [1], [2], [3] 또는 [←], [→])
                </p>
              </div>

              {/* 3 Shrine Options Grid */}
              <div className="w-full max-w-xl grid grid-cols-3 gap-2">
                {/* 1. Fortune Blessing */}
                <button
                  onClick={() => setSelectedShrineType('fortune')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-between text-center transition cursor-pointer shadow ${
                    selectedShrineType === 'fortune'
                      ? 'bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400/80 scale-102'
                      : 'bg-iron-900/80 border-iron-750 text-gray-300 hover:border-amber-500/60'
                  }`}
                >
                  <div className="text-xl sm:text-2xl">✨</div>
                  <div className="font-black text-xs sm:text-sm text-amber-300 mt-1">
                    풍요의 축복 [1]
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-300 font-mono mt-0.5">
                    행운(MF) +30%
                  </div>
                  {selectedShrineType === 'fortune' && (
                    <div className="pt-1 text-[10px] text-amber-300 font-black">
                      ✓ 선택됨
                    </div>
                  )}
                </button>

                {/* 2. Combat Mastery Blessing */}
                <button
                  onClick={() => setSelectedShrineType('crit')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-between text-center transition cursor-pointer shadow ${
                    selectedShrineType === 'crit'
                      ? 'bg-blood-950/90 border-blood-400 text-blood-100 ring-2 ring-blood-400/80 scale-102'
                      : 'bg-iron-900/80 border-iron-750 text-gray-300 hover:border-blood-500/60'
                  }`}
                >
                  <div className="text-xl sm:text-2xl">⚔️</div>
                  <div className="font-black text-xs sm:text-sm text-blood-300 mt-1">
                    투지의 축복 [2]
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-300 font-mono mt-0.5">
                    치명타율 +15% / 공속 +20%
                  </div>
                  {selectedShrineType === 'crit' && (
                    <div className="pt-1 text-[10px] text-blood-300 font-black">
                      ✓ 선택됨
                    </div>
                  )}
                </button>

                {/* 3. Aegis Protection Blessing */}
                <button
                  onClick={() => setSelectedShrineType('defense')}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-between text-center transition cursor-pointer shadow ${
                    selectedShrineType === 'defense'
                      ? 'bg-blue-950/90 border-blue-400 text-blue-100 ring-2 ring-blue-400/80 scale-102'
                      : 'bg-iron-900/80 border-iron-750 text-gray-300 hover:border-blue-500/60'
                  }`}
                >
                  <div className="text-xl sm:text-2xl">🛡️</div>
                  <div className="font-black text-xs sm:text-sm text-blue-300 mt-1">
                    수호의 축복 [3]
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-300 font-mono mt-0.5">
                    방어력 +50 / 피해감소 +15%
                  </div>
                  {selectedShrineType === 'defense' && (
                    <div className="pt-1 text-[10px] text-blue-300 font-black">
                      ✓ 선택됨
                    </div>
                  )}
                </button>
              </div>

              {/* Confirm Claim Button */}
              <div className="w-full max-w-sm flex items-center justify-center">
                <button
                  onClick={() => claimShrine(selectedShrineType)}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 hover:from-purple-500 hover:to-amber-400 text-iron-950 font-black text-xs sm:text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-iron-950 fill-current" />
                  <span>축복 활성화 및 다음 방으로 이동 [Space]</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1.5 py-1 w-full max-w-md">
              <div className="text-lg animate-bounce">⚔️</div>
              <h3 className="font-cinzel font-black text-xs sm:text-sm text-amber-200">구역 소탕 완료</h3>
              {roomCombatStats && roomCombatStats.totalDamage > 0 && (
                <div className="w-full bg-iron-950/95 border border-brass-500/60 rounded-xl p-2 shadow-lg flex items-center justify-around gap-2 text-center font-mono animate-fade-in my-1">
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">⚔️ 턴당 피해 (DPT)</div>
                    <div className="text-sm font-black text-amber-300">
                      {roomCombatStats.dpt.toLocaleString()} <span className="text-[9px] text-amber-200/80">/턴</span>
                    </div>
                  </div>
                  <div className="h-5 w-px bg-iron-800" />
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">💥 총 피해</div>
                    <div className="text-xs font-black text-orange-200">
                      {roomCombatStats.totalDamage.toLocaleString()}
                    </div>
                  </div>
                  <div className="h-5 w-px bg-iron-800" />
                  <div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">⚡ 실 전투</div>
                    <div className="text-xs font-black text-cyan-300">
                      {roomCombatStats.turns}턴
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-gray-400 font-mono">
                [Space] 키를 눌러 다음 방으로 이동하세요.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 5-LANE BATTLEFIELD */
        <div className="flex flex-col h-full gap-0.5">
          {/* ═══ 5-LANE MINION & BATTLEFIELD GRID ═══ */}
          <div className="grid grid-cols-5 gap-1 flex-1 items-stretch h-full">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const isPlayerInLane = playerLane === laneIdx;
            const laneList = gridLaneMonsters[laneIdx] || [];
            const hasBoss = isBossRoom && bossMonster?.lane === laneIdx;
            const isBossWeakLane = isBossRoom && bossMonster?.bossWeakLane === laneIdx;
            const isWhirlwind = selectedSkill.route === 'radius';
            const isCleave = selectedSkill.route === 'branch' && Math.abs(laneIdx - playerLane) <= 1;
            const isLineOrSingle = (selectedSkill.route === 'line' || selectedSkill.route === 'single') && isPlayerInLane;
            const isLaneTargeted = isWhirlwind || isCleave || isLineOrSingle || preview.targetsHit.some(t => t.lane === laneIdx);
            const laneHitTargets = laneList.filter(m => preview.targetsHit.some(t => t.monsterId === m.id));
            const laneFatalHits = laneList.filter(m => preview.targetsHit.find(t => t.monsterId === m.id)?.isFatal).length;
            const hasHitsInLane = laneHitTargets.length > 0;

            // Render up to 2 monsters in boss room, up to 4 monsters in normal room
            const maxVisibleRows = isBossRoom ? 2 : 4;
            const visibleMonsters = laneList.slice(0, maxVisibleRows);
            const queuedCount = Math.max(0, laneList.length - maxVisibleRows);

            return (
              <div
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx, true)}
                className={`flex flex-col justify-between items-center p-0.5 sm:p-1 rounded-lg border transition cursor-pointer relative h-full overflow-hidden z-10 ${
                  hasBoss
                    ? isPlayerInLane
                      ? 'bg-red-950/70 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                      : 'bg-red-950/35 border-red-600/90'
                    : isPlayerInLane
                    ? 'bg-iron-900/75 border-brass-400 ring-1 sm:ring-2 ring-brass-400/80 shadow-[0_0_12px_rgba(222,178,67,0.4)] lane-player-active'
                    : isWhirlwind
                    ? 'bg-sky-950/30 border-sky-500/80'
                    : isCleave
                    ? 'bg-amber-950/30 border-amber-500/80'
                    : isLaneTargeted
                    ? 'bg-iron-900/50 border-blood-700/80'
                    : 'bg-black/25 border-iron-800/80 hover:border-iron-700'
                }`}
              >
                {/* Lane Top Header & Hit Summary */}
                <div className="w-full flex-shrink-0 space-y-0.5">
                  <div className={`w-full py-0.2 px-1 text-center rounded text-[9px] sm:text-[10px] font-mono font-black flex items-center justify-between transition ${
                    hasBoss
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-black animate-pulse'
                      : isPlayerInLane
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-iron-950 font-black'
                      : 'bg-iron-950 text-gray-300 border border-iron-850'
                  }`}>
                    <span className="truncate">
                      {hasBoss ? '👑BOSS' : `${laneIdx + 1}`}
                    </span>
                    <span className="font-bold text-[8px] sm:text-[9px]">
                      {laneList.length > 0 ? `${laneList.length}👹` : '0'}
                    </span>
                  </div>

                  {/* Boss Danger Telegraph Overlay */}
                  {isBossRoom && bossMonster?.bossTelegraphLanes?.includes(laneIdx) && (
                    <div className="absolute inset-0 z-10 pointer-events-none rounded-lg border-2 border-red-500 animate-danger-lane flex items-start justify-center overflow-hidden">
                      <span className="mt-4 px-1 py-0.2 rounded bg-red-600 text-white text-[8px] font-mono font-black border border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.9)]">☠️위험</span>
                    </div>
                  )}

                  {/* Lane Hit Prediction Summary */}
                  {isBossWeakLane && (
                    <div className="w-full py-0.2 px-0.5 bg-emerald-600 text-white text-[8px] font-mono font-black rounded border border-emerald-300 shadow animate-pulse text-center truncate">
                      🎯 약점
                    </div>
                  )}

                  {hasHitsInLane && (
                    <div className={`w-full text-center py-0.2 px-0.5 rounded text-[8px] font-mono font-black border transition truncate ${
                      laneFatalHits === laneList.length
                        ? 'bg-red-600 border-amber-300 text-white animate-pulse'
                        : laneFatalHits > 0
                        ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                        : 'bg-iron-900 border-iron-750 text-gray-300'
                    }`}>
                      {laneFatalHits === laneList.length
                        ? '💥전멸'
                        : laneFatalHits > 0
                        ? `⚔️${laneFatalHits}/${laneList.length}`
                        : `🎯${laneHitTargets.length}타`}
                    </div>
                  )}

                  {/* Rear Queue Stack Indicator (if more than 4 monsters in queue) */}
                  {queuedCount > 0 && (
                    <div className="w-full bg-iron-950/90 border border-iron-800 rounded px-1 py-0.2 text-[7px] font-mono text-gray-300 flex items-center justify-between">
                      <span className="text-amber-400 font-bold truncate">
                        +{queuedCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Visible Rows of Enemies in this Lane (Bottom-Up Stack) */}
                <div className="w-full flex-1 flex flex-col-reverse justify-start gap-0.5 overflow-hidden my-0.5">
                  {visibleMonsters.map((m, dIdx) => {
                    const hitInfo = preview.targetsHit.find(t => t.monsterId === m.id);
                    const isTargeted = !!hitInfo;
                    const isPredictedKill = hitInfo?.isFatal;
                    const isOverkillResidual = hitInfo?.isOverkillHit;
                    const isStopper = preview.stopperId === m.id;
                    const isDying = dyingMonsterIds.has(m.id);
                    const monsterDmgPopups = floatingDamages.filter(d => d.id.includes(m.id));
                    const isBoss = m.rank === 'boss';
                    const isElite = m.rank === 'elite';
                    const isFrozen = Boolean(m.isFrozen);
                    const isEnraged = isBoss && m.maxHp > 0 && m.hp / m.maxHp <= 0.3;

                    return (
                      <div
                        key={m.id}
                        className={`w-full rounded transition-all relative overflow-visible shadow flex-shrink-0 monster-token ${
                          isBoss ? 'p-1 border-2' : 'p-0.5 border'
                        } ${dIdx === 0 ? 'monster-token-front' : ''} ${
                          monsterDmgPopups.length > 0 ? 'monster-token-hit' : ''
                        } ${
                          isDying
                            ? 'animate-death-shrink'
                            : isPredictedKill
                            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white ring-1 ring-amber-400 animate-pulse'
                            : isTargeted
                            ? 'bg-red-950/85 border border-red-500 ring-1 ring-red-500/80 text-red-100'
                            : isBoss
                            ? isEnraged
                              ? 'animate-boss-enrage bg-gradient-to-b from-red-900 via-red-950 to-amber-950 text-amber-100 border-red-400 ring-2 ring-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                              : 'animate-boss-pulse bg-gradient-to-b from-red-950 via-iron-950 to-red-950 text-amber-200 border-amber-400 ring-1 ring-amber-400'
                            : isStopper
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-300 ring-1 ring-yellow-300'
                            : isFrozen
                            ? 'bg-sky-950/80 border border-sky-400 text-sky-100'
                            : isElite
                            ? 'bg-blood-950 border-blood-500 text-yellow-200'
                            : dIdx === 0
                            ? 'bg-iron-850 border-iron-700 text-white shadow-sm'
                            : 'bg-iron-900 border-iron-800 text-gray-300'
                        } ${isOverkillResidual && !isDying ? 'animate-overkill-glow' : ''}`}
                      >
                        {(() => {
                          const chg = m.intent?.chargePercent || 0;
                          if (chg < 75 || m.hp <= 0 || isFrozen) return null;
                          return (<span className="chargeGauge absolute -top-1 -right-1 z-20 px-0.5 rounded bg-red-600 text-white text-[8px] font-black border border-red-300 animate-pulse">⚡{chg}%</span>);
                        })()}
                        {monsterDmgPopups.length > 0 && (
                          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded">
                            <div className="hit-spark" />
                            <div className="hit-slash" />
                          </div>
                        )}

                        {/* Floating Damage Popups */}
                        {monsterDmgPopups.map(dp => (
                          <div
                            key={dp.id}
                            className={`absolute -top-2 left-1/2 -translate-x-1/2 z-45 font-mono font-black whitespace-nowrap ${
                              dp.isCrit
                                ? 'text-amber-200 text-xs sm:text-sm animate-crit-dmg drop-shadow-[0_0_8px_rgba(251,191,36,1)]'
                                : dp.isOverkill
                                ? 'text-orange-300 text-[10px] sm:text-xs animate-float-dmg drop-shadow-[0_0_6px_rgba(249,115,22,0.9)]'
                                : 'text-white text-[10px] sm:text-xs animate-float-dmg drop-shadow-[0_2px_4px_rgba(0,0,0,1)]'
                            }`}
                          >
                            {dp.isCrit && <span className="text-[7px] text-yellow-200 block text-center">CRIT</span>}
                            {dp.isOverkill && <span className="text-[7px] text-orange-200 block text-center">OVER</span>}
                            -{dp.damage}
                            {dp.isFatal && <span className="text-blood-300 ml-0.5">💀</span>}
                          </div>
                        ))}

                        {/* Monster Header: Portrait + Name + Rank (NO D1/D2) */}
                        <div className={`flex items-center justify-between leading-tight gap-0.5 ${
                          isBoss ? 'text-[9px] sm:text-[10px]' : 'text-[8px] sm:text-[9px]'
                        }`}>
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <MonsterPortrait
                              icon={m.icon}
                              name={m.name}
                              rank={m.rank}
                              element={m.element}
                              size={isBoss ? 30 : dIdx === 0 ? 24 : 20}
                              isEnraged={isEnraged}
                              isFrozen={isFrozen}
                              isDying={isDying}
                            />
                            <span className={`truncate font-bold ${
                              isBoss ? 'text-amber-200 font-cinzel font-black' : isElite ? 'text-yellow-200' : 'text-white'
                            }`}>
                              {m.name.split(' ')[0]}
                            </span>
                          </div>
                          {isBoss ? (
                            <span className={`font-mono text-[7px] font-black px-0.5 rounded flex-shrink-0 ${
                              isEnraged ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-iron-950'
                            }`}>
                              {isEnraged ? '광란' : 'BOSS'}
                            </span>
                          ) : isElite ? (
                            <span className="font-mono text-[7px] font-black px-0.5 rounded bg-yellow-500 text-iron-950 flex-shrink-0">
                              ELITE
                            </span>
                          ) : null}
                        </div>

                        {/* HP Bar */}
                        <div className={`w-full bg-iron-950 rounded-full overflow-hidden border border-iron-800 my-0.2 hp-bar-shell ${
                          isBoss ? 'h-2 sm:h-2.5' : 'h-1 sm:h-1.5'
                        }`}>
                          <div
                            className={`h-full transition-all duration-200 hp-bar-fill ${
                              isBoss
                                ? isEnraged
                                  ? 'bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-boss-hp-shimmer'
                                  : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400'
                                : m.hp / m.maxHp < 0.25
                                ? 'bg-red-500'
                                : m.hp / m.maxHp < 0.5
                                ? 'bg-orange-500'
                                : 'bg-gradient-to-r from-blood-700 via-rose-500 to-red-400'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))}%` }}
                          />
                        </div>

                        {/* Monster Stats Row */}
                        <div className="flex justify-between items-center font-mono text-gray-300 text-[8px] leading-none">
                          <span className="font-black text-rose-300">{m.hp}</span>
                          {(() => {
                            const [minD, maxD] = getMonsterDamageRange(m.intent?.damage || 3);
                            return (
                              <span className="font-bold text-amber-300">
                                ⚔️{minD}~{maxD}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Prediction / Targeting Tag */}
                        {isPredictedKill ? (
                          <div className="text-[7px] font-black text-blood-200 uppercase bg-blood-950 px-0.5 rounded text-center border border-blood-700 truncate">
                            {isOverkillResidual ? '오버킬' : '처치예상'}
                          </div>
                        ) : isTargeted ? (
                          <div className="text-[7px] font-black text-red-200 uppercase bg-red-950 px-0.5 rounded text-center border border-red-500 animate-pulse truncate">
                            -{hitInfo.damage}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Lane Selector Button */}
                <div className="w-full flex-shrink-0 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayerLane(laneIdx, true);
                    }}
                    className={`w-full py-0.5 text-[9px] font-mono font-bold rounded border transition cursor-pointer flex items-center justify-center min-h-[32px] sm:min-h-[42px] overflow-visible ${
                      isPlayerInLane
                        ? 'bg-gradient-to-r from-amber-500/90 to-yellow-300 text-iron-950 border-amber-300 font-black shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                        : 'bg-iron-950/80 text-gray-400 border-iron-800 hover:border-iron-700 hover:text-gray-200'
                    }`}
                  >
                    {isPlayerInLane ? <PlayerChampion isAttacking={isAttacking} compact showLabel={false} /> : '선택'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
});

BattleFieldLanes.displayName = 'BattleFieldLanes';
