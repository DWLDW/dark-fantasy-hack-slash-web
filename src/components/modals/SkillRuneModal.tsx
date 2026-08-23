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

const RUNE_ICONS: Record<string, string> = {
  rune_fire: '🔥',
  rune_frost: '❄️',
  rune_lightning: '⚡',
  rune_void: '💀'
};

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
        {sLevel >= 10 ? 'MAX' : '0 SP'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <button
        {...holdProps}
        className="px-2.5 py-1 rounded font-black text-xs flex items-center justify-center transition shadow bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 ring-1 ring-brass-300 animate-pulse cursor-pointer transform active:scale-95 select-none font-mono"
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
          className="px-2 py-1 rounded font-mono font-black text-xs flex items-center justify-center transition shadow bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 cursor-pointer transform active:scale-95 select-none"
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
  const currentRune = SKILL_RUNES_DATA.find(r => r.id === activeRuneId);
  const currentSkillLv = skillLevels[selectedSkill.id] || 1;
  const levelDamageBonus = (currentSkillLv - 1) * 15;
  const isSelectedUnlocked = isSkillUnlocked(selectedSkill.id, playerStats.level);

  // Find which slot the selected skill is currently in
  const currentAssignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
    slot => equippedSkillSlots[slot] === selectedSkill.id
  );

  const handleResetSkills = () => {
    openConfirmModal({
      title: '스킬 포인트 초기화',
      message: '모든 스킬에 투자된 스킬 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n(장착된 스킬 룬과 룬워드 효과는 안전하게 보존됩니다)',
      confirmText: '스킬 초기화',
      type: 'warning',
      onConfirm: resetSkillPoints
    });
  };

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-3.5 sm:p-5 w-full max-w-3xl max-h-[90vh] overflow-y-auto sm:overflow-hidden shadow-2xl space-y-3 text-xs md:text-sm select-none font-sans">
      
      {/* 1. Modal Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-iron-750 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm sm:text-base font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>스킬 슬롯 & 룬 결합 성소</span>
          </h2>
          {playerStats.skillPoints > 0 && (
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2 py-0.5 rounded text-xs font-black animate-pulse font-mono">
              보유 SP: {playerStats.skillPoints}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSkills}
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

      {/* 2. 4 Active Equipped Skill Slots Bar (Q / W / E / R) */}
      <div className="p-2.5 rounded-lg bg-iron-900/90 border border-iron-750 space-y-1.5">
        <div className="text-[10px] sm:text-[11px] font-cinzel font-bold text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-brass-300 font-black">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            장착 중인 4대 액티브 스킬 슬롯
          </span>
          <span className="text-[10px] text-gray-500 hidden sm:inline">슬롯을 클릭하여 스킬 세부 설정</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['Q', 'W', 'E', 'R'] as const).map(slot => {
            const skillId = equippedSkillSlots[slot];
            const sk = getSkillById(skillId) || ALL_AVAILABLE_SKILLS[0];
            const isTargetSelected = sk.id === selectedSkillId;
            const rId = skillRunes[sk.id] || sk.activeRuneId;
            const slotRune = SKILL_RUNES_DATA.find(r => r.id === rId);

            return (
              <button
                key={slot}
                onClick={() => setSelectedSkillId(sk.id)}
                className={`p-1.5 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative shadow ${
                  isTargetSelected
                    ? 'bg-blood-950/80 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'bg-iron-950 border-iron-800 hover:border-iron-600 hover:bg-iron-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
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
                <div className="text-[9px] font-mono truncate mt-0.5 flex items-center gap-0.5" style={{ color: slotRune?.color || '#9ca3af' }}>
                  <span>{slotRune ? (RUNE_ICONS[slotRune.id] || '✨') : '⚪'}</span>
                  <span>{slotRune ? slotRune.name.split(' ')[0] : '기본'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Warrior Skills Library (Compact 4-Column Grid) */}
      <div className="space-y-1">
        <div className="text-[11px] font-cinzel font-bold text-gray-300 px-1 flex items-center justify-between">
          <span>스킬 라이브러리 (선택하여 룬 결합 및 단축키 지정)</span>
          <span className="text-[10px] text-gray-400 font-mono">레벨당 위력 +15%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {ALL_AVAILABLE_SKILLS.map(skill => {
            const isSelected = skill.id === selectedSkillId;
            const sLevel = skillLevels[skill.id] || 1;
            const unlocked = isSkillUnlocked(skill.id, playerStats.level);
            const rId = skillRunes[skill.id] || skill.activeRuneId;
            const skRune = SKILL_RUNES_DATA.find(r => r.id === rId);
            const slotKey = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
              slot => equippedSkillSlots[slot] === skill.id
            );

            return (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative ${
                  !unlocked
                    ? 'bg-iron-950/70 border-iron-850 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-iron-900 border-brass-400 ring-2 ring-brass-400/60 shadow-md'
                    : 'bg-iron-950 border-iron-800 hover:border-iron-600 hover:bg-iron-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-white truncate">
                    {skill.name}
                  </span>
                  {slotKey ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-black text-[9px]">
                      [{slotKey}]
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-gray-500">
                      Lv.{sLevel}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between w-full mt-1 text-[10px] font-mono">
                  <span className="text-amber-300 font-bold truncate">
                    {unlocked ? getSkillDamageText(skill, totalStats, sLevel, rId) : `Lv.${skill.unlockLevel} 해금`}
                  </span>
                  {skRune && (
                    <span className="text-[9px]" style={{ color: skRune.color }}>
                      {RUNE_ICONS[skRune.id] || '✨'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Skill Details & Slot Binding */}
      <div className="p-3 bg-iron-900/90 rounded-lg border border-iron-750 space-y-2.5 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-iron-800 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-cinzel font-black text-brass-200">
                {selectedSkill.name}
              </span>
              <span className="font-mono font-black text-amber-300 text-xs px-2 py-0.5 rounded bg-iron-950 border border-iron-750">
                Lv.{currentSkillLv}/10 (+{levelDamageBonus}%)
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {selectedSkill.rageCost > 0 ? `분노 ${selectedSkill.rageCost}` : '분노 0'}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 font-mono mt-0.5">
              {selectedSkill.description}
            </p>
          </div>

          {/* SP Upgrade & Slot Assign */}
          <div className="flex items-center gap-2 flex-wrap">
            {isSelectedUnlocked && (
              <SkillUpgradeButtons
                skillId={selectedSkill.id}
                sLevel={currentSkillLv}
                availablePoints={playerStats.skillPoints}
                onUpgrade={upgradeSkill}
              />
            )}

            {/* Quick Slot Assign Buttons */}
            {isSelectedUnlocked ? (
              <div className="flex items-center gap-1 font-mono text-xs">
                {(['Q', 'W', 'E', 'R'] as const).map(slot => {
                  const isCurrentSlot = equippedSkillSlots[slot] === selectedSkill.id;
                  return (
                    <button
                      key={slot}
                      onClick={() => equipSkillToSlot(slot, selectedSkill.id)}
                      className={`px-2.5 py-1 rounded font-black text-[11px] transition cursor-pointer flex items-center gap-0.5 ${
                        isCurrentSlot
                          ? 'bg-emerald-600 text-white border border-emerald-400 shadow ring-1 ring-emerald-300'
                          : 'bg-iron-950 hover:bg-iron-800 text-brass-300 border border-iron-700 hover:border-brass-400'
                      }`}
                    >
                      {isCurrentSlot && <Check className="w-3 h-3" />}
                      <span>{slot} 슬롯</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] text-amber-400 font-mono">
                🔒 Lv.{selectedSkill.unlockLevel} 해금 필요
              </span>
            )}
          </div>
        </div>

        {/* 5. 5 Elemental Skill Runes Selector (아이콘 + 설명 하단에 깔끔하게 표시) */}
        <div className="space-y-1.5">
          <div className="text-[10px] sm:text-[11px] font-cinzel font-bold text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1 text-purple-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              스킬 룬 각인 (클릭 시 즉시 결합)
            </span>
            <span className="text-[9px] text-gray-400">원하는 속성을 클릭하여 활성화</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {/* Base Rune Option */}
            <button
              onClick={() => setSkillRune(selectedSkill.id, null)}
              className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                !activeRuneId
                  ? 'bg-iron-900 border-brass-400 ring-2 ring-brass-400 text-brass-200 shadow'
                  : 'bg-iron-950 border-iron-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="text-base">⚪</span>
              <span className="text-[10px] font-bold mt-0.5">기본 각인</span>
              <span className="text-[8px] text-gray-500 font-mono">{!activeRuneId ? '각인됨' : '선택'}</span>
            </button>

            {/* 4 Elemental Runes */}
            {SKILL_RUNES_DATA.map(rune => {
              const isActive = activeRuneId === rune.id;
              const icon = RUNE_ICONS[rune.id] || '✨';

              return (
                <button
                  key={rune.id}
                  onClick={() => setSkillRune(selectedSkill.id, rune.id)}
                  className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    isActive
                      ? 'border-2 shadow-md bg-iron-950 ring-2'
                      : 'bg-iron-950 border-iron-800 hover:border-iron-600'
                  }`}
                  style={{
                    borderColor: isActive ? rune.color : undefined,
                    boxShadow: isActive ? `0 0 10px ${rune.color}50` : undefined
                  }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-[10px] font-bold mt-0.5 truncate w-full" style={{ color: rune.color }}>
                    {rune.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: isActive ? rune.color : '#6b7280' }}>
                    {isActive ? '각인됨' : '각인'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Active Rune Description Box */}
          <div className="p-2 rounded-lg bg-iron-950 border border-iron-800 text-[11px] font-mono flex items-center justify-between gap-2 animate-fade-in">
            {currentRune ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{RUNE_ICONS[currentRune.id] || '✨'}</span>
                <div>
                  <div className="font-bold flex items-center gap-1.5" style={{ color: currentRune.color }}>
                    <span>{currentRune.name}</span>
                    <span className="text-[9px] px-1 rounded bg-iron-900 border border-iron-750 text-gray-300">
                      {currentRune.specialEffectName}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-300 mt-0.5">
                    {currentRune.description}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-base">⚪</span>
                <span>기본 각인 상태입니다. 상단 룬을 클릭하여 화염, 냉기, 번개, 공허의 고유 전술 효과를 각인하세요.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SkillRuneModal.displayName = 'SkillRuneModal';
