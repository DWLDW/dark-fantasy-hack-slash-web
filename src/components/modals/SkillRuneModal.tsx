import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { WARRIOR_SKILLS } from '../../data/gameData';
import { Skill, GameItem } from '../../types/game';
import { X, Sparkles, Zap, Flame, Wind, Shield, Sword } from 'lucide-react';

export const SkillRuneModal: React.FC = () => {
  const { inventory, closeModal, addLog } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<Skill>(WARRIOR_SKILLS[0]);
  const [socketedRunes, setSocketedRunes] = useState<Record<string, string>>({
    slash: 'Flame Rune'
  });

  const runeItems = inventory.filter(i => i.slot === 'rune');

  const handleSocketRune = (skillId: string, runeName: string) => {
    setSocketedRunes(prev => ({ ...prev, [skillId]: runeName }));
    addLog(`[${selectedSkill.name}]에 [${runeName}]을(를) 장착했습니다.`, 'system');
  };

  const handleRemoveRune = (skillId: string) => {
    setSocketedRunes(prev => {
      const copy = { ...prev };
      delete copy[skillId];
      return copy;
    });
    addLog(`[${selectedSkill.name}]의 룬을 해제했습니다.`, 'system');
  };

  return (
    <div className="bg-iron-950 border border-brass-600/80 rounded-md p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-800 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-cinzel font-bold text-brass-300 tracking-wider">
            스킬 & 룬 제단 (Skill & Rune Forge)
          </h2>
        </div>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-100 p-1 rounded hover:bg-iron-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left 5 Cols: Skill List */}
        <div className="md:col-span-5 space-y-2">
          <h3 className="font-cinzel font-bold text-gray-300 border-b border-iron-800 pb-1">
            광전사 스킬 목록
          </h3>
          {WARRIOR_SKILLS.map(skill => {
            const hasRune = socketedRunes[skill.id];
            const isSelected = selectedSkill.id === skill.id;

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className={`p-2.5 rounded border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blood-950/50 border-brass-500 ring-1 ring-brass-500/50'
                    : 'bg-iron-900/60 border-iron-800 hover:border-iron-700'
                }`}
              >
                <div>
                  <div className="font-bold text-gray-200 flex items-center gap-1.5">
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">[{skill.hotkey}]</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    분노 소모: {skill.rageCost} | 위력: x{skill.damageMultiplier}
                  </div>
                </div>

                {hasRune && (
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-1.5 py-0.5 rounded font-mono">
                    ✦ {hasRune.split(' ')[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Rune Socketing Panel */}
        <div className="md:col-span-7 bg-iron-900/60 p-4 rounded border border-iron-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start border-b border-iron-800 pb-2 mb-3">
              <div>
                <h3 className="font-cinzel font-bold text-base text-brass-300">
                  {selectedSkill.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  경로 유형: <span className="text-orange-400 font-bold uppercase">{selectedSkill.route}</span> | 오버킬 효율: <span className="text-orange-400 font-bold">{selectedSkill.overkillEfficiency * 100}%</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {selectedSkill.description}
            </p>

            {/* Socket Box */}
            <div className="bg-iron-950 p-3 rounded border border-iron-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-300">룬 소켓 (Rune Socket):</span>
                {socketedRunes[selectedSkill.id] ? (
                  <button
                    onClick={() => handleRemoveRune(selectedSkill.id)}
                    className="text-[11px] text-blood-400 hover:text-blood-300 underline"
                  >
                    소켓 해제
                  </button>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-3 p-2 bg-iron-900 rounded border border-dashed border-brass-600/50">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  {socketedRunes[selectedSkill.id] ? (
                    <div className="font-bold text-purple-300 text-xs">
                      {socketedRunes[selectedSkill.id]} 장착됨
                      <div className="text-[10px] text-gray-400 font-normal">
                        효과: 스킬 적중 시 잔여 피해를 광역 화염 폭발로 변환합니다.
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs italic">
                      장착된 룬이 없습니다. 아래 소지한 룬을 선택해 결합하세요.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Available Runes */}
          <div className="border-t border-iron-800 pt-3">
            <h4 className="font-bold text-gray-300 text-xs mb-2">보유 중인 룬</h4>
            <div className="flex flex-wrap gap-2">
              {runeItems.length > 0 ? (
                runeItems.map(rune => (
                  <button
                    key={rune.id}
                    onClick={() => handleSocketRune(selectedSkill.id, rune.name)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-iron-950 hover:bg-iron-800 border border-purple-600/60 rounded text-purple-300 text-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{rune.name}</span>
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-xs italic py-2">
                  소지품에 사용 가능한 룬이 없습니다. 던전에서 룬을 파밍하세요.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
