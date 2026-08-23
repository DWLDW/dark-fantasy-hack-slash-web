import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { WARRIOR_SKILLS, SKILL_RUNES_DATA } from '../../data/gameData';
import { Skill, SkillRune } from '../../types/game';
import {
  X,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  Skull,
  Droplets,
  Moon,
  Check,
  Plus,
  RotateCcw,
  Shield,
  Heart,
  Activity
} from 'lucide-react';

const SkillUpgradeButtons: React.FC<{
  skillId: string;
  sLevel: number;
  availablePoints: number;
  onUpgrade: (skillId: string, amount: number) => void;
}> = ({ skillId, sLevel, availablePoints, onUpgrade }) => {
  const canUpgrade = availablePoints > 0 && sLevel < 10;
  const maxPossible = Math.min(availablePoints, 10 - sLevel);

  const holdProps = useHoldAction((e?: React.SyntheticEvent) => {
    if (availablePoints <= 0 || sLevel >= 10) return;
    const isShift = (e as React.MouseEvent)?.shiftKey;
    const amount = isShift ? maxPossible : 1;
    onUpgrade(skillId, amount);
  }, 280, 70, canUpgrade);

  if (!canUpgrade) {
    return (
      <span className="text-[10px] text-gray-500 font-bold font-mono px-2 py-1 bg-iron-950 rounded border border-iron-800">
        {sLevel >= 10 ? "MAX" : "0 SP"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <button
        {...holdProps}
        className="px-2 py-1 h-7 rounded-md font-black text-xs flex items-center justify-center transition shadow bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 ring-1 ring-brass-300 animate-pulse cursor-pointer transform active:scale-95 select-none"
        title="클릭: +1Lv / Shift+클릭: MAX / 꾹 누르면 연속 레벨업"
      >
        <Plus className="w-3.5 h-3.5 mr-0.5" />
        <span>1</span>
      </button>

      {maxPossible >= 2 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade(skillId, maxPossible);
          }}
          className="px-2 py-1 h-7 rounded-md font-mono font-black text-xs flex items-center justify-center transition shadow bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 cursor-pointer transform active:scale-95 select-none"
          title={`한 번에 +${maxPossible}Lv 즉시 투자`}
        >
          +{maxPossible}
        </button>
      )}
    </div>
  );
};

