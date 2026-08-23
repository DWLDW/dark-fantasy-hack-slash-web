import React, { useState, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, RUNEWORD_RECIPES, D2_RUNES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { GameItem } from '../../types/game';
import { ACHIEVEMENTS } from '../../data/achievements';
import {
  Box,
  Sparkles,
  Dices,
  BookOpen,
  ArrowRight,
  Shield,
  Flame,
  Compass,
  Hammer,
  Trophy,
  Heart,
  Zap,
  FlaskConical,
  ArrowUpCircle,
  Backpack,
  Activity,
  Coins,
  Gem
} from 'lucide-react';
import {
  POTION_CAPACITY_TIERS,
  getPotionCapacityUpgradeCost,
  getPotionHealingUpgradeCost,
  getConsumablePowerUpgradeCost,
  getGambleLevelUpgradeCost
} from '../../state/helpers/cubeCraftingHelper';

export const TownView: React.FC = React.memo(() => {
  const {
    playerStats,
    totalStats,
    equipment,
    inventory,
    runesVault,
    currentDungeon,
    currentDifficulty,
    maxUnlockedDifficulty,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    enterDungeon,
    setViewMode,
    openModal,
    transmuteInCube,
    gambleItem,
    identifyAllItems,
    achievementStats,
    claimedAchievements,
    townUpgrades,
    upgradeTownFacility
  } = useGame();

  const autoDeployDiff = Math.max(1, maxUnlockedDifficulty || currentDifficulty || 1);
  const [activeFacility, setActiveFacility] = useState<'cain' | 'gamble' | 'runewords' | 'cube'>('cain');
  const [gambleFeedback, setGambleFeedback] = useState<{ item: GameItem; isHighRarity: boolean; cost: number } | null>(null);
  const [identifiedHistory, setIdentifiedHistory] = useState<GameItem[]>([]);
  const [selectedCubeItems, setSelectedCubeItems] = useState<string[]>([]);

  const handleIdentifyAll = () => {
    const identified = identifyAllItems();
    if (identified && identified.length > 0) {
      setIdentifiedHistory(identified);
    }
  };

  const handleToggleCubeItem = (id: string) => {
    if (selectedCubeItems.includes(id)) {
      setSelectedCubeItems(prev => prev.filter(i => i !== id));
    } else {
      if (selectedCubeItems.length < 3) {
        setSelectedCubeItems(prev => [...prev, id]);
      }
    }
  };

  const handleExecuteCube = () => {
    transmuteInCube(selectedCubeItems);
    setSelectedCubeItems([]);
  };

  const handleGamble = (type: 'weapon' | 'armor' | 'ring' | 'amulet') => {
    const res = gambleItem(type);
    if (res) {
      setGambleFeedback({ item: res.item, isHighRarity: res.isHighRarity, cost: type === 'weapon' ? 3500 : type === 'armor' ? 4000 : type === 'ring' ? 6000 : 7500 });
    }
  };

  const lastDungeon = currentDungeon || DUNGEONS_DATA[0];
  const unidentifiedCount = inventory.filter(i => i.isIdentified === false).length;

  const totalVaultRunes = useMemo(() => {
    return Object.values(runesVault).reduce((a, b) => a + b, 0);
  }, [runesVault]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 space-y-3 select-none pb-16 font-sans">
      {/* 1. Town Top Navigation & Status Bar */}
      <div className="bg-iron-950/95 border-2 border-brass-500/80 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blood-950 border border-brass-500 flex items-center justify-center text-brass-400 font-cinzel font-black text-sm shadow">
              ❖
            </div>
            <div>
              <h1 className="font-cinzel font-black text-sm sm:text-base text-white tracking-wider">
                로그 야영지 (Rogue Encampment)
              </h1>
              <p className="text-[11px] text-gray-400 font-mono">
                성역의 마지막 안식처 · 장비 감정, 도박, 룬워드 및 영구 강화 연구소
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Achievements, Map, Deploy */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => openModal('achievement')}
            className="px-2.5 py-1.5 bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-amber-400 text-amber-300 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition shadow cursor-pointer relative"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>업적</span>
            {ACHIEVEMENTS.some(a => a.condition(achievementStats) && !claimedAchievements.includes(a.id)) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            data-tutorial="dungeon_select"
            onClick={() => setViewMode('dungeon_select')}
            className="px-3 py-1.5 bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-200 hover:text-white rounded text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>던전 선택 맵</span>
          </button>

          <button
            data-tutorial="deploy"
            onClick={() => enterDungeon(lastDungeon.id, autoDeployDiff)}
            className="px-4 py-1.5 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded text-xs flex items-center gap-1.5 shadow-xl ring-1 ring-amber-400/60 transition transform active:scale-95 animate-pulse cursor-pointer"
            title={`[${lastDungeon.name.split(':')[0]}] (개방 최고 난이도 Lv.${autoDeployDiff})으로 즉시 출격`}
          >
            <span>[Space] [${lastDungeon.name.split(':')[0]}] Lv.${autoDeployDiff} 즉시 출격</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Compact Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* LEFT COLUMN (7 Cols): 4 D2 Town Facilities (Cain, Gamble, RuneWords, Cube Upgrades) */}
        <div className="lg:col-span-7 bg-iron-900/90 p-3 sm:p-4 rounded-xl border-2 border-iron-750 flex flex-col shadow-xl space-y-3">
          {/* Facility Nav Tabs */}
          <div className="flex border-b border-iron-750 gap-1.5 pb-2.5">
            {/* 1. DECKARD CAIN */}
            <button
              data-tutorial="cain"
              onClick={() => setActiveFacility('cain')}
              className={`flex-1 py-2 px-1 rounded text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer relative ${
                activeFacility === 'cain'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md ring-1 ring-brass-400/50'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>데커드 케인</span>
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
              className={`flex-1 py-2 px-1 rounded text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'gamble'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md ring-1 ring-brass-400/50'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Dices className="w-4 h-4 text-yellow-400" />
              <span>기드의 도박</span>
            </button>

            {/* 3. RUNEWORDS */}
            <button
              data-tutorial="runewords"
              onClick={() => setActiveFacility('runewords')}
              className={`flex-1 py-2 px-1 rounded text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'runewords'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md ring-1 ring-brass-400/50'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>룬워드 도감</span>
            </button>

            {/* 4. HORADRIC CUBE & UPGRADES */}
            <button
              onClick={() => setActiveFacility('cube')}
              className={`flex-1 py-2 px-1 rounded text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                activeFacility === 'cube'
                  ? 'bg-blood-950 text-brass-200 border-2 border-brass-400 shadow-md ring-1 ring-brass-400/50'
                  : 'bg-iron-950 text-gray-300 hover:bg-iron-800 hover:text-white border border-iron-700'
              }`}
            >
              <Box className="w-4 h-4 text-purple-400" />
              <span>골드 연구소</span>
            </button>
          </div>

          {/* Facility Content Views */}
          <div className="flex-1">
            {/* 1. DECKARD CAIN */}
            {activeFacility === 'cain' && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="p-3 bg-iron-950/80 rounded-lg border border-iron-750 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-cinzel font-black text-sm text-brass-200">
                      📜 현자 데커드 케인 (무료 일괄 감정)
                    </h3>
                    <p className="text-[11px] text-gray-300 mt-0.5">
                      "Stay awhile and listen!" 미확인 장비의 숨겨진 잠재력과 고유 옵션을 해방합니다.
                    </p>
                  </div>

                  <button
                    onClick={handleIdentifyAll}
                    disabled={unidentifiedCount === 0}
                    className={`px-4 py-2 rounded-lg font-black text-xs transition shadow flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      unidentifiedCount > 0
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white animate-pulse'
                        : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>모두 감정하기 ({unidentifiedCount}개)</span>
                  </button>
                </div>

                {identifiedHistory.length > 0 && (
                  <div className="p-2.5 rounded bg-iron-950 border border-iron-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-300 font-mono">최근 감정 완료된 전리품:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                      {identifiedHistory.map(item => (
                        <div key={item.id} className="p-1.5 rounded bg-iron-900 border border-iron-750 flex justify-between items-center">
                          <span className="font-bold text-gray-200 truncate">{item.name}</span>
                          <span className="text-[10px] text-amber-400 uppercase font-black">{item.rarity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. GAMBLE */}
            {activeFacility === 'gamble' && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-950/80 via-iron-900 to-amber-950/80 border border-amber-500/70 flex items-center justify-between gap-2 shadow">
                  <div className="flex items-center gap-2">
                    <Dices className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-black text-amber-200">기드의 암시장 도박장 [도박장 Lv.{townUpgrades.gambleLevel}/5]</div>
                      <div className="text-[10px] text-gray-300 font-mono">
                        {townUpgrades.gambleLevel === 1 ? '일반~익셉셔널 초반 장비' : townUpgrades.gambleLevel === 2 ? '익셉셔널 중급 장비 해금' : townUpgrades.gambleLevel === 3 ? '익셉셔널 후반 & 엘리트 무기' : townUpgrades.gambleLevel === 4 ? '엘리트 종결 베이스 & 유니크 대폭 상승' : '최상급 종결급 & 조던링/샤코/할배검 출현!'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono bg-iron-950 px-2 py-0.5 rounded border border-iron-750">
                    골드: {playerStats.gold.toLocaleString()} G
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button onClick={() => handleGamble('weapon')} className="p-3 bg-iron-950 hover:bg-amber-950/40 border border-iron-700 hover:border-amber-400 rounded-lg text-center transition cursor-pointer shadow">
                    <div className="text-lg">⚔️</div>
                    <div className="font-bold text-gray-200 mt-1">무기 도박</div>
                    <div className="text-[10px] text-amber-300 font-mono font-black mt-0.5">3,500 G</div>
                  </button>
                  <button onClick={() => handleGamble('armor')} className="p-3 bg-iron-950 hover:bg-amber-950/40 border border-iron-700 hover:border-amber-400 rounded-lg text-center transition cursor-pointer shadow">
                    <div className="text-lg">🛡️</div>
                    <div className="font-bold text-gray-200 mt-1">방어구 도박</div>
                    <div className="text-[10px] text-amber-300 font-mono font-black mt-0.5">4,000 G</div>
                  </button>
                  <button onClick={() => handleGamble('ring')} className="p-3 bg-iron-950 hover:bg-amber-950/40 border border-iron-700 hover:border-amber-400 rounded-lg text-center transition cursor-pointer shadow">
                    <div className="text-lg">💍</div>
                    <div className="font-bold text-gray-200 mt-1">반지 도박</div>
                    <div className="text-[10px] text-amber-300 font-mono font-black mt-0.5">6,000 G</div>
                  </button>
                  <button onClick={() => handleGamble('amulet')} className="p-3 bg-iron-950 hover:bg-amber-950/40 border border-iron-700 hover:border-amber-400 rounded-lg text-center transition cursor-pointer shadow">
                    <div className="text-lg">📿</div>
                    <div className="font-bold text-gray-200 mt-1">목걸이 도박</div>
                    <div className="text-[10px] text-amber-300 font-mono font-black mt-0.5">7,500 G</div>
                  </button>
                </div>

                {gambleFeedback && (
                  <div className="p-2.5 rounded bg-iron-950 border border-amber-500/60 flex items-center justify-between gap-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">도박 획득: [{gambleFeedback.item.name}]</span>
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-iron-900 px-1 rounded">
                        {gambleFeedback.item.rarity}
                      </span>
                    </div>
                    <button onClick={() => openModal('inventory')} className="text-[10px] text-brass-300 underline font-mono">가방에서 보기</button>
                  </div>
                )}
              </div>
            )}

            {/* 3. RUNEWORDS */}
            {activeFacility === 'runewords' && (
              <div className="space-y-2 text-xs animate-fade-in max-h-[260px] overflow-y-auto pr-1">
                <div className="text-[11px] font-mono text-gray-300 bg-iron-950 p-2 rounded border border-iron-800">
                  노말 소켓 장비에 정확한 룬 조합을 각인하여 강력한 고대 룬워드를 제작합니다.
                </div>
                {RUNEWORD_RECIPES.map(recipe => {
                  const sim = simulateRuneWordCrafting(recipe, runesVault);
                  return (
                    <div key={recipe.id} className="p-2.5 rounded-lg bg-iron-950 border border-iron-750 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                          <span>{recipe.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-normal">({recipe.allowedSlot}, {recipe.requiredSockets}소켓)</span>
                        </div>
                        <div className="text-[11px] text-purple-300 font-mono mt-0.5">
                          필요 룬: [{recipe.requiredRunes.join(' + ')}]
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        sim.canDirectCraft ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-iron-900 text-gray-500'
                      }`}>
                        {sim.canDirectCraft ? '제작 가능' : '룬 부족'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. CUBE & PERMANENT UPGRADES */}
            {activeFacility === 'cube' && (
              <div className="space-y-3 text-xs animate-fade-in">
                {/* 4대 호라드릭 영구 시설 강화 */}
                <div className="p-3 bg-gradient-to-b from-purple-950/50 via-iron-950 to-iron-950 rounded-lg border-2 border-purple-500/70 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-purple-800/60 pb-1.5">
                    <span className="font-cinzel font-black text-xs text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      호라드릭 영구 편의 강화 (골드 연구소)
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">보유: {playerStats.gold.toLocaleString()} G</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* 1. Potion Max */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-300 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-red-400" /> 물약 상한
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-300 bg-iron-950 px-1.5 py-0.2 rounded border border-iron-800">
                          Lv.{townUpgrades.potionCapacityLevel}/5 ({POTION_CAPACITY_TIERS[townUpgrades.potionCapacityLevel] || 3}개)
                        </span>
                      </div>
                      {getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionCapacity')}
                          disabled={playerStats.gold < (getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[11px] transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>강화 ({getPotionCapacityUpgradeCost(townUpgrades.potionCapacityLevel)?.toLocaleString()} G)</span>
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 2. Potion Healing */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-300 flex items-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-rose-400" /> 물약 회복량
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-300 bg-iron-950 px-1.5 py-0.2 rounded border border-iron-800">
                          Lv.{townUpgrades.potionHealingLevel}/10 (+{townUpgrades.potionHealingLevel * 15} HP)
                        </span>
                      </div>
                      {getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('potionHealing')}
                          disabled={playerStats.gold < (getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[11px] transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>강화 ({getPotionHealingUpgradeCost(townUpgrades.potionHealingLevel)?.toLocaleString()} G)</span>
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 3. Consumable Alchemy */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-300 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-blue-400" /> 소모품 연금술
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-300 bg-iron-950 px-1.5 py-0.2 rounded border border-iron-800">
                          Lv.{townUpgrades.consumablePowerLevel}/10
                        </span>
                      </div>
                      {getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('consumablePower')}
                          disabled={playerStats.gold < (getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel) || 0)}
                          className="w-full py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[11px] transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>강화 ({getConsumablePowerUpgradeCost(townUpgrades.consumablePowerLevel)?.toLocaleString()} G)</span>
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>

                    {/* 4. Gamble Level */}
                    <div className="p-2 bg-iron-900/90 rounded border border-iron-750 flex flex-col justify-between space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-yellow-300 flex items-center gap-1">
                          <Dices className="w-3.5 h-3.5 text-yellow-400" /> 도박장 레벨
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-300 bg-iron-950 px-1.5 py-0.2 rounded border border-iron-800">
                          Lv.{townUpgrades.gambleLevel}/5
                        </span>
                      </div>
                      {getGambleLevelUpgradeCost(townUpgrades.gambleLevel) !== null ? (
                        <button
                          onClick={() => upgradeTownFacility('gambleLevel')}
                          disabled={playerStats.gold < (getGambleLevelUpgradeCost(townUpgrades.gambleLevel) || 0)}
                          className="w-full py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:bg-iron-800 disabled:text-gray-600 text-iron-950 font-black text-[11px] transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>강화 ({getGambleLevelUpgradeCost(townUpgrades.gambleLevel)?.toLocaleString()} G)</span>
                        </button>
                      ) : (
                        <div className="text-center text-[10px] font-mono font-bold text-emerald-400 bg-iron-950 py-0.5 rounded border border-iron-800">MAX</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cube Transmute Panel */}
                <div className="p-2.5 bg-iron-950 rounded-lg border border-iron-750 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-gray-300 font-mono">
                    선택된 큐브 재료 ({selectedCubeItems.length}/3)
                  </div>
                  <button
                    onClick={handleExecuteCube}
                    disabled={selectedCubeItems.length === 0}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-iron-800 disabled:text-gray-600 text-white font-bold text-xs rounded transition cursor-pointer"
                  >
                    🔮 합성 (Transmute)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Recommended Dungeon Action Card + Character Quick Launchers */}
        <div className="lg:col-span-5 space-y-3">
          {/* Recommended Dungeon Action Card */}
          <div className="bg-iron-900/90 p-4 rounded-xl border-2 border-brass-500/80 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-iron-750 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel font-black text-sm text-white">추천 원정 던전</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-750">
                Lv.{lastDungeon.recommendedLevel} 권장
              </span>
            </div>

            <div>
              <div className="font-bold text-sm text-brass-200">{lastDungeon.name}</div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">{lastDungeon.theme}</div>
              <div className="text-[11px] text-gray-300 mt-1 font-mono">
                몬스터: {lastDungeon.monsterSummary}
              </div>
            </div>

            <div className="pt-2 border-t border-iron-750">
              <button
                onClick={() => enterDungeon(lastDungeon.id, autoDeployDiff)}
                className="w-full py-3 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black text-sm rounded-lg transition shadow-xl ring-2 ring-amber-400/60 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 animate-pulse"
              >
                <span>⚔️ [{lastDungeon.name.split(':')[0]}] Lv.{autoDeployDiff} 즉시 출격</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Character, Inventory, Skills Quick Navigation Cards */}
          <div className="grid grid-cols-3 gap-2 font-mono">
            {/* C: Stats */}
            <button
              onClick={() => openModal('character')}
              className="p-2.5 rounded-lg bg-iron-900 hover:bg-iron-850 border border-iron-750 hover:border-amber-400 text-left transition shadow cursor-pointer relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <Shield className="w-4 h-4" />
                <kbd className="bg-iron-950 px-1 rounded text-[10px] text-gray-400 border border-iron-750">C</kbd>
              </div>
              <div className="font-black text-white text-xs mt-1">스탯창</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Lv.{playerStats.level}</div>
              {playerStats.statPoints > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-iron-950 text-[9px] font-black rounded-full shadow animate-pulse">
                  +{playerStats.statPoints}P
                </span>
              )}
            </button>

            {/* I: Inventory */}
            <button
              onClick={() => openModal('inventory')}
              className="p-2.5 rounded-lg bg-iron-900 hover:bg-iron-850 border border-iron-750 hover:border-emerald-400 text-left transition shadow cursor-pointer relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <Backpack className="w-4 h-4" />
                <kbd className="bg-iron-950 px-1 rounded text-[10px] text-gray-400 border border-iron-750">I</kbd>
              </div>
              <div className="font-black text-white text-xs mt-1">가방·장비</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{inventory.length}/40개</div>
            </button>

            {/* K: Skills */}
            <button
              onClick={() => openModal('skills')}
              className="p-2.5 rounded-lg bg-iron-900 hover:bg-iron-850 border border-iron-750 hover:border-purple-400 text-left transition shadow cursor-pointer relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <Zap className="w-4 h-4" />
                <kbd className="bg-iron-950 px-1 rounded text-[10px] text-gray-400 border border-iron-750">K</kbd>
              </div>
              <div className="font-black text-white text-xs mt-1">스킬·룬</div>
              <div className="text-[10px] text-gray-400 mt-0.5">4대 슬롯</div>
              {playerStats.skillPoints > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-purple-500 text-white text-[9px] font-black rounded-full shadow animate-pulse">
                  +{playerStats.skillPoints}SP
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TownView.displayName = 'TownView';
