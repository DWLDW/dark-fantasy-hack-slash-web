import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { ALL_AVAILABLE_SKILLS, SKILL_RUNES_DATA, isSkillUnlocked, getSkillById, getSkillDamageText } from '../../data/skills';
import {
  X,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Plus,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Snowflake,
  Skull
} from 'lucide-react';

const RUNE_ICONS: Record<string, string> = {
  rune_fire: '🔥',
  rune_frost: '❄️',
  rune_lightning: '⚡',
  rune_void: '💀'
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

  // Selected Target Slot for quick one-click assignment (Q / W / E / R)
  const [selectedSlot, setSelectedSlot] = useState<'Q' | 'W' | 'E' | 'R' | null>('Q');
  const [selectedSkillId, setSelectedSkillId] = useState<string>(equippedSkillSlots['Q'] || 'slash');

  const selectedSkill = ALL_AVAILABLE_SKILLS.find(s => s.id === selectedSkillId) || ALL_AVAILABLE_SKILLS[0];
  const activeRuneId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const currentRune = SKILL_RUNES_DATA.find(r => r.id === activeRuneId);
  const currentSkillLv = skillLevels[selectedSkill.id] || 1;
  const levelDamageBonus = (currentSkillLv - 1) * 15;
  const isSelectedUnlocked = isSkillUnlocked(selectedSkill.id, playerStats.level);

  // Find which slot the selected skill is currently in (if any)
  const currentAssignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
    slot => equippedSkillSlots[slot] === selectedSkill.id
  );

  const canUpgrade = playerStats.skillPoints > 0 && currentSkillLv < 10 && isSelectedUnlocked;
  const maxPossible = Math.min(playerStats.skillPoints, 10 - currentSkillLv);

  const handleLevelUpHold = useHoldAction((e?: React.SyntheticEvent) => {
    if (!canUpgrade) return;
    const isShift = (e as React.MouseEvent)?.shiftKey;
    const amount = isShift ? maxPossible : 1;
    upgradeSkill(selectedSkill.id, amount);
  }, 260, 60, canUpgrade);

  const handleSlotClick = (slot: 'Q' | 'W' | 'E' | 'R') => {
    setSelectedSlot(slot);
    const assignedSkillId = equippedSkillSlots[slot];
    if (assignedSkillId) {
      setSelectedSkillId(assignedSkillId);
    }
  };

  const handleSkillCardClick = (skillId: string) => {
    setSelectedSkillId(skillId);
    const unlocked = isSkillUnlocked(skillId, playerStats.level);
    // If a target slot is active and skill is unlocked, immediately equip into that slot!
    if (selectedSlot && unlocked) {
      equipSkillToSlot(selectedSlot, skillId);
    }
  };

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
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-3.5 sm:p-5 w-full max-w-3xl max-h-[92vh] overflow-y-auto sm:overflow-hidden shadow-2xl space-y-2.5 text-xs md:text-sm select-none font-sans">
      
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-iron-750 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm sm:text-base font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>스킬 레벨업 & 단축키 슬롯 결합</span>
          </h2>
          {playerStats.skillPoints > 0 && (
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2 py-0.5 rounded text-xs font-black animate-pulse font-mono">
              보유 SP: {playerStats.skillPoints}P
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

      {/* 2. Top 4 Equipped Slots (Q / W / E / R) with Click-to-Select State */}
      <div className="p-2 sm:p-2.5 rounded-lg bg-iron-900/90 border border-iron-750 space-y-1.5">
        <div className="text-[10px] sm:text-[11px] font-cinzel font-bold text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-1 text-brass-300 font-black">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>단축키 슬롯 선택 (Q · W · E · R)</span>
          </span>
          <span className="text-[10px] font-mono text-amber-300/90">
            {selectedSlot ? (
              <span className="bg-amber-950/70 text-amber-200 px-2 py-0.5 rounded border border-amber-500/70 animate-pulse font-bold">
                ✨ [{selectedSlot}] 슬롯 선택됨 ➔ 아래 스킬 클릭 시 즉시 장착
              </span>
            ) : (
              '슬롯을 클릭한 후 아래 스킬을 선택하여 장착하세요'
            )}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['Q', 'W', 'E', 'R'] as const).map(slot => {
            const skillId = equippedSkillSlots[slot];
            const sk = getSkillById(skillId) || ALL_AVAILABLE_SKILLS[0];
            const isSlotActive = selectedSlot === slot;
            const isSkillActive = sk.id === selectedSkillId;
            const rId = skillRunes[sk.id] || sk.activeRuneId;
            const slotRune = SKILL_RUNES_DATA.find(r => r.id === rId);

            return (
              <button
                key={slot}
                onClick={() => handleSlotClick(slot)}
                className={`p-1.5 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative shadow ${
                  isSlotActive
                    ? 'bg-blood-950/90 border-brass-400 ring-2 ring-brass-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : isSkillActive
                    ? 'bg-iron-900 border-brass-500/60'
                    : 'bg-iron-950 border-iron-800 hover:border-iron-600 hover:bg-iron-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`w-5 h-5 rounded font-mono font-black text-xs flex items-center justify-center ${
                    isSlotActive ? 'bg-amber-400 text-iron-950 shadow' : 'bg-iron-900 border border-iron-700 text-brass-300'
                  }`}>
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

      {/* 3. Skill Library (Compact Grid) with '레벨제한: Lv.X' and instant slot binding */}
      <div className="space-y-1">
        <div className="text-[11px] font-cinzel font-bold text-gray-300 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>워리어 스킬 보관함</span>
            {selectedSlot && (
              <span className="text-[10px] text-amber-300 font-mono font-normal">
                (클릭 시 [{selectedSlot}] 슬롯으로 장착)
              </span>
            )}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">레벨당 계수 +15%</span>
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
                onClick={() => handleSkillCardClick(skill.id)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative ${
                  !unlocked
                    ? 'bg-iron-950/70 border-iron-850 opacity-55 cursor-not-allowed'
                    : isSelected
                    ? 'bg-iron-900 border-brass-400 ring-2 ring-brass-400/80 shadow-md'
                    : 'bg-iron-950 border-iron-800 hover:border-iron-600 hover:bg-iron-900/70'
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
                    {unlocked ? getSkillDamageText(skill, totalStats, sLevel, rId) : `레벨제한: Lv.${skill.unlockLevel}`}
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

      {/* 4. Selected Skill Detailed View, SP Counter, and Full-Width Yellow Level Up Bar */}
      <div className="p-3 bg-iron-900/90 rounded-lg border border-iron-750 space-y-2.5 shadow">
        {/* Skill Title, Damage Formula & Slot Assignment */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-iron-800 pb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-cinzel font-black text-brass-200">
                {selectedSkill.name}
              </span>
              <span className="font-mono font-black text-amber-300 text-xs px-2 py-0.5 rounded bg-iron-950 border border-iron-750">
                Lv.{currentSkillLv}/10 (+{levelDamageBonus}%)
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {selectedSkill.rageCost > 0 ? `분노 ${selectedSkill.rageCost}` : '분노 0 (자원 미소모)'}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 font-mono mt-0.5">
              {selectedSkill.description}
            </p>
          </div>

          {/* Quick Slot Assign Buttons */}
          <div className="flex items-center gap-1 font-mono text-xs flex-shrink-0">
            {isSelectedUnlocked ? (
              (['Q', 'W', 'E', 'R'] as const).map(slot => {
                const isCurrentSlot = equippedSkillSlots[slot] === selectedSkill.id;
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      equipSkillToSlot(slot, selectedSkill.id);
                      setSelectedSlot(slot);
                    }}
                    className={`px-2.5 py-1 rounded font-black text-[11px] transition cursor-pointer flex items-center gap-0.5 ${
                      isCurrentSlot
                        ? 'bg-emerald-600 text-white border border-emerald-400 shadow ring-1 ring-emerald-300'
                        : 'bg-iron-950 hover:bg-iron-800 text-brass-300 border border-iron-700 hover:border-brass-400'
                    }`}
                    title={`[${selectedSkill.name}]을 ${slot} 슬롯에 장착`}
                  >
                    {isCurrentSlot && <Check className="w-3 h-3" />}
                    <span>{slot} 슬롯</span>
                  </button>
                );
              })
            ) : (
              <span className="text-[10px] text-amber-400 font-mono bg-iron-950 px-2 py-1 rounded border border-iron-800">
                🔒 레벨제한: Lv.{selectedSkill.unlockLevel}
              </span>
            )}
          </div>
        </div>

        {/* SP Status Banner & Big Yellow Level Up Bar */}
        <div className="space-y-1.5">
          {/* SP Counter directly above the level up button */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>스킬 레벨 강화</span>
            </span>
            <span className={`font-black px-2 py-0.5 rounded border ${
              playerStats.skillPoints > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                : 'bg-iron-950 text-gray-500 border-iron-800'
            }`}>
              보유 SP: {playerStats.skillPoints}P
            </span>
          </div>

          {/* Full-width Big Yellow Level-Up Button */}
          {isSelectedUnlocked ? (
            <div className="flex items-center gap-2">
              <button
                {...handleLevelUpHold}
                disabled={!canUpgrade}
                className={`flex-1 py-2.5 px-3 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg select-none cursor-pointer transform active:scale-95 ${
                  canUpgrade
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-iron-950 ring-2 ring-amber-300 animate-pulse'
                    : currentSkillLv >= 10
                    ? 'bg-iron-900 border border-iron-750 text-emerald-400 cursor-default opacity-80'
                    : 'bg-iron-900 border border-iron-800 text-gray-500 cursor-not-allowed opacity-60'
                }`}
                title="클릭: +1Lv / Shift+클릭: MAX / 꾹 누르면 연속 레벨업"
              >
                {currentSkillLv >= 10 ? (
                  <span>✨ MAX LEVEL (최대 레벨 10 달성)</span>
                ) : canUpgrade ? (
                  <>
                    <Plus className="w-4 h-4 font-black" />
                    <span>⚡ [{selectedSkill.name}] +1 레벨업 (Lv.{currentSkillLv} ➔ Lv.{currentSkillLv + 1}) · 소모 1 SP</span>
                  </>
                ) : (
                  <span>🔒 잔여 SP 부족 (레벨업 시 SP 획득)</span>
                )}
              </button>

              {canUpgrade && maxPossible >= 2 && (
                <button
                  onClick={() => upgradeSkill(selectedSkill.id, maxPossible)}
                  className="px-3.5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono font-black text-xs shadow-md border border-amber-400 cursor-pointer transform active:scale-95 select-none flex-shrink-0"
                  title={`잔여 SP로 +${maxPossible}Lv 즉시 마스터`}
                >
                  +{maxPossible} MAX
                </button>
              )}
            </div>
          ) : (
            <div className="p-2 rounded bg-iron-950 border border-iron-800 text-center text-xs text-gray-500 font-mono">
              캐릭터 레벨이 Lv.{selectedSkill.unlockLevel}에 도달하면 이 스킬이 개방됩니다.
            </div>
          )}
        </div>

        {/* 5. 1-Line Compact Rune Engraving Bar & 1-Line Effect Description */}
        <div className="pt-1.5 border-t border-iron-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-cinzel font-bold text-gray-300">
            <span className="flex items-center gap-1 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>5대 룬 각인 (클릭 시 1열 즉시 결합)</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {currentRune ? `현재: ${currentRune.name}` : '기본 무속성 각인'}
            </span>
          </div>

          {/* 1 Single Clean Row for 5 Runes */}
          <div className="grid grid-cols-5 gap-1 font-mono text-xs">
            {/* Base Rune */}
            <button
              onClick={() => setSkillRune(selectedSkill.id, null)}
              className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                !activeRuneId
                  ? 'bg-iron-900 border-brass-400 ring-2 ring-brass-400 text-brass-200 shadow font-black'
                  : 'bg-iron-950 border-iron-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>⚪</span>
              <span className="text-[11px] font-bold">기본</span>
            </button>

            {/* 4 Elemental Runes */}
            {SKILL_RUNES_DATA.map(rune => {
              const isActive = activeRuneId === rune.id;
              const icon = RUNE_ICONS[rune.id] || '✨';

              return (
                <button
                  key={rune.id}
                  onClick={() => setSkillRune(selectedSkill.id, rune.id)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                    isActive
                      ? 'border-2 shadow-md bg-iron-950 ring-2 font-black'
                      : 'bg-iron-950 border-iron-800 hover:border-iron-600 text-gray-300'
                  }`}
                  style={{
                    borderColor: isActive ? rune.color : undefined,
                    boxShadow: isActive ? `0 0 10px ${rune.color}50` : undefined
                  }}
                >
                  <span>{icon}</span>
                  <span className="text-[11px] font-bold truncate" style={{ color: rune.color }}>
                    {rune.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 1-Line Compact Active Rune Effect Preview Box */}
          <div className="p-1.5 px-2.5 rounded-lg bg-iron-950 border border-iron-800 text-[11px] font-mono flex items-center justify-between gap-2">
            {currentRune ? (
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">{RUNE_ICONS[currentRune.id] || '✨'}</span>
                <span className="font-bold flex-shrink-0" style={{ color: currentRune.color }}>
                  [{currentRune.specialEffectName}]
                </span>
                <span className="text-[10px] text-gray-300 truncate">
                  {currentRune.description}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] truncate">
                <span>⚪ 기본 물리 속성입니다. 상단 룬을 클릭하면 화염/냉기/번개/공허 전술 효과가 각인됩니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SkillRuneModal.displayName = 'SkillRuneModal';
