import React, { useMemo, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { Trophy, Sparkles, BookOpen, Coins, Gem, ArrowRight, Flame, HelpCircle, Zap, ShieldCheck, Package, Lock, Swords, Crown } from 'lucide-react';
import { D2_RUNES } from '../../data/gameData';
import { getNextStoryDungeon, generateEndlessRiftDungeon } from '../../data/dungeons';
import { isItemBetterWithThreshold, calculateItemScore } from '../../utils/itemScoring';
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
    inventory,
    equipItem,
    autoEquipBestItems,
    bulkSellItems,
    getItemSellPrice
  } = useGame();

  if (!isVictoryModalOpen || !dungeonVictoryLoot) return null;

  const allIdentified = useMemo(() => {
    return dungeonVictoryLoot.items.every(i => i.isIdentified !== false);
  }, [dungeonVictoryLoot.items]);

  const hasUnidentified = dungeonVictoryLoot.items.some(i => i.isIdentified === false);

  const legendariesCount = dungeonVictoryLoot.items.filter(
    i => i.isIdentified && (i.rarity === 'unique' || i.rarity === 'legendary' || i.rarity === 'set')
  ).length;

  const isRift = Boolean(currentDungeon.isEndlessRift || currentDungeon.id.startsWith('endless_rift_'));
  
  // store has already advanced currentDungeon to the next chapter or endless tier
  const targetDungeon = currentDungeon;
  const isStoryProgression = !isRift && Boolean(targetDungeon);

  const targetDiff = isRift
    ? Math.max(currentDifficulty, maxUnlockedDifficulty)
    : (dungeonVictoryLoot.nextDifficulty || currentDifficulty);

  const targetLabel = isRift
    ? `🌌 대균열 ${currentDungeon.riftTier || endlessRiftTier}단계 진격 (Space)`
    : isStoryProgression
    ? `다음 장 진격: [${targetDungeon.name.split(':')[0]}]`
    : `전 막 정복! 상위 난이도: [${currentDungeon.name.split(':')[0]}] Lv.${targetDiff}`;

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

  const normalItems = inventory.filter(i => i.rarity === 'normal');
  const normalCount = normalItems.length;
  const normalGoldPreview = normalItems.reduce((sum, it) => sum + getItemSellPrice(it), 0);
  const showBulkSellCTA = inventory.length > 30;

  const handleBulkSellNormal = () => {
    if (normalCount === 0) return;
    bulkSellItems(['normal']);
  };

  // 🎮 게이머 손목 피로 방지: Space/Enter로 즉시 다음 진격, Esc로 마을 귀환
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-none animate-fade-in select-none font-sans">
      <div className="bg-iron-950 border-2 border-brass-400 rounded-xl p-3 sm:p-4 w-full max-w-xl max-h-[96dvh] overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.35)] flex flex-col justify-between text-xs font-sans relative text-gray-200">
        
        {/* 🏆 Top AI Victory Artwork Banner (Compact 120px) */}
        <div className="relative rounded-lg overflow-hidden border border-brass-500/80 shadow-lg h-24 sm:h-28 flex-shrink-0 flex items-end p-2 sm:p-2.5">
          <picture className="absolute inset-0 pointer-events-none z-0 select-none">
            <source srcSet="/images/ui/dungeon_victory_heroic.webp" type="image/webp" />
            <img
              src="/images/ui/dungeon_victory_heroic.jpg"
              alt="Dungeon Victory"
              className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
              draggable={false}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/40 to-transparent" />

          {/* Victory Floating Title */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-300 shadow">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-cinzel font-black text-white tracking-wider leading-tight drop-shadow">
                  던전 정복 완료!
                </h2>
                <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                  <span>[{currentDungeon.name.split(':')[0]}]</span>
                  <span className="text-gray-300">· Lv.{currentDifficulty} 돌파</span>
                </div>
              </div>
            </div>

            {hasUnidentified && (
              <button
                onClick={identifyAllVictoryLoot}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono font-bold text-[10px] sm:text-xs shadow flex items-center gap-1 cursor-pointer animate-pulse"
              >
                <BookOpen className="w-3 h-3" />
                <span>케인 감정 [F]</span>
              </button>
            )}
          </div>
        </div>

        {/* 📊 Reward & Combat Stats Bar (Slim 32px) */}
        <div className="grid grid-cols-3 gap-1.5 font-mono text-center my-1 flex-shrink-0">
          <div className="p-1.5 rounded-lg bg-iron-900/90 border border-yellow-600/50 flex items-center justify-between px-2">
            <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1">
              <Coins className="w-3 h-3" /> 골드
            </span>
            <span className="text-xs font-black text-yellow-200">
              +{dungeonVictoryLoot.gold.toLocaleString()}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-iron-900/90 border border-purple-600/50 flex items-center justify-between px-2">
            <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
              <Gem className="w-3 h-3" /> 샤드
            </span>
            <span className="text-xs font-black text-purple-200">
              +{dungeonVictoryLoot.shards}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-iron-900/90 border border-emerald-600/50 flex items-center justify-between px-2">
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> EXP
            </span>
            <span className="text-xs font-black text-emerald-200">
              +{dungeonVictoryLoot.exp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 🔮 Dropped Runes Strip */}
        {Object.keys(dungeonVictoryLoot.runes).length > 0 && (
          <div className="p-1.5 bg-iron-900/90 rounded-lg border border-purple-600/50 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
            <span className="text-[10px] font-bold text-purple-300 flex-shrink-0">🔮 룬:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {Object.entries(dungeonVictoryLoot.runes).map(([rKey, count]) => {
                const def = D2_RUNES[rKey];
                return (
                  <span
                    key={rKey}
                    className="px-1.5 py-0.2 rounded bg-iron-950 border border-purple-500 text-purple-200 font-mono font-black text-[9px] flex items-center gap-0.5"
                  >
                    <span>#{def?.number} {rKey}</span>
                    <span className="text-amber-300">x{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ⚔️ Equipment Loot Showcase Grid (Flex-1 Adaptive) */}
        <div className="flex-1 min-h-0 my-1 overflow-y-auto space-y-1 pr-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>획득 장비 ({dungeonVictoryLoot.items.length}개)</span>
            {allIdentified && (
              <button
                onClick={autoEquipBestItems}
                className="text-amber-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Zap className="w-2.5 h-2.5" />
                <span>추천 일괄 장착</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
            {dungeonVictoryLoot.items.map(item => {
              const isIdentified = item.isIdentified !== false;
              const isLegendary = isIdentified && (item.rarity === 'unique' || item.rarity === 'legendary');
              const isRecommended = isIdentified && recommendedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-1.5 rounded-lg border flex items-center justify-between gap-1 shadow ${
                    !isIdentified
                      ? 'bg-blood-950/40 border-blood-600 text-blood-200'
                      : isRecommended
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400'
                      : isLegendary
                      ? 'bg-amber-950/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                      : item.rarity === 'rare'
                      ? 'bg-yellow-950/40 border-yellow-500 text-yellow-200'
                      : 'bg-iron-900 border-iron-750 text-gray-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-black truncate flex items-center gap-1">
                      <span>{item.name}</span>
                      {!isIdentified && <HelpCircle className="w-2.5 h-2.5 text-blood-400" />}
                    </div>
                    <div className="text-[9px] text-gray-400 truncate">
                      {item.slot} · {isIdentified ? item.rarity : '미확인'}
                    </div>
                  </div>

                  {isIdentified && isRecommended && (
                    <button
                      onClick={() => equipItem(item)}
                      className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] flex items-center gap-0.5 flex-shrink-0 cursor-pointer"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>장착</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎮 Bottom Action Bar (Fixed 44px) */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-iron-800 flex-shrink-0">
          <button
            onClick={handleReDeploy}
            className="w-full py-2 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded-lg text-xs transition shadow-xl ring-1 ring-amber-300 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="truncate">다음 진격 [Space]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={closeVictoryModal}
            className="w-full py-2 bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-300 hover:text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>마을 귀환 [Esc]</span>
          </button>
        </div>

      </div>
    </div>
  );
};

