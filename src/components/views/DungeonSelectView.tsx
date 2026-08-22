import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA } from '../../data/gameData';
import { DungeonInfo } from '../../types/game';
import { Compass, Flame, Shield, Sparkles, Trophy, ArrowRight, Skull } from 'lucide-react';

export const DungeonSelectView: React.FC = () => {
  const { enterDungeon, setViewMode } = useGame();
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonInfo>(DUNGEONS_DATA[0]);

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 pb-20 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-iron-750 pb-3">
        <div>
          <h1 className="text-xl md:text-2xl font-cinzel font-black text-brass-200 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            던전 원정 관문 (Dungeon Expedition Gate)
          </h1>
          <p className="text-xs md:text-sm text-gray-300 mt-0.5">
            파밍 목표에 맞는 던전을 선택하십시오. 각 던전마다 드랍 풀과 몬스터 속성이 다릅니다.
          </p>
        </div>

        <button
          onClick={() => setViewMode('town')}
          className="px-4 py-2 bg-iron-850 hover:bg-iron-750 border border-iron-600 text-gray-200 hover:text-white rounded text-xs md:text-sm font-bold transition shadow"
        >
          마을로 복귀
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 4 Cols: Dungeon List */}
        <div className="lg:col-span-4 space-y-2.5">
          <h2 className="font-cinzel font-bold text-sm text-gray-200 border-b border-iron-750 pb-2">
            탐험 가능한 던전 목록
          </h2>

          {DUNGEONS_DATA.map(dungeon => {
            const isSelected = selectedDungeon.id === dungeon.id;
            return (
              <div
                key={dungeon.id}
                onClick={() => setSelectedDungeon(dungeon)}
                className={`p-3.5 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between shadow ${
                  isSelected
                    ? 'bg-blood-950 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_12px_rgba(222,178,67,0.3)]'
                    : 'bg-iron-900 border-iron-750 hover:border-iron-600 hover:bg-iron-850'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-cinzel font-bold text-sm md:text-base text-gray-100">
                      {dungeon.name}
                    </h3>
                    <div className="text-xs text-gray-300 font-medium mt-1">
                      권장 Lv.{dungeon.recommendedLevel} | 난이도: <strong className="text-white">{dungeon.difficulty}</strong>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${
                    dungeon.difficulty === '쉬움' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
                    dungeon.difficulty === '보통' ? 'bg-blue-950 border-blue-500 text-blue-300' :
                    'bg-blood-950 border-blood-500 text-blood-300'
                  }`}>
                    {dungeon.difficulty}
                  </span>
                </div>

                <div className="mt-2 text-xs text-gray-400 font-mono">
                  {dungeon.theme}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 8 Cols: Selected Dungeon Detailed Briefing */}
        <div className="lg:col-span-8 bg-iron-900/90 p-4 md:p-6 rounded-lg border-2 border-iron-750 flex flex-col justify-between space-y-4 shadow-md">
          <div>
            <div className="flex justify-between items-start border-b border-iron-750 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-200 bg-amber-950/80 border border-amber-500 px-2.5 py-1 rounded font-bold">
                  권장 레벨: Lv.{selectedDungeon.recommendedLevel}+
                </span>
                <h2 className="font-cinzel font-black text-xl md:text-2xl text-brass-200 mt-2">
                  {selectedDungeon.name}
                </h2>
                <p className="text-xs md:text-sm text-gray-300 mt-1 italic font-medium">
                  "{selectedDungeon.theme}"
                </p>
              </div>

              <div className="text-right font-mono text-xs text-gray-200 bg-iron-950 p-2.5 rounded-lg border border-iron-700">
                <div className="flex items-center gap-1.5 text-yellow-300 font-black justify-end text-xs md:text-sm">
                  <Trophy className="w-4 h-4" />
                  최고 기록: {selectedDungeon.bestClearTime}
                </div>
                <div className="text-xs text-gray-400 font-bold mt-0.5">
                  최대 Chain: x{selectedDungeon.maxChainRecord}
                </div>
              </div>
            </div>

            {/* Tactical Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div className="p-3.5 bg-iron-950 rounded-lg border border-iron-750 space-y-1.5">
                <div className="font-bold text-gray-100 flex items-center gap-1.5 text-sm">
                  <Skull className="w-4 h-4 text-blood-400" />
                  등장 적 & 편대 정보
                </div>
                <div className="text-gray-300 text-xs leading-relaxed font-sans font-medium">
                  {selectedDungeon.monsterSummary}
                </div>
              </div>

              <div className="p-3.5 bg-iron-950 rounded-lg border border-iron-750 space-y-1.5">
                <div className="font-bold text-gray-100 flex items-center gap-1.5 text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  속성 및 방어 특이사항
                </div>
                <div className="text-gray-300 text-xs leading-relaxed font-sans font-medium">
                  {selectedDungeon.elementalInfo}
                </div>
              </div>
            </div>

            {/* Target Drop Pool */}
            <div className="mt-4">
              <h3 className="font-cinzel font-bold text-sm text-brass-300 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                목표 파밍 드랍 테이블 (Target Loot Pool)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedDungeon.dropItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-iron-950 rounded-lg border border-iron-750 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className={`font-black font-cinzel text-xs md:text-sm ${
                        item.rarity === 'runeword' ? 'text-amber-300' :
                        item.rarity === 'unique' ? 'text-orange-400' :
                        item.rarity === 'rare' ? 'text-yellow-300' : 'text-blue-400'
                      }`}>
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-300 font-sans font-medium mt-0.5 truncate max-w-[220px]">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-400 uppercase font-bold bg-iron-900 px-2 py-0.5 rounded border border-iron-800">
                      {item.slot}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enter Button */}
          <div className="pt-3.5 border-t border-iron-750 flex justify-end">
            <button
              onClick={() => enterDungeon(selectedDungeon.id)}
              className="px-7 py-3.5 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-black rounded-lg text-sm md:text-base flex items-center gap-2 shadow-2xl transition transform active:scale-95 animate-pulse"
            >
              <Flame className="w-5 h-5 text-amber-300" />
              <span>던전 진입하기 (Enter Expedition)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
