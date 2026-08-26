import React from 'react';
import { EquipSlot } from '../../../types/game';
import { Sparkles, ArrowDownUp, Coins, Zap, Swords } from 'lucide-react';

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
    <div className="bg-iron-900/90 p-1.5 sm:p-2 rounded-lg border border-iron-750 flex flex-wrap items-center justify-between gap-1.5 shadow">
      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-wrap">
        {(['all', 'weapon', 'armor', 'accessory', 'runeword'] as const).map((cat) => {
          const labels = {
            all: '전체',
            weapon: '⚔️무기',
            armor: '🛡️방어구',
            accessory: '💍장신구',
            runeword: '✨룬'
          };
          const isAct = categoryFilter === cat && selectedSlot === 'all';
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 border whitespace-nowrap cursor-pointer ${
                isAct
                  ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 font-medium'
              }`}
            >
              <span>{labels[cat]}</span>
              <span className="text-[10px] font-mono opacity-80">({categoryCounts[cat]})</span>
            </button>
          );
        })}
      </div>

      {/* Quick Actions (Recommend, Sort, Bulk Sell) */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        {/* Recommended Auto-Equip */}
        {onAutoEquip && (
          <button
            onClick={onAutoEquip}
            className="px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 border shadow bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 border-amber-300 ring-1 ring-amber-300/80 cursor-pointer transform active:scale-95 animate-pulse"
            title="소지품에서 가장 우수한 상위 장비를 자동 일괄 장착합니다 [A]"
          >
            <Zap className="w-3.5 h-3.5 fill-iron-950" />
            <span>추천장착</span>
            <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-amber-200 border border-amber-600/60 hidden sm:inline">A</kbd>
          </button>
        )}

        {/* Sort Toggle */}
        <button
          onClick={() => onToggleSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          title={sortOrder === 'desc' ? "등급 높은순 (클릭 시 낮은순 전환)" : "등급 낮은순 (클릭 시 높은순 전환)"}
          className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer bg-iron-950 text-gray-300 border border-iron-800 hover:border-iron-700"
        >
          <ArrowDownUp className="w-3 h-3 text-amber-400" />
          <span>{sortOrder === 'desc' ? '등급↓' : '등급↑'}</span>
        </button>

        {/* Bulk Sell */}
        <button
          onClick={onBulkSell}
          disabled={sellableCount === 0}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border shadow ${
            sellableCount > 0
              ? 'bg-amber-950/80 text-amber-200 border-amber-500/80 hover:border-amber-400 cursor-pointer'
              : 'bg-iron-950 text-gray-600 border-iron-850 cursor-not-allowed opacity-50'
          }`}
          title="소지품의 모든 잠금 해제 장비를 일괄 판매합니다"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>일괄판매</span>
          {sellableCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-300">
              ({sellableCount})
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

InventoryFilterBar.displayName = 'InventoryFilterBar';
