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
  const nextStoryDungeon = isRift ? null : getNextStoryDungeon(currentDungeon.id);
  const isStoryProgression = nextStoryDungeon !== null;

  const nextRiftTier = (currentDungeon.riftTier || endlessRiftTier) + (dungeonVictoryLoot.advanceLevels || 1);
  const targetDungeon = isRift
    ? generateEndlessRiftDungeon(nextRiftTier)
    : (isStoryProgression ? nextStoryDungeon : currentDungeon);

  const targetDiff = isRift
    ? Math.max(currentDifficulty, maxUnlockedDifficulty)
    : (isStoryProgression ? currentDifficulty : (dungeonVictoryLoot.nextDifficulty || (currentDifficulty + (dungeonVictoryLoot.advanceLevels || 1))));

  const targetLabel = isRift
    ? `🌌 대균열 ${nextRiftTier}단계 진격 (Space)`
    : isStoryProgression
    ? `다음 장 진격: [${nextStoryDungeon.name.split(':')[0]}]`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-iron-950 via-iron-900 to-iron-950 border-2 border-brass-400 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(251,191,36,0.3)] space-y-3 text-xs md:text-sm font-sans">
        
        {/* Top Glorious Header */}
        <div className="text-center space-y-1 border-b border-brass-600/60 pb-2.5 relative">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-amber-950/80 border-2 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.35)]">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-lg md:text-2xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-brass-300 via-amber-200 to-brass-400 tracking-wider">
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

          {/* Performance Leap Banner */}
          {dungeonVictoryLoot.performanceGrade && (
            <div className="mt-1.5 p-1.5 rounded-lg bg-gradient-to-r from-amber-950/90 via-blood-950 to-amber-950/90 border border-amber-400 text-center font-mono shadow">
              <div className="text-amber-300 font-black text-xs md:text-sm flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>{dungeonVictoryLoot.performanceGrade}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-300 mt-0.5">
                {isRift ? (
                  <span>무결점 전투 성적에 따라 대균열 <strong className="text-amber-300 font-black">[{nextRiftTier}단계]</strong>로 즉시 진격합니다! (티어 +{dungeonVictoryLoot.advanceLevels || 1} 급상승)</span>
                ) : isStoryProgression && nextStoryDungeon ? (
                  <span>남은 체력 및 클리어 성적에 따라 다음 스토리 <strong className="text-amber-300 font-black">[{nextStoryDungeon.name.split(':')[0]}]</strong> 관문이 개방되었습니다!</span>
                ) : (
                  <span>남은 체력 및 클리어 성적에 따라 다음 난이도 <strong className="text-amber-300 font-black">Lv.{dungeonVictoryLoot.nextDifficulty || targetDiff}</strong>가 즉시 해금되었습니다!</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reward Currency Stats Bar */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="p-2 rounded-lg bg-iron-950 border border-yellow-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>획득 골드</span>
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black text-yellow-200 mt-0.5">
              +{dungeonVictoryLoot.gold.toLocaleString()} G
            </span>
          </div>

          <div className="p-2 rounded-lg bg-iron-950 border border-purple-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-purple-400 font-bold text-xs">
              <Gem className="w-3.5 h-3.5" />
              <span>소울 샤드</span>
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black text-purple-200 mt-0.5">
              +{dungeonVictoryLoot.shards} 개
            </span>
          </div>

          <div className="p-2 rounded-lg bg-iron-950 border border-emerald-600/60 flex flex-col items-center justify-center shadow">
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>경험치</span>
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black text-emerald-200 mt-0.5">
              +{dungeonVictoryLoot.exp.toLocaleString()} EXP
            </span>
          </div>
        </div>

        {/* Dropped Runes Row */}
        {Object.keys(dungeonVictoryLoot.runes).length > 0 && (
          <div className="p-2.5 bg-iron-950/80 rounded-lg border border-purple-600/50 space-y-1 shadow">
            <div className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>획득한 고대 룬 (룬 보관함 자동 보관):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {Object.entries(dungeonVictoryLoot.runes).map(([rKey, count]) => {
                const def = D2_RUNES[rKey];
                return (
                  <span
                    key={rKey}
                    className="px-2 py-0.5 rounded bg-iron-900 border border-brass-500 text-brass-200 font-mono font-bold text-xs flex items-center gap-1 shadow"
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
        <div className="space-y-1.5">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-gray-200 text-xs md:text-sm">
                획득한 전리품 장비 ({dungeonVictoryLoot.items.length}개)
              </span>
              {legendariesCount > 0 && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500 animate-pulse">
                  ★ 전설의 유니크 {legendariesCount}개 발견!
                </span>
              )}
            </div>

            {/* Auto-Equip Button: Disabled when un-identified, enabled when all identified! */}
            <button
              onClick={autoEquipBestItems}
              disabled={!allIdentified}
              className={`px-3 py-1 rounded font-black text-xs shadow flex items-center gap-1 transition select-none ${
                allIdentified
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 ring-2 ring-amber-300 cursor-pointer transform active:scale-95 animate-pulse'
                  : 'bg-iron-900 text-gray-500 border border-iron-800 cursor-not-allowed opacity-60'
              }`}
              title={allIdentified ? "공격력+체력 가중치 기준 최적 장비 자동 일괄 장착" : "📜 먼저 케인에게 장비를 감정한 후 일괄 장착할 수 있습니다"}
            >
              {allIdentified ? <Zap className="w-3 h-3 fill-iron-950" /> : <Lock className="w-3 h-3 text-gray-500" />}
              <span>{allIdentified ? '⚡ 추천 일괄 장착' : '🔒 감정 후 일괄 장착 가능'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {dungeonVictoryLoot.items.map(item => {
              const isIdentified = item.isIdentified !== false;
              const isLegendary = isIdentified && (item.rarity === 'unique' || item.rarity === 'legendary');
              const isRecommended = isIdentified && recommendedIds.has(item.id);
              const score = isIdentified ? calculateItemScore(item) : null;

              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg border-2 transition relative flex flex-col justify-between shadow ${
                    !isIdentified
                      ? 'bg-blood-950/40 border-blood-600 text-blood-200'
                      : isRecommended
                      ? 'bg-gradient-to-br from-emerald-950/50 via-iron-900 to-amber-950/40 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                      : isLegendary
                      ? 'bg-gradient-to-br from-amber-950/60 via-iron-900 to-amber-950/80 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                      : item.rarity === 'rare'
                      ? 'bg-yellow-950/30 border-yellow-500 text-yellow-200'
                      : 'bg-iron-900 border-iron-700 text-gray-200'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black border border-emerald-300 shadow flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 추천
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-xs flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {!isIdentified && <HelpCircle className="w-3.5 h-3.5 text-blood-400 animate-spin" />}
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{item.slot}</span>
                        {score !== null && (
                          <span className="text-brass-300 font-bold bg-iron-950 px-1 rounded border border-iron-800">
                            전투력: {score}
                          </span>
                        )}
                        {isIdentified && <span>| {item.rarity}</span>}
                      </div>
                    </div>
                  </div>

                  {isIdentified ? (
                    <div className="mt-1 text-[10px] text-gray-300 font-sans leading-tight">
                      <p className="truncate">{item.description}</p>
                      {isRecommended && (
                        <button
                          onClick={() => equipItem(item)}
                          className="mt-1.5 w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3" /> 즉시 장착
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-blood-300 italic flex items-center justify-between">
                      <span>미확인 상태입니다. 아래 케인에게 감정받으세요.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deckard Cain Instant Identify & Auto-Equip Bar */}
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-950/60 via-iron-900 to-blue-950/60 border-2 border-blue-600/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-blue-400 flex items-center justify-center text-blue-200 font-serif font-black text-xs shadow flex-shrink-0">
              DC
            </div>
            <div>
              <div className="font-cinzel font-bold text-blue-200 text-xs flex items-center gap-1">
                <span>현자 데커드 케인 (Deckard Cain)</span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium italic">
                {hasUnidentified
                  ? '"잠시 내 말에 귀 기울여보게나... 고대의 지혜로 전리품들의 잠재력을 밝혀주겠네."'
                  : '"모든 전리품의 숨겨진 힘이 밝혀졌네! 이제 최적의 장비로 무장하게나."'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={identifyAllVictoryLoot}
              disabled={!hasUnidentified}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                hasUnidentified
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white ring-1 ring-blue-300 animate-pulse'
                  : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{hasUnidentified ? '전리품 일괄 감정' : '모든 전리품 감정 완료'}</span>
              {hasUnidentified && (
                <kbd className="px-1.5 py-0.5 rounded bg-blue-950/90 text-cyan-200 text-[10px] font-mono border border-blue-400">
                  F
                </kbd>
              )}
            </button>
          </div>
        </div>

        {showBulkSellCTA && (
          <div className="p-2.5 rounded-lg bg-gradient-to-r from-iron-950 via-yellow-950/40 to-iron-950 border border-yellow-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-xs font-bold text-yellow-200">가방 {inventory.length}/40 — 정리 필요</div>
                <div className="text-[10px] text-gray-400 font-mono">일반 장비 {normalCount}개 판매 가능 ➔ 예상 {normalGoldPreview.toLocaleString()} G</div>
              </div>
            </div>
            <button
              onClick={handleBulkSellNormal}
              disabled={normalCount === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${normalCount > 0 ? 'bg-yellow-600 hover:bg-yellow-500 text-iron-950 shadow' : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'}`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>일반 장비 일괄 판매{normalCount > 0 ? ` (${normalCount}개)` : ''}</span>
            </button>
          </div>
        )}

        {/* Bottom Dual Action Buttons: Next Story / Re-deploy vs Return Town */}
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleReDeploy}
            className={`w-full py-3 text-white font-black rounded-lg text-xs md:text-sm transition shadow-xl transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-pulse ${
              isStoryProgression
                ? 'bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-iron-950 ring-2 ring-amber-300 shadow-xl'
            }`}
          >
            {isStoryProgression ? <Swords className="w-4 h-4 text-white" /> : <Crown className="w-4 h-4 text-iron-950" />}
            <span className={isStoryProgression ? 'text-white' : 'text-iron-950'}>{targetLabel}</span>
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${
              isStoryProgression ? 'bg-blood-950 text-amber-300 border-amber-400' : 'bg-amber-900 text-yellow-200 border-amber-700'
            }`}>
              Space
            </kbd>
            <ArrowRight className={`w-4 h-4 ${isStoryProgression ? 'text-white' : 'text-iron-950'}`} />
          </button>

          <button
            onClick={closeVictoryModal}
            className="w-full py-3 bg-iron-900 hover:bg-iron-800 border-2 border-iron-700 hover:border-iron-500 text-gray-200 hover:text-white font-bold rounded-lg text-xs md:text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🏘️ 전리품 챙겨 마을로 귀환</span>
            <kbd className="px-1.5 py-0.5 rounded bg-iron-950 text-gray-400 text-[10px] font-mono border border-iron-750">
              Esc
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
