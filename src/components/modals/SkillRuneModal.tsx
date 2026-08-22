import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { WARRIOR_SKILLS, SKILL_RUNES_DATA } from '../../data/gameData';
import { Skill, SkillRune } from '../../types/game';
import { X, Sparkles, Zap, Flame, Snowflake, Skull, Droplets, Moon, Check, Shield } from 'lucide-react';

export const SkillRuneModal: React.FC = () => {
  const { skillRunes, setSkillRune, closeModal, addLog } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<Skill>(WARRIOR_SKILLS[0]);

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
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            스킬 룬 제단 (Skill Rune Sanctuary)
          </h2>
        </div>
        <button
          onClick={closeModal}
          className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left 5 Cols: Skill Selector */}
        <div className="md:col-span-5 space-y-2">
          <h3 className="font-cinzel font-bold text-gray-200 border-b border-iron-750 pb-1.5">
            광전사 스킬 목록
          </h3>
          {WARRIOR_SKILLS.map(skill => {
            const equippedRuneId = skillRunes[skill.id] || skill.activeRuneId;
            const equippedRune = SKILL_RUNES_DATA.find(r => r.id === equippedRuneId);
            const isSelected = selectedSkill.id === skill.id;

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between shadow ${
                  isSelected
                    ? 'bg-blood-950 border-brass-400 ring-2 ring-brass-400/80'
                    : 'bg-iron-900 border-iron-750 hover:border-iron-600 hover:bg-iron-850'
                }`}
              >
                <div>
                  <div className="font-bold text-gray-100 flex items-center gap-1.5 text-xs md:text-sm">
                    <span>{skill.name}</span>
                    <span className="text-xs text-amber-300 font-mono font-bold bg-iron-950 px-1 rounded border border-iron-700">
                      [{skill.hotkey}]
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-mono mt-0.5">
                    {skill.rageCost > 0 ? (
                      <span className="text-amber-400">분노 {skill.rageCost}</span>
                    ) : (
                      <span className="text-emerald-400">기본기</span>
                    )}
                    <span className="ml-1 text-gray-400">| x{skill.damageMultiplier}</span>
                  </div>
                </div>

                {equippedRune && (
                  <span
                    className="text-xs px-2 py-0.5 rounded font-mono font-bold border flex items-center gap-1 shadow"
                    style={{ borderColor: equippedRune.color, color: equippedRune.color, backgroundColor: '#11151f' }}
                  >
                    {getElementIcon(equippedRune.element)}
                    <span className="hidden sm:inline">{equippedRune.name.split(' ')[0]}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Rune Selection & Modification Panel */}
        <div className="md:col-span-7 bg-iron-900 p-4 rounded-lg border-2 border-iron-750 flex flex-col justify-between space-y-4 shadow-md">
          <div>
            <div className="flex justify-between items-start border-b border-iron-750 pb-2.5 mb-3">
              <div>
                <h3 className="font-cinzel font-black text-base text-brass-200">
                  {selectedSkill.name} 룬 변주
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 font-medium">
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
              <div className="text-xs font-bold text-gray-200">장착할 룬 속성 선택:</div>
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
