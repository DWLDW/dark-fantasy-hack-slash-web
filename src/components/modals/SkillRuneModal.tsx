import React, { useState, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { ALL_AVAILABLE_SKILLS, SKILL_RUNES_DATA, isSkillUnlocked, getSkillById, getSkillDamageText } from '../../data/skills';
import { WARRIOR_PASSIVE_SKILLS, isPassiveUnlocked } from '../../data/passiveSkills';
import { calculateResetShardCost } from '../../state/helpers/skillManager';
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
  Skull,
  Swords,
  Shield,
  Crosshair,
  HeartPulse,
  Crown,
  Dna,
  Lock
} from 'lucide-react';

const RUNE_ICONS: Record<string, string> = {
  rune_fire: '🔥',
  rune_frost: '❄️',
  rune_lightning: '⚡',
  rune_poison: '🧪',
  rune_void: '💀'
};

const PASSIVE_ICON_MAP: Record<string, React.ReactNode> = {
  Swords: <Swords className="w-5 h-5 text-amber-400" />,
  Shield: <Shield className="w-5 h-5 text-blue-400" />,
  Crosshair: <Crosshair className="w-5 h-5 text-rose-400" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-red-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-purple-400" />,
  Crown: <Crown className="w-5 h-5 text-amber-300" />
};