export const SkillRuneModal: React.FC = React.memo(() => {
  const {
    skillRunes,
    setSkillRune,
    skillLevels,
    upgradeSkill,
    resetSkillPoints,
    playerStats,
    closeModal
  } = useGame();

  const [selectedSkillId, setSelectedSkillId] = useState<string>('whirlwind');

  const selectedSkill = WARRIOR_SKILLS.find(s => s.id === selectedSkillId) || WARRIOR_SKILLS[0];
  const activeRuneId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const currentSkillLv = skillLevels[selectedSkill.id] || 1;
  const levelDamageBonus = (currentSkillLv - 1) * 15;

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            스킬 트리 & 룬 결합 성소
          </h2>
          {playerStats.skillPoints > 0 && (
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2.5 py-0.5 rounded text-xs font-black animate-pulse">
              보유 스킬 포인트: {playerStats.skillPoints} SP
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSkillPoints}
            className="px-2.5 py-1 rounded bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer"
            title="투자한 모든 스킬 포인트를 전액 회수합니다"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>스킬 초기화</span>
          </button>
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 4 Warrior Skills Selection */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-cinzel font-bold text-gray-300 px-1 flex items-center justify-between">
            <span>워리어 액티브 스킬 목록</span>
            <span className="text-[10px] text-gray-400 font-mono">레벨업 시 위력 +15%/Lv</span>
          </div>

          {WARRIOR_SKILLS.map(skill => {
            const isSelected = skill.id === selectedSkillId;
            const sLevel = skillLevels[skill.id] || 1;
            const runeId = skillRunes[skill.id] || skill.activeRuneId;
            const currentRune = SKILL_RUNES_DATA.find(r => r.id === runeId);

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`p-3 rounded-lg border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-iron-900 border-brass-500 ring-1 ring-brass-400/50 shadow-lg'
                    : 'bg-iron-950/80 border-iron-800 hover:border-iron-600 hover:bg-iron-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-iron-900 border border-iron-700 flex items-center justify-center font-black font-mono text-xs text-brass-300">
                      {skill.hotkey}
                    </span>
                    <span className="font-bold text-white text-sm tracking-wide">
                      {skill.name}
                    </span>
                    <span className="text-xs font-mono font-black px-1.5 py-0.2 rounded bg-iron-900 text-amber-300 border border-iron-750">
                      Lv.{sLevel}
                    </span>
                  </div>

                  <SkillUpgradeButtons
                    skillId={skill.id}
                    sLevel={sLevel}
                    availablePoints={playerStats.skillPoints}
                    onUpgrade={upgradeSkill}
                  />
                </div>

                <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-2 font-medium">
                  {skill.description}
                </div>

                {/* Active Skill Rune Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-iron-800 text-[11px]">
                  <span className="text-gray-400">장착된 룬:</span>
                  {currentRune ? (
                    <span
                      className="font-bold px-2 py-0.5 rounded flex items-center gap-1 border"
                      style={{
                        backgroundColor: `${currentRune.color}15`,
                        borderColor: `${currentRune.color}60`,
                        color: currentRune.color
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      {currentRune.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">기본 상태</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Skill Rune Customization Shrine */}
        <div className="lg:col-span-7 bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-4 shadow">
          {/* Selected Skill Header */}
          <div className="border-b border-iron-750 pb-3 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-black text-brass-200">
                  {selectedSkill.name}
                </span>
                <span className="font-mono font-black text-amber-400 text-xs px-2 py-0.5 rounded bg-iron-950 border border-iron-750">
                  Lv.{currentSkillLv} / 10 (+{levelDamageBonus}% 위력 증폭)
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1 font-mono">
                자원 소모: {selectedSkill.rageCost > 0 ? `분노 ${selectedSkill.rageCost}` : '자원 소모 없음'} | 궤적: {selectedSkill.route.toUpperCase()}
              </div>
            </div>

            <SkillUpgradeButtons
              skillId={selectedSkill.id}
              sLevel={currentSkillLv}
              availablePoints={playerStats.skillPoints}
              onUpgrade={upgradeSkill}
            />
          </div>

          {/* 5 Elemental Skill Runes Selector */}
          <div className="space-y-2.5">
            <div className="text-xs font-cinzel font-bold text-gray-300 flex items-center justify-between">
              <span>결합 가능한 5대 원소 스킬 룬</span>
              <span className="text-[10px] text-gray-400">원하는 룬을 클릭하여 즉시 각인</span>
            </div>

            <div className="space-y-2">
              {SKILL_RUNES_DATA.map(rune => {
                const isActive = activeRuneId === rune.id;

                return (
                  <div
                    key={rune.id}
                    onClick={() => setSkillRune(selectedSkill.id, rune.id)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-2 shadow-md bg-iron-950'
                        : 'bg-iron-950/70 border-iron-800 hover:border-iron-600 hover:bg-iron-950'
                    }`}
                    style={{
                      borderColor: isActive ? rune.color : undefined
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-black text-sm tracking-wide"
                          style={{ color: rune.color }}
                        >
                          {rune.name}
                        </span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-iron-900 border border-iron-750 text-gray-300">
                          {rune.specialEffectName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed font-medium">
                        {rune.description}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isActive ? (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-iron-950 font-black shadow"
                          style={{ backgroundColor: rune.color }}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          className="px-2.5 py-1 rounded text-xs font-bold bg-iron-900 text-gray-400 border border-iron-700 hover:text-white hover:border-iron-500 transition"
                        >
                          장착
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SkillRuneModal.displayName = 'SkillRuneModal';
