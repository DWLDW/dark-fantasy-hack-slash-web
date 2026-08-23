import React, { useMemo } from 'react';
import { useGame } from '../../../state/gameStore';
import { Monster } from '../../../types/game';
import { Crown, Crosshair, Sparkles } from 'lucide-react';

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
    setSelectedShrineType
  } = useGame();

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
  const activeBoss = monsters.find(m => m.rank === 'boss' && m.hp > 0);

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
    <div className="bg-iron-900/95 border-2 border-iron-750 rounded-xl p-2 sm:p-3 shadow-2xl relative min-h-[280px] sm:min-h-[340px] flex flex-col justify-between select-none font-sans">
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
          const isPlayerInLane = playerLane === laneIdx;
          const isBestLane = bestLaneHint === laneIdx;
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
            <button
              key={laneIdx}
              onClick={() => setPlayerLane(laneIdx)}
              className={`py-1 px-1 rounded transition border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                hasBoss
                  ? isPlayerInLane
                    ? 'bg-red-950/90 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(239,68,68,0.7)] text-white font-black'
                    : 'bg-red-950/60 border-red-600 text-amber-200'
                  : isPlayerInLane
                  ? 'bg-blood-950 border-blood-500 text-white font-black shadow ring-1 ring-blood-400'
                  : isBestLane
                  ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                  : isLaneTargeted
                  ? 'bg-iron-900 border-blood-700/80 text-gray-200'
                  : 'bg-iron-950 border-iron-800 text-gray-400 hover:border-iron-600'
              }`}
            >
              <div className="flex items-center gap-1">
                {isPlayerInLane && <Crosshair className="w-3 h-3 text-blood-400 animate-spin-slow" />}
                <span>{hasBoss ? '👑 BOSS' : `L${laneIdx + 1}`}</span>
                {laneList.length > 0 && (
                  <span className="text-[9px] text-amber-300 font-bold">({laneList.length})</span>
                )}
                {isBestLane && !isPlayerInLane && <span className="text-[9px] text-amber-300 font-black">↑추천</span>}
              </div>

              {/* Lane Hit Prediction Summary */}
              {hasHitsInLane && (
                <div className={`w-full text-center py-0.2 px-0.5 rounded text-[8px] font-mono font-black border transition ${
                  laneFatalHits === laneList.length
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-300 text-white shadow-sm animate-pulse'
                    : laneFatalHits > 0
                    ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                    : 'bg-iron-900 border-iron-700 text-gray-300'
                }`}>
                  {laneFatalHits === laneList.length
                    ? `💥 전멸`
                    : laneFatalHits > 0
                    ? `⚔️ ${laneFatalHits}/${laneList.length} 처치`
                    : `🎯 ${laneHitTargets.length}타격`}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 5-Lane Monster Formations Grid */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 flex-1 items-stretch">
        {[0, 1, 2, 3, 4].map(laneIdx => {
          const laneList = laneMonsters[laneIdx] || [];
          const isCurrentLane = playerLane === laneIdx;
          const hasBoss = laneList.some(m => m.rank === 'boss');

          return (
            <div
              key={laneIdx}
              onClick={() => setPlayerLane(laneIdx)}
              className={`p-1 sm:p-1.5 rounded-lg border-2 flex flex-col justify-start space-y-1 transition relative cursor-pointer ${
                hasBoss
                  ? isCurrentLane
                    ? 'bg-red-950/80 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                    : 'bg-red-950/40 border-red-600/90 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                  : isCurrentLane
                  ? 'bg-blood-950/40 border-blood-500/80 shadow-[inset_0_0_15px_rgba(239,68,68,0.25)]'
                  : 'bg-iron-950/70 border-iron-800/80 hover:border-iron-700'
              }`}
            >
              {laneList.map((m, dIdx) => {
                const hitInfo = preview.targetsHit.find(t => t.monsterId === m.id);
                const isTargeted = !!hitInfo;
                const isPredictedKill = hitInfo?.isFatal;
                const isOverkillResidual = hitInfo?.isOverkillHit;
                const isStopper = preview.stopperId === m.id;
                const isDying = dyingMonsterIds.has(m.id);
                const isBoss = m.rank === 'boss';
                const isElite = m.rank === 'elite';

                const monsterDmgPopups = floatingDamages.filter(d => d.id.includes(m.id));

                return (
                  <div
                    key={m.id}
                    className={`p-1.5 rounded border transition-all relative overflow-visible shadow ${
                      isDying
                        ? 'opacity-0 scale-75 bg-red-950 border-red-500 transition-all duration-300'
                        : isPredictedKill
                        ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white ring-2 ring-amber-400 shadow-[0_0_14px_rgba(249,115,22,0.85)] animate-pulse'
                        : isTargeted
                        ? 'bg-red-950/85 border-2 border-red-500 ring-2 ring-red-500/80 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                        : isBoss
                        ? 'ring-2 ring-amber-400 bg-gradient-to-b from-red-950 via-iron-950 to-red-950 text-amber-200 shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-red-500'
                        : isStopper
                        ? 'bg-yellow-950 border-yellow-400 text-yellow-300 ring-1 ring-yellow-300'
                        : isElite
                        ? 'bg-blood-950 border-blood-500 text-yellow-200'
                        : dIdx === 0
                        ? 'bg-iron-850 border-iron-600 text-white shadow-sm'
                        : 'bg-iron-900 border-iron-800 text-gray-300'
                    } ${isOverkillResidual && !isDying ? 'animate-overkill-glow' : ''}`}
                  >
                    {/* Floating Damage Popups */}
                    {monsterDmgPopups.map(dp => (
                      <div
                        key={dp.id}
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 z-30 font-mono font-black whitespace-nowrap ${
                          dp.isCrit
                            ? 'text-amber-300 text-xs sm:text-sm animate-crit-dmg drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                            : dp.isOverkill
                            ? 'text-orange-400 text-[10px] sm:text-xs animate-float-dmg drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]'
                            : 'text-white text-[9px] sm:text-xs animate-float-dmg drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                        }`}
                      >
                        {dp.isCrit && <span className="text-[7px] text-yellow-200 block text-center">CRITICAL!</span>}
                        {dp.isOverkill && <span className="text-[7px] text-orange-200 block text-center">OVERKILL</span>}
                        -{dp.damage}
                        {dp.isFatal && <span className="text-blood-300 ml-0.5">💀</span>}
                      </div>
                    ))}

                    {/* Header row */}
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

                    {/* Stats row */}
                    <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-gray-300 mt-0.5">
                      <span className="font-bold text-rose-300">{m.hp} HP</span>
                      <span className="font-bold text-amber-300">⚔️{m.intent.damage || (isElite ? 14 : 6)}</span>
                    </div>

                    {/* Prediction & Targeting Badges */}
                    {isPredictedKill ? (
                      <div className="text-[7px] sm:text-[8px] font-black text-white uppercase mt-0.5 bg-gradient-to-r from-blood-900 to-amber-700 px-0.5 py-0.2 rounded text-center border border-amber-300 shadow">
                        {isOverkillResidual ? '오버킬 관통' : '처치 예상'}
                      </div>
                    ) : isTargeted ? (
                      <div className="text-[7px] sm:text-[8px] font-black text-red-200 uppercase mt-0.5 bg-red-950 px-0.5 rounded text-center border border-red-500 animate-pulse">
                        🎯 피격 (-{hitInfo.damage})
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {laneList.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 font-mono py-6">
                  소탕 완료
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
                방향키 [← / →] 축복 선택 · [Space] 키 또는 버튼 클릭으로 수령
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
  );
});

BattleFieldLanes.displayName = 'BattleFieldLanes';
