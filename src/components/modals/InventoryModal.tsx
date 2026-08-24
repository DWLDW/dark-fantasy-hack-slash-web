import React, { useState, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { EquipSlot, GameItem, ItemRarity, RuneWordRecipe } from '../../types/game';
import { RUNEWORD_RECIPES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { ItemDetailCard } from './inventory/ItemDetailCard';
import { ItemCompareTable } from './inventory/ItemCompareTable';
import { EquippedPaperdoll } from './inventory/EquippedPaperdoll';
import { InventoryFilterBar, CategoryFilter, SortOrder } from './inventory/InventoryFilterBar';
import { InventoryItemsGrid, StackedItemEntry } from './inventory/InventoryItemsGrid';
import { RuneCraftPanel, EligibleRuneWord } from './inventory/RuneCraftPanel';
import { RuneVaultTab } from './inventory/RuneVaultTab';
import {
  X,
  ShieldAlert,
  Sparkles,
  Sword,
  BookOpen,
  Hammer,
  Layers,
  Coins,
  Scale,
  Package,
  Lock,
  Unlock,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

const RARITY_WEIGHT: Record<ItemRarity, number> = {
  legendary: 7,
  unique: 6,
  set: 5,
  runeword: 4,
  rare: 3,
  magic: 2,
  normal: 1
};

const isArmorSlot = (slot: string) => ['helm', 'armor', 'shield', 'gloves', 'boots'].includes(slot);
const isAccessorySlot = (slot: string) => ['amulet', 'ring1', 'ring2', 'ring'].includes(slot);

export const InventoryModal: React.FC = () => {
  const {
    equipment,
    inventory,
    itemStash,
    depositToStash,
    withdrawFromStash,
    toggleItemLock,
    sellAllUnlockedItems,
    runesVault,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    equipItem,
    autoEquipBestItems,
    unequipItem,
    viewMode,
    monsters,
    closeModal,
    openConfirmModal,
    identifyItem,
    sellItem,
    bulkSellItems,
    getItemSellPrice
  } = useGame();

  const [activeTab, setActiveTab] = useState<'inventory' | 'stash' | 'runes'>('inventory');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [detailSubTab, setDetailSubTab] = useState<'compare' | 'craft'>('compare');
  const [ringTargetSlot, setRingTargetSlot] = useState<'ring1' | 'ring2'>('ring1');

  const isCombatMode = viewMode === 'battle' && monsters.length > 0;

  const isRingItem = (item: GameItem | null) => {
    if (!item) return false;
    return item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2';
  };

  const handleEquip = (itemToEquip: GameItem, explicitSlot?: EquipSlot) => {
    let targetSlot = explicitSlot;
    if (!targetSlot) {
      if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
        targetSlot = selectedSlot;
      } else if (isRingItem(itemToEquip)) {
        targetSlot = ringTargetSlot;
      }
    }
    equipItem(itemToEquip, targetSlot);
  };

  // Pure equipment items in inventory
  const cleanEquipmentInventory = useMemo(() => {
    return inventory.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');
  }, [inventory]);

  // Pure equipment items in stash
  const cleanEquipmentStash = useMemo(() => {
    return itemStash.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');
  }, [itemStash]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    const sourceList = activeTab === 'stash' ? cleanEquipmentStash : cleanEquipmentInventory;
    return {
      all: sourceList.length,
      weapon: sourceList.filter(i => i.slot === 'weapon').length,
      armor: sourceList.filter(i => isArmorSlot(i.slot)).length,
      accessory: sourceList.filter(i => isAccessorySlot(i.slot)).length,
      runeword: sourceList.filter(i => i.isRuneWord).length
    };
  }, [activeTab, cleanEquipmentInventory, cleanEquipmentStash]);

  // Filter & sort items (Inventory)
  const filteredItems = useMemo(() => {
    let list = cleanEquipmentInventory;

    // 1. Slot Filter if specific slot chosen
    if (selectedSlot !== 'all') {
      list = list.filter(item => {
        if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
          return item.slot === 'ring1' || item.slot === 'ring2' || item.slot === 'ring';
        }
        return item.slot === selectedSlot;
      });
    } else {
      // 2. Category Filter
      if (categoryFilter === 'weapon') {
        list = list.filter(item => item.slot === 'weapon');
      } else if (categoryFilter === 'armor') {
        list = list.filter(item => isArmorSlot(item.slot));
      } else if (categoryFilter === 'accessory') {
        list = list.filter(item => isAccessorySlot(item.slot));
      } else if (categoryFilter === 'runeword') {
        list = list.filter(item => item.isRuneWord === true);
      }
    }

    // 3. Sorting by Rarity
    return [...list].sort((a, b) => {
      const weightA = RARITY_WEIGHT[a.rarity] || 1;
      const weightB = RARITY_WEIGHT[b.rarity] || 1;
      if (sortOrder === 'desc') {
        return weightB - weightA;
      } else {
        return weightA - weightB;
      }
    });
  }, [cleanEquipmentInventory, selectedSlot, categoryFilter, sortOrder]);

  // Filter & sort items (Stash)
  const filteredStashItems = useMemo(() => {
    let list = cleanEquipmentStash;
    if (categoryFilter === 'weapon') {
      list = list.filter(item => item.slot === 'weapon');
    } else if (categoryFilter === 'armor') {
      list = list.filter(item => isArmorSlot(item.slot));
    } else if (categoryFilter === 'accessory') {
      list = list.filter(item => isAccessorySlot(item.slot));
    } else if (categoryFilter === 'runeword') {
      list = list.filter(item => item.isRuneWord === true);
    }

    return [...list].sort((a, b) => {
      const weightA = RARITY_WEIGHT[a.rarity] || 1;
      const weightB = RARITY_WEIGHT[b.rarity] || 1;
      if (sortOrder === 'desc') return weightB - weightA;
      return weightA - weightB;
    });
  }, [cleanEquipmentStash, categoryFilter, sortOrder]);

  // Group stacked items
  const stackedFilteredItems = useMemo((): StackedItemEntry[] => {
    const map = new Map<string, StackedItemEntry>();

    filteredItems.forEach(item => {
      const groupKey = `${item.name}_${item.rarity}_${item.sockets || 0}_${(item.socketedRunes || []).join('-')}_${item.isIdentified !== false}_${Boolean(item.isLocked)}`;
      const existing = map.get(groupKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(groupKey, { item, count: 1 });
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  const stackedStashItems = useMemo((): StackedItemEntry[] => {
    const map = new Map<string, StackedItemEntry>();

    filteredStashItems.forEach(item => {
      const groupKey = `${item.name}_${item.rarity}_${item.sockets || 0}_${(item.socketedRunes || []).join('-')}_${item.isIdentified !== false}_${Boolean(item.isLocked)}`;
      const existing = map.get(groupKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(groupKey, { item, count: 1 });
      }
    });

    return Array.from(map.values());
  }, [filteredStashItems]);

  // Equipped item matching current selected item slot
  const currentEquippedItem = useMemo(() => {
    if (!selectedItem) return null;
    if (selectedItem.slot === 'ring1' || selectedItem.slot === 'ring2' || selectedItem.slot === 'ring') {
      return equipment[ringTargetSlot] || null;
    }
    return equipment[selectedItem.slot as EquipSlot] || null;
  }, [selectedItem, equipment, ringTargetSlot]);

  // Items eligible for Sell All (Unlocked non-rune/non-consumable items in inventory)
  const sellableItems = useMemo(() => {
    return inventory.filter(i => !i.isLocked && i.slot !== 'rune' && i.slot !== 'consumable');
  }, [inventory]);

  const totalSellGold = useMemo(() => {
    return sellableItems.reduce((acc, item) => acc + (getItemSellPrice ? getItemSellPrice(item) : (item.value || 5)), 0);
  }, [sellableItems, getItemSellPrice]);

  const handleSellAll = () => {
    if (sellableItems.length === 0) {
      alert('판매할 수 있는 잠금 해제 장비가 없습니다.\n(🔒 잠금된 아이템은 안전하게 보호됩니다)');
      return;
    }

    openConfirmModal({
      title: '소지품 장비 전부 팔기',
      message: `인벤토리의 모든 미장착 장비 총 ${sellableItems.length}개를 전부 상점에 판매하시겠습니까?\n\n• 총 획득 골드: +${totalSellGold.toLocaleString()}G\n• 🔒 잠금된 아이템과 장착 중인 장비는 안전하게 보호됩니다.`,
      confirmText: `전부 팔기 (+${totalSellGold.toLocaleString()}G)`,
      type: 'warning',
      onConfirm: () => {
        sellAllUnlockedItems();
        if (selectedItem && !selectedItem.isLocked) {
          setSelectedItem(null);
        }
      }
    });
  };

  const handleSingleSell = (item: GameItem) => {
    if (item.isLocked) {
      alert(`🔒 [${item.name}]은(는) 잠금 상태이므로 판매할 수 없습니다.\n먼저 잠금을 해제해주세요.`);
      return;
    }
    const price = getItemSellPrice ? getItemSellPrice(item) : (item.rarity === 'normal' ? 5 : item.rarity === 'magic' ? 15 : item.rarity === 'rare' ? 50 : 100);
    openConfirmModal({
      title: '아이템 개별 판매',
      message: `• 아이템: ${item.name} (${item.rarity.toUpperCase()})\n• 판매 가격: ${price.toLocaleString()} Gold\n\n정말 상점에 판매하시겠습니까?`,
      confirmText: '판매',
      type: 'info',
      onConfirm: () => {
        sellItem(item.id);
        setSelectedItem(null);
      }
    });
  };

  // Filter craftable / relevant RuneWords if selected item is a normal socket base
  const eligibleRuneWords = useMemo((): EligibleRuneWord[] => {
    if (!selectedItem || selectedItem.rarity !== 'normal' || !selectedItem.sockets || selectedItem.sockets <= 0) {
      return [];
    }

    const list: EligibleRuneWord[] = [];
    RUNEWORD_RECIPES.forEach(recipe => {
      const isSlotMatching = recipe.allowedSlot === selectedItem.slot ||
        ((selectedItem.slot === 'ring1' || selectedItem.slot === 'ring2' || selectedItem.slot === 'ring') && (recipe.allowedSlot === 'ring1' || recipe.allowedSlot === 'ring2'));

      if (isSlotMatching && recipe.requiredSockets === selectedItem.sockets) {
        const sim = simulateRuneWordCrafting(recipe, runesVault);
        list.push({
          recipe,
          canDirectCraft: sim.canDirectCraft,
          canTransmuteCraft: sim.canTransmuteCraft,
          directMissingRunes: sim.directMissingRunes,
          transmutedRunesCost: sim.transmutedRunesCost
        });
      }
    });
    return list;
  }, [selectedItem, runesVault]);

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-3 md:p-5 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Top Header & Tab Switcher (Sticky) */}
      <div className="sticky -top-3 md:-top-5 bg-iron-950/95 backdrop-blur z-20 pt-1 pb-3 -mx-3 md:-mx-5 px-3 md:px-5 border-b border-iron-750 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h2 className="text-sm sm:text-base font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-1.5">
            <span>⚔️ 장비 & 보관함</span>
          </h2>

          {/* Mode Switch Tabs (Inventory vs Stash vs Runes) */}
          <div className="flex bg-iron-900 p-0.5 rounded-lg border border-iron-750 font-cinzel font-bold text-xs">
            <button
              onClick={() => {
                setActiveTab('inventory');
                setSelectedItem(null);
              }}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>소지품 ({cleanEquipmentInventory.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stash');
                setSelectedItem(null);
              }}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stash'
                  ? 'bg-iron-800 text-indigo-300 border-2 border-indigo-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>보관함 ({cleanEquipmentStash.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('runes');
                setSelectedItem(null);
              }}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'runes'
                  ? 'bg-iron-800 text-amber-300 border-2 border-amber-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>룬 보관함</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {isCombatMode ? (
            <span className="flex items-center gap-1 bg-blood-950 text-blood-300 border border-blood-600 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              전투 중 (조회 전용)
            </span>
          ) : (
            <span className="text-gray-400 text-xs">(더블클릭으로 장착)</span>
          )}
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EQUIPMENT & INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {/* Top Filter, Sorting & Batch Sell Action Bar */}
          <InventoryFilterBar
            categoryFilter={categoryFilter}
            selectedSlot={selectedSlot}
            categoryCounts={categoryCounts}
            sortOrder={sortOrder}
            sellableCount={sellableItems.length}
            totalSellGold={totalSellGold}
            onSelectCategory={(cat) => {
              setCategoryFilter(cat);
              setSelectedSlot('all');
            }}
            onToggleSortOrder={(order) => setSortOrder(order)}
            onBulkSell={handleSellAll}
            onAutoEquip={autoEquipBestItems}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left 5 Cols: Full 9 Equipment Slots (Diablo II Paperdoll) */}
            <div className="md:col-span-5">
              <EquippedPaperdoll
                equipment={equipment}
                selectedSlot={selectedSlot}
                isCombatMode={isCombatMode}
                onSelectSlot={(slot, item) => {
                  setSelectedSlot(slot);
                  setSelectedItem(item);
                }}
                onUnequipSlot={(slot) => unequipItem(slot)}
                onOpenRuneVault={() => setActiveTab('runes')}
              />
            </div>

            {/* Right 7 Cols: Filtered Items Grid + Comparison / Details Section */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              {/* Filtered Inventory Grid */}
              <InventoryItemsGrid
                stackedFilteredItems={stackedFilteredItems}
                totalFilteredCount={filteredItems.length}
                selectedSlot={selectedSlot}
                categoryFilter={categoryFilter}
                selectedItem={selectedItem}
                isCombatMode={isCombatMode}
                onSelectItem={(item) => setSelectedItem(item)}
                onEquipItem={(item) => handleEquip(item)}
              />

              {/* Selected Item Detail / Comparison Action Panel */}
              {selectedItem ? (
                <div className="bg-iron-900 p-3 rounded-lg border-2 border-brass-500 shadow-xl space-y-3">
                  {/* Tab Selector inside Detail Card if Socket Base */}
                  {selectedItem.rarity === 'normal' && selectedItem.sockets && selectedItem.sockets > 0 && (
                    <div className="flex bg-iron-950 p-1 rounded-lg border border-iron-750 gap-1 font-cinzel font-bold">
                      <button
                        onClick={() => setDetailSubTab('compare')}
                        className={`flex-1 py-1 px-2 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          detailSubTab === 'compare'
                            ? 'bg-iron-800 text-brass-200 border border-brass-400 font-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>장비 비교 및 상세</span>
                      </button>
                      <button
                        onClick={() => setDetailSubTab('craft')}
                        className={`flex-1 py-1 px-2 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          detailSubTab === 'craft'
                            ? 'bg-amber-950 text-amber-200 border border-amber-400 font-black'
                            : 'text-gray-400 hover:text-amber-300'
                        }`}
                      >
                        <Hammer className="w-3.5 h-3.5 text-amber-400" />
                        <span>제작 가능한 룬워드 ({eligibleRuneWords.length}종)</span>
                      </button>
                    </div>
                  )}

                  {detailSubTab === 'craft' && selectedItem.rarity === 'normal' && selectedItem.sockets && selectedItem.sockets > 0 ? (
                    <RuneCraftPanel
                      selectedItem={selectedItem}
                      eligibleRuneWords={eligibleRuneWords}
                      onDirectCraft={(targetId: string, recipeId: string) => craftRuneWord(targetId, recipeId)}
                      onTransmuteCraft={(targetId: string, recipeId: string) => craftRuneWordWithTransmute(targetId, recipeId)}
                    />
                  ) : (
                    <>
                      {/* Ring 1 vs Ring 2 Target Selector */}
                      {isRingItem(selectedItem) && (
                        <div className="flex items-center justify-between bg-iron-950 p-1.5 rounded border border-iron-750 text-xs">
                          <span className="font-bold text-gray-300 font-cinzel">비교 및 장착 대상 반지 슬롯:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setRingTargetSlot('ring1')}
                              className={`px-2 py-0.5 rounded border text-xs font-mono font-bold cursor-pointer ${
                                ringTargetSlot === 'ring1'
                                  ? 'bg-iron-800 text-brass-300 border-brass-400'
                                  : 'bg-iron-900 text-gray-500 border-iron-800'
                              }`}
                            >
                              [반지 1] {equipment.ring1 ? `(${equipment.ring1.name})` : '(비어있음)'}
                            </button>
                            <button
                              onClick={() => setRingTargetSlot('ring2')}
                              className={`px-2 py-0.5 rounded border text-xs font-mono font-bold cursor-pointer ${
                                ringTargetSlot === 'ring2'
                                  ? 'bg-iron-800 text-brass-300 border-brass-400'
                                  : 'bg-iron-900 text-gray-500 border-iron-800'
                              }`}
                            >
                              [반지 2] {equipment.ring2 ? `(${equipment.ring2.name})` : '(비어있음)'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Stat Comparison Table if replacing equipped item */}
                      {currentEquippedItem && currentEquippedItem.id !== selectedItem.id ? (
                        <ItemCompareTable
                          equippedItem={currentEquippedItem}
                          selectedItem={selectedItem}
                        />
                      ) : (
                        <ItemDetailCard
                          item={selectedItem}
                          onToggleLock={toggleItemLock}
                          onDeposit={depositToStash}
                          isInStash={false}
                        />
                      )}
                    </>
                  )}

                  {/* Bottom Actions: Equip / Identify / Single Sell / Lock */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-iron-750">
                    <div className="flex items-center gap-2">
                      {!isCombatMode && selectedItem.isIdentified !== false && (
                        <button
                          onClick={() => handleEquip(selectedItem)}
                          className="px-4 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 border shadow bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 border-amber-300 ring-1 ring-amber-300 cursor-pointer"
                        >
                          <Sword className="w-3.5 h-3.5" />
                          <span>장착하기</span>
                        </button>
                      )}

                      {/* Identify Unidentified Unique/Set */}
                      {selectedItem.isIdentified === false && (
                        <button
                          onClick={() => identifyItem(selectedItem.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 border shadow bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white border-red-400 animate-pulse cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>주문서로 식별</span>
                        </button>
                      )}

                      {/* Stash Deposit */}
                      {selectedItem.slot !== 'rune' && selectedItem.slot !== 'consumable' && (
                        <button
                          onClick={() => depositToStash(selectedItem.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border bg-iron-950 text-indigo-300 border-indigo-600/70 hover:bg-indigo-950/60 cursor-pointer shadow"
                          title="보관함(Stash)으로 옮깁니다"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>보관함에 넣기</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Lock Toggle Button */}
                      <button
                        onClick={() => toggleItemLock(selectedItem.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${
                          selectedItem.isLocked
                            ? 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                            : 'bg-iron-950 text-gray-400 border-iron-750 hover:text-white'
                        }`}
                        title={selectedItem.isLocked ? "잠금을 해제합니다" : "아이템을 잠금하여 판매/소실을 방지합니다"}
                      >
                        {selectedItem.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                        <span>{selectedItem.isLocked ? '잠금 해제' : '아이템 잠금'}</span>
                      </button>

                      {/* Individual Sell */}
                      <button
                        onClick={() => handleSingleSell(selectedItem)}
                        disabled={Boolean(selectedItem.isLocked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                          selectedItem.isLocked
                            ? 'bg-iron-950 text-gray-600 border-iron-850 cursor-not-allowed opacity-50'
                            : 'bg-iron-950 text-amber-400 border-amber-700/60 hover:bg-amber-950/40 hover:border-amber-400 cursor-pointer'
                        }`}
                        title={selectedItem.isLocked ? "잠금된 아이템은 판매할 수 없습니다" : "이 아이템을 상점에 판매합니다"}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>개별 판매 (+{(getItemSellPrice ? getItemSellPrice(selectedItem) : selectedItem.value || 5).toLocaleString()}G)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-iron-900/60 border border-iron-800 rounded-lg text-center text-gray-500 font-cinzel italic">
                  위 목록에서 아이템을 클릭하면 상세 능력치 및 장착 비교가 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STASH / ITEM VAULT (PERSONAL STORAGE) */}
      {/* ========================================================================= */}
      {activeTab === 'stash' && (
        <div className="space-y-3">
          {/* Stash Category & Sorting Bar */}
          <div className="bg-iron-900/90 p-2.5 rounded-lg border border-iron-750 flex flex-wrap items-center justify-between gap-2 shadow">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-indigo-300 font-cinzel mr-1">📦 보관함 분류:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-indigo-950 text-indigo-200 border-2 border-indigo-400 shadow-inner font-black'
                    : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 font-medium'
                }`}
              >
                <span>전체</span>
                <span className="text-[10px] font-mono opacity-80">({categoryCounts.all})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('weapon')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
                  categoryFilter === 'weapon'
                    ? 'bg-indigo-950 text-indigo-200 border-2 border-indigo-400 shadow-inner font-black'
                    : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 font-medium'
                }`}
              >
                <span>무기</span>
                <span className="text-[10px] font-mono opacity-80">({categoryCounts.weapon})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('armor')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
                  categoryFilter === 'armor'
                    ? 'bg-indigo-950 text-indigo-200 border-2 border-indigo-400 shadow-inner font-black'
                    : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 font-medium'
                }`}
              >
                <span>방어구</span>
                <span className="text-[10px] font-mono opacity-80">({categoryCounts.armor})</span>
              </button>

              <button
                onClick={() => setCategoryFilter('accessory')}
                className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border cursor-pointer ${
                  categoryFilter === 'accessory'
                    ? 'bg-indigo-950 text-indigo-200 border-2 border-indigo-400 shadow-inner font-black'
                    : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-gray-200 font-medium'
                }`}
              >
                <span>장신구</span>
                <span className="text-[10px] font-mono opacity-80">({categoryCounts.accessory})</span>
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center bg-iron-950 rounded-lg border border-iron-800 p-0.5">
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-2 py-1 rounded text-[11px] font-bold text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-amber-400" /> : <ArrowUp className="w-3 h-3 text-amber-400" />}
                <span>{sortOrder === 'desc' ? '등급 높은순' : '등급 낮은순'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left 7 Cols: Stash Items Grid */}
            <div className="md:col-span-7">
              <InventoryItemsGrid
                stackedFilteredItems={stackedStashItems}
                totalFilteredCount={filteredStashItems.length}
                selectedSlot="all"
                categoryFilter={categoryFilter}
                selectedItem={selectedItem}
                isCombatMode={false}
                onSelectItem={(item) => setSelectedItem(item)}
                onEquipItem={(item) => {
                  withdrawFromStash(item.id);
                }}
              />
            </div>

            {/* Right 5 Cols: Selected Stash Item Detail & Actions */}
            <div className="md:col-span-5 space-y-3">
              {selectedItem ? (
                <div className="space-y-3">
                  <ItemDetailCard
                    item={selectedItem}
                    onToggleLock={toggleItemLock}
                    onWithdraw={withdrawFromStash}
                    isInStash={true}
                  />

                  {/* Stash Action Bar */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-iron-900 rounded-lg border border-iron-750">
                    <button
                      onClick={() => {
                        withdrawFromStash(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow cursor-pointer flex-1 justify-center"
                    >
                      <Package className="w-4 h-4" />
                      <span>소지품으로 꺼내기</span>
                    </button>

                    <button
                      onClick={() => toggleItemLock(selectedItem.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${
                        selectedItem.isLocked
                          ? 'bg-amber-950 text-amber-300 border-amber-400'
                          : 'bg-iron-950 text-gray-400 border-iron-750 hover:text-white'
                      }`}
                    >
                      {selectedItem.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                      <span>{selectedItem.isLocked ? '잠금 해제' : '아이템 잠금'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-iron-900/60 border border-iron-800 rounded-lg text-center text-gray-500 font-cinzel italic">
                  보관함의 아이템을 클릭하면 상세 정보를 확인하고 소지품으로 꺼낼 수 있습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEDICATED RUNE VAULT (CHESSBOARD MATRIX & SMART RUNEWORD DISCOVERY) */}
      {/* ========================================================================= */}
      {activeTab === 'runes' && (
        <RuneVaultTab
          runesVault={runesVault}
          onTransmuteRune={transmuteRunesInVault}
        />
      )}
    </div>
  );
};
