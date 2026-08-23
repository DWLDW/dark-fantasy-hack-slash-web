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
  Scale
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
    runesVault,
    craftRuneWord,
    craftRuneWordWithTransmute,
    transmuteRunesInVault,
    equipItem,
    unequipItem,
    viewMode,
    monsters,
    closeModal,
    identifyItem,
    sellItem,
    bulkSellItems,
    getItemSellPrice
  } = useGame();

  const [activeTab, setActiveTab] = useState<'inventory' | 'runes'>('inventory');
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

  // Pure equipment items
  const cleanEquipmentInventory = useMemo(() => {
    return inventory.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');
  }, [inventory]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    return {
      all: cleanEquipmentInventory.length,
      weapon: cleanEquipmentInventory.filter(i => i.slot === 'weapon').length,
      armor: cleanEquipmentInventory.filter(i => isArmorSlot(i.slot)).length,
      accessory: cleanEquipmentInventory.filter(i => isAccessorySlot(i.slot)).length,
      runeword: cleanEquipmentInventory.filter(i => i.isRuneWord).length
    };
  }, [cleanEquipmentInventory]);

  // Filter & sort items
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

  // Group stacked items
  const stackedFilteredItems = useMemo((): StackedItemEntry[] => {
    const map = new Map<string, StackedItemEntry>();

    filteredItems.forEach(item => {
      const groupKey = `${item.name}_${item.rarity}_${item.sockets || 0}_${(item.socketedRunes || []).join('-')}_${item.isIdentified !== false}`;
      const existing = map.get(groupKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(groupKey, { item, count: 1 });
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  // Find currently equipped item for comparison with selectedItem
  const equippedItemForCompare = useMemo((): GameItem | null => {
    if (!selectedItem) return null;
    const slot = selectedItem.slot;
    if (slot === 'ring' || slot === 'ring1' || slot === 'ring2') {
      if (selectedSlot === 'ring2' || ringTargetSlot === 'ring2') return equipment.ring2 || null;
      if (selectedSlot === 'ring1' || ringTargetSlot === 'ring1') return equipment.ring1 || null;
      return equipment.ring1 || equipment.ring2 || null;
    }
    return equipment[slot] || null;
  }, [selectedItem, equipment, selectedSlot, ringTargetSlot]);

  const isSelectedItemEquipped = useMemo(() => {
    if (!selectedItem) return false;
    return Object.values(equipment).some(eq => eq?.id === selectedItem.id);
  }, [selectedItem, equipment]);

  // Items eligible for batch selling (Normal & Magic non-runeword equipment)
  const sellableItems = useMemo(() => {
    return inventory.filter(i =>
      (i.rarity === 'normal' || i.rarity === 'magic') &&
      i.slot !== 'rune' &&
      i.slot !== 'consumable' &&
      !i.isRuneWord
    );
  }, [inventory]);

  const normalSellCount = useMemo(() => sellableItems.filter(i => i.rarity === 'normal').length, [sellableItems]);
  const magicSellCount = useMemo(() => sellableItems.filter(i => i.rarity === 'magic').length, [sellableItems]);
  const totalSellGold = normalSellCount * 5 + magicSellCount * 15;

  const handleBulkSell = () => {
    if (sellableItems.length === 0) {
      alert('판매 가능한 일반(Normal) 또는 마법(Magic) 등급 장비가 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      `[장비 일괄 판매 확인]\n\n` +
      `• 일반(Normal, 5G): ${normalSellCount}개 (+${normalSellCount * 5}G)\n` +
      `• 마법(Magic, 15G): ${magicSellCount}개 (+${magicSellCount * 15}G)\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `총 ${sellableItems.length}개 아이템을 일괄 판매하여 ${totalSellGold} Gold를 획득하시겠습니까?`
    );

    if (confirmed) {
      bulkSellItems(['normal', 'magic']);
      if (selectedItem && (selectedItem.rarity === 'normal' || selectedItem.rarity === 'magic')) {
        setSelectedItem(null);
      }
    }
  };

  const handleSingleSell = (item: GameItem) => {
    const price = getItemSellPrice ? getItemSellPrice(item) : (item.rarity === 'normal' ? 5 : item.rarity === 'magic' ? 15 : item.rarity === 'rare' ? 50 : 100);
    const confirmed = window.confirm(
      `[아이템 판매 확인]\n\n` +
      `• 아이템: ${item.name} (${item.rarity.toUpperCase()})\n` +
      `• 판매 가격: ${price} Gold\n\n` +
      `정말 상점에 판매하시겠습니까?`
    );
    if (confirmed) {
      sellItem(item.id);
      setSelectedItem(null);
    }
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
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-iron-750 mb-3 gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider flex items-center gap-2">
            <span>⚔️ 소지품 & 룬 보관함</span>
          </h2>

          {/* Mode Switch Tabs */}
          <div className="flex bg-iron-900 p-1 rounded-lg border border-iron-750">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-brass-500 text-iron-950 shadow'
                  : 'text-gray-300 hover:text-white cursor-pointer'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>장비·아이템 ({cleanEquipmentInventory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('runes')}
              className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'runes'
                  ? 'bg-brass-500 text-iron-950 shadow'
                  : 'text-gray-300 hover:text-white cursor-pointer'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>💎 룬 보관함 (바둑판)</span>
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
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EQUIPMENT & INVENTORY WITH TOOLBAR, COMPARISON POPUP & CRAFTING */}
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
            onBulkSell={handleBulkSell}
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

              {/* Side-by-Side Equipment Comparison Popup / Details */}
              {selectedItem ? (
                <div className="bg-iron-950 p-3 rounded-lg border-2 border-iron-750 space-y-2.5 shadow-xl">
                  {/* Top Bar for Comparison View: Title, Sub-tabs & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-iron-800 pb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-brass-400" />
                      <h4 className="font-cinzel font-bold text-xs md:text-sm text-brass-200">
                        장비 비교 및 상세
                      </h4>

                      {/* If normal socket base with recipes, offer Crafting Tab */}
                      {eligibleRuneWords.length > 0 && (
                        <div className="flex bg-iron-900 p-0.5 rounded border border-iron-750 ml-2">
                          <button
                            onClick={() => setDetailSubTab('compare')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              detailSubTab === 'compare' ? 'bg-brass-500 text-iron-950' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            비교표
                          </button>
                          <button
                            onClick={() => setDetailSubTab('craft')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                              detailSubTab === 'craft' ? 'bg-amber-500 text-iron-950' : 'text-amber-400 hover:text-amber-200'
                            }`}
                          >
                            <Hammer className="w-3 h-3" />
                            <span>룬워드 ({eligibleRuneWords.length})</span>
                          </button>
                        </div>
                      )}
                      {/* If Ring item, offer Ring 1 vs Ring 2 comparison toggle */}
                      {isRingItem(selectedItem) && (
                        <div className="flex bg-iron-900 p-0.5 rounded border border-iron-750 ml-1 sm:ml-2">
                          <button
                            onClick={() => setRingTargetSlot('ring1')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              ringTargetSlot === 'ring1' ? 'bg-brass-500 text-iron-950' : 'text-gray-400 hover:text-white'
                            }`}
                            title="반지 1 슬롯의 현재 장비와 비교합니다"
                          >
                            반지 1 비교
                          </button>
                          <button
                            onClick={() => setRingTargetSlot('ring2')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              ringTargetSlot === 'ring2' ? 'bg-brass-500 text-iron-950' : 'text-gray-400 hover:text-white'
                            }`}
                            title="반지 2 슬롯의 현재 장비와 비교합니다"
                          >
                            반지 2 비교
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Equip, Identify, Sell, Deselect */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!isCombatMode && selectedItem.isIdentified !== false && (
                        isRingItem(selectedItem) ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEquip(selectedItem, 'ring1')}
                              className="px-2.5 py-1 bg-gradient-to-r from-brass-600 to-amber-600 hover:from-brass-500 hover:to-amber-500 text-white font-black rounded text-xs transition shadow flex items-center gap-1 cursor-pointer"
                              title="반지 1 슬롯에 즉시 장착합니다"
                            >
                              <Sword className="w-3 h-3 text-amber-300" />
                              <span>반지1 장착</span>
                            </button>
                            <button
                              onClick={() => handleEquip(selectedItem, 'ring2')}
                              className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black rounded text-xs transition shadow flex items-center gap-1 cursor-pointer"
                              title="반지 2 슬롯에 즉시 장착합니다"
                            >
                              <Sword className="w-3 h-3 text-yellow-300" />
                              <span>반지2 장착</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEquip(selectedItem)}
                            className="px-3 py-1 bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 font-black rounded text-xs transition shadow flex items-center gap-1 animate-pulse cursor-pointer"
                          >
                            <Sword className="w-3 h-3" />
                            <span>장착하기</span>
                          </button>
                        )
                      )}

                      {selectedItem.isIdentified === false && (
                        <button
                          onClick={() => identifyItem(selectedItem.id)}
                          className="px-2.5 py-1 bg-blood-600 hover:bg-blood-500 text-white font-black rounded text-xs transition shadow flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>식별</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSingleSell(selectedItem)}
                        className="px-2 py-1 bg-iron-900 hover:bg-red-950 text-gray-300 hover:text-red-300 border border-iron-750 hover:border-red-600 rounded text-xs font-bold transition shadow flex items-center gap-1 cursor-pointer"
                        title="해당 아이템을 판매하여 골드를 획득합니다."
                      >
                        <Coins className="w-3 h-3 text-yellow-400" />
                        <span>판매 ({getItemSellPrice ? getItemSellPrice(selectedItem) : 5}G)</span>
                      </button>

                      <button
                        onClick={() => setSelectedItem(null)}
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-iron-800 transition cursor-pointer"
                        title="비교 닫기"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Crafting Sub-view if Craft tab active */}
                  {detailSubTab === 'craft' && eligibleRuneWords.length > 0 ? (
                    <RuneCraftPanel
                      selectedItem={selectedItem}
                      eligibleRuneWords={eligibleRuneWords}
                      onDirectCraft={(itemId, recipeId) => craftRuneWord(itemId, recipeId)}
                      onTransmuteCraft={(itemId, recipeId) => craftRuneWordWithTransmute(itemId, recipeId)}
                    />
                  ) : (
                    <div className="space-y-3">
                      {/* 1. TOP SECTION: Selected Item's Full Stats Card & Affixes */}
                      <ItemDetailCard item={selectedItem} />

                      {/* 2. BOTTOM SECTION: Side-by-Side Equipment Comparison Table */}
                      {!isSelectedItemEquipped && equippedItemForCompare && equippedItemForCompare.id !== selectedItem.id && (
                        <ItemCompareTable selectedItem={selectedItem} equippedItem={equippedItemForCompare} />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-iron-950/50 rounded-lg border border-dashed border-iron-750 text-center text-xs text-gray-400">
                  <div className="flex justify-center mb-1">
                    <Scale className="w-5 h-5 text-gray-500" />
                  </div>
                  인벤토리의 아이템을 클릭하면 현재 착용 중인 장비와의 <strong className="text-brass-300">스탯 차이(Diff) 실시간 비교표</strong>와 스마트 룬워드 제작 창이 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEDICATED RUNE VAULT GRID (1 to 28 Runes Grid with Transmute) */}
      {/* ========================================================================= */}
      {activeTab === 'runes' && (
        <RuneVaultTab
          runesVault={runesVault}
          onTransmuteRune={(runeKey) => transmuteRunesInVault(runeKey)}
        />
      )}
    </div>
  );
};

