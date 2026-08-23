import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { ALL_AVAILABLE_SKILLS, SKILL_RUNES_DATA, isSkillUnlocked, getSkillById, getSkillDamageText } from '../../data/skills';
import { Skill, SkillRune } from '../../types/game';
import {
  X,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  Skull,
  Check,
  Plus,
  RotateCcw,
  Shield,
  Activity,
  Layers,
  Sword
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
    equippedSkillSlots,
    equipSkillToSlot,
    skillRunes,
    setSkillRune,
    skillLevels,
    upgradeSkill,
    resetSkillPoints,
    openConfirmModal,
    playerStats,
    totalStats,
    closeModal
  } = useGame();

  const [selectedSkillId, setSelectedSkillId] = useState<string>('slash');

  const selectedSkill = ALL_AVAILABLE_SKILLS.find(s => s.id === selectedSkillId) || ALL_AVAILABLE_SKILLS[0];
  const activeRuneId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const currentSkillLv = skillLevels[selectedSkill.id] || 1;
  const levelDamageBonus = (currentSkillLv - 1) * 15;
  const isSelectedUnlocked = isSkillUnlocked(selectedSkill.id, playerStats.level);

  // Find which slot the selected skill is currently in
  const currentAssignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
    slot => equippedSkillSlots[slot] === selectedSkill.id
  );

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            스킬 슬롯 & 룬 결합 성소
          </h2>
          {playerStats.skillPoints > 0 && (
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2.5 py-0.5 rounded text-xs font-black animate-pulse">
              보유 스킬 포인트: {playerStats.skillPoints} SP
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openConfirmModal({
            title: "스킬 포인트 초기화",
            message: "모든 스킬에 투자된 스킬 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n(장착된 스킬 룬과 룬워드 효과는 그대로 유지됩니다)",
            confirmText: "스킬 초기화",
            type: "warning",
            onConfirm: resetSkillPoints
          })}
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

      {/* 4 Equipped Skill Quick Slots Bar */}
      <div className="mb-4 p-3 rounded-lg bg-iron-900/90 border border-iron-750">
        <div className="text-[11px] font-cinzel font-bold text-gray-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-brass-300 font-black">
            <Layers className="w-3.5 h-3.5" />
            현재 장착된 4대 액티브 스킬 슬롯 (Q / W / E / R)
          </span>
          <span className="text-[10px] text-gray-400">스킬을 선택한 뒤 아래 버튼으로 원하는 슬롯에 즉시 장착</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['Q', 'W', 'E', 'R'] as const).map(slot => {
            const skillId = equippedSkillSlots[slot];
            const sk = getSkillById(skillId) || ALL_AVAILABLE_SKILLS[0];
            const isTargetSelected = sk.id === selectedSkillId;
            const rId = skillRunes[sk.id] || sk.activeRuneId;
            const currentRune = SKILL_RUNES_DATA.find(r => r.id === rId);

            return (
              <button
                key={slot}
                onClick={() => setSelectedSkillId(sk.id)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative shadow ${
                  isTargetSelected
                    ? 'bg-blood-950/70 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'bg-iron-950 border-iron-800 hover:border-iron-600 hover:bg-iron-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded bg-iron-900 border border-iron-700 font-mono font-black text-xs text-brass-300 flex items-center justify-center">
                    {slot}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    Lv.{skillLevels[sk.id] || 1}
                  </span>
                </div>
                <div className="font-bold text-gray-100 text-xs truncate mt-1">
                  {sk.name.split(' ')[0]}
                </div>
                <div className="text-[9px] truncate mt-0.5" style={{ color: currentRune?.color || '#9ca3af' }}>
                  {currentRune ? currentRune.name.split(' ')[0] : '기본'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: All Available Skills Library */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-cinzel font-bold text-gray-300 px-1 flex items-center justify-between">
            <span>워리어 스킬 라이브러리</span>
            <span className="text-[10px] text-gray-400 font-mono">레벨업 시 위력 +15%/Lv</span>
          </div>

          {ALL_AVAILABLE_SKILLS.map(skill => {
            const isSelected = skill.id === selectedSkillId;
            const sLevel = skillLevels[skill.id] || 1;
            const unlocked = isSkillUnlocked(skill.id, playerStats.level);
            const runeId = skillRunes[skill.id] || skill.activeRuneId;
            const currentRune = SKILL_RUNES_DATA.find(r => r.id === runeId);
            const assignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
              slot => equippedSkillSlots[slot] === skill.id
            );

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`p-3 rounded-lg border transition cursor-pointer relative ${
                  !unlocked
                    ? 'bg-iron-950/80 border-iron-800 opacity-60'
                    : isSelected
                    ? 'bg-iron-900 border-brass-500 ring-1 ring-brass-400/50 shadow-lg'
                    : 'bg-iron-950/80 border-iron-800 hover:border-iron-600 hover:bg-iron-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {assignedSlot ? (
                      <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-500 font-mono font-black text-xs text-emerald-300 flex items-center justify-center">
                        {assignedSlot}
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded bg-iron-900 border border-iron-800 font-mono text-[10px] text-gray-500 flex items-center justify-center">
                        -
                      </span>
                    )}
                    <span className="font-bold text-white text-sm tracking-wide">
                      {skill.name}
                    </span>
                    <span className="text-xs font-mono font-black px-1.5 py-0.2 rounded bg-iron-900 text-amber-300 border border-iron-750">
                      {unlocked ? getSkillDamageText(skill, totalStats, sLevel, runeId) : `Lv.${skill.unlockLevel} 해금`}
                    </span>
                  </div>

                  {unlocked ? (
                    <SkillUpgradeButtons
                      skillId={skill.id}
                      sLevel={sLevel}
                      availablePoints={playerStats.skillPoints}
                      onUpgrade={upgradeSkill}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono font-bold">잠김</span>
                  )}
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

        {/* Right Column: Skill Slot Assignment & Rune Customization Shrine */}
        <div className="lg:col-span-7 bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-4 shadow">
          {/* Selected Skill Header */}
          <div className="border-b border-iron-750 pb-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
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

              {isSelectedUnlocked && (
                <SkillUpgradeButtons
                  skillId={selectedSkill.id}
                  sLevel={currentSkillLv}
                  availablePoints={playerStats.skillPoints}
                  onUpgrade={upgradeSkill}
                />
              )}
            </div>

            {/* Quick Slot Assignment Buttons */}
            {isSelectedUnlocked ? (
              <div className="pt-2 border-t border-iron-800/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5 text-brass-400" />
                  <span>단축키 슬롯 장착:</span>
                  {currentAssignedSlot && (
                    <span className="text-emerald-400 font-mono font-black">[{currentAssignedSlot} 슬롯 사용중]</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {(['Q', 'W', 'E', 'R'] as const).map(slot => {
                    const isCurrentSlot = equippedSkillSlots[slot] === selectedSkill.id;
                    return (
                      <button
                        key={slot}
                        onClick={() => equipSkillToSlot(slot, selectedSkill.id)}
                        className={`px-3 py-1 rounded font-mono font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                          isCurrentSlot
                            ? 'bg-emerald-600 text-white border border-emerald-400 shadow ring-1 ring-emerald-300'
                            : 'bg-iron-950 hover:bg-iron-800 text-brass-300 border border-iron-700 hover:border-brass-400'
                        }`}
                        title={`${slot} 슬롯에 이 스킬 장착`}
                      >
                        {isCurrentSlot && <Check className="w-3 h-3" />}
                        <span>{slot} 슬롯</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded bg-iron-950 border border-iron-800 text-xs text-amber-300/80 font-mono">
                🔒 캐릭터 레벨 {selectedSkill.unlockLevel}에 도달하면 해금 및 슬롯 장착이 가능합니다.
              </div>
            )}
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
