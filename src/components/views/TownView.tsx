import { TownMapCanvas } from './town/TownMapCanvas';
import React, { useState, useMemo, useCallback } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, RUNEWORD_RECIPES, D2_RUNES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { POTION_CAPACITY_TIERS, getPotionCapacityUpgradeCost, getPotionHealingUpgradeCost, getConsumablePowerUpgradeCost, getGambleLevelUpgradeCost } from '../../state/helpers/cubeCraftingHelper';
import { GameItem } from '../../types/game';
import { ACHIEVEMENTS } from '../../data/achievements';
import { isDungeonUnlocked, getHighestUnlockedDungeon } from '../../data/dungeons';
import { Box, Home, X, ArrowLeft, Sparkles, Dices, BookOpen, ArrowRight, Shield, Compass, Hammer, Trophy, Zap, Package } from 'lucide-react';

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
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState<boolean>(false);
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null);

  const handleOpenFacility = useCallback((facility: 'cain' | 'gamble' | 'runewords' | 'cube') => {
    setActiveFacility(facility);
    setIsFacilityModalOpen(true);
  }, []);

  const handleIdentifyAll = useCallback(() => {
    const identified = identifyAllItems();
    if (identified && identified.length > 0) {
      setIdentifiedHistory(identified);
    }
  }, [identifyAllItems]);
  
  const [selectedCubeItems, setSelectedCubeItems] = useState<string[]>([]);
  const [selectedBaseItem, setSelectedBaseItem] = useState<GameItem | null>(null);

  const highestUnlocked = useMemo(() => getHighestUnlockedDungeon(achievementStats.dungeonClears), [achievementStats.dungeonClears]);
  const lastDungeon = useMemo(() => {
    if (currentDungeon && isDungeonUnlocked(currentDungeon.id, achievementStats.dungeonClears)) {
      return currentDungeon;
    }
    return highestUnlocked;
  }, [currentDungeon, highestUnlocked, achievementStats.dungeonClears]);

  const handleDeploy = useCallback(() => {
    enterDungeon(lastDungeon.id, autoDeployDiff);
  }, [enterDungeon, lastDungeon.id, autoDeployDiff]);

  const handleWorldMap = useCallback(() => {
    setViewMode('dungeon_select');
  }, [setViewMode]);

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

  const socketableItems = useMemo(() => 
    inventory.filter(i => i.sockets && i.sockets > (i.socketedRunes?.length || 0)),
    [inventory]
  );
  
  const unidentifiedCount = useMemo(() => 
    inventory.filter(i => i.isIdentified === false).length,
    [inventory]
  );

  return (
    <div className="h-[calc(100dvh-40px-52px)] w-full max-w-7xl mx-auto p-1.5 sm:p-2.5 flex flex-col justify-between gap-1.5 sm:gap-2 select-none overflow-hidden font-sans">
      
      {/* 1. Center Interactive Dark Fantasy Town Map Canvas (Flex-1 Adaptive Height) */}
      <div className="flex-1 min-h-0 w-full relative">
        <TownMapCanvas
          onOpenFacility={handleOpenFacility}
          unidentifiedCount={unidentifiedCount}
          onDeploy={handleDeploy}
          onWorldMap={handleWorldMap}
          lastDungeonName={lastDungeon.name}
          autoDeployDiff={autoDeployDiff}
          playerLevel={playerStats.level}
        />
      </div>

      {/* 2. Slim 1-Row 4-Facility Quick Bar (Zero Redundancy) */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-shrink-0">
        <button
          onClick={() => handleOpenFacility('cain')}
          className={`py-1 px-1 sm:px-2 rounded-lg border flex items-center justify-center gap-1 text-center transition cursor-pointer relative min-h-[36px] ${
            activeFacility === 'cain' && isFacilityModalOpen
              ? 'bg-blue-950 border-blue-400 text-blue-200 ring-2 ring-blue-400 shadow-md'
              : 'bg-iron-900/95 border-iron-750 hover:border-blue-400 text-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 flex-shrink-0" />
          <span className="font-cinzel font-black text-[10px] sm:text-xs text-white truncate">케인</span>
          {unidentifiedCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blood-600 text-white rounded-full text-[9px] font-mono font-black animate-pulse border border-white">
              {unidentifiedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleOpenFacility('gamble')}
          className={`py-1 px-1 sm:px-2 rounded-lg border flex items-center justify-center gap-1 text-center transition cursor-pointer min-h-[36px] ${
            activeFacility === 'gamble' && isFacilityModalOpen
              ? 'bg-amber-950 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
              : 'bg-iron-900/95 border-iron-750 hover:border-amber-400 text-gray-200'
          }`}
        >
          <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
          <span className="font-cinzel font-black text-[10px] sm:text-xs text-white truncate">기드</span>
        </button>

        <button
          onClick={() => handleOpenFacility('runewords')}
          className={`py-1 px-1 sm:px-2 rounded-lg border flex items-center justify-center gap-1 text-center transition cursor-pointer min-h-[36px] ${
            activeFacility === 'runewords' && isFacilityModalOpen
              ? 'bg-purple-950 border-purple-400 text-purple-200 ring-2 ring-purple-400 shadow-md'
              : 'bg-iron-900/95 border-iron-750 hover:border-purple-400 text-gray-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 flex-shrink-0" />
          <span className="font-cinzel font-black text-[10px] sm:text-xs text-white truncate">룬워드</span>
        </button>

        <button
          onClick={() => handleOpenFacility('cube')}
          className={`py-1 px-1 sm:px-2 rounded-lg border flex items-center justify-center gap-1 text-center transition cursor-pointer min-h-[36px] ${
            activeFacility === 'cube' && isFacilityModalOpen
              ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-md'
              : 'bg-iron-900/95 border-iron-750 hover:border-emerald-400 text-gray-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 flex-shrink-0" />
          <span className="font-cinzel font-black text-[10px] sm:text-xs text-white truncate">큐브</span>
        </button>
      </div>

      {/* 3. Thumb-Friendly Integrated Smart Expedition Dock */}
      <div className="p-1.5 sm:p-2 bg-iron-950/95 border-2 border-brass-600/70 rounded-xl space-y-1 shadow-2xl flex-shrink-0">
        {/* 3-A. Top Mini Status & Sub Actions */}
        <div className="flex items-center justify-between gap-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.2 bg-iron-900 border border-brass-500/80 rounded text-amber-300 font-black text-[10px] sm:text-[11px]">
              Lv.{playerStats.level}
            </span>
            <span className="text-brass-200 font-bold text-[10px] sm:text-xs">
              💰 {playerStats.gold.toLocaleString()} G
            </span>
            <span className="text-purple-300 font-bold text-[10px] sm:text-xs hidden min-[380px]:inline">
              · 🔮 {playerStats.shards} S
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openModal('inventory')}
              className="px-2 py-0.5 sm:py-1 bg-iron-900 hover:bg-iron-800 border border-iron-750 text-gray-200 rounded text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="소지품 및 보관함 열기 [I]"
            >
              <Package className="w-3 h-3 text-indigo-400" />
              <span>가방</span>
            </button>
            <button
              onClick={() => setViewMode('dungeon_select')}
              className="px-2 py-0.5 sm:py-1 bg-iron-900 hover:bg-iron-800 border border-iron-750 text-gray-200 rounded text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="던전 월드맵 선택"
            >
              <Compass className="w-3 h-3 text-red-400" />
              <span>월드맵</span>
            </button>
          </div>
        </div>

        {/* 3-B. Bottom Large Main Launch CTA (Preserves data-tutorial="deploy") */}
        <button
          data-tutorial="deploy"
          onClick={() => enterDungeon(lastDungeon.id, autoDeployDiff)}
          className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl ring-2 ring-amber-400/80 hover:ring-amber-300 transition transform active:scale-98 cursor-pointer min-h-[40px]"
          title={`[${lastDungeon.name.split(":")[0]}] (난이도 Lv.${autoDeployDiff})으로 즉시 출격`}
        >
          <span className="truncate">
            ⚔️ [출격] {lastDungeon.name.split(":")[0]} (Lv.{autoDeployDiff})
          </span>
          <ArrowRight className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>

      {/* 4. INDEPENDENT FACILITY MODAL WORKSPACE */}
      {isFacilityModalOpen && (
        <div
          onClick={() => setIsFacilityModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-none flex items-center justify-center p-2.5 sm:p-4 animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-iron-950 border-2 border-brass-500 rounded-2xl p-3 sm:p-5 max-w-4xl w-full max-h-[90dvh] flex flex-col shadow-2xl space-y-3 relative animate-scale-in text-gray-200 select-none overflow-hidden"
          >
            {/* Modal Header & Facility Switcher */}
            <div className="flex items-center justify-between border-b border-iron-750 pb-2.5 flex-shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsFacilityModalOpen(false)}
                  className="px-3 py-1.5 bg-iron-900 hover:bg-iron-800 border border-iron-750 hover:border-amber-400 text-gray-200 hover:text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                  title="마을 타운맵으로 돌아갑니다 [Esc]"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>뒤로가기</span>
                </button>

                <div className="grid grid-cols-4 gap-1 font-mono text-xs">
                  <button
                    onClick={() => setActiveFacility('cain')}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${activeFacility === 'cain' ? 'bg-blue-950 border-blue-400 text-blue-200 ring-1 ring-blue-400' : 'bg-iron-900 border-iron-800 text-gray-400'}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>케인</span>
                  </button>
                  <button
                    onClick={() => setActiveFacility('gamble')}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${activeFacility === 'gamble' ? 'bg-amber-950 border-amber-400 text-amber-200 ring-1 ring-amber-400' : 'bg-iron-900 border-iron-800 text-gray-400'}`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>기드</span>
                  </button>
                  <button
                    onClick={() => setActiveFacility('runewords')}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${activeFacility === 'runewords' ? 'bg-purple-950 border-purple-400 text-purple-200 ring-1 ring-purple-400' : 'bg-iron-900 border-iron-800 text-gray-400'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>룬워드</span>
                  </button>
                  <button
                    onClick={() => setActiveFacility('cube')}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${activeFacility === 'cube' ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400' : 'bg-iron-900 border-iron-800 text-gray-400'}`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>큐브</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsFacilityModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Pure Active Facility Workspace */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3">
            {/* 1. DECKARD CAIN (식별소) */}
            {activeFacility === 'cain' && (
              <div className="space-y-4 text-xs sm:text-sm text-center py-1 animate-fade-in">
                <div className="text-base sm:text-lg font-cinzel text-brass-200 font-black flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>"Stay awhile and listen!"</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-md mx-auto font-medium">
                  호라드림의 마지막 현자 데커드 케인이 던전에서 획득한 모든 미확인 장비의 숨겨진 유니크/레어 능력을 무료로 감정해 줍니다.
                </p>

                <div className="p-4 bg-iron-950 rounded-xl border-2 border-iron-700 max-w-md mx-auto shadow-xl space-y-3.5">
                  <div className="text-gray-200 font-mono font-bold flex items-center justify-between text-sm">
                    <span>미확인 전리품:</span>
                    <span className={`text-sm sm:text-base font-black px-2.5 py-0.5 rounded ${
                      unidentifiedCount > 0
                        ? 'bg-blood-950 text-blood-200 border border-blood-600 animate-pulse'
                        : 'bg-iron-900 text-gray-400'
                    }`}>
                      {unidentifiedCount} 개
                    </span>
                  </div>

                  {/* Tier 2-A: Arcane Identify All Button */}
                  <button
                    onClick={handleIdentifyAll}
                    disabled={unidentifiedCount === 0}
                    className={`w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-500 disabled:opacity-40 text-white font-black rounded-xl transition shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-blue-400 ring-2 ring-blue-400/60 hover:ring-blue-300 hover:shadow-[0_0_20px_rgba(96,165,250,0.5)] ${
                      unidentifiedCount > 0 ? 'animate-pulse' : ''
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>소지품 일괄 무료 감정 (Identify All)</span>
                  </button>

                  {identifiedHistory.length > 0 && (
                    <div className="mt-2 text-left space-y-2 max-h-60 overflow-y-auto pr-1">
                      <div className="font-bold text-gray-200 text-xs sm:text-sm flex items-center justify-between border-b border-iron-800 pb-1.5">
                        <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>최근 감정 장비 ({identifiedHistory.length}개):</span>
                        </span>
                        <span className="text-xs text-emerald-400 font-mono font-black">✓ 가방 보관</span>
                      </div>

                      <div className="space-y-2">
                        {identifiedHistory.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs sm:text-sm font-mono transition ${
                              item.rarity === 'unique' || item.rarity === 'legendary'
                                ? 'bg-orange-950/60 border-orange-400 text-orange-200 shadow-[0_0_12px_rgba(251,146,60,0.35)]'
                                : item.rarity === 'rare'
                                ? 'bg-yellow-950/50 border-yellow-400 text-yellow-200'
                                : 'bg-blue-950/50 border-blue-400 text-blue-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="font-black flex items-center gap-2 flex-wrap">
                                <span className="text-white text-xs sm:text-sm">{item.name}</span>
                                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-iron-950 border border-iron-700 text-amber-300 font-bold uppercase">
                                  {item.rarity}
                                </span>
                                <span className="text-xs text-gray-400">({item.slot})</span>
                              </div>
                              {item.subAffixes && item.subAffixes.length > 0 && (
                                <div className="text-[11px] sm:text-xs text-gray-200 flex flex-wrap gap-1">
                                  {item.subAffixes.map((aff, aIdx) => (
                                    <span key={aIdx} className="bg-iron-900/90 px-1.5 py-0.5 rounded border border-iron-750 text-emerald-300 font-bold">
                                      +{aff.value} {aff.label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-right flex sm:flex-col items-end gap-1.5 sm:gap-0 flex-shrink-0">
                              {item.stats.minDmg !== undefined && (
                                <span className="text-brass-200 font-black">공격력 {item.stats.minDmg}~{item.stats.maxDmg}</span>
                              )}
                              {item.stats.defense !== undefined && (
                                <span className="text-blue-300 font-black">방어 {item.stats.defense}</span>
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

                  <div className="text-xs text-gray-300 font-mono font-medium">
                    {unidentifiedCount > 0
                      ? '✓ 감정 시 숨겨진 접두사/접미사 및 고유 유니크 효과가 완전히 개방됩니다.'
                      : '✓ 현재 소지품에 감정 대기 중인 장비가 없습니다.'}
                  </div>
                </div>
              </div>
            )}

            {/* 2. GAMBLE (기드의 암시장 도박) */}
            {activeFacility === 'gamble' && (
              <div className="space-y-3.5 text-xs sm:text-sm animate-fade-in">
                <div className="text-gray-100 leading-relaxed font-medium bg-iron-950/80 p-3 rounded-xl border border-iron-750">
                  "모든 물건에는 가치가 있는 법이지... 골드만 충분하다면 말이야."<br />
                  미확인 장비를 뽑아 대박 <strong className="text-yellow-300 font-black">레어</strong> 및 <strong className="text-orange-400 font-black">유니크(나겔링, 조던링, 마라의 만화경 등)</strong>를 노리세요!
                </div>

                {gambleFeedback && (
                  <div className={`p-3 rounded-xl border-2 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fade-in ${
                    gambleFeedback.isHighRarity
                      ? "bg-gradient-to-r from-amber-950 via-iron-900 to-amber-950 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      : "bg-iron-950 border-brass-500 shadow-lg"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-900/90 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-base flex-shrink-0 animate-bounce">
                        🎲
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cinzel font-black text-sm sm:text-base text-white">
                            {gambleFeedback.item.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-black uppercase bg-iron-900 border border-amber-500 text-amber-300">
                            {gambleFeedback.item.rarity}
                          </span>
                          <span className="text-xs font-mono text-blood-300 font-black">
                            (-{gambleFeedback.cost.toLocaleString()} G)
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1">
                          가방에 획득 완료! 데커드 케인에게 감정받아 숨겨진 옵션을 확인하세요.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveFacility('cain')}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black rounded-lg text-xs sm:text-sm shadow transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer animate-pulse"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>케인에게 감정</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  <button
                    onClick={() => {
                      const res = gambleItem('weapon');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3500 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-amber-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>⚔️ 무기류</span>
                      <span className="text-[11px] text-amber-400 font-bold">도검/폴암</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">3,500 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('armor');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 4000 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-blue-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>🥋 갑옷류</span>
                      <span className="text-[11px] text-blue-400 font-bold">판금갑옷</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">4,000 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('shield');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3800 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-cyan-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>🛡️ 방패류</span>
                      <span className="text-[11px] text-cyan-400 font-bold">타워실드</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">3,800 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('helm');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 3200 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-purple-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>👑 투구류</span>
                      <span className="text-[11px] text-purple-400 font-bold">샤코/크라운</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">3,200 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('gloves');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 2800 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-emerald-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>🧤 장갑류</span>
                      <span className="text-[11px] text-emerald-400 font-bold">건틀릿</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">2,800 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('boots');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 2800 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-emerald-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>🥾 신발류</span>
                      <span className="text-[11px] text-emerald-400 font-bold">워부츠</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">2,800 G</div>
                  </button>


                  <button
                    onClick={() => {
                      const res = gambleItem('ring');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 6000 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-yellow-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>💍 반지 (Ring)</span>
                      <span className="text-[11px] text-yellow-400 font-bold">조던/나겔</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">6,000 G</div>
                  </button>

                  <button
                    onClick={() => {
                      const res = gambleItem('amulet');
                      if (res) setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: 7500 });
                    }}
                    className="p-3 bg-iron-950 hover:bg-iron-850 border-2 border-iron-700 hover:border-purple-400 rounded-xl text-left transition space-y-1.5 shadow cursor-pointer transform active:scale-95"
                  >
                    <div className="font-black text-gray-100 text-xs sm:text-sm flex items-center justify-between">
                      <span>📿 목걸이 (Amulet)</span>
                      <span className="text-[11px] text-purple-400 font-bold">마라/대군주</span>
                    </div>
                    <div className="text-brass-200 font-black text-xs sm:text-sm">7,500 G</div>
                  </button>
                </div>

                <div className="text-xs text-gray-300 text-center font-mono font-bold pt-0.5">
                  보유 골드: <span className="text-brass-200 font-black text-sm">{playerStats.gold.toLocaleString()} G</span>
                </div>
              </div>
            )}

            {/* 3. RUNEWORDS (룬워드 공방) */}
            {activeFacility === 'runewords' && (
              <div className="space-y-3.5 text-xs sm:text-sm animate-fade-in">
                <div className="text-gray-100 font-medium leading-relaxed bg-iron-950/80 p-3 rounded-xl border border-iron-750">
                  빈 소켓이 있는 노멀 베이스 장비에 룬을 순서대로 박아 <strong className="text-amber-300 font-black">전설의 룬워드</strong>를 제작하세요.
                </div>

                {/* Step 1: Base Item Selection (Inventory-style Vertical Responsive Grid) */}
                <div className="p-3 bg-iron-950 rounded-xl border border-iron-800 space-y-2.5">
                  <div className="font-bold text-gray-200 text-xs sm:text-sm flex justify-between items-center pb-1.5 border-b border-iron-800 flex-wrap gap-1">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>1. 소켓 베이스 장비 선택:</span>
                    </span>
                    {selectedBaseItem ? (
                      <button
                        onClick={() => setSelectedBaseItem(null)}
                        className="text-xs text-amber-300 hover:text-amber-200 font-mono font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        ✕ 선택 해제 (전체 도감)
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 font-mono font-bold">
                        보유 소켓 장비: {socketableItems.length}개
                      </span>
                    )}
                  </div>

                  {socketableItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {socketableItems.map(item => {
                        const isSelected = selectedBaseItem?.id === item.id;
                        const slotLabel = item.slot === 'weapon' ? '무기' : item.slot === 'armor' ? '갑옷' : item.slot === 'shield' ? '방패' : item.slot === 'helm' ? '투구' : item.slot;
                        const socketedCount = item.socketedRunes?.length || 0;
                        const remainingSockets = (item.sockets || 0) - socketedCount;

                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedBaseItem(isSelected ? null : item)}
                            className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between gap-2 transition shadow cursor-pointer relative ${
                              isSelected
                                ? 'bg-gradient-to-b from-amber-950/90 via-iron-900 to-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                                : 'bg-iron-900/95 border-iron-750 text-gray-200 hover:bg-iron-850 hover:border-iron-600'
                            }`}
                          >
                            {/* Card Top: Name & Selection Badge */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="font-black text-xs sm:text-sm text-white break-keep flex-1">
                                {item.name}
                              </div>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-iron-950 font-mono font-black text-xs flex-shrink-0 shadow">
                                  선택됨
                                </span>
                              )}
                            </div>

                            {/* Badges: Slot, Tier, Sockets */}
                            <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                              <span className="px-2 py-0.5 rounded bg-iron-950 border border-iron-700 text-gray-200 font-bold">
                                {slotLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-iron-950 border border-iron-700 text-amber-300 font-bold uppercase text-[11px]">
                                {item.tier || 'NORMAL'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-200 font-black">
                                💎 {item.sockets} 소켓
                              </span>
                            </div>

                            {/* Stats Line (Min/Max Dmg or Defense) */}
                            <div className="text-xs sm:text-sm font-mono font-bold flex items-center justify-between text-gray-200 pt-1 border-t border-iron-800 flex-wrap gap-1">
                              {item.stats.minDmg !== undefined && (
                                <span className="text-brass-200 font-black">
                                  공격력: {item.stats.minDmg} ~ {item.stats.maxDmg}
                                  {item.stats.attackSpeed !== undefined && item.stats.attackSpeed > 0 && (
                                    <span className="text-amber-300 ml-1">({item.stats.attackSpeed > 0 ? `+${item.stats.attackSpeed}%` : ''})</span>
                                  )}
                                </span>
                              )}
                              {item.stats.defense !== undefined && (
                                <span className="text-blue-300 font-black">
                                  방어력: {item.stats.defense}
                                </span>
                              )}
                              {remainingSockets < (item.sockets || 0) && (
                                <span className="text-xs text-emerald-400 font-black">
                                  ({socketedCount}/{item.sockets} 룬 각인)
                                </span>
                              )}
                            </div>

                            {/* Socketed Runes List if any (No Truncate!) */}
                            {item.socketedRunes && item.socketedRunes.length > 0 && (
                              <div className="text-xs text-purple-200 font-mono bg-iron-950 px-2 py-1 rounded border border-iron-800 flex flex-wrap gap-1">
                                <span className="text-gray-400 font-bold">각인:</span>
                                {item.socketedRunes.map((sr, sIdx) => (
                                  <span key={sIdx} className="bg-purple-900/60 text-purple-200 px-1 rounded border border-purple-700 font-bold">
                                    {sr}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center space-y-2 bg-iron-900/40 rounded-xl border border-dashed border-iron-800">
                      <div className="text-gray-300 font-mono text-xs sm:text-sm font-bold">
                        소지품에 빈 소켓 장비가 없습니다.
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                        던전 탐험에서 회색(노멀) 소켓 베이스 아이템을 획득하거나, 하단에서 룬워드 제작에 필요한 소켓 및 룬 공식을 미리 확인하세요.
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2: Recipes Grid View */}
                <div className="space-y-2.5 pt-1 border-t border-iron-750">
                  <div className="font-bold text-gray-200 text-xs sm:text-sm flex justify-between items-center flex-wrap gap-1">
                    <span>2. 룬워드 도감 & 제작 목록:</span>
                    <span className="text-xs text-purple-300 font-mono font-bold">
                      {selectedBaseItem ? `선택 베이스: ${selectedBaseItem.name} (${selectedBaseItem.sockets}S)` : '전체 레시피'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {RUNEWORD_RECIPES.filter(r => {
                      if (!selectedBaseItem) return true;
                      return r.allowedSlot === selectedBaseItem.slot && r.requiredSockets === selectedBaseItem.sockets;
                    }).map(recipe => {
                      const sim = simulateRuneWordCrafting(recipe, runesVault);
                      const isMatchingSelected = selectedBaseItem && recipe.allowedSlot === selectedBaseItem.slot && recipe.requiredSockets === selectedBaseItem.sockets;

                      return (
                        <div
                          key={recipe.id}
                          className={`p-3 rounded-xl border-2 flex flex-col justify-between gap-2.5 transition ${
                            isMatchingSelected && sim.canDirectCraft
                              ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                              : isMatchingSelected && sim.canTransmuteCraft
                              ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.35)]'
                              : 'bg-iron-950 border-iron-800'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs sm:text-sm text-amber-300">{recipe.name}</span>
                              <span className="text-xs font-mono text-gray-200 bg-iron-900 px-2 py-0.5 rounded border border-iron-700 font-bold">
                                {recipe.allowedSlot === 'weapon' ? '무기' : recipe.allowedSlot === 'armor' ? '갑옷' : recipe.allowedSlot === 'shield' ? '방패' : '투구'} ({recipe.requiredSockets}소켓)
                              </span>
                            </div>

                            {/* Rune Ingredients with High-Contrast Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {recipe.requiredRunes.map((rk, rIdx) => {
                                const vaultCount = runesVault[rk] || 0;
                                const isAvailable = vaultCount >= 1;
                                return (
                                  <span
                                    key={rIdx}
                                    className={`px-2 py-0.5 rounded text-xs font-mono font-black border ${
                                      isAvailable
                                        ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
                                        : 'bg-iron-900 text-gray-300 border-iron-700'
                                    }`}
                                    title={`보유: ${vaultCount}개`}
                                  >
                                    {rk} ({vaultCount}/1)
                                  </span>
                                );
                              })}
                            </div>

                            {/* Core Stat Badges Preview */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {recipe.enhancedDamage && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-amber-200 border-amber-600/70 bg-amber-950/70">
                                  피해 +{recipe.enhancedDamage}%
                                </span>
                              )}
                              {recipe.enhancedDefense && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-blue-200 border-blue-600/70 bg-blue-950/70">
                                  방어 +{recipe.enhancedDefense}%
                                </span>
                              )}
                              {recipe.bonusStats?.minDmg || recipe.bonusStats?.maxDmg ? (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-amber-200 border-amber-600/60 bg-amber-950/50">
                                  공격력 +{recipe.bonusStats.minDmg || 0}~{recipe.bonusStats.maxDmg || 0}
                                </span>
                              ) : null}
                              {recipe.bonusStats?.defense && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-blue-200 border-blue-600/60 bg-blue-950/50">
                                  방어력 +{recipe.bonusStats.defense}
                                </span>
                              )}
                              {recipe.bonusStats?.allResist && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-emerald-200 border-emerald-600/70 bg-emerald-950/70">
                                  모든저항 +{recipe.bonusStats.allResist}%
                                </span>
                              )}
                              {recipe.bonusStats?.attackSpeed && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-yellow-200 border-yellow-600/70 bg-yellow-950/70">
                                  공속 +{recipe.bonusStats.attackSpeed}%
                                </span>
                              )}
                              {recipe.bonusStats?.critChance && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border text-rose-200 border-rose-600/70 bg-rose-950/70">
                                  치명타 +{recipe.bonusStats.critChance}%
                                </span>
                              )}
                            </div>

                            {/* Flavor Description (High Contrast) */}
                            {recipe.description && (
                              <p className="text-xs text-gray-300 leading-snug pt-0.5 font-medium">
                                {recipe.description}
                              </p>
                            )}
                          </div>

                          {/* Action Button: Direct Craft / Transmute Craft */}
                          {isMatchingSelected ? (
                            <div className="flex gap-2 pt-1 border-t border-iron-800">
                              <button
                                onClick={() => {
                                  craftRuneWord(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canDirectCraft}
                                className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-black transition shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                                  sim.canDirectCraft
                                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 text-iron-950 ring-2 ring-amber-300'
                                    : 'bg-iron-900 text-gray-500 border border-iron-800 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <Hammer className="w-4 h-4" />
                                <span>즉시 제련</span>
                              </button>

                              <button
                                onClick={() => {
                                  craftRuneWordWithTransmute(selectedBaseItem.id, recipe.id);
                                  setSelectedBaseItem(null);
                                }}
                                disabled={!sim.canTransmuteCraft}
                                className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-black transition shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                                  sim.canTransmuteCraft
                                    ? 'bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 text-white ring-2 ring-purple-300'
                                    : 'bg-iron-900 text-gray-500 border border-iron-800 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <Hammer className="w-4 h-4" />
                                <span>🔮 합성 제작</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs font-mono text-gray-400 pt-1 text-right font-bold">
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
              <div className="space-y-4 text-xs sm:text-sm animate-fade-in">
                
                {/* 4대 호라드릭 영구 시설 강화 */}
                <div className="p-3.5 bg-gradient-to-b from-purple-950/70 via-iron-950 to-iron-950 rounded-xl border-2 border-purple-500/80 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-purple-800 pb-1.5 flex-wrap gap-1">
                    <span className="font-cinzel font-black text-xs sm:text-sm text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      호라드릭 영구 편의 연구소 (최대 30레벨)
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-black">보유: {playerStats.gold.toLocaleString()} G</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. Potion Max */}
                    <div className="p-3 bg-iron-900/95 rounded-xl border border-iron-750 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-xs sm:text-sm text-rose-200">🧪 물약 슬롯 상한</span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-800">
                          Lv.{townUpgrades.potionCapacityLevel}/{POTION_CAPACITY_TIERS.length - 1} ({POTION_CAPACITY_TIERS[townUpgrades.potionCapacityLevel] || 3}개)
                        </span>
                      </div>
                      {getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionCapacity')}
                          disabled={playerStats.gold < (getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) || 0)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-iron-950 disabled:text-amber-200/40 disabled:border-iron-800 text-iron-950 font-black text-xs sm:text-sm transition shadow cursor-pointer border border-amber-400"
                        >
                          강화 ({getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-xs font-mono font-black text-emerald-400 bg-iron-950 py-1 rounded-lg border border-iron-800">MAX (최대 달성)</div>
                      )}
                    </div>

                    {/* 2. Potion Healing */}
                    <div className="p-3 bg-iron-900/95 rounded-xl border border-iron-750 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-xs sm:text-sm text-rose-200">💖 물약 회복량 강화</span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-800">
                          Lv.{townUpgrades.potionHealingLevel}/30 (+{townUpgrades.potionHealingLevel * 10}%)
                        </span>
                      </div>
                      {getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionHealing')}
                          disabled={playerStats.gold < (getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) || 0)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-iron-950 disabled:text-amber-200/40 disabled:border-iron-800 text-iron-950 font-black text-xs sm:text-sm transition shadow cursor-pointer border border-amber-400"
                        >
                          강화 ({getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-xs font-mono font-black text-emerald-400 bg-iron-950 py-1 rounded-lg border border-iron-800">MAX (최대 달성)</div>
                      )}
                    </div>

                    {/* 3. Consumable Power */}
                    <div className="p-3 bg-iron-900/95 rounded-xl border border-iron-750 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-xs sm:text-sm text-blue-200">🛡️ 소모품 연금술 강화</span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-800">
                          Lv.{townUpgrades.consumablePowerLevel}/30 (+{townUpgrades.consumablePowerLevel * 8}%)
                        </span>
                      </div>
                      {getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('consumablePower')}
                          disabled={playerStats.gold < (getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) || 0)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-iron-950 disabled:text-amber-200/40 disabled:border-iron-800 text-iron-950 font-black text-xs sm:text-sm transition shadow cursor-pointer border border-amber-400"
                        >
                          강화 ({getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-xs font-mono font-black text-emerald-400 bg-iron-950 py-1 rounded-lg border border-iron-800">MAX (최대 달성)</div>
                      )}
                    </div>

                    {/* 4. Gamble Quality */}
                    <div className="p-3 bg-iron-900/95 rounded-xl border border-iron-750 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-xs sm:text-sm text-purple-200">🎲 도박 장비 품질 향상</span>
                        <span className="text-xs font-mono font-black text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-800">
                          Lv.{townUpgrades.gambleLevel}/20
                        </span>
                      </div>
                      {getGambleLevelUpgradeCost(townUpgrades.gambleLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('gambleLevel')}
                          disabled={playerStats.gold < (getGambleLevelUpgradeCost(townUpgrades.gambleLevel) || 0)}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:bg-iron-950 disabled:text-amber-200/40 disabled:border-iron-800 text-iron-950 font-black text-xs sm:text-sm transition shadow cursor-pointer border border-amber-400"
                        >
                          강화 ({getGambleLevelUpgradeCost(townUpgrades.gambleLevel)?.toLocaleString()} G)
                        </button>
                      ) : (
                        <div className="text-center text-xs font-mono font-black text-emerald-400 bg-iron-950 py-1 rounded-lg border border-iron-800">MAX (최대 달성)</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 큐브 속 재료 변환 */}
                <div className="p-3.5 bg-iron-950 rounded-xl border-2 border-iron-750 space-y-2.5">
                  <div className="font-bold text-gray-200 flex justify-between items-center text-xs sm:text-sm">
                    <span>큐브 속 재료 ({selectedCubeItems.length}/3):</span>
                    {selectedCubeItems.length > 0 && (
                      <button onClick={() => setSelectedCubeItems([])} className="text-blood-300 font-bold hover:underline text-xs cursor-pointer">
                        슬롯 비우기
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 min-h-[56px]">
                    {[0, 1, 2].map(idx => {
                      const itemId = selectedCubeItems[idx];
                      const item = inventory.find(i => i.id === itemId);
                      return (
                        <div key={idx} className="p-2 bg-iron-900 rounded-lg border-2 border-dashed border-iron-700 flex items-center justify-center text-center text-xs sm:text-sm">
                          {item ? (
                            <span className="text-brass-200 font-black break-keep">{item.name}</span>
                          ) : (
                            <span className="text-gray-400 font-mono font-bold">[빈 슬롯]</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleTransmute}
                    disabled={selectedCubeItems.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-40 text-white font-black rounded-xl transition shadow text-xs sm:text-sm cursor-pointer border border-purple-400"
                  >
                    🔮 비전 변환 (Transmute)
                  </button>
                </div>

                {/* Inventory Picker for Cube */}
                <div className="space-y-1.5">
                  <div className="text-xs sm:text-sm font-bold text-gray-200">소지품에서 큐브에 넣을 아이템 선택:</div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs sm:text-sm">
                    {inventory.map(item => {
                      const isSelected = selectedCubeItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCubeItem(item.id)}
                          className={`p-2 rounded-lg border cursor-pointer flex justify-between items-center transition ${
                            isSelected
                              ? 'bg-purple-950 border-purple-400 text-purple-100 font-black'
                              : 'bg-iron-950 border-iron-750 text-gray-200 hover:bg-iron-850'
                          }`}
                        >
                          <span className="break-keep font-medium">{item.name}</span>
                          <span className="text-xs text-gray-300 capitalize font-bold bg-iron-900 px-1.5 py-0.5 rounded border border-iron-800">{item.slot}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="pt-2.5 border-t border-iron-800 flex items-center justify-between flex-shrink-0 text-xs sm:text-sm font-mono">
              <span className="text-xs text-gray-300 font-medium">단축키 [Esc] 키로 닫기</span>
              <button
                onClick={() => setIsFacilityModalOpen(false)}
                className="px-4 py-2 bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-amber-400 text-gray-200 hover:text-white rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>마을 타운맵으로 복귀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TownView.displayName = 'TownView';
