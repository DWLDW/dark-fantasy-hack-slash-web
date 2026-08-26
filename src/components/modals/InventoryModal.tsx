import React, { useState, useMemo, useEffect } from 'react';
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
    confirmDialogState,
    identifyItem,
    sellItem,
    bulkSellItems,
    getItemSellPrice
  } = useGame();

  const [activeTab, setActiveTab] = useState<'inventory' | 'stash' | 'runes'>('inventory');
  const [mobileSubView, setMobileSubView] = useState<'bag' | 'paperdoll'>('bag');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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

  // Keyboard shortcut listener for inventory management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (confirmDialogState?.isOpen) return;

      // 1. Tab Switching (1: 소지품, 2: 보관함, 3: 룬 보관함)
      if (e.key === '1') {
        setActiveTab('inventory');
        setSelectedItem(null);
        return;
      }
      if (e.key === '2') {
        setActiveTab('stash');
        setSelectedItem(null);
        return;
      }
      if (e.key === '3') {
        setActiveTab('runes');
        setSelectedItem(null);
        return;
      }

      // 2. Arrow Key Grid Selection Navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const currentList = activeTab === 'stash' ? stackedStashItems : stackedFilteredItems;
        if (currentList.length > 0) {
          const curIdx = selectedItem ? currentList.findIndex(entry => entry.item.id === selectedItem.id) : -1;
          let nextIdx = 0;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextIdx = curIdx < currentList.length - 1 ? curIdx + 1 : 0;
          } else {
            nextIdx = curIdx > 0 ? curIdx - 1 : currentList.length - 1;
          }
          setSelectedItem(currentList[nextIdx].item);
        }
        return;
      }

      // 3. Quick Actions on Selected Item
      const key = e.key.toLowerCase();
      if (key === 'e' || e.code === 'Enter') {
        if (!selectedItem) return;
        e.preventDefault();
        if (activeTab === 'inventory') {
          if (!isCombatMode && selectedItem.isIdentified !== false) {
            handleEquip(selectedItem);
          }
        } else if (activeTab === 'stash') {
          withdrawFromStash(selectedItem.id);
          setSelectedItem(null);
        }
        return;
      }

      if (key === 'l') {
        if (selectedItem) {
          e.preventDefault();
          toggleItemLock(selectedItem.id);
        }
        return;
      }

      if (key === 'd') {
        if (!selectedItem) return;
        e.preventDefault();
        if (activeTab === 'inventory') {
          if (selectedItem.slot !== 'rune' && selectedItem.slot !== 'consumable') {
            depositToStash(selectedItem.id);
            setSelectedItem(null);
          }
        } else if (activeTab === 'stash') {
          withdrawFromStash(selectedItem.id);
          setSelectedItem(null);
        }
        return;
      }

      if (key === 's') {
        if (activeTab === 'inventory' && selectedItem && !selectedItem.isLocked) {
          e.preventDefault();
          handleSingleSell(selectedItem);
        }
        return;
      }

      if (key === 'a') {
        if (activeTab === 'inventory' && !isCombatMode) {
          e.preventDefault();
          autoEquipBestItems();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    selectedItem,
    stackedFilteredItems,
    stackedStashItems,
    isCombatMode,
    confirmDialogState?.isOpen,
    cleanEquipmentInventory.length,
    cleanEquipmentStash.length
  ]);

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-3 md:p-5 w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-[0_0_40px_rgba(251,191,36,0.18)] text-xs md:text-sm select-none ui-ornate">
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
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-brass-300/80 border border-iron-750">1</kbd>
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
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-indigo-300/80 border border-iron-750">2</kbd>
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
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-amber-300/80 border border-iron-750">3</kbd>
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
        <div className="space-y-2.5">
          {/* Mobile Sub-View Switcher (Paperdoll vs Bag) */}
          <div className="flex md:hidden bg-iron-950 p-1 rounded-lg border border-iron-800 gap-1 font-cinzel font-bold text-xs">
            <button
              onClick={() => setMobileSubView('bag')}
              className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mobileSubView === 'bag'
                  ? 'bg-iron-800 text-brass-200 border border-brass-500/60 shadow font-black'
                  : 'text-gray-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>소지품 가방 ({cleanEquipmentInventory.length})</span>
            </button>
            <button
              onClick={() => setMobileSubView('paperdoll')}
              className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mobileSubView === 'paperdoll'
                  ? 'bg-iron-800 text-brass-200 border border-brass-500/60 shadow font-black'
                  : 'text-gray-400'
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              <span>착용 장비 (9)</span>
            </button>
          </div>

          {/* Top Filter, Sorting & Batch Sell Action Bar (Shown when viewing bag on mobile or always on desktop) */}
          <div className={mobileSubView === 'bag' ? 'block' : 'hidden md:block'}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Left 5 Cols: Full 9 Equipment Slots (Diablo II Paperdoll) */}
            <div className={`md:col-span-5 ${mobileSubView === 'paperdoll' ? 'block' : 'hidden md:block'}`}>
              <EquippedPaperdoll
                equipment={equipment}
                selectedSlot={selectedSlot}
                isCombatMode={isCombatMode}
                onSelectSlot={(slot, item) => {
                  setSelectedSlot(slot);
                  setSelectedItem(item);
                  if (window.innerWidth < 768 && item) {
                    setIsDetailModalOpen(true);
                  }
                }}
                onUnequipSlot={(slot) => unequipItem(slot)}
                onOpenRuneVault={() => setActiveTab('runes')}
              />
            </div>

            {/* Right 7 Cols: Filtered Items Grid + Comparison / Details Section */}
            <div className={`md:col-span-7 flex flex-col justify-between space-y-2.5 ${mobileSubView === 'bag' ? 'block' : 'hidden md:block'}`}>
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

              {/* Desktop-only Selected Item Detail / Comparison Action Panel */}
              {selectedItem && (
                <div className="hidden md:block bg-iron-900 p-3 rounded-lg border-2 border-brass-500 shadow-xl space-y-2.5">
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

                      {/* 1. Selected Item Full Detail Card */}
                      <ItemDetailCard
                        item={selectedItem}
                        onToggleLock={toggleItemLock}
                        onDeposit={depositToStash}
                        onSell={handleSingleSell}
                        sellPrice={getItemSellPrice ? getItemSellPrice(selectedItem) : selectedItem.value || 5}
                        isInStash={false}
                      />

                      {/* 2. Stat Comparison Table */}
                      {currentEquippedItem && currentEquippedItem.id !== selectedItem.id && (
                        <div className="space-y-1 pt-1">
                          <ItemCompareTable
                            equippedItem={currentEquippedItem}
                            selectedItem={selectedItem}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Compact Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-iron-750">
                    <div className="flex items-center gap-2 w-full">
                      {!isCombatMode && selectedItem.isIdentified !== false && (
                        <button
                          onClick={() => handleEquip(selectedItem)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 border shadow bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 border-amber-300 ring-1 ring-amber-300 cursor-pointer"
                        >
                          <Sword className="w-3.5 h-3.5" />
                          <span>장착하기</span>
                          <kbd className="text-[9px] font-mono px-1 rounded bg-black/30 text-iron-950 font-black border border-amber-500/50">E</kbd>
                        </button>
                      )}

                      {/* Identify Unidentified Unique/Set */}
                      {selectedItem.isIdentified === false && (
                        <button
                          onClick={() => identifyItem(selectedItem.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 border shadow bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white border-red-400 animate-pulse cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>주문서로 식별</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📱 Mobile Floating Bottom Quick-Action Sheet (Zero-Scroll 2-Touch Equip) */}
          {selectedItem && (
            <div className="md:hidden sticky bottom-0 -mx-3 -mb-3 p-2 bg-iron-950/98 border-t-2 border-brass-500 shadow-2xl backdrop-blur z-30 flex flex-col gap-1.5 animate-slide-up font-sans">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="font-bold text-xs truncate text-brass-100">
                    {selectedItem.name}
                  </span>
                  {selectedItem.isLocked && <span className="text-[10px]">🔒</span>}
                  {selectedItem.sockets && selectedItem.sockets > 0 && (
                    <span className="text-[9px] font-mono px-1 rounded bg-iron-900 text-amber-300 border border-iron-750">
                      {selectedItem.sockets}소켓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleItemLock(selectedItem.id)}
                    className="p-1 rounded bg-iron-900 border border-iron-750 text-gray-300 cursor-pointer"
                    title="아이템 잠금/해제"
                  >
                    {selectedItem.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => handleSingleSell(selectedItem)}
                    disabled={selectedItem.isLocked}
                    className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600/80 text-[10px] font-mono font-bold cursor-pointer disabled:opacity-40"
                  >
                    💰 {getItemSellPrice ? getItemSellPrice(selectedItem) : 5}G
                  </button>
                </div>
              </div>

              {/* Action Buttons: 1-Touch Equip + Detail Popup Modal Trigger */}
              <div className="flex items-center gap-1.5">
                {!isCombatMode && selectedItem.isIdentified !== false && (
                  <button
                    onClick={() => handleEquip(selectedItem)}
                    className="flex-1 py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-iron-950 shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Sword className="w-3.5 h-3.5" />
                    <span>원터치 장착</span>
                  </button>
                )}

                {selectedItem.isIdentified === false && (
                  <button
                    onClick={() => identifyItem(selectedItem.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-black bg-gradient-to-r from-red-600 to-rose-500 text-white shadow flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>주문서 식별</span>
                  </button>
                )}

                <button
                  onClick={() => setIsDetailModalOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-iron-900 border border-iron-700 text-gray-200 flex items-center gap-1 cursor-pointer active:scale-95"
                  title="아이템 상세 스탯 및 비교 팝업 열기"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>상세</span>
                </button>
              </div>
            </div>
          )}

          {/* 🔍 Mobile Detail & Comparison Sub-Modal Popup */}
          {isDetailModalOpen && selectedItem && (
            <div
              onClick={() => setIsDetailModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 font-sans"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-iron-950 border-2 border-brass-500 rounded-xl p-3.5 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-2.5 shadow-2xl animate-scale-in text-gray-200"
              >
                <div className="flex items-center justify-between border-b border-iron-750 pb-2">
                  <span className="font-cinzel font-black text-sm text-brass-200">
                    🔍 아이템 상세 & 스탯 비교
                  </span>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-1 rounded text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <ItemDetailCard
                  item={selectedItem}
                  onToggleLock={toggleItemLock}
                  onDeposit={depositToStash}
                  onSell={handleSingleSell}
                  sellPrice={getItemSellPrice ? getItemSellPrice(selectedItem) : selectedItem.value || 5}
                  isInStash={false}
                />

                {currentEquippedItem && currentEquippedItem.id !== selectedItem.id && (
                  <ItemCompareTable
                    equippedItem={currentEquippedItem}
                    selectedItem={selectedItem}
                  />
                )}

                <div className="pt-2 border-t border-iron-800 flex items-center justify-end">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-iron-900 border border-iron-700 text-gray-300 text-xs font-bold"
                  >
                    확인 및 닫기
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  <div className="flex items-center gap-2 pt-1.5 border-t border-iron-750">
                    <button
                      onClick={() => {
                        withdrawFromStash(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="w-full py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>소지품으로 꺼내기</span>
                      <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-indigo-200 border border-indigo-400/50">D/Enter</kbd>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-iron-900/60 border border-iron-800 rounded-lg text-center text-gray-500 font-cinzel italic">
                  보관함의 아이템을 클릭하거나 [↑↓←→] 방향키로 선택하면 상세 정보를 확인하고 소지품으로 꺼낼 수 있습니다.
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

      {/* Bottom Keyboard Shortcut Guide Bar */}
      <div className="mt-3 pt-2 border-t border-iron-800 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400 flex-wrap gap-1">
        <span>⌨️ 단축키: <strong className="text-brass-300">[1~3]</strong> 탭 | <strong className="text-brass-300">[↑↓←→]</strong> 아이템 탐색 | <strong className="text-amber-300">[E]</strong> 장착 | <strong className="text-indigo-300">[D]</strong> 보관/꺼내기 | <strong className="text-amber-300">[L]</strong> 잠금 | <strong className="text-amber-300">[S]</strong> 판매 | <strong className="text-yellow-300">[A]</strong> 추천장착</span>
        <span className="text-gray-500 hidden sm:inline">[더블클릭] 빠른 장착/해제</span>
      </div>
    </div>
  );
};
