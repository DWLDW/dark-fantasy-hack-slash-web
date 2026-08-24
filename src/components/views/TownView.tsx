import React, { useState, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, RUNEWORD_RECIPES, D2_RUNES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { POTION_CAPACITY_TIERS, getPotionCapacityUpgradeCost, getPotionHealingUpgradeCost, getConsumablePowerUpgradeCost, getGambleLevelUpgradeCost } from '../../state/helpers/cubeCraftingHelper';
import { GameItem } from '../../types/game';
import { ACHIEVEMENTS } from '../../data/achievements';
import { isDungeonUnlocked, getHighestUnlockedDungeon } from '../../data/dungeons';
import { Box, Sparkles, Dices, BookOpen, ArrowRight, Shield, Compass, Hammer, Trophy, Zap, Package } from 'lucide-react';

export const TownView: React.FC = React.memo(() => {
  const {
    playerStats,
    totalStats,
    equipment,
    inventory,
    runesVault,
    currentDungeon,
    currentDifficulty,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    enterDungeon,
    autoEquipBestItems,
    setViewMode,
    openModal,
    transmuteInCube,
    gambleItem,
    identifyAllItems,
    addLog,
    achievementStats,
    claimedAchievements,
    townUpgrades,
    upgradeTownFacility
  } = useGame();

  const autoDeployDiff = currentDifficulty || 1;
  const [activeFacility, setActiveFacility] = useState<'cain' | 'gamble' | 'runewords' | 'cube'>('cain');
  const [gambleFeedback, setGambleFeedback] = useState<{ item: GameItem; isHighRarity: boolean; cost: number } | null>(null);
  const [identifiedHistory, setIdentifiedHistory] = useState<GameItem[]>([]);

  const handleIdentifyAll = () => {
    const identified = identifyAllItems();
    if (identified && identified.length > 0) {
      setIdentifiedHistory(identified);
    }
  };
  
  const [selectedCubeItems, setSelectedCubeItems] = useState<string[]>([]);
  const [selectedBaseItem, setSelectedBaseItem] = useState<GameItem | null>(null);

  const highestUnlocked = useMemo(() => getHighestUnlockedDungeon(achievementStats.dungeonClears), [achievementStats.dungeonClears]);
  const lastDungeon = useMemo(() => {
    if (currentDungeon && isDungeonUnlocked(currentDungeon.id, achievementStats.dungeonClears)) {
      return currentDungeon;
    }
    return highestUnlocked;
  }, [currentDungeon, highestUnlocked, achievementStats.dungeonClears]);

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
  const unidentifiedCount = inventory.filter(i => i.isIdentified === false).length;

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-3 pb-24 sm:pb-28 select-none overflow-x-hidden font-sans">
      
      {/* 1. Immersive Town Visual Banner (Rogue Encampment AI Art Illustration + Fixed Header) */}
      <div className="relative rounded-xl overflow-hidden border-2 border-brass-600/70 shadow-2xl bg-iron-950">
        {/* Background Image Layer with atmospheric vignette gradients */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity filter contrast-125 pointer-events-none"
          style={{ backgroundImage: "url('/images/town_bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/75 to-iron-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-iron-950/90 via-transparent to-iron-950/90 pointer-events-none" />

        {/* Content on Banner */}
        <div className="relative z-10 p-3 sm:p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2 drop-shadow-md">
                <span>로그 캠프 (Rogue Encampment)</span>
              </h1>
              <span className="px-2 py-0.5 rounded bg-blood-950/80 border border-blood-600 text-blood-300 font-mono text-[10px] sm:text-xs font-bold">
                1막 본거지
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-300 font-mono leading-relaxed max-w-xl drop-shadow">
              호라드림의 현자 데커드 케인, 기드의 암시장, 룬워드 공방과 호라드릭 큐브 연구소가 위치한 성역의 안식처입니다.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => openModal('inventory')}
              className="px-3 py-1.5 bg-iron-900/90 hover:bg-iron-800 border border-indigo-500/70 hover:border-indigo-400 text-indigo-300 hover:text-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer"
              title="모험가 개인 보관함 및 소지품 열기 [I]"
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>보관함·가방 [I]</span>
            </button>

            <button
              onClick={() => openModal('achievement')}
              className="px-3 py-1.5 bg-iron-900/90 hover:bg-iron-800 border border-amber-500/70 hover:border-amber-400 text-amber-300 hover:text-amber-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md relative cursor-pointer"
              title="성역의 위업 (업적 및 보상 확인)"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>업적</span>
              {ACHIEVEMENTS.some(a => a.condition(achievementStats) && !claimedAchievements.includes(a.id)) && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </button>

            <button
              data-tutorial="dungeon_select"
              onClick={() => setViewMode('dungeon_select')}
              className="px-3 py-1.5 bg-iron-900/90 hover:bg-iron-800 border border-iron-600 text-gray-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>던전 월드맵</span>
            </button>
            
            <button
              data-tutorial="deploy"
              onClick={() => enterDungeon(lastDungeon.id, autoDeployDiff)}
              className="px-4 py-2 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded-lg text-xs sm:text-sm flex items-center gap-1.5 shadow-xl ring-2 ring-amber-400/60 transition transform active:scale-95 animate-pulse cursor-pointer"
              title={`이전 던전 [${lastDungeon.name.split(":")[0]}] (개방 최고 난이도 Lv.${autoDeployDiff})으로 즉시 출격`}
            >
              <span>[Space] [{lastDungeon.name.split(":")[0]}] Lv.{autoDeployDiff} 즉시 출격</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Facilities & Management (3-Column Desktop / Streamlined 1-Page Mobile Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left Column (3 Cols Desktop Only): Quick Gear & Combat Specs (Hidden on Mobile to ensure Zero-Scroll) */}
        <div className="hidden lg:flex lg:col-span-3 bg-iron-900/90 p-3 sm:p-4 rounded-xl border-2 border-iron-750 flex-col justify-between space-y-3 shadow-md">
          <div>
            <div className="flex justify-between items-center border-b border-iron-750 pb-2 mb-2.5">
              <h2 className="font-cinzel font-bold text-gray-100 text-xs sm:text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brass-400" />
                장착 장비 & 세트 효과
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={autoEquipBestItems}
                  className="text-[10px] text-amber-300 font-bold font-mono bg-iron-950 px-1.5 py-0.5 rounded border border-amber-500/70 hover:border-amber-400 hover:text-white cursor-pointer flex items-center gap-0.5"
                  title="공격력+체력 기준 최적 장비 자동 일괄 장착"
                >
                  <Zap className="w-3 h-3 fill-amber-300" />
                  <span>일괄 장착</span>
                </button>
                <button
                  onClick={() => openModal('inventory')}
                  className="text-xs text-brass-300 font-bold hover:underline font-mono bg-iron-950 px-2 py-0.5 rounded border border-iron-700 cursor-pointer"
                >
                  [I] 가방
                </button>
              </div>
            </div>

            {/* Quick Equipment List */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2 bg-iron-950 rounded border border-iron-750">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">무기:</span>
                  <span className={equipment.weapon?.isRuneWord ? 'text-amber-300 font-black text-xs truncate' : 'text-gray-100 font-bold truncate'}>
                    {equipment.weapon?.name || '맨손'}
                  </span>
                </div>
                {equipment.weapon?.socketedRunes && (
                  <div className="text-[10px] text-purple-300 font-bold mt-0.5 bg-iron-900 px-1.5 py-0.2 rounded border border-iron-800">
                    소켓: [{equipment.weapon.socketedRunes.join(' + ')}]
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 bg-iron-950 rounded border border-iron-750">
                  <span className="text-gray-400 block text-[10px]">투구:</span>
                  <span className={equipment.helm?.rarity === 'set' ? 'text-emerald-300 font-bold truncate block' : equipment.helm?.rarity === 'unique' ? 'text-orange-400 font-bold truncate block' : 'text-gray-200 font-medium truncate block'}>
                    {equipment.helm?.name || '없음'}
                  </span>
                </div>
                <div className="p-1.5 bg-iron-950 rounded border border-iron-750">
                  <span className="text-gray-400 block text-[10px]">방패:</span>
                  <span className={equipment.shield?.rarity === 'set' ? 'text-emerald-300 font-bold truncate block' : equipment.shield?.rarity === 'unique' ? 'text-orange-400 font-bold truncate block' : 'text-gray-200 font-medium truncate block'}>
                    {equipment.shield?.name || '없음'}
                  </span>
                </div>
              </div>

              <div className="p-2 bg-iron-950 rounded border border-iron-750">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">갑옷:</span>
                  <span className={equipment.armor?.isRuneWord ? 'text-amber-300 font-black text-xs truncate' : equipment.armor?.rarity === 'set' ? 'text-emerald-300 font-bold truncate' : 'text-gray-100 font-bold truncate'}>
                    {equipment.armor?.name || '없음'}
                  </span>
                </div>
                {equipment.armor?.socketedRunes && (
                  <div className="text-[10px] text-purple-300 font-bold mt-0.5 bg-iron-900 px-1.5 py-0.2 rounded border border-iron-800">
                    소켓: [{equipment.armor.socketedRunes.join(' + ')}]
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 bg-iron-950 rounded border border-iron-750">
                  <span className="text-gray-400 block text-[10px]">장갑:</span>
                  <span className={equipment.gloves?.rarity === 'set' ? 'text-emerald-300 font-bold truncate block' : equipment.gloves?.rarity === 'unique' ? 'text-orange-400 font-bold truncate block' : 'text-gray-200 font-medium truncate block'}>
                    {equipment.gloves?.name || '없음'}
                  </span>
                </div>
                <div className="p-1.5 bg-iron-950 rounded border border-iron-750">
                  <span className="text-gray-400 block text-[10px]">신발:</span>
                  <span className={equipment.boots?.rarity === 'set' ? 'text-emerald-300 font-bold truncate block' : equipment.boots?.rarity === 'unique' ? 'text-orange-400 font-bold truncate block' : 'text-gray-200 font-medium truncate block'}>
                    {equipment.boots?.name || '없음'}
                  </span>
                </div>
              </div>
            </div>

            {/* Combat Specs */}
            <div className="mt-3 pt-2.5 border-t border-iron-750 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">물리 위력:</span>
                <span className="text-brass-200 font-black">{totalStats.minDmg} ~ {totalStats.maxDmg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">공격 속도:</span>
                <span className="text-amber-300 font-bold">+{totalStats.attackSpeed || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">물리 방어:</span>
                <span className="text-blue-300 font-bold">{totalStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">아이템 희귀도:</span>
                <span className="text-purple-300 font-black">+{totalStats.fortune}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => openModal('character')}
            className="w-full py-2 bg-iron-850 hover:bg-iron-800 text-gray-100 hover:text-white border border-iron-700 rounded-lg text-xs font-bold transition shadow cursor-pointer"
          >
            [C] 캐릭터 스탯 상세
          </button>
        </div>

        {/* Center Column (5 Cols Desktop / Full Width on Mobile): Four Core Town Facilities */}
        <div className="w-full lg:col-span-5 bg-iron-900/90 p-3 sm:p-4 rounded-xl border-2 border-iron-750 flex flex-col shadow-md min-h-[420px]">
          
          {/* Facility Navigation Tabs (Tier 3: Dark Inset Active Tabs) */}
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pb-2.5 border-b border-iron-750">
            {/* 1. DECKARD CAIN */}
            <button
              data-tutorial="cain"
              onClick={() => setActiveFacility('cain')}
              className={`py-2 px-1 rounded-lg text-xs flex items-center justify-center gap-1 transition relative cursor-pointer ${
                activeFacility === 'cain'
                  ? 'bg-iron-850 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'bg-iron-950 text-gray-400 hover:bg-iron-900 hover:text-white border border-iron-800 font-medium'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="truncate">케인</span>
              {unidentifiedCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blood-500 text-white rounded-full text-[9px] font-mono font-black animate-pulse shadow">
                  {unidentifiedCount}
                </span>
              )}
            </button>

            {/* 2. GHEED GAMBLE */}
            <button
              data-tutorial="gheed"
              onClick={() => setActiveFacility('gamble')}
              className={`py-2 px-1 rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'gamble'
                  ? 'bg-iron-850 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'bg-iron-950 text-gray-400 hover:bg-iron-900 hover:text-white border border-iron-800 font-medium'
              }`}
            >
              <Dices className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span className="truncate">기드</span>
            </button>

            {/* 3. RUNEWORDS */}
            <button
              data-tutorial="runewords"
              onClick={() => setActiveFacility('runewords')}
              className={`py-2 px-1 rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'runewords'
                  ? 'bg-iron-850 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'bg-iron-950 text-gray-400 hover:bg-iron-900 hover:text-white border border-iron-800 font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">룬워드</span>
            </button>

            {/* 4. HORADRIC CUBE & LAB */}
            <button
              onClick={() => setActiveFacility('cube')}
              className={`py-2 px-1 rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'cube'
                  ? 'bg-iron-850 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'bg-iron-950 text-gray-400 hover:bg-iron-900 hover:text-white border border-iron-800 font-medium'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="truncate">큐브·연구소</span>
            </button>
          </div>

          {/* Facility Content Views */}
          <div className="flex-1 py-2.5">
            
            {/* 1. DECKARD CAIN (식별소) */}
            {activeFacility === 'cain' && (
              <div className="space-y-3.5 text-xs text-center py-1 animate-fade-in">
                <div className="text-sm sm:text-base font-cinzel text-brass-200 font-black flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>"Stay awhile and listen!"</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto font-medium">
                  호라드림의 마지막 현자 데커드 케인이 던전에서 획득한 모든 미확인 장비의 숨겨진 유니크/레어 능력을 감정해 줍니다.
                </p>

                <div className="p-3.5 bg-iron-950 rounded-lg border-2 border-iron-700 max-w-sm mx-auto shadow-md space-y-3">
                  <div className="text-gray-200 font-mono font-bold flex items-center justify-between">
                    <span>미확인 전리품:</span>
                    <span className={`text-sm font-black px-2 py-0.5 rounded ${
                      unidentifiedCount > 0
                        ? 'bg-blood-950 text-blood-300 border border-blood-600 animate-pulse'
                        : 'bg-iron-900 text-gray-400'
                    }`}>
                      {unidentifiedCount} 개
                    </span>
                  </div>

                  {/* Tier 2-A: Arcane Identify All Button */}
                  <button
                    onClick={handleIdentifyAll}
                    disabled={unidentifiedCount === 0}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-40 text-white font-black rounded-lg transition shadow-lg text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer border border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.4)] animate-pulse"
                  >
                    <BookOpen className="w-4 h-4 text-blue-200" />
                    <span>소지품 일괄 무료 감정 (Identify All)</span>
                  </button>

                  {identifiedHistory.length > 0 && (
                    <div className="mt-2 text-left space-y-2 max-h-52 overflow-y-auto pr-1">
                      <div className="font-bold text-gray-200 text-xs flex items-center justify-between border-b border-iron-800 pb-1">
                        <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>최근 감정 장비 ({identifiedHistory.length}개):</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ 가방 보관</span>
                      </div>

                      <div className="space-y-1.5">
                        {identifiedHistory.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className={`p-2 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono transition ${
                              item.rarity === 'unique' || item.rarity === 'legendary'
                                ? 'bg-orange-950/50 border-orange-400 text-orange-200 shadow-[0_0_10px_rgba(251,146,60,0.3)]'
                                : item.rarity === 'rare'
                                ? 'bg-yellow-950/40 border-yellow-400 text-yellow-200'
                                : 'bg-blue-950/40 border-blue-400 text-blue-200'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-black flex items-center gap-1.5">
                                <span>{item.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-iron-950 border border-iron-700 text-gray-300 uppercase">
                                  {item.rarity}
                                </span>
                                <span className="text-[10px] text-gray-400">({item.slot})</span>
                              </div>
                              {item.subAffixes && item.subAffixes.length > 0 && (
                                <div className="text-[10px] text-gray-300 flex flex-wrap gap-1">
                                  {item.subAffixes.map((aff, aIdx) => (
                                    <span key={aIdx} className="bg-iron-900 px-1 rounded border border-iron-800 text-emerald-300 font-bold">
                                      +{aff.value} {aff.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] font-bold text-right flex sm:flex-col items-end gap-1 sm:gap-0 flex-shrink-0">
                              {item.stats.minDmg !== undefined && (
                                <span className="text-brass-200 font-black">공격력 {item.stats.minDmg}~{item.stats.maxDmg}</span>
                              )}
                              {item.stats.defense !== undefined && (
                                <span className="text-blue-300">방어 {item.stats.defense}</span>
                              )}
                              {item.stats.attackSpeed !== undefined && item.stats.attackSpeed > 0 && (
                                <span className="text-amber-300 font-bold">공속 +{item.stats.attackSpeed}%</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 font-mono">
                    {unidentifiedCount > 0
                      ? '✓ 감정 시 숨겨진 접두사/접미사 및 고유 유니크 효과가 완전히 개방됩니다.'
                      : '✓ 현재 소지품에 감정 대기 중인 장비가 없습니다.'}
                  </div>
                </div>
              </div>
            )}

            {/* 2. GAMBLE (기드의 암시장 도박) */}
            {activeFacility === 'gamble' && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="text-gray-200 leading-relaxed font-medium bg-iron-950/60 p-2.5 rounded-lg border border-iron-800">
                  "모든 물건에는 가치가 있는 법이지... 골드만 충분하다면 말이야."<br />
                  미확인 장비를 뽑아 대박 <strong className="text-yellow-300 font-bold">레어</strong> 및 <strong className="text-orange-400 font-bold">유니크(나겔링, 조던링, 마라의 만화경 등)</strong>를 노리세요!
                </div>

                {gambleFeedback && (
                  <div className={`p-2.5 rounded-lg border-2 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in ${
                    gambleFeedback.isHighRarity
                      ? "bg-gradient-to-r from-amber-950 via-iron-900 to-amber-950 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      : "bg-iron-950 border-brass-500/80 shadow-lg"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-900/80 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-sm flex-shrink-0 animate-bounce">
                        🎲
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel font-black text-sm text-brass-200">
                            {gambleFeedback.item.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase bg-iron-900 border border-amber-500 text-amber-300">
                            {gambleFeedback.item.rarity}
                          </span>
                          <span className="text-[10px] font-mono text-red-400 font-bold">
                            (-{gambleFeedback.cost.toLocaleString()}G)
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          가방에 획득 완료! 데커드 케인에게 감정받아 숨겨진 유니크/레어 옵션을 확인하세요.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveFacility('cain')}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1 flex-shrink-0 cursor-pointer animate-pulse"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>케인에게 감정</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <button
                    onClick={() => {
                      const res = gambleItem('weapon');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3500 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-amber-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>⚔️ 무기류</span>
                      <span className="text-[10px] text-amber-400">도검/폴암</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">3,500 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('armor');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 4000 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-blue-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>🥋 갑옷류</span>
                      <span className="text-[10px] text-blue-400">판금갑옷</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">4,000 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('shield');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3800 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-cyan-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>🛡️ 방패류</span>
                      <span className="text-[10px] text-cyan-400">방패/모나크</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">3,800 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('helm');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3200 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-yellow-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>🪖 투구류</span>
                      <span className="text-[10px] text-yellow-400">투구/샤코</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">3,200 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('gloves');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 2800 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-emerald-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>🧤 장갑류</span>
                      <span className="text-[10px] text-emerald-400">건틀릿</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">2,800 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('boots');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 2800 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-emerald-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>🥾 신발류</span>
                      <span className="text-[10px] text-emerald-400">장화/그리브</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">2,800 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('ring');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 6000 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-purple-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>💍 반지 (Ring)</span>
                      <span className="text-[10px] text-purple-400">조던/나겔</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">6,000 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('amulet');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 7500 });
                    }}
                    className="p-2.5 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-purple-400 rounded-lg text-left transition space-y-1 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-bold text-gray-100 text-xs flex items-center justify-between">
                      <span>📿 목걸이 (Amulet)</span>
                      <span className="text-[10px] text-purple-400">마라/대군주</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs">7,500 G</div>
                  </button>
                </div>

                <div className="text-xs text-gray-300 text-center font-mono font-bold pt-0.5">
                  보유 골드: <span className="text-brass-200 font-black text-sm">{playerStats.gold.toLocaleString()} G</span>
                </div>
              </div>
            )}

            {/* 3. RUNEWORDS (룬워드 공방) */}
            {activeFacility === 'runewords' && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="text-gray-200 font-medium">
                  빈 소켓이 있는 노멀 베이스 장비에 룬을 순서대로 박아 <strong className="text-amber-300 font-bold">전설의 룬워드</strong>를 제작하세요.
                </div>

                {/* Step 1: Base Item Selection */}
                <div className="p-2.5 bg-iron-950 rounded-lg border border-iron-800 space-y-1.5">
                  <div className="font-bold text-gray-200 text-xs flex justify-between items-center">
                    <span>1. 소켓 베이스 아이템 선택 (선택 시 맞춤 필터링):</span>
                    {selectedBaseItem && (
                      <button
                        onClick={() => setSelectedBaseItem(null)}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        선택 해제 (전체 도감 보기)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {socketableItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedBaseItem(selectedBaseItem?.id === item.id ? null : item)}
                        className={`p-2 rounded-lg border-2 text-left flex-shrink-0 min-w-[120px] transition shadow cursor-pointer ${
                          selectedBaseItem?.id === item.id
                            ? 'bg-blood-950 border-brass-300 text-brass-100 ring-2 ring-brass-400'
                            : 'bg-iron-900 border-iron-750 text-gray-200 hover:bg-iron-800'
                        }`}
                      >
                        <div className="font-black text-xs truncate">{item.name}</div>
                        <div className="text-[10px] text-purple-300 font-bold mt-0.5">
                          {item.slot.toUpperCase()} · {item.sockets}소켓
                        </div>
                      </button>
                    ))}
                    {socketableItems.length === 0 && (
                      <div className="p-2 text-gray-500 font-mono text-[11px] w-full text-center">
                        소지품에 빈 소켓 장비가 없습니다. (하단에서 전체 룬워드 레시피 도감을 확인할 수 있습니다)
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Recipes Grid View */}
                <div className="space-y-2 pt-1 border-t border-iron-750">
                  <div className="font-bold text-gray-200 text-xs flex justify-between items-center">
                    <span>2. 룬워드 도감 & 제작 목록:</span>
                    <span className="text-[10px] text-purple-300 font-mono">
                      {selectedBaseItem ? `선택 베이스: ${selectedBaseItem.name} (${selectedBaseItem.sockets}S)` : '전체 레시피'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {RUNEWORD_RECIPES.filter(r => {
                      if (!selectedBaseItem) return true;
                      return r.allowedSlot === selectedBaseItem.slot && r.requiredSockets === selectedBaseItem.sockets;
                    }).map(recipe => {
                      const sim = simulateRuneWordCrafting(recipe, runesVault);
                      const isMatchingSelected = selectedBaseItem && recipe.allowedSlot === selectedBaseItem.slot && recipe.requiredSockets === selectedBaseItem.sockets;

                      return (
                        <div
                          key={recipe.id}
                          className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 transition ${
                            isMatchingSelected && sim.canDirectCraft
                              ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                              : isMatchingSelected && sim.canTransmuteCraft
                              ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)]'
                              : 'bg-iron-950 border-iron-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-amber-300">{recipe.name}</span>
                              <span className="text-[10px] font-mono text-gray-400 bg-iron-900 px-1.5 py-0.5 rounded border border-iron-750">
                                {recipe.allowedSlot === 'weapon' ? '무기' : recipe.allowedSlot === 'armor' ? '갑옷' : recipe.allowedSlot === 'shield' ? '방패' : '투구'} ({recipe.requiredSockets}소켓)
                              </span>
                            </div>

                            {/* Rune Ingredients with Badges */}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {recipe.requiredRunes.map((rk, rIdx) => {
                                const vaultCount = runesVault[rk] || 0;
                                const isAvailable = vaultCount >= 1;
                                return (
                                  <span
                                    key={rIdx}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                      isAvailable
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                        : 'bg-iron-900 text-gray-500 border-iron-800'
                                    }`}
                                    title={`보유: ${vaultCount}개`}
                                  >
                                    {rk} ({vaultCount}/1)
                                  </span>
                                );
                              })}
                            </div>

                            <p className="text-[10px] text-gray-400 leading-tight pt-1">
                              {recipe.specialEffect || recipe.description}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          {selectedBaseItem && isMatchingSelected ? (
                            <div className="flex items-center gap-1.5 pt-1 border-t border-iron-800/80">
                              <button
                                onClick={() => {
                                  craftRuneWord(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canDirectCraft}
                                className={`flex-1 py-1 rounded text-xs font-black transition shadow flex items-center justify-center gap-1 cursor-pointer ${
                                  sim.canDirectCraft
                                    ? 'bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 text-iron-950 ring-1 ring-brass-300'
                                    : 'bg-iron-900 text-gray-600 border border-iron-800 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>✨ 즉시 제작</span>
                              </button>

                              <button
                                onClick={() => {
                                  craftRuneWordWithTransmute(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canTransmuteCraft}
                                className={`flex-1 py-1 rounded text-xs font-black transition shadow flex items-center justify-center gap-1 cursor-pointer ${
                                  sim.canTransmuteCraft
                                    ? 'bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 text-white ring-1 ring-purple-300'
                                    : 'bg-iron-900 text-gray-600 border border-iron-800 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <Hammer className="w-3 h-3" />
                                <span>🔮 합성 제작</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-gray-500 pt-1 text-right">
                              {selectedBaseItem ? '소켓 수 또는 슬롯 불일치' : '제작하려면 상단에서 소켓 베이스 선택'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. HORADRIC CUBE & LAB (호라드릭 큐브 & 영구 편의 연구소) */}
            {activeFacility === 'cube' && (
              <div className="space-y-3 text-xs animate-fade-in">
                
                {/* 4대 호라드릭 영구 시설 강화 */}
                <div className="p-3 bg-gradient-to-b from-purple-950/60 via-iron-950 to-iron-950 rounded-lg border-2 border-purple-500/70 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between border-b border-purple-800/60 pb-1">
                    <span className="font-cinzel font-black text-xs text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      호라드릭 영구 편의 연구소 (최대 30레벨)
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">보유: {playerStats.gold.toLocaleString()} G</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Potion Max */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-rose-300">🧪 물약 상한</span>
                        <span className="text-[9px] font-mono font-black text-amber-300 bg-iron-950 px-1 rounded border border-iron-800">
                          Lv.{townUpgrades.potionCapacityLevel}/{POTION_CAPACITY_TIERS.length - 1} ({POTION_CAPACITY_TIERS[townUpgrades.potionCapacityLevel] || 3}개)
                        </span>
                      </div>
                      {getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionCapacity')}
                          disabled={playerStats.gold < (getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[10px] transition shadow cursor-pointer"
                        >
                          강화 ({getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 2. Potion Healing */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-rose-300">💖 물약 회복량</span>
                        <span className="text-[9px] font-mono font-black text-amber-300 bg-iron-950 px-1 rounded border border-iron-800">
                          Lv.{townUpgrades.potionHealingLevel}/30 (+{townUpgrades.potionHealingLevel * 10}%)
                        </span>
                      </div>
                      {getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionHealing')}
                          disabled={playerStats.gold < (getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[10px] transition shadow cursor-pointer"
                        >
                          강화 ({getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 3. Consumable Power */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-blue-300">🛡️ 소모품 연금술</span>
                        <span className="text-[9px] font-mono font-black text-amber-300 bg-iron-950 px-1 rounded border border-iron-800">
                          Lv.{townUpgrades.consumablePowerLevel}/30 (+{townUpgrades.consumablePowerLevel * 8}%)
                        </span>
                      </div>
                      {getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('consumablePower')}
                          disabled={playerStats.gold < (getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[10px] transition shadow cursor-pointer"
                        >
                          강화 ({getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 4. Gamble Quality */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-purple-300">🎲 도박 품질</span>
                        <span className="text-[9px] font-mono font-black text-amber-300 bg-iron-950 px-1 rounded border border-iron-800">
                          Lv.{townUpgrades.gambleLevel}/20
                        </span>
                      </div>
                      {getGambleLevelUpgradeCost(townUpgrades.gambleLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('gambleLevel')}
                          disabled={playerStats.gold < (getGambleLevelUpgradeCost(townUpgrades.gambleLevel) || 0)}
                          className="w-full py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[10px] transition shadow cursor-pointer"
                        >
                          강화 ({getGambleLevelUpgradeCost(townUpgrades.gambleLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 큐브 속 재료 변환 */}
                <div className="p-3 bg-iron-950 rounded-lg border-2 border-iron-750 space-y-2">
                  <div className="font-bold text-gray-200 flex justify-between items-center text-xs">
                    <span>큐브 속 재료 ({selectedCubeItems.length}/3):</span>
                    {selectedCubeItems.length > 0 && (
                      <button onClick={() => setSelectedCubeItems([])} className="text-blood-300 font-bold hover:underline text-xs cursor-pointer">
                        슬롯 비우기
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 min-h-[50px]">
                    {[0, 1, 2].map(idx => {
                      const itemId = selectedCubeItems[idx];
                      const item = inventory.find(i => i.id === itemId);
                      return (
                        <div key={idx} className="p-1.5 bg-iron-900 rounded border-2 border-dashed border-iron-650 flex items-center justify-center text-center text-xs">
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
                    className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-40 text-white font-black rounded-lg transition shadow text-xs md:text-sm cursor-pointer"
                  >
                    🔮 변환 (Transmute)
                  </button>
                </div>

                {/* Inventory Picker for Cube */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-300">소지품에서 큐브에 넣을 아이템 선택:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                    {inventory.map(item => {
                      const isSelected = selectedCubeItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCubeItem(item.id)}
                          className={`p-1.5 rounded border cursor-pointer flex justify-between items-center transition ${
                            isSelected
                              ? 'bg-purple-950 border-purple-400 text-purple-100 font-bold'
                              : 'bg-iron-950 border-iron-750 text-gray-200 hover:bg-iron-850'
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[10px] text-gray-400 capitalize font-bold">{item.slot}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column (4 Cols Desktop Only): 33 D2 Rune Vault (Hidden on Mobile to ensure Zero-Scroll) */}
        <div className="hidden lg:flex lg:col-span-4 bg-iron-900/90 p-3 sm:p-4 rounded-xl border-2 border-iron-750 flex-col space-y-2.5 shadow-md">
          <div className="flex justify-between items-center border-b border-iron-750 pb-2">
            <h3 className="font-cinzel font-bold text-gray-100 text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>룬 전용 보관함 (Vault)</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">3개 ➔ 상위 룬 합성</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
            {Object.entries(D2_RUNES).map(([rKey, rDef]) => {
              const count = runesVault[rKey] || 0;
              const canTransmute = count >= 3;

              return (
                <div
                  key={rKey}
                  className={`p-1.5 rounded border text-center font-mono text-[11px] transition flex flex-col justify-between ${
                    count > 0
                      ? 'bg-purple-950/40 border-purple-500/70 text-purple-200 shadow-sm'
                      : 'bg-iron-950/60 border-iron-800 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">#{rDef.number}</span>
                    <span className="font-bold text-gray-300">{rKey}</span>
                  </div>
                  
                  <div className={`my-1 font-black text-xs md:text-sm ${count > 0 ? 'text-amber-300' : 'text-gray-600'}`}>
                    x{count}
                  </div>

                  {canTransmute ? (
                    <button
                      onClick={() => transmuteRunesInVault(rKey)}
                      className="w-full py-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded text-[10px] font-bold shadow transition animate-pulse cursor-pointer"
                      title={`[${rKey} 룬] 3개를 상위 룬 1개로 연성합니다`}
                    >
                      3:1 합성
                    </button>
                  ) : (
                    <div className="text-[9px] text-gray-600">합성 대기</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
});

TownView.displayName = 'TownView';
