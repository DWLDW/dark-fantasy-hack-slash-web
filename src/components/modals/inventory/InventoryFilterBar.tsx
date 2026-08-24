import React from 'react';
import { EquipSlot } from '../../../types/game';
import { Sparkles, ArrowDown, ArrowUp, Coins, Zap, Swords } from 'lucide-react';

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
  onAutoEquip?: () => void;
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
  onBulkSell,
  onAutoEquip
}) => {
  return (
    <div className="bg-iron-900/90 p-2.5 rounded-lg border border-iron-750 flex flex-wrap items-center justify-between gap-2 shadow">
      {/* Tier 3: Category Filter Buttons (Dark Inset Active State) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-gray-400 font-cinzel mr-1 hidden sm:inline">분류:</span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
            categoryFilter === 'all' && selectedSlot === 'all'
              ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
              : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 hover:border-iron-700 font-medium'
          }`}
        >
          <span>전체</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.all})</span>
        </button>

        <button
          onClick={() => onSelectCategory('weapon')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
            categoryFilter === 'weapon' && selectedSlot === 'all'
              ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
              : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 hover:border-iron-700 font-medium'
          }`}
        >
          <span>무기</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.weapon})</span>
        </button>

        <button
          onClick={() => onSelectCategory('armor')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
            categoryFilter === 'armor' && selectedSlot === 'all'
              ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
              : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 hover:border-iron-700 font-medium'
          }`}
        >
          <span>방어구</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.armor})</span>
        </button>

        <button
          onClick={() => onSelectCategory('accessory')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
            categoryFilter === 'accessory' && selectedSlot === 'all'
              ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
              : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 hover:border-iron-700 font-medium'
          }`}
        >
          <span>장신구</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.accessory})</span>
        </button>

        <button
          onClick={() => onSelectCategory('runeword')}
          className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
            categoryFilter === 'runeword' && selectedSlot === 'all'
              ? 'bg-iron-800 text-amber-300 border-2 border-amber-400 shadow-inner font-black'
              : 'bg-iron-950 text-amber-400/70 border-iron-800 hover:text-amber-300 hover:border-amber-600/50 font-medium'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>룬워드</span>
          <span className="text-[10px] font-mono opacity-80">({categoryCounts.runeword})</span>
        </button>
      </div>

      {/* Auto-Equip, Sorting & Batch Sell Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tier 1: Recommended Auto-Equip Action Button (Top Visual Dominance) */}
        {onAutoEquip && (
          <button
            onClick={onAutoEquip}
            className="px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 border shadow bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-iron-950 border-amber-300 ring-2 ring-amber-300/80 shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-pointer transform active:scale-95 animate-pulse"
            title="공격력+체력 가중치 기반으로 소지품에서 가장 우수한 상위 장비를 자동 일괄 장착합니다. (미미한 차이는 기존 장비 유지)"
          >
            <Zap className="w-3.5 h-3.5 fill-iron-950" />
            <span>추천 일괄 장착</span>
          </button>
        )}

        {/* Tier 3: Rarity Sort Buttons */}
        <div className="flex items-center bg-iron-950 rounded-lg border border-iron-800 p-0.5">
          <button
            onClick={() => onToggleSortOrder('desc')}
            title="레어리티 높은 순으로 정렬"
            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              sortOrder === 'desc'
                ? 'bg-iron-800 text-brass-300 border border-brass-500/80 font-black shadow-inner'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>등급 높은순</span>
          </button>
          <button
            onClick={() => onToggleSortOrder('asc')}
            title="레어리티 낮은 순으로 정렬"
            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              sortOrder === 'asc'
                ? 'bg-iron-800 text-brass-300 border border-brass-500/80 font-black shadow-inner'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            <span>등급 낮은순</span>
          </button>
        </div>

        {/* Tier 2-B: Mercantile Batch Sell Button */}
        <button
          onClick={onBulkSell}
          disabled={sellableCount === 0}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 border shadow ${
            sellableCount > 0
              ? 'bg-gradient-to-r from-iron-900 via-amber-950/60 to-iron-900 text-amber-200 border-amber-600/70 hover:border-amber-400 hover:text-white ring-1 ring-amber-500/40 cursor-pointer shadow-md'
              : 'bg-iron-900 text-gray-600 border-iron-800 cursor-not-allowed opacity-50'
          }`}
          title="인벤토리의 모든 일반(Normal: 5G) 및 마법(Magic: 15G) 등급 장비를 일괄 판매합니다."
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>일반/마법 일괄 판매</span>
          {sellableCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/50 px-1.5 py-0.2 rounded border border-amber-500/30">
              {sellableCount}개 (+{totalSellGold}G)
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

InventoryFilterBar.displayName = 'InventoryFilterBar';
