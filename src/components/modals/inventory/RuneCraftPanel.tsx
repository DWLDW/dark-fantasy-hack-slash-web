import React from 'react';
import { GameItem, RuneWordRecipe } from '../../../types/game';
import { Sparkles, Hammer } from 'lucide-react';

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

export const RuneCraftPanel: React.FC<RuneCraftPanelProps> = ({
  selectedItem,
  eligibleRuneWords,
  onDirectCraft,
  onTransmuteCraft
}) => {
  if (eligibleRuneWords.length === 0) return null;

  return (
    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
      {eligibleRuneWords.map(({ recipe, canDirectCraft, canTransmuteCraft, directMissingRunes }) => (
        <div
          key={recipe.id}
          className={`p-2 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
            canDirectCraft
              ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
              : canTransmuteCraft
              ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]'
              : 'bg-iron-900 border-iron-750 opacity-75'
          }`}
        >
          <div>
            <div className="font-black text-xs text-gray-100 flex items-center gap-2">
              <span className={canDirectCraft ? 'text-amber-300' : canTransmuteCraft ? 'text-purple-300' : 'text-gray-300'}>
                {recipe.name}
              </span>
              <span className="text-[10px] font-mono text-purple-300 font-bold bg-iron-950 px-1 py-0.5 rounded border border-iron-700">
                [{recipe.requiredRunes.join(' + ')}]
              </span>
            </div>
            <div className="text-[10px] text-gray-300 mt-0.5">
              {canDirectCraft ? (
                <span className="text-emerald-400 font-bold">✓ 직접 보유 룬 충족! 즉시 제작 가능</span>
              ) : canTransmuteCraft ? (
                <span className="text-purple-300 font-bold">🔮 하위 룬 합성으로 충당 가능!</span>
              ) : (
                <span className="text-red-400 font-bold">부족: {directMissingRunes.join(', ')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onDirectCraft(selectedItem.id, recipe.id)}
              disabled={!canDirectCraft}
              className={`px-2 py-1 rounded text-xs font-black transition shadow flex items-center gap-1 ${
                canDirectCraft
                  ? 'bg-gradient-to-r from-brass-500 to-amber-500 text-iron-950 animate-pulse cursor-pointer'
                  : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>직접 제작</span>
            </button>
            <button
              onClick={() => onTransmuteCraft(selectedItem.id, recipe.id)}
              disabled={!canTransmuteCraft}
              className={`px-2 py-1 rounded text-xs font-black transition shadow flex items-center gap-1 ${
                canTransmuteCraft
                  ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white cursor-pointer'
                  : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Hammer className="w-3 h-3" />
              <span>합성 후 제작</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

