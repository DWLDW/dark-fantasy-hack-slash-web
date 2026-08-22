import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, RUNEWORD_RECIPES, D2_RUNES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { GameItem, EquipSlot } from '../../types/game';
import { Box, Sparkles, Dices, BookOpen, ArrowRight, Shield, Flame, Compass, Hammer, CheckSquare, PlusCircle } from 'lucide-react';

export const TownView: React.FC = () => {
  const {
    playerStats,
    totalStats,
    equipment,
    inventory,
    runesVault,
    currentDungeon,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    enterDungeon,
    setViewMode,
    openModal,
    socketRuneIntoItem,
    transmuteInCube,
    gambleItem,
    identifyAllItems,
    resetGameSave,
    addLog
  } = useGame();

  const [activeFacility, setActiveFacility] = useState<'cube' | 'runewords' | 'gamble' | 'cain'>('cube');
  
  const [selectedCubeItems, setSelectedCubeItems] = useState<string[]>([]);
  const [selectedBaseItem, setSelectedBaseItem] = useState<GameItem | null>(null);
  const [selectedRuneToSocket, setSelectedRuneToSocket] = useState<GameItem | null>(null);

  // Level-based Recommended Dungeon
  const recommendedDungeon = DUNGEONS_DATA.find(d => playerStats.level <= d.recommendedLevel + 4) || DUNGEONS_DATA[DUNGEONS_DATA.length - 1];
  // Last visited dungeon for instant quick return
  const lastDungeon = currentDungeon || recommendedDungeon;

  const handleToggleCubeItem = (id: string) => {
    if (selectedCubeItems.includes(id)) {
      setSelectedCubeItems(prev => prev.filter(i => i !== id));
    } else {
      if (selectedCubeItems.length < 3) {
        setSelectedCubeItems(prev => [...prev, id]);
      } else {
        addLog('호라드릭 큐브에는 최대 3개의 재료만 넣을 수 있습니다.', 'system');
      }
    }
  };

  const handleTransmute = () => {
    transmuteInCube(selectedCubeItems);
    setSelectedCubeItems([]);
  };

  const socketableItems = inventory.filter(i => i.sockets && i.sockets > (i.socketedRunes?.length || 0));
  const availableRunes = inventory.filter(i => i.slot === 'rune');
  const unidentifiedCount = inventory.filter(i => i.isIdentified === false).length;

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-3 pb-20 select-none overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-iron-750 pb-2.5">
        <div>
          <h1 className="text-lg md:text-2xl font-cinzel font-black text-brass-200 flex items-center gap-2">
            <span>로그 캠프 (Rogue Encampment)</span>
          </h1>
          <p className="text-[11px] md:text-xs text-gray-300 mt-0.5">
            호라드릭 큐브와 룬워드로 장비를 맞추고, 기드의 상점에서 도박을 즐기며 파밍을 준비하세요.
          </p>
        </div>
        
        {/* Quick Actions (Compact for Mobile) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setViewMode('dungeon_select')}
            className="px-3 py-1.5 bg-iron-850 hover:bg-iron-750 border border-iron-600 text-gray-200 hover:text-white rounded text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>던전 선택</span>
          </button>
          
          <button
            onClick={() => enterDungeon(lastDungeon.id)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-black rounded text-xs flex items-center gap-1.5 shadow-lg transition transform active:scale-95 animate-pulse"
            title={`이전 레벨 던전 [${lastDungeon.name}]으로 즉시 출격`}
          >
            <span>[Space] 즉시 파밍 출격</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1 (3 Cols): Quick Character Status & Sockets */}
        <div className="lg:col-span-3 bg-iron-900/90 p-4 rounded-lg border-2 border-iron-750 flex flex-col justify-between space-y-3 shadow-md">
          <div>
            <div className="flex justify-between items-center border-b border-iron-750 pb-2 mb-3">
              <h2 className="font-cinzel font-bold text-gray-100 text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brass-400" />
                장비 & 룬워드 상태
              </h2>
              <button
                onClick={() => openModal('inventory')}
                className="text-xs text-brass-300 font-bold hover:underline font-mono bg-iron-950 px-2 py-0.5 rounded border border-iron-700"
              >
                [I] 가방
              </button>
            </div>

            {/* Quick Equipment List */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-iron-950 rounded border border-iron-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">무기:</span>
                  <span className={equipment.weapon?.isRuneWord ? 'text-amber-300 font-black text-sm' : 'text-gray-100 font-bold'}>
                    {equipment.weapon?.name || '맨손'}
                  </span>
                </div>
                {equipment.weapon?.socketedRunes && (
                  <div className="text-[11px] text-purple-300 font-bold mt-1 bg-iron-900 px-1.5 py-0.5 rounded border border-iron-800">
                    소켓: [{equipment.weapon.socketedRunes.join(' + ')}]
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-iron-950 rounded border border-iron-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">갑옷:</span>
                  <span className={equipment.armor?.isRuneWord ? 'text-amber-300 font-black text-sm' : 'text-gray-100 font-bold'}>
                    {equipment.armor?.name || '없음'}
                  </span>
                </div>
                {equipment.armor?.socketedRunes && (
                  <div className="text-[11px] text-purple-300 font-bold mt-1 bg-iron-900 px-1.5 py-0.5 rounded border border-iron-800">
                    소켓: [{equipment.armor.socketedRunes.join(' + ')}]
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-iron-950 rounded border border-iron-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">목걸이:</span>
                  <span className={equipment.amulet?.rarity === 'unique' ? 'text-orange-400 font-bold truncate max-w-[150px]' : 'text-yellow-300 font-bold truncate max-w-[150px]'}>
                    {equipment.amulet?.name || '없음'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-iron-950 rounded border border-iron-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">반지 (1 / 2):</span>
                  <span className="text-yellow-300 font-bold truncate max-w-[150px]">
                    {equipment.ring1?.name ? `${equipment.ring1.name.slice(0, 8)}...` : '없음'} / {equipment.ring2?.name ? `${equipment.ring2.name.slice(0, 8)}...` : '없음'}
                  </span>
                </div>
              </div>
            </div>

            {/* Combat Specs */}
            <div className="mt-3.5 pt-3 border-t border-iron-750 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-300 font-bold">물리 위력:</span>
                <span className="text-brass-200 font-black">{totalStats.minDmg} ~ {totalStats.maxDmg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 font-bold">물리 방어:</span>
                <span className="text-blue-300 font-bold">{totalStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 font-bold">치명타율:</span>
                <span className="text-yellow-300 font-bold">{totalStats.critChance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 font-bold">오버킬 효율:</span>
                <span className="text-orange-300 font-black">{totalStats.overkillEfficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 font-bold">매직 발견확률(MF):</span>
                <span className="text-purple-300 font-black">+{totalStats.fortune}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => openModal('character')}
            className="w-full py-2 bg-iron-800 hover:bg-iron-750 text-gray-100 hover:text-white border border-iron-600 rounded text-xs font-bold transition shadow"
          >
            [C] 캐릭터 스탯 상세
          </button>
        </div>

        {/* Col 2 (5 Cols): D2 Facilities (Horadric Cube, RuneWords, Gamble, Cain) */}
        <div className="lg:col-span-5 bg-iron-900/90 p-4 rounded-lg border-2 border-iron-750 flex flex-col shadow-md">
          {/* Facility Nav Tabs */}
          <div className="flex border-b border-iron-750 gap-1.5 pb-2.5">
            <button
              onClick={() => setActiveFacility('cube')}
              className={`flex-1 py-2 px-2 rounded text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeFacility === 'cube'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Box className="w-4 h-4 text-purple-400" />
              <span>호라드릭 큐브</span>
            </button>
            <button
              onClick={() => setActiveFacility('runewords')}
              className={`flex-1 py-2 px-2 rounded text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeFacility === 'runewords'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>룬워드 공방</span>
            </button>
            <button
              onClick={() => setActiveFacility('gamble')}
              className={`flex-1 py-2 px-2 rounded text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeFacility === 'gamble'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Dices className="w-4 h-4 text-yellow-400" />
              <span>기드의 도박</span>
            </button>
            <button
              onClick={() => setActiveFacility('cain')}
              className={`flex-1 py-2 px-2 rounded text-xs font-black flex items-center justify-center gap-1.5 transition relative ${
                activeFacility === 'cain'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>데커드 케인</span>
              {unidentifiedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blood-500 rounded-full animate-ping" />
              )}
            </button>
          </div>

          {/* Facility Content View */}
          <div className="flex-1 py-3">
            
            {/* 1. HORADRIC CUBE */}
            {activeFacility === 'cube' && (
              <div className="space-y-3 text-xs">
                <div className="text-gray-200 leading-relaxed font-medium">
                  호라드릭 큐브에 재료를 최대 3개 넣고 <strong className="text-amber-300 font-bold">[변환 (Transmute)]</strong> 버튼을 누르세요.
                </div>

                {/* Selected in Cube */}
                <div className="p-3 bg-iron-950 rounded-lg border-2 border-iron-750 space-y-2">
                  <div className="font-bold text-gray-200 flex justify-between">
                    <span>큐브 속 재료 ({selectedCubeItems.length}/3):</span>
                    {selectedCubeItems.length > 0 && (
                      <button onClick={() => setSelectedCubeItems([])} className="text-blood-300 font-bold hover:underline text-xs">
                        슬롯 비우기
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 min-h-[55px]">
                    {[0, 1, 2].map(idx => {
                      const itemId = selectedCubeItems[idx];
                      const item = inventory.find(i => i.id === itemId);
                      return (
                        <div key={idx} className="p-2 bg-iron-900 rounded border-2 border-dashed border-iron-650 flex items-center justify-center text-center text-xs">
                          {item ? (
                            <span className="text-brass-200 font-bold truncate">{item.name}</span>
                          ) : (
                            <span className="text-gray-500 font-mono">[빈 슬롯]</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleTransmute}
                    disabled={selectedCubeItems.length === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-40 text-white font-black rounded transition shadow text-xs md:text-sm"
                  >
                    🔮 변환 (Transmute)
                  </button>
                </div>

                {/* Inventory Picker for Cube */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-200">소지품에서 큐브에 넣을 아이템 선택:</div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {inventory.map(item => {
                      const isSelected = selectedCubeItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCubeItem(item.id)}
                          className={`p-2 rounded border cursor-pointer flex justify-between items-center transition ${
                            isSelected
                              ? 'bg-purple-950 border-purple-400 text-purple-100 font-bold'
                              : 'bg-iron-950 border-iron-700 text-gray-200 hover:bg-iron-850'
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[11px] text-gray-400 capitalize font-bold">{item.slot}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2.5 bg-iron-950 rounded border border-iron-700 text-xs text-gray-300 space-y-1">
                  <div className="font-bold text-brass-300">📜 주요 큐브 조합 레시피:</div>
                  <div>• 동일 룬 3개 ➔ 1단계 상위 룬 합성 (예: Tal 3개 ➔ Ral 1개)</div>
                  <div>• 노멀 무소켓 장비 1개 + 룬 1개 ➔ 랜덤 2~3 소켓 생성</div>
                </div>
              </div>
            )}

            {/* 2. RUNEWORDS & SOCKETING */}
            {activeFacility === 'runewords' && (
              <div className="space-y-3.5 text-xs">
                <div className="text-gray-200 font-medium">
                  빈 소켓이 있는 노멀 베이스 장비에 룬을 순서대로 박아 <strong className="text-amber-300 font-bold">전설의 룬워드</strong>를 제작하세요.
                </div>

                {/* Step 1: Base Item Selection */}
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-200 text-xs">1. 소켓 베이스 아이템 선택:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5">
                    {socketableItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedBaseItem(item)}
                        className={`p-2.5 rounded-lg border-2 text-left flex-shrink-0 min-w-[140px] transition shadow ${
                          selectedBaseItem?.id === item.id
                            ? 'bg-blood-950 border-brass-300 text-brass-100 ring-2 ring-brass-400'
                            : 'bg-iron-950 border-iron-700 text-gray-200 hover:bg-iron-850'
                        }`}
                      >
                        <div className="font-black text-xs md:text-sm truncate">{item.name}</div>
                        <div className="text-xs text-purple-300 font-bold mt-1">
                          소켓: {item.socketedRunes?.length || 0} / {item.sockets}개
                        </div>
                      </button>
                    ))}

                    {socketableItems.length === 0 && (
                      <div className="text-gray-400 italic text-xs py-2">소켓이 뚫린 장비가 없습니다.</div>
                    )}
                  </div>
                </div>

                {/* Step 2: Auto-Matching RuneWords List & One-Click Crafting */}
                {selectedBaseItem && (
                  <div className="p-3 bg-iron-950 rounded-lg border-2 border-brass-500 space-y-2">
                    <div className="flex justify-between items-center border-b border-iron-750 pb-1">
                      <div className="font-bold text-gray-100 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>[{selectedBaseItem.name}] 제작 가능 룬워드:</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {RUNEWORD_RECIPES.filter(
                        rw => rw.allowedSlot === selectedBaseItem.slot && rw.requiredSockets === selectedBaseItem.sockets
                      ).map(recipe => {
                        const sim = simulateRuneWordCrafting(recipe, runesVault);

                        return (
                          <div
                            key={recipe.id}
                            className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                              sim.canDirectCraft
                                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                                : sim.canTransmuteCraft
                                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]'
                                : 'bg-iron-900 border-iron-750 opacity-70'
                            }`}
                          >
                            <div>
                              <div className="font-black text-xs text-gray-100 flex items-center gap-1.5">
                                <span className={sim.canDirectCraft ? 'text-amber-300' : sim.canTransmuteCraft ? 'text-purple-300' : 'text-gray-300'}>
                                  {recipe.name}
                                </span>
                                <span className="text-[10px] font-mono text-purple-300 font-bold bg-iron-950 px-1 rounded border border-iron-700">
                                  [{recipe.requiredRunes.join(' + ')}]
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {sim.canDirectCraft ? (
                                  <span className="text-emerald-400 font-bold">✓ 직접 보유 룬 충족! 즉시 제작 가능</span>
                                ) : sim.canTransmuteCraft ? (
                                  <span className="text-purple-300 font-bold">🔮 하위 룬 합성으로 충당 가능!</span>
                                ) : (
                                  <span className="text-red-400 font-bold">부족: {sim.directMissingRunes.join(', ')}</span>
                                )}
                              </div>
                            </div>

                            {/* Dual Buttons */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => {
                                  craftRuneWord(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canDirectCraft}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                                  sim.canDirectCraft
                                    ? 'bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 ring-1 ring-brass-300 animate-pulse'
                                    : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                                }`}
                                title={sim.canDirectCraft ? '보유한 상위 룬으로 즉시 제작' : '해당 상위 룬 직접 부족'}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>✨ 즉시 제작</span>
                              </button>

                              <button
                                onClick={() => {
                                  craftRuneWordWithTransmute(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canTransmuteCraft}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                                  sim.canTransmuteCraft
                                    ? 'bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white ring-1 ring-purple-300'
                                    : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                                }`}
                                title={sim.canTransmuteCraft ? '하위 룬들을 자동으로 합성하여 상위 룬을 충당한 뒤 제작' : '하위 룬 총량 부족'}
                              >
                                <Hammer className="w-3.5 h-3.5" />
                                <span>🔮 합성 후 제작</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. GAMBLE (기드의 도박) */}
            {activeFacility === 'gamble' && (
              <div className="space-y-3.5 text-xs">
                <div className="text-gray-200 leading-relaxed font-medium">
                  "모든 물건에는 가치가 있는 법이지... 골드만 충분하다면 말이야."<br />
                  미확인 장비를 뽑아 대박 <strong className="text-yellow-300 font-bold">레어</strong> 및 <strong className="text-orange-400 font-bold">유니크</strong>를 노리세요!
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  <button
                    onClick={() => gambleItem('weapon')}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-iron-500 rounded-lg text-left transition space-y-1 shadow"
                  >
                    <div className="font-bold text-gray-100 text-xs md:text-sm">미확인 한손검</div>
                    <div className="text-brass-200 font-black text-xs">3,500 Gold</div>
                  </button>

                  <button
                    onClick={() => gambleItem('armor')}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-iron-500 rounded-lg text-left transition space-y-1 shadow"
                  >
                    <div className="font-bold text-gray-100 text-xs md:text-sm">미확인 중갑옷</div>
                    <div className="text-brass-200 font-black text-xs">4,000 Gold</div>
                  </button>

                  <button
                    onClick={() => gambleItem('ring')}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-iron-500 rounded-lg text-left transition space-y-1 shadow"
                  >
                    <div className="font-bold text-gray-100 text-xs md:text-sm">미확인 반지</div>
                    <div className="text-brass-200 font-black text-xs">6,000 Gold</div>
                  </button>

                  <button
                    onClick={() => gambleItem('amulet')}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-iron-500 rounded-lg text-left transition space-y-1 shadow"
                  >
                    <div className="font-bold text-gray-100 text-xs md:text-sm">미확인 목걸이</div>
                    <div className="text-brass-200 font-black text-xs">7,500 Gold</div>
                  </button>
                </div>

                <div className="text-xs text-gray-300 text-center font-mono font-bold">
                  보유 골드: <span className="text-brass-200 font-black text-sm">{playerStats.gold.toLocaleString()} G</span>
                </div>
              </div>
            )}

            {/* 4. DECKARD CAIN (식별) */}
            {activeFacility === 'cain' && (
              <div className="space-y-4 text-xs text-center py-4">
                <div className="text-base font-cinzel text-brass-200 font-black">
                  "Stay awhile and listen!"
                </div>
                <p className="text-xs text-gray-200 leading-relaxed max-w-sm mx-auto font-medium">
                  호라드림의 마지막 전승자 데커드 케인이 던전에서 주워온 모든 미확인 장비의 숨겨진 능력을 감정해 줍니다.
                </p>

                <div className="p-4 bg-iron-950 rounded-lg border-2 border-iron-700 max-w-sm mx-auto shadow-md">
                  <div className="text-gray-200 mb-3 font-mono font-bold">
                    미확인 전리품: <strong className="text-blood-400 text-sm font-black">{unidentifiedCount}</strong>개
                  </div>
                  <button
                    onClick={identifyAllItems}
                    disabled={unidentifiedCount === 0}
                    className="w-full py-3 bg-gradient-to-r from-brass-600 via-brass-500 to-brass-400 hover:from-brass-500 hover:to-brass-300 disabled:opacity-40 text-iron-950 font-black rounded-lg transition shadow text-xs md:text-sm flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>소지품 일괄 감정 (Identify All)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 3 (4 Cols): Recommended Dungeon Briefing */}
        <div className="lg:col-span-4 bg-iron-900/90 p-3 sm:p-4 rounded-lg border-2 border-brass-600/70 flex flex-col justify-between space-y-2.5 shadow-md">
          <div>
            <div className="flex justify-between items-start border-b border-iron-750 pb-2 mb-2">
              <div>
                <span className="text-[10px] bg-blood-950 text-blood-300 border border-blood-600 px-1.5 py-0.5 rounded font-mono font-bold">
                  맞는 레벨 추천
                </span>
                <h3 className="font-cinzel font-black text-sm sm:text-base text-brass-200 mt-1">
                  {recommendedDungeon.name}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-gray-300 font-bold bg-iron-950 px-2 py-0.5 rounded border border-iron-700">
                권장 Lv.{recommendedDungeon.recommendedLevel}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-300 leading-snug mb-2.5">
              "{recommendedDungeon.theme}"
            </p>

            <div className="space-y-1.5 text-[11px] sm:text-xs bg-iron-950 p-2.5 rounded-lg border border-iron-750 font-mono">
              <div className="text-gray-300">
                <strong className="text-white font-bold">출현:</strong> {recommendedDungeon.monsterSummary}
              </div>
              <div className="text-gray-300">
                <strong className="text-white font-bold">주요 드랍:</strong> {recommendedDungeon.dropItems.map(i => i.name).slice(0, 3).join(', ')}...
              </div>
              <div className="text-gray-300">
                <strong className="text-white font-bold">최고 기록:</strong> <span className="text-yellow-300 font-bold">{recommendedDungeon.bestClearTime}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => enterDungeon(recommendedDungeon.id)}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-black rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl transition transform active:scale-98"
          >
            <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>10초 파밍 시작 (Lv.{recommendedDungeon.recommendedLevel} 던전)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
