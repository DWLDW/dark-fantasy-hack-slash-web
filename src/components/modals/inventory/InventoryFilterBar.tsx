import React from 'react';
import { EquipSlot } from '../../../types/game';
import { Sparkles, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

export type CategoryFilter = 'all' | 'weapon' | 'armor' | 'accessory' | 'runeword';
export type SortOrder = 'desc' | 'asc';

export interface CategoryCounts {
  all: number;
  weapon: number;
  armor: number;
  accessory: number;
  runeword: number;
}

export interface InventoryFilterBarProps {
  categoryFilter: CategoryFilter;
  selectedSlot: EquipSlot | 'all';
  categoryCounts: CategoryCounts;
  sortOrder: SortOrder;
  sellableCount: number;
  totalSellGold: number;
  onSelectCategory: (cat: CategoryFilter) => void;
  onToggleSortOrder: (order: SortOrder) => void;
  onBulkSell: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = React.memo(({
  categoryFilter,
  selectedSlot,
  categoryCounts,
  sortOrder,
  sellableCount,
  totalSellGold,
  onSelectCategory,
  onToggleSortOrder,
  onBulkSell
}) => {
  return (
    <div className="bg-iron-900/90 p-2.5 rounded-lg border border-iron-750 flex flex-wrap items-center justify-between gap-2 shadow">
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-gray-400 font-cinzel mr-1 hidden sm:inline">분류:</span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border ${
            categoryFilter === 'all' && selectedSlot === 'all'
              ? 'bg-brass-500 text-iron-950 border-brass-400 shadow'
              : 'bg-iron-950 text-gray-300 border-iron-800 hover:text-white hover:border-iron-700'
          }`}
        >
          <span>전체</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.all})</span>
        </button>

        <button
          onClick={() => onSelectCategory('weapon')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border ${
            categoryFilter === 'weapon' && selectedSlot === 'all'
              ? 'bg-brass-500 text-iron-950 border-brass-400 shadow'
              : 'bg-iron-950 text-gray-300 border-iron-800 hover:text-white hover:border-iron-700'
          }`}
        >
          <span>무기</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.weapon})</span>
        </button>

        <button
          onClick={() => onSelectCategory('armor')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border ${
            categoryFilter === 'armor' && selectedSlot === 'all'
              ? 'bg-brass-500 text-iron-950 border-brass-400 shadow'
              : 'bg-iron-950 text-gray-300 border-iron-800 hover:text-white hover:border-iron-700'
          }`}
        >
          <span>방어구</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.armor})</span>
        </button>

        <button
          onClick={() => onSelectCategory('accessory')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border ${
            categoryFilter === 'accessory' && selectedSlot === 'all'
              ? 'bg-brass-500 text-iron-950 border-brass-400 shadow'
              : 'bg-iron-950 text-gray-300 border-iron-800 hover:text-white hover:border-iron-700'
          }`}
        >
          <span>장신구</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.accessory})</span>
        </button>

        <button
          onClick={() => onSelectCategory('runeword')}
          className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border ${
            categoryFilter === 'runeword' && selectedSlot === 'all'
              ? 'bg-amber-500 text-iron-950 border-amber-400 shadow'
              : 'bg-iron-950 text-amber-400/80 border-iron-800 hover:text-amber-300 hover:border-amber-600/50'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>룬워드</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.runeword})</span>
        </button>
      </div>

      {/* Sorting & Batch Sell Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Rarity Sort Buttons */}
        <div className="flex items-center bg-iron-950 rounded border border-iron-800 p-0.5">
          <button
            onClick={() => onToggleSortOrder('desc')}
            title="레어리티 높은 순으로 정렬"
            className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition ${
              sortOrder === 'desc'
                ? 'bg-brass-500 text-iron-950 font-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>등급 높은순</span>
          </button>
          <button
            onClick={() => onToggleSortOrder('asc')}
            title="레어리티 낮은 순으로 정렬"
            className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition ${
              sortOrder === 'asc'
                ? 'bg-brass-500 text-iron-950 font-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            <span>등급 낮은순</span>
          </button>
        </div>

        {/* Batch Sell Button */}
        <button
          onClick={onBulkSell}
          disabled={sellableCount === 0}
          className={`px-3 py-1 rounded text-xs font-black transition flex items-center gap-1.5 border shadow ${
            sellableCount > 0
              ? 'bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 border-red-700/80 hover:text-white ring-1 ring-red-500/40'
              : 'bg-iron-900 text-gray-600 border-iron-800 cursor-not-allowed opacity-50'
          }`}
          title="인벤토리의 모든 일반(Normal: 5G) 및 마법(Magic: 15G) 등급 장비를 일괄 판매합니다."
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>일반/마법 일괄 판매</span>
          {sellableCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.2 rounded border border-amber-500/30">
              {sellableCount}개 (+{totalSellGold}G)
            </span>
          )}
        </button>
      </div>
    </div>
  );
});
InventoryFilterBar.displayName = 'InventoryFilterBar';


