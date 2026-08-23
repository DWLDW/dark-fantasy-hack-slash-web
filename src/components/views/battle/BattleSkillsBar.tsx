import React from 'react';
import { useGame } from '../../../state/gameStore';
import { isSkillUnlocked, getSkillDamageText } from '../../../data/skills';
import { Swords } from 'lucide-react';

export const BattleSkillsBar: React.FC = React.memo(() => {
  const {
    monsters,
    selectedSkill,
    selectSkillOrExecute,
    equippedSkills,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    playerStats,
    totalStats,
    skillRunes,
    skillLevels,
    currentDungeon,
    currentRoomId,
    selectNextRoom,
    pendingExitRoomId,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    selectedShrineType
  } = useGame();

  const totalMonsters = monsters.length;
  const isCleared = totalMonsters === 0;
  const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);

  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2 select-none font-sans flex-shrink-0">
      {/* 4 Equipped Skill Cards */}
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
              className={`p-1.5 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition relative shadow cursor-pointer ${
                !unlocked
                  ? 'bg-iron-950 border-iron-800 text-gray-600 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blood-950 border-brass-400 text-brass-100 ring-2 ring-brass-400 shadow-[0_0_10px_rgba(222,178,67,0.5)] scale-[1.02]'
                  : canAfford
                  ? 'bg-iron-900 border-iron-750 text-gray-100 hover:bg-iron-850 hover:border-iron-600'
                  : 'bg-iron-950/70 border-iron-800 text-gray-500 opacity-60'
              }`}
              title={unlocked ? `${skill.name} (클릭 시 스마트 타겟팅 락온, 재클릭 시 시전)` : `Lv.${skill.unlockLevel} 해금`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-black font-cinzel leading-tight">
                <span className="truncate">{unlocked ? skill.name.split(' ')[0] : '잠김'}</span>
                <span className={`text-[9px] sm:text-[10px] font-mono font-black px-1 rounded ${
                  isSelected ? 'bg-brass-400 text-iron-950' : 'bg-iron-950 text-amber-400 border border-iron-750'
                }`}>
                  {unlocked ? `[${skill.hotkey}]` : `Lv.${skill.unlockLevel}`}
                </span>
              </div>

              {unlocked && (
                <div className="text-[10px] sm:text-xs font-mono text-amber-300 font-black truncate my-0.5">
                  {dmgText}
                </div>
              )}

              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-gray-300">
                <span className={`font-bold ${canAfford ? 'text-amber-300' : 'text-blood-400'}`}>
                  분노 {skill.rageCost > 0 ? skill.rageCost : '0'}
                </span>
                <span className="text-[9px] text-gray-400 font-bold bg-iron-950 px-1 rounded">
                  Lv.{sLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* [Space] Action Attack Button */}
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
        className={`px-3.5 sm:px-5 py-2 rounded-lg font-black text-sm md:text-base flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 flex-shrink-0 cursor-pointer min-w-[90px] sm:min-w-[110px] ${
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
        <span className="text-[10px] font-mono text-amber-200/90 font-bold">[Space]</span>
      </button>
    </div>
  );
});

BattleSkillsBar.displayName = 'BattleSkillsBar';
