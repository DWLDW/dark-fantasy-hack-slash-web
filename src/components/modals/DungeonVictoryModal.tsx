import React, { useMemo, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { Trophy, Sparkles, BookOpen, Coins, Gem, ArrowRight, HelpCircle, Zap, ShieldCheck, Swords } from 'lucide-react';
import { D2_RUNES } from '../../data/gameData';
import { isItemBetterWithThreshold } from '../../utils/itemScoring';
import type { GameItem, EquipSlot } from '../../types/game';

export const DungeonVictoryModal: React.FC = () => {
  const {
    isVictoryModalOpen,
    dungeonVictoryLoot,
    currentDungeon,
    currentDifficulty,
    maxUnlockedDifficulty,
    endlessRiftTier,
    closeVictoryModal,
    identifyAllVictoryLoot,
    enterDungeon,
    equipment,
    equipItem,
    autoEquipBestItems
  } = useGame();

  if (!isVictoryModalOpen || !dungeonVictoryLoot) return null;

  const allIdentified = useMemo(() => {
    return dungeonVictoryLoot.items.every(i => i.isIdentified !== false);
  }, [dungeonVictoryLoot.items]);

  const hasUnidentified = dungeonVictoryLoot.items.some(i => i.isIdentified === false);

  const isRift = Boolean(currentDungeon.isEndlessRift || currentDungeon.id.startsWith('endless_rift_'));
  
  // store has already advanced currentDungeon to the next chapter or endless tier
  const targetDungeon = currentDungeon;
  const isStoryProgression = !isRift && Boolean(targetDungeon);

  const targetDiff = isRift
    ? Math.max(currentDifficulty, maxUnlockedDifficulty)
    : (dungeonVictoryLoot.nextDifficulty || currentDifficulty);

  const targetLabel = isRift
    ? `🌌 대균열 ${currentDungeon.riftTier || endlessRiftTier}단계 진격 [Space]`
    : isStoryProgression
    ? `다음 장 진격: [${targetDungeon.name.split(':')[0]}] [Space]`
    : `상위 난이도 진격: Lv.${targetDiff} [Space]`;

  const handleReDeploy = () => {
    closeVictoryModal();
    enterDungeon(targetDungeon.id, targetDiff);
  };

  const isUpgrade = (item: GameItem): boolean => {
    if (item.isIdentified === false) return false;
    const isRing = item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2';
    if (isRing) {
      const r1 = equipment['ring1'];
      const r2 = equipment['ring2'];
      return isItemBetterWithThreshold(item, r1) || isItemBetterWithThreshold(item, r2);
    }
    const currentEquipped = equipment[item.slot as EquipSlot];
    return isItemBetterWithThreshold(item, currentEquipped);
  };

  const recommendedIds = useMemo(() => {
    if (!allIdentified) return new Set<string>();
    const s = new Set<string>();
    dungeonVictoryLoot.items.forEach(it => {
      if (isUpgrade(it)) s.add(it.id);
    });
    return s;
  }, [dungeonVictoryLoot.items, allIdentified, equipment]);

  // 🎮 게이머 손목 피로 방지: Space/Enter로 즉시 다음 진격, Esc로 마을 귀환, F로 케인 감정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleReDeploy();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeVictoryModal();
        return;
      }

      if (e.key.toLowerCase() === 'f' && hasUnidentified) {
        e.preventDefault();
        e.stopPropagation();
        identifyAllVictoryLoot();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnidentified, handleReDeploy, closeVictoryModal, identifyAllVictoryLoot]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none font-sans">
      <div className="bg-iron-950 border-2 border-brass-400 rounded-2xl p-3.5 sm:p-5 w-full max-w-3xl max-h-[94dvh] overflow-hidden shadow-[0_0_60px_rgba(251,191,36,0.45)] flex flex-col justify-between text-xs font-sans relative text-gray-200 gap-2.5">
        
        {/* 🏆 Grand AI Victory Cinematic Artwork Banner (Expanded 180px~220px) */}
        <div className="relative rounded-xl overflow-hidden border-2 border-brass-500/90 shadow-2xl h-44 sm:h-56 flex-shrink-0 flex items-end p-3 sm:p-4">
          <picture className="absolute inset-0 pointer-events-none z-0 select-none">
            <source srcSet="/images/ui/dungeon_victory_heroic.webp" type="image/webp" />
            <img
              src="/images/ui/dungeon_victory_heroic.jpg"
              alt="Dungeon Victory"
              className="w-full h-full object-cover object-center filter brightness-100 contrast-110"
              draggable={false}
            />
          </picture>
          {/* Rich Ambient Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/40 to-transparent" />

          {/* Victory Floating Title & Kane Identify Button */}
          <div className="relative z-10 flex items-end justify-between w-full gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950/90 border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-cinzel font-black text-amber-100 tracking-wider leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  던전 정복 완료!
                </h2>
                <div className="text-xs sm:text-sm text-amber-300 font-mono flex items-center gap-1.5 font-bold mt-0.5">
                  <span className="bg-iron-950/80 px-2 py-0.5 rounded border border-amber-500/60">
                    [{currentDungeon.name.split(':')[0]}]
                  </span>
                  <span className="text-gray-200">· Lv.{currentDifficulty} 정복 돌파</span>
                </div>
              </div>
            </div>

            {hasUnidentified && (
              <button
                onClick={identifyAllVictoryLoot}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-mono font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-cyan-300 flex items-center gap-1.5 cursor-pointer animate-pulse transition active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>데커드 케인 감정 [F]</span>
              </button>
            )}
          </div>
        </div>

        {/* 📊 Core Rewards Bar (Gold, Shards, EXP) */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center flex-shrink-0">
          <div className="p-2.5 rounded-xl bg-iron-900/90 border border-yellow-500/60 flex items-center justify-between px-3 shadow-lg">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-yellow-400" /> 골드
            </span>
            <span className="text-sm sm:text-base font-black text-yellow-200">
              +{dungeonVictoryLoot.gold.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-iron-900/90 border border-purple-500/60 flex items-center justify-between px-3 shadow-lg">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-purple-400" /> 샤드
            </span>
            <span className="text-sm sm:text-base font-black text-purple-200">
              +{dungeonVictoryLoot.shards.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-iron-900/90 border border-emerald-500/60 flex items-center justify-between px-3 shadow-lg">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> EXP
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-200">
              +{dungeonVictoryLoot.exp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 🔮 Dropped Runes Strip */}
        {Object.keys(dungeonVictoryLoot.runes).length > 0 && (
          <div className="p-2 bg-iron-900/90 rounded-xl border border-purple-500/60 flex items-center gap-2 overflow-x-auto flex-shrink-0 shadow">
            <span className="text-xs font-black text-purple-300 flex-shrink-0">🔮 룬 획득:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(dungeonVictoryLoot.runes).map(([rKey, count]) => {
                const def = D2_RUNES[rKey];
                return (
                  <span
                    key={rKey}
                    className="px-2 py-0.5 rounded-lg bg-iron-950 border border-purple-400 text-purple-200 font-mono font-black text-xs flex items-center gap-1 shadow"
                  >
                    <span>#{def?.number} {rKey}</span>
                    <span className="text-amber-300">x{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ⚔️ Equipment Loot Showcase Grid (3-Column Wide Layout) */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
          <div className="flex items-center justify-between text-xs font-mono text-gray-300">
            <span className="font-bold">획득 전리품 장비 ({dungeonVictoryLoot.items.length}개)</span>
            {allIdentified && (
              <button
                onClick={autoEquipBestItems}
                className="text-amber-300 font-black hover:underline flex items-center gap-1 cursor-pointer bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/60"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>추천 일괄 장착</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-xs">
            {dungeonVictoryLoot.items.map(item => {
              const isIdentified = item.isIdentified !== false;
              const isLegendary = isIdentified && (item.rarity === 'unique' || item.rarity === 'legendary');
              const isRecommended = isIdentified && recommendedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-xl border-2 flex items-center justify-between gap-1.5 shadow-md ${
                    !isIdentified
                      ? 'bg-blood-950/50 border-blood-600 text-blood-200'
                      : isRecommended
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400'
                      : isLegendary
                      ? 'bg-amber-950/70 border-amber-400 text-amber-100 ring-2 ring-amber-400'
                      : item.rarity === 'rare'
                      ? 'bg-yellow-950/50 border-yellow-500 text-yellow-200'
                      : 'bg-iron-900 border-iron-750 text-gray-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-black truncate flex items-center gap-1">
                      <span>{item.name}</span>
                      {!isIdentified && <HelpCircle className="w-3 h-3 text-blood-400" />}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">
                      {item.slot} · {isIdentified ? item.rarity : '미확인'}
                    </div>
                  </div>

                  {isIdentified && isRecommended && (
                    <button
                      onClick={() => equipItem(item)}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] flex items-center gap-0.5 flex-shrink-0 cursor-pointer shadow active:scale-95"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>장착</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎮 Bottom Large Action Bar (Height 48px) */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-iron-800 flex-shrink-0">
          <button
            onClick={handleReDeploy}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-[0_0_20px_rgba(239,68,68,0.7)] ring-2 ring-amber-300 flex items-center justify-center gap-2 cursor-pointer animate-pulse active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span className="truncate">{targetLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={closeVictoryModal}
            className="w-full py-2.5 sm:py-3 bg-iron-900 hover:bg-iron-800 border-2 border-iron-700 text-gray-200 hover:text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>마을 귀환 [Esc]</span>
          </button>
        </div>

      </div>
    </div>
  );
};


