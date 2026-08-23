import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { WARRIOR_SKILLS } from '../../data/gameData';
import { MiniRoomGraph } from '../layout/MiniRoomGraph';
import { Monster, Skill } from '../../types/game';
import {
  Swords,
  Flame,
  Shield,
  ArrowLeft,
  ArrowRight,
  Zap,
  RotateCcw,
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

export const BattleView: React.FC = () => {
  const {
    monsters,
    playerLane,
    setPlayerLane,
    selectedSkill,
    selectSkillOrExecute,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    hordeTimelinePercent,
    floatingDamages,
    chainCount,
    maxChainThisRoom,
    preview,
    combatLogs,
    playerStats,
    skillLevels,
    consumables,
    useConsumable,
    resetBattleFormation,
    returnToTown,
    currentDungeon,
    currentRoomId,
    selectNextRoom,
    dungeonBuffs,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine
  } = useGame();

  const [showLogs, setShowLogs] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-3 py-1 space-y-1.5 select-none pb-12 sm:pb-20 overflow-x-hidden">
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

            <button
              onClick={resetBattleFormation}
              className="p-1 sm:p-1.5 bg-iron-800 hover:bg-iron-750 text-gray-300 hover:text-white rounded border border-iron-650 transition"
              title="30마리 검증 포메이션으로 전장 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
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
        <div className="bg-gradient-to-r from-blood-950 via-iron-950 to-blood-950 border-2 border-blood-600/90 rounded-lg p-2 sm:p-2.5 shadow-2xl space-y-1 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-cinzel font-black text-xs sm:text-sm text-yellow-300 tracking-wider">
                {activeBoss.name}
              </span>
            </div>
            <div className="text-right font-mono font-bold text-xs text-blood-300">
              HP {activeBoss.hp} / {activeBoss.maxHp} (방어 {activeBoss.defense})
            </div>
          </div>

          <div className="w-full bg-iron-950 h-2 sm:h-3 rounded-full overflow-hidden border border-blood-800 shadow-inner">
            <div
              className="bg-gradient-to-r from-blood-600 via-rose-500 to-amber-500 h-full transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
              style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
            />
          </div>

          {activeBoss.bossGimmick && (
            <div className="text-[10px] sm:text-[11px] text-amber-300/90 font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
              <span>{activeBoss.bossGimmick}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Battlefield Box (Clean Surface Separation) */}
      <div className={`bg-iron-950 border-2 border-brass-500/80 rounded-lg p-1.5 sm:p-2.5 shadow-2xl relative overflow-hidden transition-transform duration-100 flex flex-col gap-1.5 ${
        isAttacking ? 'animate-hit-shake' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-blood-950/20 via-transparent to-iron-950/90 pointer-events-none" />
        {isEventRoom ? (
          <div className="min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-center p-3 sm:p-6 text-center space-y-4 bg-iron-900/80 rounded-lg border border-iron-750">
            {/* Treasure Room Event */}
            {currentRoom?.type === 'treasure' && (
              <div className="space-y-3 max-w-md w-full animate-fade-in">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                  <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-base sm:text-lg text-brass-200">
                    {currentRoom.title} (황금 보물고)
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    던전 깊은 곳에 숨겨진 보물 상자입니다. 골드, 샤드, 미확인 장비가 가득합니다!
                  </p>
                </div>
                {!roomEventClaimed ? (
                  <button
                    onClick={claimTreasure}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-iron-950 font-black text-xs sm:text-sm rounded-lg shadow-xl ring-2 ring-amber-300 transition animate-pulse cursor-pointer"
                  >
                    🎁 황금 궤짝 열기 (보물 획득)
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-bold">✨ 보물을 모두 획득했습니다! 다음 방으로 이동하세요.</p>
                  </div>
                )}
              </div>
            )}

            {/* Rune Shrine Event */}
            {currentRoom?.type === 'rune' && (
              <div className="space-y-3 max-w-md w-full animate-fade-in">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(192,132,252,0.4)]">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-base sm:text-lg text-purple-200">
                    {currentRoom.title} (고대 룬의 제단)
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    성스러운 룬의 마력이 소용돌이치는 제단입니다. 기도를 올려 고대 룬을 연성하세요!
                  </p>
                </div>
                {!roomEventClaimed ? (
                  <button
                    onClick={claimRuneAltar}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-lg shadow-xl ring-2 ring-purple-400 transition animate-pulse cursor-pointer"
                  >
                    🔮 제단 기도 및 룬 연성하기
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-bold">✨ 룬 연성이 완료되었습니다! 다음 방으로 이동하세요.</p>
                  </div>
                )}
              </div>
            )}

            {/* Blessing Shrine Event */}
            {currentRoom?.type === 'shrine' && (
              <div className="space-y-3 max-w-lg w-full animate-fade-in">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-blue-950 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(96,165,250,0.4)]">
                  <Sun className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-base sm:text-lg text-blue-200">
                    {currentRoom.title} (축복의 성소)
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    신비로운 고대 성소입니다. 이번 던전 원정을 수월하게 이끌 축복을 선택하세요!
                  </p>
                </div>
                {!roomEventClaimed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                    <button
                      onClick={() => claimShrine('fortune')}
                      className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-amber-600/80 hover:border-amber-400 rounded-lg text-left transition space-y-1 shadow"
                    >
                      <div className="font-bold text-amber-300 text-xs">☀️ 태양의 성소</div>
                      <div className="text-[10px] text-gray-300 leading-tight">매직 찬스(MF) +35%</div>
                    </button>
                    <button
                      onClick={() => claimShrine('crit')}
                      className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-rose-600/80 hover:border-rose-400 rounded-lg text-left transition space-y-1 shadow"
                    >
                      <div className="font-bold text-rose-300 text-xs">🩸 피의 성소</div>
                      <div className="text-[10px] text-gray-300 leading-tight">HP 100% 완충 & 치명 +15%</div>
                    </button>
                    <button
                      onClick={() => claimShrine('defense')}
                      className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-blue-600/80 hover:border-blue-400 rounded-lg text-left transition space-y-1 shadow"
                    >
                      <div className="font-bold text-blue-300 text-xs">🛡️ 강철의 성소</div>
                      <div className="text-[10px] text-gray-300 leading-tight">방어 +50 & DR +10%</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-bold">✨ 성소의 축복이 활성화되었습니다! 다음 방으로 이동하세요.</p>
                  </div>
                )}
              </div>
            )}

            {/* Start Room */}
            {currentRoom?.type === 'start' && (
              <div className="space-y-3 max-w-md w-full animate-fade-in">
                <h3 className="font-cinzel font-black text-base sm:text-lg text-brass-200">
                  {currentRoom.title}
                </h3>
                <p className="text-xs text-gray-300">
                  던전의 입구입니다. 전열을 정비하고 탐험을 시작하세요.
                </p>
              </div>
            )}

            {/* Next Room Navigation for Event Rooms */}
            {currentRoom && currentRoom.connections && currentRoom.connections.length > 0 && (
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => selectNextRoom(currentRoom.connections[0])}
                  className="px-6 py-2.5 bg-gradient-to-r from-brass-600 to-amber-600 hover:from-brass-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-lg shadow-lg border border-brass-400 transition flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <span>다음 룸으로 전진 [Space]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>

        {/* Real-time Preview Banner / Room Cleared Selection Banner */}
        {isCleared ? (
          <div className="bg-iron-900 border border-brass-400/80 px-2.5 py-1.5 rounded flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 text-brass-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>룸 소탕 완료! 다음 경로를 선택하세요:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {currentRoom?.connections.map(nextId => {
                const nRoom = currentDungeon.rooms.find(r => r.id === nextId);
                if (!nRoom) return null;
                return (
                  <button
                    key={nextId}
                    onClick={() => selectNextRoom(nextId)}
                    className="px-2.5 py-1 bg-gradient-to-r from-brass-700 to-brass-600 hover:from-brass-600 hover:to-brass-500 text-white font-bold rounded shadow border border-brass-400 transition flex items-center gap-1 text-[10px] sm:text-xs cursor-pointer animate-pulse"
                  >
                    <span>Room #{nRoom.id}: {nRoom.title}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                );
              })}
              <span className="text-[10px] text-gray-400 font-sans hidden sm:inline">(또는 Space 진입)</span>
            </div>
          </div>
        ) : (
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
                  <span>예상 {preview.chainCount}처치</span>
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

        {/* 5-Lane Grid */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 min-h-[185px] sm:min-h-[260px] relative">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const isPlayerInLane = playerLane === laneIdx;
            const laneList = laneMonsters[laneIdx] || [];
            const isLaneTargeted = preview.targetsHit.some(t => t.lane === laneIdx);

            return (
              <div
                key={laneIdx}
                onClick={() => setPlayerLane(laneIdx)}
                className={`flex flex-col justify-between items-center p-1 sm:p-1.5 rounded-lg border transition cursor-pointer relative overflow-hidden ${
                  isPlayerInLane
                    ? 'bg-iron-900/90 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_15px_rgba(222,178,67,0.3)]'
                    : isLaneTargeted
                    ? 'bg-iron-900/60 border-blood-700/80'
                    : 'bg-iron-900/40 border-iron-800 hover:border-iron-700'
                }`}
              >
                {/* Lane Header */}
                <div className={`w-full py-0.5 text-center rounded text-[9px] sm:text-[10px] font-mono font-black mb-0.5 sm:mb-1 ${
                  isPlayerInLane ? 'bg-brass-500 text-iron-950' : 'bg-iron-950 text-gray-400'
                }`}>
                  L{laneIdx + 1} {isPlayerInLane && '▼'}
                </div>

                {/* Monster Queue in this Lane */}
                <div className="w-full flex-1 flex flex-col-reverse justify-start gap-1 relative">
                  {laneList.map(m => {
                    const hitInfo = preview.targetsHit.find(t => t.monsterId === m.id);
                    const isPredictedKill = hitInfo?.isFatal;
                    const isOverkillResidual = hitInfo?.isOverkillHit;
                    const isStopper = preview.stopperId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`w-full rounded p-1 sm:p-1.5 border transition-all relative overflow-hidden shadow ${
                          isPredictedKill
                            ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white text-[10px] sm:text-[12px] ring-1 sm:ring-2 ring-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
                            : isStopper
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-300 text-[9px] sm:text-[11px] ring-1 ring-yellow-300'
                            : m.rank === 'elite'
                            ? 'bg-blood-950 border-blood-500 text-yellow-200 text-[9px] sm:text-[10px]'
                            : 'bg-iron-950 border-iron-750 text-gray-200 text-[9px] sm:text-[10px]'
                        }`}
                      >
                        {/* Monster Card Details */}
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black truncate leading-tight">
                          <span className="truncate">{m.name.split(' ')[0]}</span>
                          <span className="text-[10px] sm:text-[12px] filter drop-shadow-sm flex-shrink-0">
                            {m.rank === 'elite' ? '👑' : m.name.includes('방패') ? '🛡️' : m.name.includes('궁수') ? '🏹' : '👹'}
                          </span>
                        </div>

                        {/* HP Bar */}
                        <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-mono text-gray-300 mt-0.5 leading-none">
                          <span>HP {m.hp}</span>
                          <span className="text-gray-400">방{m.defense}</span>
                        </div>
                        <div className="w-full bg-iron-950 h-1 sm:h-1.5 rounded-full overflow-hidden border border-iron-750 mt-0.5">
                          <div
                            className="bg-blood-500 h-full transition-all duration-200"
                            style={{ width: `${Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))}%` }}
                          />
                        </div>

                        {/* Prediction Badges */}
                        {isPredictedKill && (
                          <div className="text-[7px] sm:text-[8px] font-black text-blood-200 uppercase mt-0.5 bg-blood-950 px-0.5 rounded text-center border border-blood-700">
                            {isOverkillResidual ? '오버킬 관통' : '처치 예상'}
                          </div>
                        )}
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
                    className={`w-full py-0.5 text-[8px] sm:text-[9px] font-mono font-bold rounded border transition ${
                      isPlayerInLane
                        ? 'bg-brass-500 text-iron-950 border-brass-400 font-black'
                        : 'bg-iron-950 text-gray-400 border-iron-800 hover:border-iron-700'
                    }`}
                  >
                    {isPlayerInLane ? '선택됨' : '선택'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>

      {/* 3. Bottom Action Bar: 4 Skill Buttons + Primary Attack Button */}
      <div className="bg-iron-950 border-2 border-brass-500/80 rounded-lg p-1.5 sm:p-2 shadow-2xl space-y-1.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-1.5">
          {/* Skills Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 flex-1 w-full">
            {WARRIOR_SKILLS.map(skill => {
              const isSelected = selectedSkill.id === skill.id;
              const sLevel = skillLevels[skill.id] || 1;
              const canAfford = playerStats.rage >= skill.rageCost;

              return (
                <button
                  key={skill.id}
                  onClick={() => selectSkillOrExecute(skill)}
                  disabled={isAttacking || isEnemyTurn}
                  className={`p-1.5 rounded-lg border text-left flex flex-col justify-between transition relative shadow ${
                    isSelected
                      ? 'bg-blood-950 border-brass-400 text-brass-100 ring-1 sm:ring-2 ring-brass-400/80 shadow-[0_0_8px_rgba(222,178,67,0.4)]'
                      : canAfford
                      ? 'bg-iron-950 border-iron-700 text-gray-100 hover:bg-iron-800'
                      : 'bg-iron-950/60 border-iron-800 text-gray-400 opacity-60'
                  }`}
                  title={`${skill.name} (선택 또는 더블 클릭 시 즉시 시전)`}
                >
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-black font-cinzel">
                    <span className="truncate">{skill.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[8px] text-amber-300 font-mono font-bold bg-iron-900 px-1 rounded border border-iron-700">
                        Lv.{sLevel}
                      </span>
                      <span className={`text-[9px] font-mono font-black px-1 rounded ${
                        isSelected ? 'bg-brass-400 text-iron-950' : 'bg-iron-900 text-gray-300'
                      }`}>
                        [{skill.hotkey}]
                      </span>
                    </div>
                  </div>

                  {/* Rage Cost / Gain Indicator */}
                  <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-gray-300 mt-1">
                    <span className={`font-bold ${canAfford ? 'text-amber-300' : 'text-blood-400'}`}>
                      분노 {skill.rageCost > 0 ? `${playerStats.rage}/${skill.rageCost}` : '0/0'}
                    </span>
                    {skill.rageGainPerHit && (
                      <span className="text-amber-400 font-bold">⚡+{skill.rageGainPerHit}</span>
                    )}
                    {skill.lifeStealPercent && (
                      <span className="text-blood-400 font-bold">🩸{skill.lifeStealPercent}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Attack Trigger / Next Room Button */}
          <button
            onClick={() => {
              if (isCleared) {
                if (currentRoom && currentRoom.connections && currentRoom.connections.length > 0) {
                  selectNextRoom(currentRoom.connections[0]);
                }
              } else {
                executeAttack();
              }
            }}
            disabled={isAttacking || isEnemyTurn}
            className={`w-full md:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-black text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xl transition transform active:scale-95 flex-shrink-0 ${
              isCleared
                ? 'bg-gradient-to-r from-brass-600 to-amber-600 hover:from-brass-500 hover:to-amber-500 text-white ring-2 ring-brass-400 shadow-[0_0_12px_rgba(222,178,67,0.6)] animate-pulse cursor-pointer'
                : isEnemyTurn
                ? 'bg-blood-950 text-blood-300 border-2 border-blood-600 cursor-wait'
                : isAttacking
                ? 'bg-amber-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white ring-2 ring-blood-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isAttacking
                ? '처치 중...'
                : isEnemyTurn
                ? '적 반격...'
                : isCleared
                ? '다음 룸 진입 [Space]'
                : '[Space] 공격'}
            </span>
          </button>
        </div>

        {/* 4. Quick Consumables Bar [1 ~ 4] */}
        <div className="pt-1 border-t border-iron-800 flex items-center justify-between flex-wrap gap-1 text-[10px] sm:text-xs font-mono">
          <span className="text-gray-200 font-bold flex items-center gap-1">
            <FlaskConical className="w-3 h-3 text-purple-400" />
            <span>소모품:</span>
          </span>

          <div className="flex items-center gap-1 sm:gap-2">
            {consumables.map(item => (
              <button
                key={item.id}
                onClick={() => useConsumable(item.hotkey)}
                disabled={item.count <= 0}
                className={`px-2 py-0.5 rounded border flex items-center gap-1 transition shadow ${
                  item.count > 0
                    ? 'bg-iron-900 border-iron-700 text-gray-200 hover:bg-iron-800 cursor-pointer'
                    : 'bg-iron-950 border-iron-850 text-gray-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-amber-400 font-bold">[{item.hotkey}]</span>
                <span className="truncate max-w-[80px] sm:max-w-none">{item.name.split(' ')[0]}</span>
                <span className="text-blood-300 font-bold">x{item.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-[10px] text-gray-400 hover:text-gray-200 underline font-sans cursor-pointer"
            >
              {showLogs ? '로그 닫기' : '전투 로그 보기'}
            </button>

            <button
              onClick={returnToTown}
              className="px-2 py-0.5 bg-blood-950/80 hover:bg-blood-900 border border-blood-800 text-blood-300 hover:text-white rounded text-[10px] font-bold transition shadow"
            >
              마을 귀환
            </button>
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
};
