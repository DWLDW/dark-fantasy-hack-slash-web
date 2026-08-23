import React, { useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { Trophy, Sparkles, BookOpen, Coins, Gem, ArrowRight, Flame, HelpCircle, Zap, ShieldCheck, Package } from 'lucide-react';
import { D2_RUNES } from '../../data/gameData';
import type { GameItem, ItemStats } from '../../types/game';

function offensiveScore(stats: ItemStats | undefined): number {
  if (!stats) return 0;
  return (stats.minDmg || 0) + (stats.maxDmg || 0) + (stats.critChance || 0) + ((stats.critDamage || 0) * 0.1) + (stats.attackSpeed || 0) * 0.5 + (stats.overkillEfficiency || 0) * 0.1;
}
function defensiveScore(stats: ItemStats | undefined): number {
  if (!stats) return 0;
  return (stats.defense || 0) + (stats.evasion || 0) * 2 + (stats.damageReduction || 0) * 5 + (stats.hp || 0) * 0.2 + (stats.allResist || 0) * 2;
}

export const DungeonVictoryModal: React.FC = () => {
  const {
    isVictoryModalOpen,
    dungeonVictoryLoot,
    currentDungeon,
    currentDifficulty,
    closeVictoryModal,
    identifyAllVictoryLoot,
    enterDungeon,
    equipment,
    inventory,
    equipItem,
    bulkSellItems,
    getItemSellPrice
  } = useGame();

  if (!isVictoryModalOpen || !dungeonVictoryLoot) return null;

  const hasUnidentified = dungeonVictoryLoot.items.some(i => i.isIdentified === false);
  const allIdentified = !hasUnidentified;
  const legendariesCount = dungeonVictoryLoot.items.filter(
    i => i.isIdentified && (i.rarity === 'unique' || i.rarity === 'legendary' || i.rarity === 'set')
  ).length;

  const nextDiff = dungeonVictoryLoot.nextDifficulty || (currentDifficulty + (dungeonVictoryLoot.advanceLevels || 1));
  const targetLabel = `${currentDungeon.name.split(':')[0].trim()} Lv.${nextDiff}`;

  const handleReDeploy = () => {
    closeVictoryModal();
    enterDungeon(currentDungeon.id, nextDiff);
  };

  const isUpgrade = (item: GameItem): boolean => {
    if (item.isIdentified === false) return false;
    const equippable = ['helm','amulet','weapon','armor','shield','gloves','boots','ring','ring1','ring2'];
    if (!equippable.includes(item.slot)) return false;
    const offNew = offensiveScore(item.stats);
    const defNew = defensiveScore(item.stats);
    const combinedNew = offNew + defNew;
    const isRing = item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2';
    if (isRing) {
      const r1 = equipment['ring1'] as GameItem | undefined;
      const r2 = equipment['ring2'] as GameItem | undefined;
      if (!r1 && !r2) return true;
      const beats = (cur?: GameItem) => {
        if (!cur) return true;
        const offCur = offensiveScore(cur.stats);
        const defCur = defensiveScore(cur.stats);
        return offNew > offCur || defNew > defCur || combinedNew > (offCur + defCur);
      };
      return beats(r1) || beats(r2);
    }
    const cur = equipment[item.slot] as GameItem | undefined;
    if (!cur) return true;
    const offCur = offensiveScore(cur.stats);
    const defCur = defensiveScore(cur.stats);
    return offNew > offCur || defNew > defCur || combinedNew > (offCur + defCur);
  };

  const recommendedIds = useMemo(() => {
    if (!allIdentified) return new Set<string>();
    const s = new Set<string>();
    dungeonVictoryLoot.items.forEach(it => { if (isUpgrade(it)) s.add(it.id); });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-iron-950 via-iron-900 to-iron-950 border-2 border-brass-400 rounded-xl p-5 md:p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(251,191,36,0.3)] space-y-4 text-xs md:text-sm">
        {/* Top Glorious Header */}
        <div className="text-center space-y-1.5 border-b border-brass-600/60 pb-3 relative">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-950/80 border-2 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-brass-300 via-amber-200 to-brass-400 tracking-wider">
            던전 정복 완료! (Dungeon Cleared)
          </h2>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-mono font-black text-xs rounded-full border border-amber-300 shadow">
              🔥 난이도 Lv.{currentDifficulty} 돌파
            </span>
            <span className="text-xs text-gray-300 font-mono">
              [{currentDungeon.name.split(':')[0]}]
            </span>
          </div>

          {/* Performance Leap Banner (+1 ~ +5 Jump) */}
          {dungeonVictoryLoot.performanceGrade && (
            <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-950/90 via-blood-950 to-amber-950/90 border border-amber-400 text-center font-mono animate-pulse shadow-lg">
              <div className="text-amber-300 font-black text-xs md:text-sm flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>{dungeonVictoryLoot.performanceGrade}</span>
              </div>
              <div className="text-[11px] text-gray-300 mt-0.5">
                남은 체력 및 클리어 성적에 따라 다음 난이도 <strong className="text-amber-300 font-black">Lv.{nextDiff}</strong>가 즉시 해금되었습니다!
              </div>
            </div>
          )}
        </div>

        {/* Reward Currency Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
          <div className="p-2.5 rounded-lg bg-iron-950 border border-yellow-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs">
              <Coins className="w-4 h-4" />
              <span>획득 골드</span>
            </div>
            <span className="text-sm md:text-base font-black text-yellow-200 mt-0.5">
              +{dungeonVictoryLoot.gold.toLocaleString()} G
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-iron-950 border border-purple-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-purple-400 font-bold text-xs">
              <Gem className="w-4 h-4" />
              <span>소울 샤드</span>
            </div>
            <span className="text-sm md:text-base font-black text-purple-200 mt-0.5">
              +{dungeonVictoryLoot.shards} 개
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-iron-950 border border-emerald-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>경험치</span>
            </div>
            <span className="text-sm md:text-base font-black text-emerald-200 mt-0.5">
              +{dungeonVictoryLoot.exp.toLocaleString()} EXP
            </span>
          </div>
        </div>

        {/* Dropped Runes Row */}
        {Object.keys(dungeonVictoryLoot.runes).length > 0 && (
          <div className="p-3 bg-iron-950/80 rounded-lg border border-purple-600/50 space-y-1.5 shadow">
            <div className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>획득한 고대 룬 (룬 보관함 자동 보관됨):</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(dungeonVictoryLoot.runes).map(([rKey, count]) => {
                const def = D2_RUNES[rKey];
                return (
                  <span
                    key={rKey}
                    className="px-2.5 py-1 rounded bg-iron-900 border border-brass-500 text-brass-200 font-mono font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>#{def?.number} {rKey} 룬</span>
                    <span className="text-amber-400">x{count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Dropped Equipment Items Grid */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-cinzel font-bold text-gray-200 text-xs md:text-sm">
              획득한 전리품 장비 ({dungeonVictoryLoot.items.length}개)
            </span>
            {legendariesCount > 0 && (
              <span className="text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500 animate-pulse">
                ★ 전설의 유니크 {legendariesCount}개 발견!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
            {dungeonVictoryLoot.items.map(item => {
              const isIdentified = item.isIdentified !== false;
              const isLegendary = isIdentified && (item.rarity === 'unique' || item.rarity === 'legendary');
              const isRecommended = isIdentified && recommendedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border-2 transition relative flex flex-col justify-between shadow ${
                    !isIdentified
                      ? 'bg-blood-950/40 border-blood-600 text-blood-200'
                      : isRecommended
                      ? 'bg-gradient-to-br from-emerald-950/50 via-iron-900 to-amber-950/40 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                      : isLegendary
                      ? 'bg-gradient-to-br from-amber-950/60 via-iron-900 to-amber-950/80 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse'
                      : item.rarity === 'rare'
                      ? 'bg-yellow-950/30 border-yellow-500 text-yellow-200'
                      : 'bg-iron-900 border-iron-700 text-gray-200'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black border border-emerald-300 shadow flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 추천 장착
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-xs md:text-sm flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {!isIdentified && <HelpCircle className="w-3.5 h-3.5 text-blood-400 animate-spin" />}
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize font-mono mt-0.5">
                        {item.slot} {item.tier ? `| [${item.tier}]` : ''} {isIdentified && `| ${item.rarity}`}
                      </div>
                    </div>
                  </div>

                  {isIdentified ? (
                    <div className="mt-1.5 text-[10px] text-gray-300 font-sans leading-tight">
                      <p>{item.description}</p>
                      {item.specialEffect && (
                        <p className="text-amber-300 font-bold mt-0.5">★ {item.specialEffect}</p>
                      )}
                      {isRecommended && (
                        <button
                          onClick={() => equipItem(item)}
                          className="mt-2 w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> 추천 장착 — 클릭해 장착
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[10px] text-blood-300 italic">
                      데커드 케인의 감정을 받으면 강력한 난이도 스케일링 옵션이 드러납니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {allIdentified && recommendedIds.size > 0 && (
            <p className="text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 추천 장착 표시된 아이템은 현재 장착 장비보다 공격/방어 합산 수치가 높습니다. 클릭으로 즉시 교체하세요.
            </p>
          )}
        </div>

        {/* Deckard Cain Instant Identify Facility Banner */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-950/60 via-iron-900 to-blue-950/60 border-2 border-blue-600/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-900 border-2 border-blue-400 flex items-center justify-center text-blue-200 font-serif font-black text-sm shadow flex-shrink-0">
              DC
            </div>
            <div>
              <div className="font-cinzel font-bold text-blue-200 text-xs sm:text-sm flex items-center gap-1.5">
                <span>현자 데커드 케인 (Deckard Cain)</span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium italic">
                "잠시 내 말에 귀 기울여보게나... 고대의 지혜로 이 전리품들의 잠재력을 밝혀주겠네."
              </p>
            </div>
          </div>

          <button
            onClick={identifyAllVictoryLoot}
            disabled={!hasUnidentified}
            className={`px-4 py-2 rounded-lg text-xs font-black transition shadow flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer ${
              hasUnidentified
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white ring-2 ring-blue-300 animate-pulse'
                : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
            }`}
          >
          <BookOpen className="w-4 h-4" />
            <span>{hasUnidentified ? '📜 케인의 지혜로 모두 감정' : '✓ 모두 감정 완료됨'}</span>
          </button>
        </div>

        {showBulkSellCTA && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-iron-950 via-yellow-950/40 to-iron-950 border border-yellow-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-xs font-bold text-yellow-200">가방 {inventory.length}/40 — 정리 필요</div>
                <div className="text-[11px] text-gray-400 font-mono">일반 장비 {normalCount}개 판매 가능 · 예상 {normalGoldPreview.toLocaleString()} G</div>
              </div>
            </div>
            <button
              onClick={handleBulkSellNormal}
              disabled={normalCount === 0}
              className={`px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${normalCount>0 ? 'bg-yellow-600 hover:bg-yellow-500 text-iron-950 shadow' : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'}`}
            >
              <Coins className="w-4 h-4" />
              <span>일반 장비 일괄 판매{normalCount>0?` (${normalCount}개 · +${normalGoldPreview.toLocaleString()} G)`:''}</span>
            </button>
          </div>
        )}

        {/* Bottom Dual Action Buttons: Re-deploy vs Return Town */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleReDeploy}
            className="w-full py-3 bg-gradient-to-r from-blood-600 via-amber-600 to-yellow-500 hover:from-blood-500 hover:to-yellow-400 text-iron-950 font-black rounded-lg text-xs md:text-sm transition shadow-xl ring-2 ring-amber-300 transform active:scale-95 flex items-center justify-center gap-2 animate-pulse cursor-pointer"
          >
            <Flame className="w-4 h-4 text-iron-950" />
            <span>재출격: {targetLabel}</span>
            <ArrowRight className="w-4 h-4 text-iron-950" />
          </button>

          <button
            onClick={closeVictoryModal}
            className="w-full py-3 bg-iron-900 hover:bg-iron-800 border-2 border-iron-700 hover:border-iron-500 text-gray-200 hover:text-white font-bold rounded-lg text-xs md:text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🏘️ 전리품 챙겨 마을로 귀환</span>
          </button>
        </div>
      </div>
    </div>
  );
};