export const SkillRuneModal: React.FC = React.memo(() => {
  const {
    equippedSkillSlots,
    equipSkillToSlot,
    skillRunes,
    setSkillRune,
    skillLevels,
    upgradeSkill,
    passiveLevels,
    upgradePassive,
    resetSkillPoints,
    openConfirmModal,
    playerStats,
    totalStats,
    closeModal
  } = useGame();

  // Tab State: 'active' | 'passive'
  const [activeTab, setActiveTab] = useState<'active' | 'passive'>('active');

  // Selected Target Slot for quick one-click assignment (Q / W / E / R)
  const [selectedSlot, setSelectedSlot] = useState<'Q' | 'W' | 'E' | 'R' | null>('Q');
  const [selectedSkillId, setSelectedSkillId] = useState<string>(equippedSkillSlots['Q'] || 'slash');

  const selectedSkill = ALL_AVAILABLE_SKILLS.find(s => s.id === selectedSkillId) || ALL_AVAILABLE_SKILLS[0];
  const activeRuneId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const currentRune = SKILL_RUNES_DATA.find(r => r.id === activeRuneId);
  const currentSkillLv = skillLevels[selectedSkill.id] || 1;
  const maxSkillLv = selectedSkill.maxLevel || 20;
  const levelDamageBonus = (currentSkillLv - 1) * 15;
  const isSelectedUnlocked = isSkillUnlocked(selectedSkill.id, playerStats.level);

  // Find which slot the selected skill is currently in (if any)
  const currentAssignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
    slot => equippedSkillSlots[slot] === selectedSkill.id
  );

  const canUpgradeActive = playerStats.skillPoints > 0 && currentSkillLv < maxSkillLv && isSelectedUnlocked;
  const maxPossibleActive = Math.min(playerStats.skillPoints, maxSkillLv - currentSkillLv);

  const handleLevelUpHold = useHoldAction((e?: React.SyntheticEvent) => {
    if (!canUpgradeActive) return;
    const isShift = (e as React.MouseEvent)?.shiftKey;
    const amount = isShift ? maxPossibleActive : 1;
    upgradeSkill(selectedSkill.id, amount);
  }, 260, 60, canUpgradeActive);

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

  const shardCost = calculateResetShardCost(playerStats.level);

  const handleResetSkills = () => {
    openConfirmModal({
      title: '스킬 & 패시브 포인트 초기화',
      message: `모든 액티브 스킬과 패시브 스킬에 투자된 스킬 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n💎 필요 샤드: ${shardCost}개 (보유: ${playerStats.shards || 0}개)\n(장착된 스킬 룬과 룬워드 효과는 안전하게 보존됩니다)`,
      confirmText: `전액 초기화 (💎 ${shardCost}개)`,
      type: 'warning',
      onConfirm: resetSkillPoints
    });
  };

  // Passive Total Investment Calculation
  const totalPassivePointsSpent = useMemo(() => {
    return Object.values(passiveLevels).reduce((acc, lv) => acc + (lv || 0), 0);
  }, [passiveLevels]);

  const hasEnoughShards = (playerStats.shards || 0) >= shardCost;

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-3.5 sm:p-5 w-full max-w-3xl max-h-[92vh] overflow-y-auto sm:overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.18)] space-y-2.5 text-xs md:text-sm select-none font-sans ui-ornate">
      
      {/* 1. Top Header with SP Badge & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-iron-750 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm sm:text-base font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>스킬 & 패시브 마스터리</span>
          </h2>

          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 border border-amber-600/80 rounded font-mono font-bold text-amber-300 text-xs shadow">
            <span>보유 SP:</span>
            <span className="text-white font-black text-sm">{playerStats.skillPoints}</span>
            <span>P</span>
          </div>

          {totalPassivePointsSpent > 0 && (
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/80">
              투자된 패시브: {totalPassivePointsSpent}P
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSkills}
            className={`px-2.5 py-1 rounded border text-xs font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer ${
              hasEnoughShards
                ? 'bg-iron-900 hover:bg-amber-950/40 border-iron-700 hover:border-amber-500/80 text-gray-300 hover:text-amber-200'
                : 'bg-iron-950 border-iron-800 text-gray-500 opacity-70'
            }`}
            title={`투자한 모든 액티브 및 패시브 포인트를 전액 회수합니다 (필요: 샤드 ${shardCost}개)`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>전체 초기화</span>
            <span className={`text-[10px] ${hasEnoughShards ? 'text-amber-300 font-bold' : 'text-red-400'}`}>
              (💎 {shardCost})
            </span>
          </button>
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs: Active vs Passive */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-iron-900/90 rounded-lg border border-iron-800 font-cinzel font-bold text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-iron-950 font-black shadow-lg ring-1 ring-amber-300'
              : 'text-gray-400 hover:text-gray-200 hover:bg-iron-800/60'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>액티브 스킬 & 룬 각인 (Q · W · E · R)</span>
        </button>

        <button
          onClick={() => setActiveTab('passive')}
          className={`py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'passive'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 text-white font-black shadow-lg ring-1 ring-purple-300'
              : 'text-gray-400 hover:text-gray-200 hover:bg-iron-800/60'
          }`}
        >
          <Dna className="w-4 h-4 text-purple-300" />
          <span>패시브 스킬 마스터리 ({totalPassivePointsSpent}P 투자됨)</span>
        </button>
      </div>

      {/* ═══ TAB 1: ACTIVE SKILLS & RUNES ═══ */}
      {activeTab === 'active' && (
        <div className="space-y-2.5">
          {/* Top 4 Equipped Slots (Q / W / E / R) */}
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
                const assignedSkillId = equippedSkillSlots[slot];
                const skill = ALL_AVAILABLE_SKILLS.find(s => s.id === assignedSkillId);
                const isCurrentSelectedSlot = selectedSlot === slot;
                const runeId = skill ? (skillRunes[skill.id] || skill.activeRuneId) : null;
                const lv = skill ? (skillLevels[skill.id] || 1) : 1;

                return (
                  <button
                    key={slot}
                    onClick={() => handleSlotClick(slot)}
                    className={`p-1.5 rounded-lg border-2 text-left transition relative cursor-pointer ${
                      isCurrentSelectedSlot
                        ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                        : skill
                        ? 'bg-iron-950 border-iron-700 hover:border-amber-500/60'
                        : 'bg-iron-950/60 border-dashed border-iron-800 hover:border-iron-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black px-1.5 py-0.5 rounded font-mono ${
                        isCurrentSelectedSlot ? 'bg-amber-400 text-iron-950' : 'bg-iron-800 text-amber-300'
                      }`}>
                        [{slot}]
                      </span>
                      {skill && (
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          Lv.{lv}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 font-bold text-xs truncate text-gray-200">
                      {skill ? skill.name.split(' ')[0] : '비어있음'}
                    </div>

                    {skill && runeId && (
                      <div className="text-[9px] text-gray-400 truncate mt-0.5 flex items-center gap-1 font-mono">
                        <span>{RUNE_ICONS[runeId] || '🔮'}</span>
                        <span className="truncate">{SKILL_RUNES_DATA.find(r => r.id === runeId)?.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid: Left (Skill Cards) + Right (Detail, Rune, Level Up) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Left: All Available Active Skills */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <div className="text-[11px] font-cinzel font-bold text-gray-400 px-1 flex items-center justify-between">
                <span>보유 스킬 목록</span>
                <span className="text-[10px] font-mono text-gray-400">최대 Lv.{maxSkillLv}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {ALL_AVAILABLE_SKILLS.map(skill => {
                  const unlocked = isSkillUnlocked(skill.id, playerStats.level);
                  const isSelected = selectedSkill.id === skill.id;
                  const assignedSlot = (Object.keys(equippedSkillSlots) as ('Q' | 'W' | 'E' | 'R')[]).find(
                    s => equippedSkillSlots[s] === skill.id
                  );
                  const lv = skillLevels[skill.id] || 1;
                  const runeId = skillRunes[skill.id] || skill.activeRuneId;

                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleSkillCardClick(skill.id)}
                      className={`p-2 rounded-lg border transition text-left cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400 shadow'
                          : unlocked
                          ? 'bg-iron-900 border-iron-750 hover:bg-iron-850 hover:border-iron-600'
                          : 'bg-iron-950 border-iron-850 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {assignedSlot && (
                            <span className="text-[9px] font-mono font-black bg-amber-500 text-iron-950 px-1 rounded">
                              {assignedSlot}
                            </span>
                          )}
                          <span className="font-bold text-xs text-gray-200 truncate">
                            {skill.name}
                          </span>
                          {unlocked && (
                            <span className="text-[10px] font-mono text-amber-400 font-black">
                              Lv.{lv}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                          {unlocked
                            ? getSkillDamageText(skill, totalStats, lv, runeId)
                            : `Lv.${skill.unlockLevel || 1} 필요`}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isSelected && selectedSlot && unlocked && (
                          <span className="text-[10px] font-mono text-amber-300 font-black flex items-center gap-0.5 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500">
                            <Check className="w-3 h-3" /> 장착됨
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Skill Detail & Rune Socketing & Level Up */}
            <div className="p-3 rounded-lg bg-iron-900 border border-iron-750 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                {/* Skill Name & Level Up Header */}
                <div className="flex items-center justify-between border-b border-iron-750 pb-1.5">
                  <div>
                    <h3 className="font-cinzel font-black text-sm text-amber-200 flex items-center gap-1.5">
                      <span>{selectedSkill.name}</span>
                      <span className="text-xs font-mono text-amber-400 font-black">
                        Lv.{currentSkillLv} / {maxSkillLv}
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {selectedSkill.route === 'line' ? '직선 관통 (Line)' : selectedSkill.route === 'branch' ? '3레인 휩쓸기 (Branch)' : selectedSkill.route === 'radius' ? '전체 광역 (Radius)' : '단일 집중 (Single)'}
                      {levelDamageBonus > 0 && <span className="text-amber-300 font-bold ml-1.5">★ 레벨 보너스 +{levelDamageBonus}%</span>}
                    </p>
                  </div>

                  {/* Level Up Button */}
                  {canUpgradeActive && (
                    <button
                      {...handleLevelUpHold}
                      className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 font-black text-xs shadow-lg transition flex items-center gap-1 cursor-pointer animate-pulse"
                      title="클릭 시 Lv+1 (Shift+클릭 시 최대치 즉시 투자)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lv 업 ({playerStats.skillPoints}P)</span>
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-300 leading-relaxed bg-iron-950 p-2 rounded border border-iron-800">
                  {selectedSkill.description}
                </p>

                {/* Rune Inscription (Socketing) */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-cinzel font-bold text-gray-400 flex items-center justify-between">
                    <span>원소 룬 각인 (Rune Inscription)</span>
                    <span className="text-[9px] text-amber-300 font-mono">클릭 시 즉시 각인</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    {SKILL_RUNES_DATA.map(rune => {
                      const isRuneActive = activeRuneId === rune.id;
                      return (
                        <button
                          key={rune.id}
                          onClick={() => setSkillRune(selectedSkill.id, rune.id)}
                          className={`p-1.5 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                            isRuneActive
                              ? 'bg-amber-950/90 border-amber-400 ring-1 ring-amber-400 shadow'
                              : 'bg-iron-950 border-iron-800 hover:border-iron-600'
                          }`}
                          title={rune.description}
                        >
                          <span className="text-sm">{RUNE_ICONS[rune.id] || '🔮'}</span>
                          <span className="text-[9px] font-bold truncate text-gray-200">
                            {rune.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {currentRune && (
                    <div className="text-[10px] text-amber-200 font-mono bg-iron-950/80 p-1.5 rounded border border-amber-500/40 mt-1">
                      ✨ <span className="font-bold">{currentRune.name}</span>: {currentRune.specialEffectName}
                    </div>
                  )}
                </div>
              </div>

              {/* Slot Assignment Quick Bar */}
              <div className="pt-1.5 border-t border-iron-750 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>단축키 슬롯 지정:</span>
                <div className="flex items-center gap-1">
                  {(['Q', 'W', 'E', 'R'] as const).map(slot => {
                    const isEquippedHere = equippedSkillSlots[slot] === selectedSkill.id;
                    return (
                      <button
                        key={slot}
                        onClick={() => equipSkillToSlot(slot, selectedSkill.id)}
                        disabled={!isSelectedUnlocked}
                        className={`px-2 py-0.5 rounded font-black text-[10px] transition cursor-pointer ${
                          isEquippedHere
                            ? 'bg-amber-500 text-iron-950 ring-1 ring-amber-300'
                            : isSelectedUnlocked
                            ? 'bg-iron-800 hover:bg-iron-700 text-gray-300'
                            : 'bg-iron-950 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        [{slot}]
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: PASSIVE SKILLS MASTERY TREE ═══ */}
      {activeTab === 'passive' && (
        <div className="space-y-2">
          {/* Passive Grid: 8 Warrior Passives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[58vh] overflow-y-auto pr-1">
            {WARRIOR_PASSIVE_SKILLS.map(passive => {
              const currentLv = passiveLevels[passive.id] || 0;
              const isMax = currentLv >= passive.maxLevel;
              const isUnlocked = isPassiveUnlocked(passive.id, playerStats.level);
              const canUpgrade = playerStats.skillPoints > 0 && !isMax && isUnlocked;
              const maxPossible = Math.min(playerStats.skillPoints, passive.maxLevel - currentLv);

              const categoryBadge = passive.category === 'offense'
                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                : passive.category === 'defense'
                ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                : 'bg-purple-950/80 border-purple-500 text-purple-300';

              const categoryLabel = passive.category === 'offense' ? '공격 마스터리' : passive.category === 'defense' ? '방어 마스터리' : '전술 유틸리티';

              return (
                <div
                  key={passive.id}
                  className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1.5 ${
                    isMax
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                      : currentLv > 0
                      ? 'bg-iron-900/90 border-iron-700 hover:border-amber-500/60'
                      : isUnlocked
                      ? 'bg-iron-950 border-iron-800 hover:border-iron-700'
                      : 'bg-iron-950/60 border-iron-900 opacity-60'
                  }`}
                >
                  {/* Header: Icon + Title + Level + Category */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isMax ? 'bg-amber-950 border-amber-400' : 'bg-iron-900 border-iron-750'
                        }`}>
                          {PASSIVE_ICON_MAP[passive.icon] || <Dna className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-cinzel font-black text-xs sm:text-sm text-gray-200 truncate">
                            {passive.name}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${categoryBadge}`}>
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      {/* Level / Status */}
                      <div className="flex-shrink-0 text-right font-mono">
                        {isUnlocked ? (
                          <span className={`text-xs font-black px-2 py-0.5 rounded border ${
                            isMax
                              ? 'bg-amber-500 text-iron-950 border-amber-300 font-bold'
                              : currentLv > 0
                              ? 'bg-iron-800 text-amber-300 border-iron-700'
                              : 'bg-iron-900 text-gray-400 border-iron-800'
                          }`}>
                            Lv.{currentLv}/{passive.maxLevel}
                          </span>
                        ) : (
                          <span className="text-[10px] text-blood-400 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Lv.{passive.unlockLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-gray-400 leading-snug mt-1">
                      {passive.description}
                    </p>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full bg-iron-950 rounded-full h-1.5 border border-iron-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isMax ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                      }`}
                      style={{ width: `${(currentLv / passive.maxLevel) * 100}%` }}
                    />
                  </div>

                  {/* Current & Next Bonus Text */}
                  <div className="bg-iron-950/80 p-1.5 rounded-lg border border-iron-800 text-[10px] font-mono space-y-0.5">
                    {currentLv > 0 ? (
                      <div className="text-amber-300 font-bold">
                        현재 효과: {passive.statBonusText(currentLv)}
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        현재 효과: 미투자 (기본 0%)
                      </div>
                    )}
                    {!isMax && isUnlocked && (
                      <div className="text-gray-400 flex items-center gap-1">
                        <span>다음 레벨:</span>
                        <span className="text-emerald-400 font-bold">{passive.nextLevelBonusText(currentLv)}</span>
                      </div>
                    )}
                  </div>

                  {/* Upgrade Actions */}
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <span className="text-[9px] text-gray-400 font-mono">
                      {isMax ? '★ 마스터 완료' : `소모: 1P / 레벨`}
                    </span>

                    {isUnlocked && !isMax && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            if (!canUpgrade) return;
                            const amount = e.shiftKey ? maxPossible : 1;
                            upgradePassive(passive.id, amount);
                          }}
                          disabled={!canUpgrade}
                          className={`px-3 py-1 rounded font-black text-xs transition flex items-center gap-1 cursor-pointer shadow ${
                            canUpgrade
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white animate-pulse'
                              : 'bg-iron-900 text-gray-600 border border-iron-800 cursor-not-allowed'
                          }`}
                          title="클릭 시 Lv+1 (Shift+클릭 시 최대치 일괄 투자)"
                        >
                          <Plus className="w-3 h-3" />
                          <span>강화 +1</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Summary Banner */}
          <div className="p-2 rounded-lg bg-iron-900/90 border border-iron-750 flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
            <span className="text-amber-200 font-bold flex items-center gap-1">
              <Dna className="w-3.5 h-3.5 text-purple-400" />
              <span>패시브는 투자 즉시 모든 전투 스탯과 기술에 영구적으로 반영됩니다.</span>
            </span>
            <span className="text-gray-400">
              Shift + 클릭으로 최대치 일괄 투자 가능
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

SkillRuneModal.displayName = 'SkillRuneModal';
