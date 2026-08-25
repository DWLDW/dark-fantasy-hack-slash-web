import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Monster } from '../../../types/game';
import { Sparkles, Coins, Gem, ShieldCheck, ArrowRight, Crosshair } from 'lucide-react';
import { calculateItemScore } from '../../../utils/itemScoring';
import { getActTheme } from '../../../utils/actThemes';
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
    currentDungeon,
    currentRoomId,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    selectedShrineType,
    setSelectedShrineType,
    latestRoomLootEvent,
    equipItem,
    equipment,
    isAttacking
  } = useGame();

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const actTheme = useMemo(() => getActTheme(currentDungeon.id), [currentDungeon.id]);

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
    <div className={`${actTheme.containerBg} border-2 ${actTheme.borderColor} ${actTheme.glowShadow} rounded-xl p-1.5 sm:p-2 relative select-none font-sans flex flex-col justify-between overflow-hidden flex-shrink-0 transition-all duration-300 h-[255px] sm:h-[310px] max-h-[255px] sm:max-h-[310px] battlefield-stage`}>
      <AtmosphereLayer act={actTheme.act} theme={actTheme} />
      {!isCleared && <CombatFxLayer />}
      {isCleared ? (
        <div className="w-full h-full flex flex-col justify-center items-center relative z-20 py-1">
          {latestRoomLootEvent ? (
            /* 🔥 HERO LOOT REVEAL OVERLAY WITH DROPPED ITEM CARDS */
            <div className="w-full h-full p-2 sm:p-2.5 bg-gradient-to-b from-iron-950 via-iron-900 to-iron-950 border-2 border-amber-400 rounded-xl shadow-[0_0_40px_rgba(251,191,36,0.35)] space-y-1.5 animate-fade-in flex flex-col justify-between items-center text-center">
              
              {/* Loot Header & Currency Banner */}
              <div className="space-y-0.5 w-full">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-base sm:text-lg">
                    {latestRoomLootEvent.type === 'treasure' ? '🎁' : latestRoomLootEvent.type === 'rune' ? '🔮' : '⚔️'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-cinzel font-black text-amber-200 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>[{latestRoomLootEvent.title}] 획득 전리품</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </h3>
                </div>

                {/* Currency Rewards Row */}
                <div className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-[11px] flex-wrap">
                  {latestRoomLootEvent.gold !== undefined && latestRoomLootEvent.gold > 0 && (
                    <span className="px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-500 text-yellow-300 font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>+{latestRoomLootEvent.gold.toLocaleString()} G</span>
                    </span>
                  )}
                  {latestRoomLootEvent.shards !== undefined && latestRoomLootEvent.shards > 0 && (
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500 text-purple-300 font-bold flex items-center gap-1">
                      <Gem className="w-3 h-3" />
                      <span>+{latestRoomLootEvent.shards} Shard</span>
                    </span>
                  )}
                  {latestRoomLootEvent.runeName && (
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-400 text-purple-200 font-bold flex items-center gap-1">
                      <span>🔮 {latestRoomLootEvent.runeName} 룬 x{latestRoomLootEvent.count || 1}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Dropped Items Grid (Clickable to Equip immediately) */}
              {latestRoomLootEvent.items && latestRoomLootEvent.items.length > 0 ? (
                <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto px-1">
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
                        className={`p-1.5 rounded-lg border flex items-center justify-between gap-1.5 transition text-left cursor-pointer shadow ${
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
                          <div className="font-black text-[11px] truncate flex items-center gap-1">
                            <span>{item.name}</span>
                            <span className="text-[8px] font-mono uppercase opacity-80 px-1 py-0.5 bg-iron-900 rounded border border-iron-800">
                              {item.slot}
                            </span>
                          </div>
                          {isIdentified && item.stats && (
                            <div className="text-[9px] text-gray-300 font-mono flex items-center gap-1.5 mt-0.2 truncate">
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
                            <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> 장착됨
                            </span>
                          ) : isIdentified ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                equipItem(item);
                              }}
                              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-iron-950 font-black text-[10px] shadow transition cursor-pointer"
                            >
                              장착
                            </button>
                          ) : (
                            <span className="text-[9px] text-blood-300 font-mono">미확인</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-400 font-mono font-bold">
                  ✓ 모든 보상이 안전하게 수령되었습니다.
                </p>
              )}

              <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                <span>[Space] 키를 눌러 다음 방으로 이동하세요</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </div>
            </div>
          ) : !roomEventClaimed && (currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') ? (
            <div className="p-2.5 bg-iron-950/95 border-2 border-amber-400 rounded-xl shadow-2xl space-y-2 text-center animate-fade-in w-full max-w-xl h-full flex flex-col justify-center">
              {currentRoom.type === 'treasure' && (
                <div className="space-y-1.5">
                  <div className="text-xl">🎁</div>
                  <h3 className="font-cinzel font-black text-sm text-amber-200">{currentRoom.title}</h3>
                  <button
                    onClick={claimTreasure}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-iron-950 font-black rounded-lg text-xs shadow transition transform active:scale-95 animate-pulse cursor-pointer"
                  >
                    보물 상자 개봉하기 [Space]
                  </button>
                </div>
              )}

              {currentRoom.type === 'rune' && (
                <div className="space-y-1.5">
                  <div className="text-xl">🔮</div>
                  <h3 className="font-cinzel font-black text-sm text-purple-200">{currentRoom.title}</h3>
                  <button
                    onClick={claimRuneAltar}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-black rounded-lg text-xs shadow transition transform active:scale-95 animate-pulse cursor-pointer"
                  >
                    고대 룬 제단 기도 [Space]
                  </button>
                </div>
              )}

              {currentRoom.type === 'shrine' && (
                <div className="space-y-1.5 w-full max-w-xl mx-auto">
                  <div className="text-sm sm:text-base font-cinzel font-black text-blue-200">{currentRoom.title}</div>
                  <p className="text-[10px] text-gray-300 font-mono">
                    방향키 [← / →] 또는 [1~3] 키로 축복 선택 ➔ [Space] 수령
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-left">
                    <button
                      onClick={() => {
                        setSelectedShrineType('fortune');
                      }}
                      className={`p-2 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer relative ${
                        selectedShrineType === 'fortune'
                          ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.45)] scale-[1.02]'
                          : 'bg-iron-900 border-iron-750 text-gray-400 opacity-70 hover:opacity-100 hover:border-iron-600'
                      }`}
                    >
                      <div className="font-black text-amber-300 text-xs flex items-center justify-between">
                        <span>☀️ 태양</span>
                        <kbd className="text-[9px] bg-iron-950 text-amber-400 px-1 py-0.5 rounded border border-amber-500/50">[1]</kbd>
                      </div>
                      <div className="text-[10px] text-gray-200 font-bold">MF +35%</div>
                      <div className="text-[8px] text-gray-400">매직 아이템 발견</div>
                      {selectedShrineType === 'fortune' && (
                        <div className="pt-1 text-[9px] text-amber-300 font-black flex items-center gap-0.5">
                          <span>✓ 선택됨</span>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedShrineType('crit');
                      }}
                      className={`p-2 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer relative ${
                        selectedShrineType === 'crit'
                          ? 'bg-rose-950/90 border-rose-400 ring-2 ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.45)] scale-[1.02]'
                          : 'bg-iron-900 border-iron-750 text-gray-400 opacity-70 hover:opacity-100 hover:border-iron-600'
                      }`}
                    >
                      <div className="font-black text-rose-300 text-xs flex items-center justify-between">
                        <span>🩸 피</span>
                        <kbd className="text-[9px] bg-iron-950 text-rose-400 px-1 py-0.5 rounded border border-rose-500/50">[2]</kbd>
                      </div>
                      <div className="text-[10px] text-gray-200 font-bold">치명 +15%</div>
                      <div className="text-[8px] text-gray-400">체력 100% 즉시 완충</div>
                      {selectedShrineType === 'crit' && (
                        <div className="pt-1 text-[9px] text-rose-300 font-black flex items-center gap-0.5">
                          <span>✓ 선택됨</span>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedShrineType('defense');
                      }}
                      className={`p-2 rounded-lg border-2 transition space-y-0.5 shadow cursor-pointer relative ${
                        selectedShrineType === 'defense'
                          ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.45)] scale-[1.02]'
                          : 'bg-iron-900 border-iron-750 text-gray-400 opacity-70 hover:opacity-100 hover:border-iron-600'
                      }`}
                    >
                      <div className="font-black text-blue-300 text-xs flex items-center justify-between">
                        <span>🛡️ 강철</span>
                        <kbd className="text-[9px] bg-iron-950 text-blue-400 px-1 py-0.5 rounded border border-blue-500/50">[3]</kbd>
                      </div>
                      <div className="text-[10px] text-gray-200 font-bold">방어 +50</div>
                      <div className="text-[8px] text-gray-400">물리 피해 감소 +10%</div>
                      {selectedShrineType === 'defense' && (
                        <div className="pt-1 text-[9px] text-blue-300 font-black flex items-center gap-0.5">
                          <span>✓ 선택됨</span>
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => claimShrine(selectedShrineType)}
                    className="mt-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black rounded-lg text-xs shadow-lg transition transform active:scale-95 animate-pulse cursor-pointer flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>선택한 축복 수령하기 [Space]</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-1 py-2">
              <div className="text-xl animate-bounce">⚔️</div>
              <h3 className="font-cinzel font-black text-sm sm:text-base text-amber-200">구역 소탕 완료</h3>
              <p className="text-[11px] text-gray-400 font-mono">
                [Space] 키를 눌러 다음 방으로 이동하세요.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 5-LANE BATTLEFIELD */
        <div className="flex flex-col h-full gap-1">
          {/* ═══ 5-LANE MINION & BATTLEFIELD GRID ═══ */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 flex-1 items-stretch h-full">
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

            // Render up to 4 monsters in the visible stack
            const visibleMonsters = laneList.slice(0, 4);
            const queuedCount = Math.max(0, laneList.length - 4);

            return (
              <div
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx)}
                className={`flex flex-col justify-between items-center p-1 rounded-lg border-2 transition cursor-pointer relative h-full overflow-hidden z-10 ${
                  hasBoss
                    ? isPlayerInLane
                      ? 'bg-red-950/70 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                      : 'bg-red-950/35 border-red-600/90 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : isPlayerInLane
                    ? 'bg-iron-900/75 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_18px_rgba(222,178,67,0.45)] lane-player-active'
                    : isWhirlwind
                    ? 'bg-sky-950/30 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : isCleave
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : isLaneTargeted
                    ? 'bg-iron-900/50 border-blood-700/80'
                    : 'bg-black/25 border-iron-800/80 hover:border-iron-700'
                }`}
              >
                {/* Lane Top Header & Hit Summary */}
                <div className="w-full flex-shrink-0 space-y-0.5">
                  <div className={`w-full py-0.5 px-1 text-center rounded text-[10px] sm:text-[11px] font-mono font-black flex items-center justify-between transition ${
                    hasBoss
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black border border-amber-300 animate-pulse'
                      : isPlayerInLane
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-iron-950 font-black ring-1 ring-amber-200'
                      : 'bg-iron-950 text-gray-300 border border-iron-800'
                  }`}>
                    <span className="flex items-center gap-0.5 truncate">
                      {isPlayerInLane && <Crosshair className="w-3 h-3 text-blood-500 flex-shrink-0" />}
                      <span>{hasBoss ? '👑BOSS' : `L${laneIdx + 1}`}</span>
                    </span>
                    <span className="font-bold text-[9px]">
                      {laneList.length > 0 ? `${laneList.length}👹` : '0'}
                    </span>
                  </div>

                  {/* Boss Danger Telegraph Overlay */}
                  {isBossRoom && bossMonster?.bossTelegraphLanes?.includes(laneIdx) && (
                    <div className="absolute inset-0 z-10 pointer-events-none rounded-lg border-2 border-red-500 animate-danger-lane flex items-start justify-center overflow-hidden">
                      <span className="mt-8 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] sm:text-[10px] font-mono font-black border border-red-300 shadow-[0_0_14px_rgba(239,68,68,0.9)]">☠️ DANGER</span>
                    </div>
                  )}

                  {/* Lane Hit Prediction Summary */}
                  {isBossWeakLane && (
                    <div className="w-full py-0.5 px-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-[9px] font-mono font-black rounded border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse flex items-center justify-center gap-0.5 truncate">
                      <span>🎯 약점 (2.5x)</span>
                    </div>
                  )}

                  {hasHitsInLane && (
                    <div className={`w-full text-center py-0.5 px-0.5 rounded text-[8px] sm:text-[9px] font-mono font-black border transition truncate ${
                      laneFatalHits === laneList.length
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-300 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
                        : laneFatalHits > 0
                        ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                        : 'bg-iron-900 border-iron-700 text-gray-300'
                    }`}>
                      {laneFatalHits === laneList.length
                        ? '💥 전멸'
                        : laneFatalHits > 0
                        ? `⚔️ ${laneFatalHits}/${laneList.length}`
                        : `🎯 ${laneHitTargets.length}타격`}
                    </div>
                  )}

                  {/* Rear Queue Stack Indicator (if more than 4 monsters in queue) */}
                  {queuedCount > 0 && (
                    <div className="w-full bg-iron-950/90 border border-iron-800 rounded px-1 py-0.5 text-[8px] font-mono text-gray-300 flex items-center justify-between">
                      <span className="text-amber-400 font-bold truncate">
                        후열 +{queuedCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                        {Array.from({ length: Math.min(3, queuedCount) }).map((_, i) => (
                          <span key={i} className="text-[6px]">●</span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4 Visible Rows of Enemies in this Lane (Bottom-Up Stack: D1 frontline at bottom) */}
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
                        className={`w-full rounded-md transition-all relative overflow-visible shadow flex-shrink-0 monster-token ${
                          isBoss ? 'p-1 sm:p-1.5 border-2' : 'p-0.5 sm:p-1 border'
                        } ${dIdx === 0 ? 'monster-token-front' : ''} ${
                          monsterDmgPopups.length > 0 ? 'monster-token-hit' : ''
                        } ${
                          isDying
                            ? 'animate-death-shrink'
                            : isPredictedKill
                            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white ring-2 ring-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse'
                            : isTargeted
                            ? 'bg-red-950/85 border-2 border-red-500 ring-2 ring-red-500/80 text-red-100'
                            : isBoss
                            ? isEnraged
                              ? 'animate-boss-enrage bg-gradient-to-b from-red-900 via-red-950 to-amber-950 text-amber-100 border-red-400 ring-2 ring-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.7)]'
                              : 'animate-boss-pulse bg-gradient-to-b from-red-950 via-iron-950 to-red-950 text-amber-200 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.4)]'
                            : isStopper
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-300 ring-1 ring-yellow-300'
                            : isFrozen
                            ? 'bg-sky-950/80 border-2 border-sky-400 text-sky-100 ring-2 ring-sky-400/60'
                            : isElite
                            ? 'bg-blood-950 border-blood-500 text-yellow-200'
                            : dIdx === 0
                            ? 'bg-iron-850 border-iron-600 text-white shadow-sm'
                            : 'bg-iron-900 border-iron-800 text-gray-300'
                        } ${isOverkillResidual && !isDying ? 'animate-overkill-glow' : ''}`}
                      >
                        {(() => {
                          const chg = m.intent?.chargePercent || 0;
                          if (chg < 75 || m.hp <= 0 || isFrozen) return null;
                          return (<span className="chargeGauge absolute -top-1 -right-1 z-20 px-1 rounded bg-red-600 text-white text-[9px] font-black border border-red-300 animate-pulse">⚡{chg}%</span>);
                        })()}
                        {monsterDmgPopups.length > 0 && (
                          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-md">
                            <div className="hit-spark" />
                            <div className="hit-slash" />
                          </div>
                        )}

                        {/* Floating Damage Popups */}
                        {monsterDmgPopups.map(dp => (
                          <div
                            key={dp.id}
                            className={`absolute -top-2 left-1/2 -translate-x-1/2 z-30 font-mono font-black whitespace-nowrap ${
                              dp.isCrit
                                ? 'text-amber-200 text-sm sm:text-base animate-crit-dmg drop-shadow-[0_0_10px_rgba(251,191,36,1)]'
                                : dp.isOverkill
                                ? 'text-orange-300 text-xs sm:text-sm animate-float-dmg drop-shadow-[0_0_8px_rgba(249,115,22,0.9)]'
                                : 'text-white text-xs sm:text-sm animate-float-dmg drop-shadow-[0_2px_6px_rgba(0,0,0,1)]'
                            }`}
                          >
                            {dp.isCrit && <span className="text-[8px] text-yellow-200 block text-center tracking-widest">CRIT</span>}
                            {dp.isOverkill && <span className="text-[8px] text-orange-200 block text-center">OVERKILL</span>}
                            -{dp.damage}
                            {dp.isFatal && <span className="text-blood-300 ml-0.5">💀</span>}
                          </div>
                        ))}

                        {/* Monster Header: Portrait + Name + Rank */}
                        <div className={`flex items-center justify-between leading-tight gap-1 ${
                          isBoss ? 'text-[10px] sm:text-[11px]' : 'text-[9px] sm:text-[10px]'
                        }`}>
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <MonsterPortrait
                              icon={m.icon}
                              name={m.name}
                              rank={m.rank}
                              element={m.element}
                              size={isBoss ? 34 : dIdx === 0 ? 30 : 24}
                              isEnraged={isEnraged}
                              isFrozen={isFrozen}
                              isDying={isDying}
                            />
                            <span className={`hidden sm:inline truncate font-bold ${
                              isBoss ? 'text-amber-200 font-cinzel font-black' : isElite ? 'text-yellow-200' : 'text-white'
                            }`}>
                              {m.name}
                            </span>
                          </div>
                          {isBoss ? (
                            <span className={`font-mono text-[8px] font-black px-1 rounded flex-shrink-0 ${
                              isEnraged ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600/80 text-iron-950'
                            }`}>
                              {isEnraged ? '⚡광란' : 'BOSS'}
                            </span>
                          ) : isElite ? (
                            <span className="font-mono text-[8px] font-black px-1 rounded bg-yellow-500 text-iron-950 flex-shrink-0">
                              ELITE
                            </span>
                          ) : (
                            <span className="font-mono text-[8px] text-gray-400 flex-shrink-0">D{dIdx + 1}</span>
                          )}
                        </div>

                        {/* HP Bar — thicker, with inner shine */}
                        <div className={`w-full bg-iron-950 rounded-full overflow-hidden border border-iron-800 my-0.5 hp-bar-shell ${
                          isBoss ? 'h-2.5 sm:h-3' : 'h-1.5'
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

                        {/* Monster Stats Row — Boss shows more info */}
                        <div className={`flex justify-between items-center font-mono text-gray-300 leading-none ${
                          isBoss ? 'text-[9px] sm:text-[10px]' : 'text-[8px] sm:text-[9px]'
                        }`}>
                          <span className="font-black text-rose-300">{m.hp}</span>
                          <span className="font-bold text-amber-300">⚔️{m.intent.damage || 6}</span>
                        </div>

                        {/* Prediction / Targeting Tag */}
                        {isPredictedKill ? (
                          <div className="text-[7px] sm:text-[8px] font-black text-blood-200 uppercase mt-0.2 bg-blood-950 px-0.5 rounded text-center border border-blood-700 truncate">
                            {isOverkillResidual ? '오버킬' : '처치 예상'}
                          </div>
                        ) : isTargeted ? (
                          <div className="text-[7px] sm:text-[8px] font-black text-red-200 uppercase mt-0.2 bg-red-950 px-0.5 rounded text-center border border-red-500 animate-pulse truncate">
                            🎯 -{hitInfo.damage}
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
                      setPlayerLane(laneIdx);
                    }}
                    className={`w-full py-0.5 text-[9px] sm:text-[10px] font-mono font-bold rounded border transition cursor-pointer flex items-center justify-center min-h-[40px] sm:min-h-[58px] overflow-visible ${
                      isPlayerInLane
                        ? 'bg-gradient-to-r from-amber-500/90 to-yellow-300 text-iron-950 border-amber-300 font-black shadow-[0_0_12px_rgba(251,191,36,0.45)]'
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
