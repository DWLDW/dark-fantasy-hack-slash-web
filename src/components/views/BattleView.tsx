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
    returnToTown
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

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 space-y-2.5 select-none pb-24">
      {/* 1. Top Header: Mini Room Graph + Wait ATB Timeline + Chain Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
        <div className="lg:col-span-7">
          <MiniRoomGraph />
        </div>

        <div className="lg:col-span-5 bg-iron-900 border-2 border-iron-750 rounded p-2.5 flex items-center justify-between shadow-md">
          {/* Wait ATB Horde Timeline */}
          <div className="flex-1 pr-3 border-r border-iron-750">
            <div className="flex justify-between items-center text-[11px] font-mono text-gray-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blood-400" />
                {isEnemyTurn ? <span className="text-blood-400 animate-pulse font-black">적 반격 턴!</span> : 'Wait ATB 타임라인'}
              </span>
              <span className="text-xs text-gray-400">{isEnemyTurn ? 'STRIKE' : '대기 중'}</span>
            </div>
            <div className="w-full bg-iron-950 h-2.5 rounded-full overflow-hidden border border-iron-700">
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
          <div className="pl-3 flex items-center gap-2.5">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 font-mono font-bold">1회 공격 처치</div>
              <div className={`font-cinzel font-black text-lg ${chainCount > 0 ? 'text-amber-300 animate-chain-pop' : 'text-gray-500'}`}>
                {chainCount > 0 ? `x${chainCount} KILL` : 'x0'}
              </div>
            </div>

            <button
              onClick={resetBattleFormation}
              className="p-1.5 bg-iron-800 hover:bg-iron-750 text-gray-300 hover:text-white rounded border border-iron-650 transition"
              title="GDD 26장 30마리 검증 포메이션으로 전장 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Battlefield Box (Clean Surface Separation) */}
      <div className={`bg-iron-950 border-2 border-brass-500/80 rounded-lg p-2.5 md:p-3 shadow-2xl relative overflow-hidden transition-transform duration-100 flex flex-col gap-2.5 ${
        isAttacking ? 'animate-hit-shake' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-blood-950/20 via-transparent to-iron-950/90 pointer-events-none" />

        {/* Real-time Preview Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-iron-900 px-3 py-1.5 rounded border border-iron-700 text-xs font-mono shadow">
          <div className="flex items-center gap-3">
            <span className="text-brass-300 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              스킬: <span className="text-white font-black">{selectedSkill.name} [{selectedSkill.hotkey}]</span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-200">
              확정 타격: <strong className="text-brass-200 font-black">{preview.totalDamage} 피해</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {preview.chainCount > 0 ? (
              <span className="text-emerald-300 bg-emerald-950/70 border border-emerald-500 px-2.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse">
                <Flame className="w-3.5 h-3.5 text-blood-400" />
                예상 처치: {preview.chainCount}마리 연쇄 격파!
              </span>
            ) : (
              <span className="text-gray-400 font-medium">단일 타격 또는 처치 불가</span>
            )}

            {preview.stopperId && (
              <span className="text-amber-200 font-bold flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600 shadow text-[11px]">
                <Shield className="w-3 h-3 text-amber-400" />
                엘리트 체인 저지점
              </span>
            )}
          </div>
        </div>

        {/* 5-Lane Queue Battlefield (Fixed Height & Slim Cards to NEVER overlap skills) */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2.5 min-h-[290px]">
          {[0, 1, 2, 3, 4].map(laneIndex => {
            const isCurrentPlayerLane = playerLane === laneIndex;
            const monstersInLane = laneMonsters[laneIndex] || [];

            return (
              <div
                key={laneIndex}
                onClick={() => setPlayerLane(laneIndex)}
                className={`flex flex-col justify-between items-center p-1.5 rounded-lg border-2 transition cursor-pointer relative ${
                  isCurrentPlayerLane
                    ? 'bg-blood-950/35 border-brass-400 ring-2 ring-brass-400/60 shadow-[0_0_12px_rgba(222,178,67,0.3)]'
                    : 'bg-iron-900/60 border-iron-750 hover:border-iron-600 hover:bg-iron-900/90'
                }`}
              >
                {/* Lane Header Tag */}
                <div className={`w-full py-0.5 text-center rounded text-[10px] font-mono font-black mb-1 ${
                  isCurrentPlayerLane ? 'bg-brass-500 text-iron-950 shadow' : 'bg-iron-800 text-gray-300'
                }`}>
                  LANE {laneIndex + 1}
                </div>

                {/* Monster Queue (Deep to Front, Slim Padding to Fit 6 Depths) */}
                <div className="w-full flex-1 flex flex-col-reverse justify-start gap-1 py-1">
                  {monstersInLane.map(monster => {
                    const isPredictedDead = preview.kills.includes(monster.id);
                    const isStopper = preview.stopperId === monster.id;
                    const hpPercent = Math.max(0, (monster.hp / monster.maxHp) * 100);
                    const floating = floatingDamages.find(f => f.lane === monster.lane && f.depth === monster.depth);

                    // Dynamic Portrait Icon Helper
                    const getMonsterPortrait = (mName: string, rank: string) => {
                      if (rank === 'elite' || mName.includes('집행관') || mName.includes('군주') || mName.includes('대장')) return '👑';
                      if (mName.includes('방패') || mName.includes('수호')) return '🛡️';
                      if (mName.includes('사제') || mName.includes('주술') || mName.includes('샤먼')) return '🔮';
                      if (mName.includes('궁수') || mName.includes('척살')) return '🏹';
                      if (mName.includes('전갈')) return '🦂';
                      if (mName.includes('미이라') || mName.includes('좀비')) return '🧟';
                      if (mName.includes('기사')) return '⚔️';
                      if (mName.includes('베놈') || mName.includes('독')) return '☠️';
                      if (mName.includes('화염') || mName.includes('악마')) return '🔥';
                      return '👹';
                    };

                    const portraitEmoji = getMonsterPortrait(monster.name, monster.rank);

                    return (
                      <div
                        key={monster.id}
                        className={`w-full py-1 px-1.5 rounded border transition-all duration-150 relative shadow ${
                          isPredictedDead
                            ? 'bg-blood-900/95 border-blood-400 text-white ring-1 ring-blood-400 scale-[0.98] shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                            : monster.isFrozen
                            ? 'bg-sky-950/90 border-sky-400 text-sky-100 ring-1 ring-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                            : isStopper
                            ? 'bg-amber-950 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                            : monster.rank === 'elite'
                            ? 'bg-purple-950/90 border-purple-500 text-purple-100 ring-1 ring-purple-400/50'
                            : monster.rank === 'champion'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-100'
                            : 'bg-iron-850 border-iron-700 text-gray-100'
                        }`}
                      >
                        {/* Floating Damage Text Popup with Overkill Explosive Styling */}
                        {floating && (
                          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 z-30 font-mono font-black px-1.5 py-0.5 rounded border shadow-2xl flex items-center gap-1 whitespace-nowrap animate-bounce ${
                            floating.isOverkill
                              ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 border-amber-300 text-white text-[12px] ring-2 ring-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]'
                              : floating.isCrit
                              ? 'bg-yellow-950 border-yellow-400 text-yellow-300 text-[11px] ring-1 ring-yellow-300'
                              : 'bg-blood-950 border-blood-500 text-yellow-200 text-[10px]'
                          }`}>
                            <span>-{floating.damage}</span>
                            {floating.isCrit && !floating.isOverkill && <span className="text-yellow-300 font-black">CRIT!</span>}
                            {floating.isOverkill && <span className="text-yellow-200 font-black tracking-tighter">💥OVERKILL!</span>}
                          </div>
                        )}

                        {/* Monster Header with Portrait */}
                        <div className="flex items-center justify-between text-[10px] font-black truncate leading-tight">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[12px] filter drop-shadow-sm flex-shrink-0">
                              {monster.isFrozen ? '❄️' : portraitEmoji}
                            </span>
                            <span className="truncate">{monster.name}</span>
                          </div>
                          {monster.rank === 'elite' && <Crown className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                          {monster.rank === 'champion' && <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        </div>

                        {/* HP Bar & Text */}
                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-300 mt-0.5 leading-none">
                          <span>HP</span>
                          <span className="font-bold text-white">{monster.hp}/{monster.maxHp}</span>
                        </div>
                        <div className="w-full bg-iron-950 h-1.5 rounded-full overflow-hidden border border-iron-750 mt-0.5">
                          <div
                            className={`h-full transition-all duration-200 ${
                              isPredictedDead
                                ? 'bg-blood-500'
                                : monster.isFrozen
                                ? 'bg-sky-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>

                        {/* Status Tag: Predicted Dead / Frozen / Stopper */}
                        {isPredictedDead ? (
                          <div className="text-[8px] font-black text-blood-200 uppercase mt-0.5 bg-blood-950 px-1 rounded text-center border border-blood-700">
                            처치 예상
                          </div>
                        ) : monster.isFrozen ? (
                          <div className="text-[8px] font-black text-sky-200 uppercase mt-0.5 bg-sky-950 px-1 rounded text-center border border-sky-600 animate-pulse">
                            ❄️ 빙결 (행동불가)
                          </div>
                        ) : isStopper ? (
                          <div className="text-[8px] font-black text-amber-200 uppercase mt-0.5 bg-amber-950 px-1 rounded text-center border border-amber-700">
                            체인 저지점
                          </div>
                        ) : null}

                        {/* Defense Tag */}
                        {monster.defense > 0 && !isPredictedDead && (
                          <div className="absolute -top-1 -right-1 text-[7px] font-bold bg-blue-950 text-blue-200 border border-blue-400 px-1 rounded-full shadow">
                            방어 {monster.defense}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {monstersInLane.length === 0 && (
                    <div className="text-[11px] text-gray-400 font-bold italic py-10 text-center">
                      소탕 완료
                    </div>
                  )}
                </div>

                {/* Player Indicator (Dedicated bottom slot, never overlapped) */}
                <div className={`w-full py-1 rounded text-center font-black text-[11px] transition shadow mt-1 ${
                  isCurrentPlayerLane
                    ? 'bg-gradient-to-r from-blood-700 to-blood-600 text-white border border-brass-300 shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                    : 'bg-iron-800 text-gray-400 border border-iron-700'
                }`}>
                  {isCurrentPlayerLane ? (
                    <div className="flex items-center justify-center gap-1">
                      <Swords className="w-3 h-3 text-brass-300" />
                      <span>플레이어 (▼)</span>
                    </div>
                  ) : (
                    <span>레인 선택</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Skill & Action Control Bar (Completely separate block below the battlefield) */}
        <div className="pt-2.5 border-t-2 border-iron-750 flex flex-col md:flex-row items-center justify-between gap-2.5 bg-iron-900/90 p-2.5 rounded-lg">
          
          {/* Lane Movement Buttons */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto justify-center">
            <button
              onClick={() => setPlayerLane(Math.max(0, playerLane - 1))}
              disabled={playerLane <= 0 || isAttacking || isEnemyTurn}
              className="px-3 py-2 bg-iron-950 hover:bg-iron-800 disabled:opacity-30 text-gray-100 hover:text-white rounded border border-iron-600 text-xs flex items-center gap-1 font-mono font-bold shadow"
              title="좌측 레인 이동 (단축키: ←)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brass-400" />
              <span>좌측 [←]</span>
            </button>
            <button
              onClick={() => setPlayerLane(Math.min(4, playerLane + 1))}
              disabled={playerLane >= 4 || isAttacking || isEnemyTurn}
              className="px-3 py-2 bg-iron-950 hover:bg-iron-800 disabled:opacity-30 text-gray-100 hover:text-white rounded border border-iron-600 text-xs flex items-center gap-1 font-mono font-bold shadow"
              title="우측 레인 이동 (단축키: →)"
            >
              <span>우측 [→]</span>
              <ArrowRight className="w-3.5 h-3.5 text-brass-400" />
            </button>
          </div>

          {/* QWER Skills Selector (Double Tap to Instant Cast) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full md:w-auto flex-1 max-w-2xl">
            {WARRIOR_SKILLS.map(skill => {
              const isSelected = selectedSkill.id === skill.id;
              const canAfford = playerStats.rage >= skill.rageCost;
              const sLevel = skillLevels[skill.id] || 1;
              const effectiveMultiplier = (skill.damageMultiplier * (1 + (sLevel - 1) * 0.15)).toFixed(1);

              return (
                <button
                  key={skill.id}
                  onClick={() => selectSkillOrExecute(skill)}
                  disabled={isAttacking || isEnemyTurn}
                  className={`p-2 rounded-lg border-2 text-left flex flex-col justify-between transition relative shadow ${
                    isSelected
                      ? 'bg-blood-950 border-brass-400 text-brass-100 ring-2 ring-brass-400/80 shadow-[0_0_10px_rgba(222,178,67,0.4)]'
                      : canAfford
                      ? 'bg-iron-950 border-iron-700 text-gray-100 hover:bg-iron-800'
                      : 'bg-iron-950/60 border-iron-800 text-gray-400 opacity-60'
                  }`}
                  title={`${skill.name} (선택 또는 더블 클릭 시 즉시 시전)`}
                >
                  <div className="flex items-center justify-between text-xs font-black font-cinzel">
                    <span className="truncate">{skill.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-amber-300 font-mono font-bold bg-iron-900 px-1 rounded border border-iron-700">
                        Lv.{sLevel}
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono font-black bg-iron-900 px-1 py-0.2 rounded border border-iron-700">
                        [{skill.hotkey}]
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-300 font-mono font-bold mt-1 flex items-center justify-between flex-wrap gap-1">
                    {skill.rageCost > 0 ? (
                      <span className="text-amber-400">분노 {skill.rageCost}</span>
                    ) : (
                      <span className="text-emerald-400">자원 0</span>
                    )}

                    {skill.rageGainPerHit && skill.rageGainPerHit > 0 && (
                      <span className="text-yellow-300">⚡+{skill.rageGainPerHit}</span>
                    )}

                    {skill.lifeStealPercent && skill.lifeStealPercent > 0 && (
                      <span className="text-rose-400">🩸50%</span>
                    )}

                    <span className="text-gray-400">x{effectiveMultiplier}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Attack Trigger Button */}
          <button
            onClick={executeAttack}
            disabled={isAttacking || isEnemyTurn || isCleared}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 flex-shrink-0 ${
              isCleared
                ? 'bg-iron-800 text-gray-400 border border-iron-700 cursor-not-allowed'
                : isEnemyTurn
                ? 'bg-blood-950 text-blood-300 border-2 border-blood-600 cursor-wait'
                : isAttacking
                ? 'bg-amber-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white ring-2 ring-blood-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>
              {isAttacking
                ? '연쇄 처치 발동 중...'
                : isEnemyTurn
                ? '적 반격 중...'
                : isCleared
                ? '룸 소탕 완료'
                : '[Space] 공격 (Strike)'}
            </span>
          </button>
        </div>

        {/* 4. Quick Consumables Bar [1 ~ 4] */}
        <div className="pt-2 border-t border-iron-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-gray-200 font-bold flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>소모품 퀵슬롯:</span>
          </span>

          <div className="flex items-center gap-2">
            {consumables.map(item => (
              <button
                key={item.id}
                onClick={() => useConsumable(item.id)}
                disabled={item.count <= 0 || isEnemyTurn}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-iron-900 hover:bg-iron-800 disabled:opacity-40 border border-iron-700 hover:border-iron-500 rounded text-gray-100 hover:text-white transition shadow text-xs"
                title={`${item.name} (${item.description})`}
              >
                <span className="text-[11px] text-amber-300 font-black bg-iron-950 px-1.5 py-0.5 rounded border border-iron-750">
                  [{item.hotkey}]
                </span>
                <span className="font-bold">{item.name}</span>
                <span className="text-xs font-black text-brass-300 bg-iron-950 px-1 py-0.5 rounded border border-iron-800">
                  x{item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Collapsible Battle Log */}
      <div className="bg-iron-950 border border-iron-800 rounded text-xs">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-gray-300 hover:text-white font-bold border-b border-iron-850"
        >
          <span className="font-mono text-xs">전투 실시간 로그 ({combatLogs.length})</span>
          <span className="text-xs text-gray-400">{showLogs ? '접기 ▲' : '펼치기 ▼'}</span>
        </button>

        {showLogs && (
          <div className="p-2.5 max-h-28 overflow-y-auto space-y-1 font-mono text-xs bg-iron-900/60">
            {combatLogs.map(log => (
              <div
                key={log.id}
                className={`py-0.5 ${
                  log.type === 'chain' ? 'text-amber-300 font-bold' :
                  log.type === 'damage' ? 'text-blood-300 font-bold' :
                  log.type === 'loot' ? 'text-purple-300 font-bold' : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                {log.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
