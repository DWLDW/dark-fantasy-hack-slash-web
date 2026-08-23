import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Monster } from '../../../types/game';
import { Crown, Crosshair, Sparkles, ArrowRight } from 'lucide-react';

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
    bestLaneHint,
    floatingDamages,
    currentDungeon,
    currentRoomId,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    selectedShrineType,
    setSelectedShrineType,
    latestRoomLootEvent
  } = useGame();

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);

  // Group monsters by lane
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

  return (
    <div className="bg-iron-900/90 border-2 border-iron-750 rounded-xl p-2 sm:p-3 shadow-2xl relative min-h-[220px] sm:min-h-[280px] select-none font-sans">
      {isCleared ? (
        <div className="w-full min-h-[200px] sm:min-h-[260px] flex flex-col justify-center items-center relative z-20 py-2">
          {latestRoomLootEvent ? (
            /* 🔥 FULL HERO LOOT REVEAL OVERLAY */
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
            </div>
          ) : !roomEventClaimed && (currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') ? (
            <div className="my-2 p-3 bg-iron-950/95 border-2 border-amber-400 rounded-xl shadow-2xl space-y-2 text-center animate-fade-in w-full max-w-xl">
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
                    방향키 [← / →] 축복 선택 · [Space] 키 또는 버튼 클릭으로 수령
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl mx-auto font-mono text-left">
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
          ) : (
            <div className="text-center space-y-2 py-4">
              <div className="text-2xl animate-bounce">⚔️</div>
              <h3 className="font-cinzel font-black text-base text-amber-200">구역 소탕 완료</h3>
              <p className="text-xs text-gray-400 font-mono">
                [Space] 키를 눌러 다음 방으로 이동하세요.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 5-LANE FULL HIGH-FIDELITY BATTLEFIELD */
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

                {/* Monster Queue in this Lane (Stacked Bottom-Up) */}
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
                            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white text-[10px] sm:text-[12px] ring-1 sm:ring-2 ring-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse'
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
                          <div className="text-[7px] sm:text-[8px] font-black text-blood-200 uppercase mt-0.5 bg-blood-950 px-0.5 rounded text-center border border-blood-700 shadow">
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

                {/* Bottom Lane Selector Button */}
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
  );
});

BattleFieldLanes.displayName = 'BattleFieldLanes';
