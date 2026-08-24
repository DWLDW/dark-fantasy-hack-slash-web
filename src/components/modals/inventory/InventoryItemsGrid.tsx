import React from 'react';
import { GameItem, EquipSlot } from '../../../types/game';
import { CategoryFilter } from './InventoryFilterBar';

export interface StackedItemEntry {
  item: GameItem;
  count: number;
}

export interface InventoryItemsGridProps {
  stackedFilteredItems: StackedItemEntry[];
  totalFilteredCount: number;
  selectedSlot: EquipSlot | 'all';
  categoryFilter: CategoryFilter;
  selectedItem: GameItem | null;
  isCombatMode: boolean;
  onSelectItem: (item: GameItem) => void;
  onEquipItem: (item: GameItem) => void;
}

export const getRarityColor = (rarity: GameItem['rarity'], isIdentified = true) => {
  if (!isIdentified) return 'border-red-600/80 text-red-400 bg-red-950/30';
  switch (rarity) {
    case 'runeword': return 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold';
    case 'set': return 'border-emerald-500/80 text-emerald-400 bg-emerald-950/20';
    case 'magic': return 'border-blue-500/80 text-blue-400 bg-blue-950/20';
    case 'rare': return 'border-yellow-500/80 text-yellow-400 bg-yellow-950/20';
    case 'unique': return 'border-orange-500/80 text-orange-400 bg-orange-950/20';
    case 'legendary': return 'border-rose-500/80 text-rose-400 bg-rose-950/20';
    default: return 'border-gray-600 text-gray-300 bg-iron-900/40';
  }
};

export const InventoryItemsGrid: React.FC<InventoryItemsGridProps> = React.memo(({
  stackedFilteredItems,
  totalFilteredCount,
  selectedSlot,
  categoryFilter,
  selectedItem,
  isCombatMode,
  onSelectItem,
  onEquipItem
}) => {
  return (
    <div className="bg-iron-900/90 p-3 rounded-lg border-2 border-iron-750 shadow">
      <div className="flex justify-between items-center mb-2 border-b border-iron-750 pb-1">
        <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
          <span className="text-brass-300">
            [{selectedSlot !== 'all' ? selectedSlot.toUpperCase() : categoryFilter === 'all' ? '전체 부위' : categoryFilter.toUpperCase()}]
          </span>
          <span>장비 목록 ({totalFilteredCount}개)</span>
        </span>
        <span className="text-gray-400 text-[11px] font-mono">클릭 시 장비 비교 / 더블클릭 시 장착</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[190px] overflow-y-auto p-1">
        {stackedFilteredItems.map(({ item, count }) => {
          const isSelected = selectedItem?.id === item.id;
          const rarityStyle = getRarityColor(item.rarity, item.isIdentified);

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              onDoubleClick={() => !isCombatMode && item.isIdentified !== false && onEquipItem(item)}
              className={`p-2 rounded-lg border-2 text-center cursor-pointer transition flex flex-col justify-between items-center min-h-[72px] shadow relative ${rarityStyle} ${
                isSelected ? 'ring-2 ring-brass-400 scale-105 shadow-[0_0_10px_rgba(222,178,67,0.4)]' : 'hover:border-iron-500'
              }`}
            >
              {/* Stack Badge */}
              {count > 1 && (
                <div className="absolute -top-1.5 -left-1.5 text-[9px] font-black font-mono bg-iron-950 text-amber-300 border border-amber-500 px-1.5 rounded-full shadow">
                  x{count}
                </div>
              )}

              <div className="font-black text-[11px] truncate w-full leading-tight">
                {item.name}
              </div>

              {/* Stats Overview */}
              <div className="text-[9px] font-mono text-gray-300 my-0.5">
                {item.slot === 'weapon' && item.stats.minDmg ? (
                  <span className="text-yellow-300 font-bold">⚔️ {item.stats.minDmg}~{item.stats.maxDmg}</span>
                ) : item.stats.defense ? (
                  <span className="text-blue-300 font-bold">🛡️ {item.stats.defense}</span>
                ) : (
                  <span className="text-gray-400 uppercase">{item.tier || item.slot}</span>
                )}
              </div>

              {/* Sockets / RuneWord Tag */}
              {item.isRuneWord ? (
                <div className="text-[9px] font-mono text-amber-300 font-bold bg-iron-950 px-1 rounded border border-amber-500">
                  [룬워드]
                </div>
              ) : item.sockets && item.sockets > 0 ? (
                <div className="text-[9px] font-mono text-purple-300 font-bold bg-iron-950 px-1 rounded border border-purple-700">
                  {item.socketedRunes?.length || 0}/{item.sockets} 소켓
                </div>
              ) : (
                <div className="text-[8px] text-gray-400 uppercase font-mono">
                  {item.tier || item.rarity}
                </div>
              )}

              {item.isLocked && (
                <div
                  className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-amber-950 text-amber-300 border border-amber-400 p-0.5 rounded shadow z-10"
                  title="잠금된 아이템 (판매/소실 방지)"
                >
                  🔒
                </div>
              )}

              {!item.isIdentified && !item.isLocked && (
                <div className="absolute -top-1 -right-1 text-[9px] font-black bg-blood-600 text-white px-1 rounded-full animate-pulse">
                  ?
                </div>
              )}
            </div>
          );
        })}

        {stackedFilteredItems.length === 0 && (
          <div className="col-span-4 py-8 text-center text-gray-400 font-bold italic">
            조건에 일치하는 아이템이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
});
InventoryItemsGrid.displayName = 'InventoryItemsGrid';


