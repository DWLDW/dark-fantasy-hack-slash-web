import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
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

export const SkillRuneModal: React.FC = () => {
  const {
    playerStats,
    skillRunes,
    setSkillRune,
    skillLevels,
    upgradeSkill,
    resetSkillPoints,
    closeModal,
    addLog
  } = useGame();

  const [selectedSkillId, setSelectedSkillId] = useState<string>(WARRIOR_SKILLS[0].id);

  const selectedSkill = WARRIOR_SKILLS.find(s => s.id === selectedSkillId) || WARRIOR_SKILLS[0];
  const currentSkillLevel = skillLevels[selectedSkill.id] || 1;
  const currentRuneId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId || 'rune_fire';
  const currentRune = SKILL_RUNES_DATA.find(r => r.id === currentRuneId) || SKILL_RUNES_DATA[0];

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire': return <Flame className="w-4 h-4 text-red-400" />;
      case 'cold': return <Snowflake className="w-4 h-4 text-sky-400" />;
      case 'lightning': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'poison': return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'void': return <Moon className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleSelectRune = (rune: SkillRune) => {
    setSkillRune(selectedSkill.id, rune.id);
    addLog(`[${selectedSkill.name}]에 [${rune.name}]을(를) 장착했습니다.`, 'system');
  };

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Top Header & Skill Point Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            스킬 제단 & 룬 변주 (Skill Altar & Runes)
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-mono font-black text-xs shadow animate-pulse">
              남은 SP: {playerStats.skillPoints} P
            </span>
            <button
              onClick={resetSkillPoints}
              className="px-2 py-1 rounded bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition shadow"
              title="투자한 모든 스킬 포인트를 회수합니다"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          </div>
        </div>
        <button
          onClick={closeModal}
          className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left 5 Cols: Skill Selector & Skill Level Up [+] Buttons */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="flex justify-between items-center border-b border-iron-750 pb-1.5">
            <h3 className="font-cinzel font-bold text-gray-200">광전사 스킬 목록</h3>
            <span className="text-[11px] text-gray-400 font-mono">레벨 강화 (+15%/Lv)</span>
          </div>

          {WARRIOR_SKILLS.map(skill => {
            const equippedRuneId = skillRunes[skill.id] || skill.activeRuneId;
            const equippedRune = SKILL_RUNES_DATA.find(r => r.id === equippedRuneId);
            const isSelected = selectedSkill.id === skill.id;
            const sLevel = skillLevels[skill.id] || 1;
            const canUpgrade = playerStats.skillPoints > 0 && sLevel < (skill.maxLevel || 10);

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between shadow relative ${
                  isSelected
                    ? 'bg-blood-950/80 border-brass-400 ring-2 ring-brass-400/80'
                    : 'bg-iron-900 border-iron-750 hover:border-iron-600 hover:bg-iron-850'
                }`}
              >
                <div>
                  <div className="font-bold text-gray-100 flex items-center gap-1.5 text-xs md:text-sm">
                    <span>{skill.name}</span>
                    <span className="text-xs text-amber-300 font-mono font-bold bg-iron-950 px-1.5 py-0.5 rounded border border-iron-700">
                      Lv.{sLevel}
                    </span>
                  </div>

                  {/* Skill Resource & Effect Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
                    {skill.rageCost > 0 ? (
                      <span className="text-amber-400 font-bold bg-iron-950 px-1 rounded border border-amber-800">
                        소모 {skill.rageCost}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold bg-iron-950 px-1 rounded border border-emerald-800">
                        자원 0
                      </span>
                    )}

                    {skill.rageGainPerHit && skill.rageGainPerHit > 0 && (
                      <span className="text-yellow-300 font-bold bg-iron-950 px-1 rounded border border-yellow-700">
                        ⚡ 타격당 +{skill.rageGainPerHit}
                      </span>
                    )}

                    {skill.lifeStealPercent && skill.lifeStealPercent > 0 && (
                      <span className="text-rose-400 font-bold bg-iron-950 px-1 rounded border border-rose-800">
                        🩸 흡혈 {skill.lifeStealPercent}%
                      </span>
                    )}

                    <span className="text-gray-400 font-bold">
                      x{(skill.damageMultiplier * (1 + (sLevel - 1) * 0.15)).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Level Up [+] Button */}
                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => upgradeSkill(skill.id)}
                    disabled={!canUpgrade}
                    className={`w-7 h-7 rounded-md font-black text-xs flex items-center justify-center transition shadow ${
                      canUpgrade
                        ? 'bg-gradient-to-br from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 ring-1 ring-brass-300 animate-pulse'
                        : 'bg-iron-800 text-gray-600 border border-iron-700 cursor-not-allowed'
                    }`}
                    title={canUpgrade ? `스킬 레벨 ${sLevel + 1}로 강화` : '스킬 포인트 부족 또는 최대 레벨'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Rune Selection & Modification Panel */}
        <div className="md:col-span-7 bg-iron-900 p-4 rounded-lg border-2 border-iron-750 flex flex-col justify-between space-y-4 shadow-md">
          <div>
            <div className="flex justify-between items-start border-b border-iron-750 pb-2.5 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel font-black text-base text-brass-200">
                    {selectedSkill.name} (Lv.{currentSkillLevel})
                  </h3>
                  <span className="text-xs text-amber-300 font-mono font-bold bg-iron-950 px-2 py-0.5 rounded border border-amber-600">
                    실제 위력 배수: x{(selectedSkill.damageMultiplier * (1 + (currentSkillLevel - 1) * 0.15)).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>
            </div>

            {/* Currently Active Rune Status Banner */}
            <div className="p-3 rounded-lg border-2 mb-3 bg-iron-950 space-y-1 shadow" style={{ borderColor: currentRune.color }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: currentRune.color }}>
                  {getElementIcon(currentRune.element)}
                  장착 중: {currentRune.name}
                </span>
                <span className="text-[11px] font-mono text-gray-300 font-bold bg-iron-900 px-2 py-0.5 rounded border border-iron-750">
                  {currentRune.specialEffectName}
                </span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans font-medium">
                {currentRune.description}
              </p>
              <div className="text-[11px] text-brass-300 font-mono font-bold pt-1 border-t border-iron-800 flex justify-between">
                <span>스킬 피해량: +{currentRune.damageBonusPercent}%</span>
                <span>오버킬 전이: +{currentRune.overkillBonusPercent}%</span>
              </div>
            </div>

            {/* 5 Elemental Runes Grid */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-gray-200">속성 룬 변주 선택:</div>
              <div className="space-y-2">
                {SKILL_RUNES_DATA.map(rune => {
                  const isEquipped = currentRuneId === rune.id;

                  return (
                    <button
                      key={rune.id}
                      onClick={() => handleSelectRune(rune)}
                      className={`w-full p-2.5 rounded-lg border-2 text-left transition flex items-center justify-between shadow ${
                        isEquipped
                          ? 'bg-iron-950 border-brass-400 ring-2 ring-brass-400/70'
                          : 'bg-iron-950/70 border-iron-750 hover:border-iron-600 hover:bg-iron-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-iron-900 border border-iron-700">
                          {getElementIcon(rune.element)}
                        </div>
                        <div>
                          <div className="font-bold text-xs md:text-sm text-gray-100 flex items-center gap-1.5">
                            <span>{rune.name}</span>
                            {isEquipped && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className="text-[11px] text-gray-300 font-medium">
                            {rune.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px] text-brass-300 font-bold hidden sm:block">
                        <div>피해 +{rune.damageBonusPercent}%</div>
                        <div>오버킬 +{rune.overkillBonusPercent}%</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
