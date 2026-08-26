import React from 'react';
import { GameItem, RuneWordRecipe } from '../../../types/game';
import { Sparkles, Hammer, Shield, Sword } from 'lucide-react';

export interface EligibleRuneWord {
  recipe: RuneWordRecipe;
  canDirectCraft: boolean;
  canTransmuteCraft: boolean;
  directMissingRunes: string[];
  transmutedRunesCost: Record<string, number>;
}

export interface RuneCraftPanelProps {
  selectedItem: GameItem;
  eligibleRuneWords: EligibleRuneWord[];
  onDirectCraft: (targetItemId: string, recipeId: string) => void;
  onTransmuteCraft: (targetItemId: string, recipeId: string) => void;
}

function getRuneWordStatsPreview(recipe: RuneWordRecipe, baseItem: GameItem) {
  const badges: { label: string; value: string; color: string }[] = [];

  if (recipe.enhancedDamage) {
    badges.push({ label: '피해 증가', value: `+${recipe.enhancedDamage}%`, color: 'text-amber-300 border-amber-500/50 bg-amber-950/60' });
  }
  if (recipe.enhancedDefense) {
    badges.push({ label: '방어 증가', value: `+${recipe.enhancedDefense}%`, color: 'text-blue-300 border-blue-500/50 bg-blue-950/60' });
  }
  if (recipe.bonusStats?.minDmg || recipe.bonusStats?.maxDmg) {
    badges.push({ label: '추가 공격력', value: `+${recipe.bonusStats.minDmg || 0}~${recipe.bonusStats.maxDmg || 0}`, color: 'text-amber-200 border-amber-600/50 bg-amber-950/50' });
  }
  if (recipe.bonusStats?.defense) {
    badges.push({ label: '추가 방어력', value: `+${recipe.bonusStats.defense}`, color: 'text-blue-200 border-blue-600/50 bg-blue-950/50' });
  }
  if (recipe.bonusStats?.allResist) {
    badges.push({ label: '모든 저항', value: `+${recipe.bonusStats.allResist}%`, color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60' });
  }
  if (recipe.bonusStats?.attackSpeed) {
    badges.push({ label: '공격 속도', value: `+${recipe.bonusStats.attackSpeed}%`, color: 'text-yellow-300 border-yellow-500/50 bg-yellow-950/60' });
  }
  if (recipe.bonusStats?.critChance) {
    badges.push({ label: '치명타율', value: `+${recipe.bonusStats.critChance}%`, color: 'text-rose-300 border-rose-500/50 bg-rose-950/60' });
  }
  if (recipe.bonusStats?.critDamage) {
    badges.push({ label: '치명타 피해', value: `+${recipe.bonusStats.critDamage}%`, color: 'text-rose-300 border-rose-500/50 bg-rose-950/60' });
  }
  if (recipe.bonusStats?.lifeSteal) {
    badges.push({ label: '생명력 흡수', value: `+${recipe.bonusStats.lifeSteal}%`, color: 'text-red-400 border-red-500/50 bg-red-950/60' });
  }
  if (recipe.bonusStats?.hp) {
    badges.push({ label: '생명력', value: `+${recipe.bonusStats.hp}`, color: 'text-red-300 border-red-600/50 bg-red-950/50' });
  }
  if (recipe.bonusStats?.str) {
    badges.push({ label: '힘', value: `+${recipe.bonusStats.str}`, color: 'text-orange-300 border-orange-600/50 bg-orange-950/50' });
  }
  if (recipe.bonusStats?.dex) {
    badges.push({ label: '민첩', value: `+${recipe.bonusStats.dex}`, color: 'text-green-300 border-green-600/50 bg-green-950/50' });
  }
  if (recipe.bonusStats?.int) {
    badges.push({ label: '지능', value: `+${recipe.bonusStats.int}`, color: 'text-sky-300 border-sky-600/50 bg-sky-950/50' });
  }
  if (recipe.bonusStats?.damageReduction) {
    badges.push({ label: '피해 감소', value: `+${recipe.bonusStats.damageReduction}%`, color: 'text-indigo-300 border-indigo-600/50 bg-indigo-950/50' });
  }

  // Estimated final base value
  let estMainValue = '';
  if (baseItem.slot === 'weapon' && (baseItem.stats.minDmg || baseItem.stats.maxDmg)) {
    const edMult = 1 + (recipe.enhancedDamage || 0) / 100;
    const bMin = recipe.bonusStats?.minDmg || 0;
    const bMax = recipe.bonusStats?.maxDmg || 0;
    const estMin = Math.floor((baseItem.stats.minDmg || 0) * edMult) + bMin;
    const estMax = Math.floor((baseItem.stats.maxDmg || 0) * edMult) + bMax;
    estMainValue = `⚔️ 최종 예상 공격력: ${estMin} ~ ${estMax}`;
  } else if ((baseItem.slot === 'armor' || baseItem.slot === 'shield' || baseItem.slot === 'helm') && baseItem.stats.defense) {
    const edMult = 1 + (recipe.enhancedDefense || 0) / 100;
    const bDef = recipe.bonusStats?.defense || 0;
    const estDef = Math.floor((baseItem.stats.defense || 0) * edMult) + bDef;
    estMainValue = `🛡️ 최종 예상 방어력: +${estDef}`;
  }

  return { badges, estMainValue };
}

export const RuneCraftPanel: React.FC<RuneCraftPanelProps> = ({
  selectedItem,
  eligibleRuneWords,
  onDirectCraft,
  onTransmuteCraft
}) => {
  if (eligibleRuneWords.length === 0) return null;

  return (
    <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 select-none">
      <div className="text-[11px] font-bold text-amber-300 font-cinzel flex items-center gap-1.5 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>이 베이스 장비로 제작 가능한 룬워드 목록 및 완성 능력치:</span>
      </div>

      {eligibleRuneWords.map(({ recipe, canDirectCraft, canTransmuteCraft, directMissingRunes }) => {
        const { badges, estMainValue } = getRuneWordStatsPreview(recipe, selectedItem);

        return (
          <div
            key={recipe.id}
            className={`p-2.5 rounded-xl border-2 flex flex-col gap-2 transition ${
              canDirectCraft
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/60'
                : canTransmuteCraft
                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.3)]'
                : 'bg-iron-900 border-iron-750 opacity-85'
            }`}
          >
            {/* Header: Title, Runes & Craft Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-iron-800/80 pb-2">
              <div>
                <div className="font-black text-xs sm:text-sm text-gray-100 flex items-center gap-2 flex-wrap">
                  <span className={canDirectCraft ? 'text-amber-300' : canTransmuteCraft ? 'text-purple-300' : 'text-gray-200'}>
                    {recipe.name}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 font-bold bg-iron-950 px-1.5 py-0.5 rounded border border-purple-800 shadow-sm">
                    [{recipe.requiredRunes.join(' + ')}]
                  </span>
                  {estMainValue && (
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-iron-950 px-1.5 py-0.5 rounded border border-amber-600/80 shadow">
                      {estMainValue}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-300 mt-1 flex items-center gap-1.5">
                  {canDirectCraft ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ✓ 직접 보유 룬 충족! 즉시 제작 가능
                    </span>
                  ) : canTransmuteCraft ? (
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      🔮 하위 룬 합성으로 충당 가능!
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold">
                      필요 룬 부족: {directMissingRunes.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onDirectCraft(selectedItem.id, recipe.id)}
                  disabled={!canDirectCraft}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                    canDirectCraft
                      ? 'bg-gradient-to-r from-brass-500 to-amber-500 text-iron-950 animate-pulse cursor-pointer shadow-lg hover:from-brass-400 hover:to-amber-400'
                      : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>직접 제작</span>
                </button>
                <button
                  onClick={() => onTransmuteCraft(selectedItem.id, recipe.id)}
                  disabled={!canTransmuteCraft}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                    canTransmuteCraft
                      ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white cursor-pointer hover:from-purple-600 hover:to-purple-400'
                      : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>합성 후 제작</span>
                </button>
              </div>
            </div>

            {/* 🔮 Estimated Stats & Special Effect Preview Box */}
            <div className="bg-iron-950/80 p-2 rounded-lg border border-iron-800 space-y-1.5">
              {/* Stat Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {badges.map((b, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${b.color}`}
                    >
                      {b.label} {b.value}
                    </span>
                  ))}
                </div>
              )}

              {/* Special Effect Description */}
              {recipe.specialEffect && (
                <div className="text-[10px] text-amber-200/90 font-medium leading-relaxed flex items-start gap-1">
                  <span className="text-amber-400 font-bold flex-shrink-0">✨ 특수 효과:</span>
                  <span>{recipe.specialEffect}</span>
                </div>
              )}

              {/* Lore / Description */}
              {recipe.description && (
                <div className="text-[9px] text-gray-400 italic leading-snug">
                  {recipe.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


