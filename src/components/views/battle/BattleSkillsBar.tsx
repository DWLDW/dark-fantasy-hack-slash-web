import React from 'react';
import { useGame } from '../../../state/gameStore';
import { isSkillUnlocked, getSkillDamageText, SKILL_RUNES_DATA } from '../../../data/skills';
import { Swords, Skull, Zap, Shield, Flame, RotateCw, Megaphone } from 'lucide-react';

const SKILL_ICON: Record<string, React.ReactNode> = {
  slash: <Swords className="w-3 h-3" />,
  cleave: <Zap className="w-3 h-3" />,
  execute: <Skull className="w-3 h-3" />,
  shield_bash: <Shield className="w-3 h-3" />,
  berserk: <Flame className="w-3 h-3" />,
  whirlwind: <RotateCw className="w-3 h-3" />,
  war_cry: <Megaphone className="w-3 h-3" />
};

const RUNE_TINT: Record<string, string> = {
  fire: 'from-red-950/80 via-orange-950/40 to-iron-950',
  cold: 'from-cyan-950/80 via-sky-950/40 to-iron-950',
  lightning: 'from-amber-950/80 via-yellow-950/40 to-iron-950',
  poison: 'from-emerald-950/80 via-lime-950/40 to-iron-950',
  void: 'from-purple-950/80 via-fuchsia-950/40 to-iron-950',
  physical: 'from-stone-900/80 via-iron-900 to-iron-950'
};

export const BattleSkillsBar: React.FC = React.memo(() => {
  const {
    monsters,
    selectedSkill,
    selectSkillOrExecute,
    equippedSkills,
    triggerAttackOrSmartTarget,
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
    <div className="w-full flex items-stretch gap-1 select-none font-sans flex-shrink-0">
      {/* 4 Equipped Skill Cards */}
      <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
        {equippedSkills.map(skill => {
          const isSelected = selectedSkill.id === skill.id;
          const sLevel = skillLevels[skill.id] || 1;
          const unlocked = isSkillUnlocked(skill.id, playerStats.level);
          const canAfford = playerStats.rage >= skill.rageCost;
          const dmgText = getSkillDamageText(skill, totalStats, sLevel, skillRunes[skill.id] || skill.activeRuneId);
          const rune = SKILL_RUNES_DATA.find(r => r.id === (skillRunes[skill.id] || skill.activeRuneId));
          const tint = RUNE_TINT[rune?.element || 'physical'];

          return (
            <button
              key={skill.id}
              onClick={() => { if (isCleared || totalMonsters === 0 || !unlocked) return; selectSkillOrExecute(skill); }}
              disabled={isAttacking || isEnemyTurn || !unlocked}
              className={`p-1 sm:p-1.5 rounded-lg border text-left flex flex-col justify-between transition relative shadow-sm cursor-pointer bg-gradient-to-br min-h-[46px] sm:min-h-[50px] ${tint} ${
                !unlocked
                  ? 'border-iron-850 text-gray-600 opacity-40 cursor-not-allowed'
                  : isSelected
                  ? 'border-amber-400 text-amber-100 ring-1 ring-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.35)] scale-[1.02]'
                  : canAfford
                  ? 'border-iron-750 text-gray-200 hover:bg-iron-850 hover:border-iron-600'
                  : 'border-iron-800 text-gray-500 opacity-60'
              }`}
              title={unlocked ? `${skill.name} (클릭 시 락온, 재클릭 시 시전)` : `Lv.${skill.unlockLevel} 해금`}
            >
              {/* Row 1: Name + Hotkey / Unlock Level */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-black font-cinzel leading-tight w-full">
                <span className="truncate flex items-center gap-1">
                  <span className={isSelected ? 'text-amber-300' : 'text-brass-400 flex-shrink-0'}>{SKILL_ICON[skill.id]}</span>
                  <span className="truncate">{unlocked ? skill.name.split(' ')[0] : '잠김'}</span>
                </span>
                <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1 rounded flex-shrink-0 ${
                  isSelected ? 'bg-amber-400 text-iron-950' : 'bg-iron-950 text-amber-400 border border-iron-800'
                }`}>
                  {unlocked ? `[${skill.hotkey}]` : `Lv.${skill.unlockLevel}`}
                </span>
              </div>

              {/* Row 2: Damage & Rage Cost */}
              <div className="flex items-center justify-between font-mono text-[8px] sm:text-[9px] w-full mt-0.5 leading-none">
                {unlocked ? (
                  <span className="text-amber-300 font-bold truncate">{dmgText}</span>
                ) : (
                  <span className="text-gray-500">미해금</span>
                )}
                {unlocked && (
                  <span className={`font-bold flex-shrink-0 ${canAfford ? 'text-gray-300' : 'text-blood-400'}`}>
                    {skill.rageCost > 0 ? `${skill.rageCost}분노` : '자유'}
                  </span>
                )}
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
            triggerAttackOrSmartTarget();
          }
        }}
        disabled={isAttacking || isEnemyTurn}
        className={`px-3 sm:px-4 py-1 rounded-lg font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-lg transition transform active:scale-95 flex-shrink-0 cursor-pointer min-w-[76px] sm:min-w-[95px] min-h-[46px] sm:min-h-[50px] ${
          isCleared
            ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-iron-950 ring-1 ring-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse'
            : isEnemyTurn
            ? 'bg-blood-950 text-blood-300 border border-blood-600 cursor-wait opacity-80'
            : isAttacking
            ? 'bg-amber-700 text-white ring-1 ring-amber-300 animate-pulse'
            : 'bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white ring-1 ring-amber-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
        }`}
      >
        <div className="flex items-center gap-1">
          <Swords className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {isAttacking
              ? '타격...'
              : isEnemyTurn
              ? '반격...'
              : isCleared
              ? ((currentRoom?.type === 'treasure' || currentRoom?.type === 'rune' || currentRoom?.type === 'shrine') && !roomEventClaimed ? '수령' : '다음')
              : '공격'}
          </span>
        </div>
        <span className="text-[9px] font-mono text-amber-200/90 font-bold leading-none mt-0.5">[Space]</span>
      </button>
    </div>
  );
});

BattleSkillsBar.displayName = 'BattleSkillsBar';

