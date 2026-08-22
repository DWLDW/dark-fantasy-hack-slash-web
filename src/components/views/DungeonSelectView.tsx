import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA } from '../../data/gameData';
import { DungeonInfo } from '../../types/game';
import { Compass, Flame, Shield, Sparkles, Trophy, ArrowRight, Skull, Gem } from 'lucide-react';

const DUNGEON_RUNE_LABELS: Record<string, string> = {
  act1_crypt: '#1~#9 (El ~ Ort)',
  act2_tomb: '#7~#16 (Tal ~ Io)',
  act3_jungle: '#15~#23 (Hel ~ Mal)',
  act4_chaos: '#20~#29 (Lem ~ Sur)',
  act5_worldstone: '#25~#33 (Lo ~ Zod)'
};

export const DungeonSelectView: React.FC = () => {
  const { enterDungeon, setViewMode, playerStats } = useGame();
  
  // Auto-select recommended dungeon based on player level
  const defaultRecommended = DUNGEONS_DATA.find(d => playerStats.level <= d.recommendedLevel + 4) || DUNGEONS_DATA[0];
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonInfo>(defaultRecommended);

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-3 pb-20 select-none overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-iron-750 pb-2.5">
        <div>
          <h1 className="text-lg md:text-2xl font-cinzel font-black text-brass-200 flex items-center gap-2">
            <Compass className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            <span>던전 선택 (5대 Act 원정)</span>
          </h1>
          <p className="text-[11px] md:text-xs text-gray-300 mt-0.5 font-medium">
            현재 레벨(Lv.{playerStats.level})에 적합한 막을 선택하세요. 상위 던전일수록 종결 룬과 엘리트 장비가 드랍됩니다.
          </p>
        </div>

        <button
          onClick={() => setViewMode('town')}
          className="px-3 py-1.5 bg-iron-850 hover:bg-iron-750 border border-iron-600 text-gray-200 hover:text-white rounded text-xs font-bold transition shadow"
        >
          마을 복귀
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        {/* Left 4 Cols: 5 Act Dungeons List */}
        <div className="lg:col-span-4 space-y-2">
          <h2 className="font-cinzel font-bold text-xs sm:text-sm text-gray-200 border-b border-iron-750 pb-1.5">
            원정 가능한 5대 막(Acts)
          </h2>

          {DUNGEONS_DATA.map(dungeon => {
            const isSelected = selectedDungeon.id === dungeon.id;
            const isRecommended = defaultRecommended.id === dungeon.id;
            const runeRange = DUNGEON_RUNE_LABELS[dungeon.id] || '#1~#10';

            return (
              <div
                key={dungeon.id}
                onClick={() => setSelectedDungeon(dungeon)}
                className={`p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between shadow ${
                  isSelected
                    ? 'bg-blood-950/80 border-brass-400 ring-2 ring-brass-400/80 shadow-[0_0_12px_rgba(222,178,67,0.3)]'
                    : 'bg-iron-900 border-iron-750 hover:border-iron-600 hover:bg-iron-850'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-cinzel font-black text-xs sm:text-sm text-gray-100">
                        {dungeon.name}
                      </h3>
                      {isRecommended && (
                        <span className="text-[9px] bg-blood-600 text-white font-bold px-1 py-0.2 rounded animate-pulse">
                          추천
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-300 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>권장 Lv.{dungeon.recommendedLevel}+</span>
                      <span className="text-amber-400 font-bold">| {dungeon.difficulty}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${
                    dungeon.difficulty === '쉬움' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
                    dungeon.difficulty === '보통' ? 'bg-blue-950 border-blue-500 text-blue-300' :
                    dungeon.difficulty === '어려움' ? 'bg-amber-950 border-amber-500 text-amber-300' :
                    'bg-blood-950 border-blood-500 text-blood-300'
                  }`}>
                    {dungeon.difficulty}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-iron-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400 truncate max-w-[180px]">{dungeon.theme}</span>
                  <span className="text-purple-300 font-bold bg-iron-950 px-1.5 py-0.5 rounded border border-purple-900 flex items-center gap-1">
                    <Gem className="w-3 h-3 text-purple-400" />
                    <span>{runeRange}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 8 Cols: Selected Dungeon Detailed Briefing */}
        <div className="lg:col-span-8 bg-iron-900/90 p-3 sm:p-4 md:p-6 rounded-lg border-2 border-iron-750 flex flex-col justify-between space-y-3 md:space-y-4 shadow-md">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-iron-750 pb-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-amber-200 bg-amber-950/80 border border-amber-500 px-2 py-0.5 rounded font-bold">
                    권장 레벨: Lv.{selectedDungeon.recommendedLevel}+
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <Gem className="w-3 h-3 text-purple-400" />
                    <span>드랍 룬: {DUNGEON_RUNE_LABELS[selectedDungeon.id] || '#1~#10'}</span>
                  </span>
                </div>
                <h2 className="font-cinzel font-black text-base sm:text-xl md:text-2xl text-brass-200 mt-1.5">
                  {selectedDungeon.name}
                </h2>
                <p className="text-xs text-gray-300 mt-0.5 italic font-medium">
                  "{selectedDungeon.theme}"
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-gray-200 bg-iron-950 p-2 rounded-lg border border-iron-700 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-yellow-300 font-black sm:justify-end text-xs">
                  <Trophy className="w-3.5 h-3.5" />
                  최고: {selectedDungeon.bestClearTime}
                </div>
                <div className="text-[11px] text-gray-400 font-bold mt-0.5">
                  최대 Chain: x{selectedDungeon.maxChainRecord}
                </div>
              </div>
            </div>

            {/* Tactical Intelligence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs font-mono">
              <div className="p-2.5 sm:p-3 bg-iron-950 rounded-lg border border-iron-750 space-y-1 shadow">
                <div className="font-bold text-gray-100 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Skull className="w-3.5 h-3.5 text-blood-400" />
                  출현 몬스터 & 편대 정보
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs leading-relaxed font-sans font-medium">
                  {selectedDungeon.monsterSummary}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-iron-950 rounded-lg border border-iron-750 space-y-1 shadow">
                <div className="font-bold text-gray-100 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  속성 및 방어 특이사항
                </div>
                <div className="text-gray-300 text-[11px] sm:text-xs leading-relaxed font-sans font-medium">
                  {selectedDungeon.elementalInfo}
                </div>
              </div>
            </div>

            {/* Target Drop Pool */}
            <div className="mt-3">
              <h3 className="font-cinzel font-bold text-xs sm:text-sm text-brass-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                주요 파밍 드랍 테이블
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDungeon.dropItems.map(item => (
                  <div
                    key={item.id}
                    className="p-2 sm:p-2.5 bg-iron-950 rounded-lg border border-iron-750 flex items-center justify-between text-xs shadow"
                  >
                    <div className="truncate mr-2">
                      <div className={`font-black font-cinzel text-xs ${
                        item.rarity === 'runeword' ? 'text-amber-300' :
                        item.rarity === 'unique' ? 'text-orange-400' :
                        item.rarity === 'set' ? 'text-emerald-400' :
                        item.rarity === 'rare' ? 'text-yellow-300' : 'text-blue-400'
                      }`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-300 font-sans font-medium mt-0.5 truncate max-w-[200px]">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase font-bold bg-iron-900 px-1.5 py-0.5 rounded border border-iron-800 flex-shrink-0">
                      {item.slot}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enter Button */}
          <div className="pt-2.5 border-t border-iron-750 flex justify-end">
            <button
              onClick={() => enterDungeon(selectedDungeon.id)}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-black rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 animate-pulse"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>[{selectedDungeon.name.split(':')[0]}] 원정 진입하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
