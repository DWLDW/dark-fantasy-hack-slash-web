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
import { SingleSocketRunePanel } from './inventory/SingleSocketRunePanel';
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
  ArrowRight,
  Shield,
  Flame,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Plus
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

const SLOT_NAMES: Record<EquipSlot, string> = {
  weapon: '무기',
  helm: '투구',
  armor: '갑옷',
  shield: '방패',
  gloves: '장갑',
  boots: '신발',
  amulet: '목걸이',
  ring1: '반지 1',
  ring2: '반지 2'
};

const isArmorSlot = (slot: string) => ['helm', 'armor', 'shield', 'gloves', 'boots'].includes(slot);
const isAccessorySlot = (slot: string) => ['amulet', 'ring1', 'ring2', 'ring'].includes(slot);

const matchSlot = (item: GameItem, slot: EquipSlot | 'all'): boolean => {
  if (slot === 'all') return true;
  if (slot === 'ring1' || slot === 'ring2') {
    return item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2';
  }
  return item.slot === slot;
};

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
    socketRuneIntoItem,
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

  // Tab: 'equipment' (Slot-Driven Compare/Swap) | 'all_bag' (Full 60-grid Bag) | 'stash' (Vault) | 'runes' (Rune Vault)
  const [activeTab, setActiveTab] = useState<'equipment' | 'all_bag' | 'stash' | 'runes'>('equipment');
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot>('weapon');
  const [selectedCandidateItemId, setSelectedCandidateItemId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [detailSubTab, setDetailSubTab] = useState<'compare' | 'craft' | 'socket'>('compare');

  const isCombatMode = viewMode === 'battle' && monsters.length > 0;

  // Pure equipment items in inventory
  const cleanEquipmentInventory = useMemo(() => {
    return inventory.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');
  }, [inventory]);

  // Pure equipment items in stash
  const cleanEquipmentStash = useMemo(() => {
    return itemStash.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');
  }, [itemStash]);

  // Currently equipped item in the selected slot
  const currentEquippedItem = useMemo(() => {
    return equipment[selectedSlot] || null;
  }, [equipment, selectedSlot]);

  // Candidates in inventory for the selected slot
  const slotCandidateItems = useMemo(() => {
    const list = cleanEquipmentInventory.filter(item => matchSlot(item, selectedSlot));
    return list.sort((a, b) => {
      const weightA = RARITY_WEIGHT[a.rarity] || 1;
      const weightB = RARITY_WEIGHT[b.rarity] || 1;
      return weightB - weightA;
    });
  }, [cleanEquipmentInventory, selectedSlot]);

  // Auto-select first candidate item when slot changes if current candidate is invalid
  useEffect(() => {
    if (slotCandidateItems.length > 0) {
      const exists = slotCandidateItems.some(i => i.id === selectedCandidateItemId);
      if (!selectedCandidateItemId || !exists) {
        setSelectedCandidateItemId(slotCandidateItems[0].id);
      }
    } else {
      setSelectedCandidateItemId(null);
    }
  }, [selectedSlot, slotCandidateItems, selectedCandidateItemId]);

  // ⚡ 100% Reactive Item Reference: Always binds to the live state in inventory/equipment/stash
  const activeCandidateItem = useMemo((): GameItem | null => {
    if (!selectedCandidateItemId) return null;
    const fromInv = inventory.find(i => i.id === selectedCandidateItemId);
    if (fromInv) return fromInv;
    const fromStash = itemStash.find(i => i.id === selectedCandidateItemId);
    if (fromStash) return fromStash;
    const fromEquip = Object.values(equipment).find(i => i && i.id === selectedCandidateItemId);
    if (fromEquip) return fromEquip;
    return null;
  }, [selectedCandidateItemId, inventory, itemStash, equipment]);

  // Eligible Runewords calculation for selected candidate item
  const eligibleRuneWords = useMemo((): EligibleRuneWord[] => {
    if (!activeCandidateItem || activeCandidateItem.rarity !== 'normal' || !activeCandidateItem.sockets || activeCandidateItem.sockets <= 0) {
      return [];
    }

    const availableRecipes = RUNEWORD_RECIPES.filter(recipe => {
      const isSlotMatching =
        recipe.allowedSlot === activeCandidateItem.slot ||
        (recipe.allowedSlot === 'weapon' && (activeCandidateItem.slot === 'weapon' || activeCandidateItem.slot === 'shield'));
      return isSlotMatching && recipe.requiredSockets === activeCandidateItem.sockets;
    });

    return availableRecipes.map(recipe => {
      const sim = simulateRuneWordCrafting(recipe, runesVault);
      return {
        recipe,
        canDirectCraft: sim.canDirectCraft,
        canTransmuteCraft: sim.canTransmuteCraft,
        directMissingRunes: sim.directMissingRunes,
        transmutedRunesCost: sim.transmutedRunesCost
      };
    });
  }, [activeCandidateItem, runesVault]);

  // Check if candidate item is a unique/set/rare socketed item
  const isSingleSocketTarget = useMemo(() => {
    if (!activeCandidateItem) return false;
    const isNormal = activeCandidateItem.rarity === 'normal';
    const hasSockets = Boolean(activeCandidateItem.sockets && activeCandidateItem.sockets > 0);
    const hasEmptySockets = (activeCandidateItem.sockets || 0) > (activeCandidateItem.socketedRunes?.length || 0);
    return !isNormal && hasSockets && hasEmptySockets;
  }, [activeCandidateItem]);

  // Reset detail sub-tab when item changes
  useEffect(() => {
    if (activeCandidateItem?.rarity === 'normal' && activeCandidateItem?.sockets && activeCandidateItem.sockets > 0 && eligibleRuneWords.length > 0) {
      setDetailSubTab('compare');
    } else if (isSingleSocketTarget) {
      setDetailSubTab('compare');
    } else {
      setDetailSubTab('compare');
    }
  }, [activeCandidateItem?.id, eligibleRuneWords.length, isSingleSocketTarget]);

  // Handle slot selection from paperdoll
  const handleSelectSlot = (slot: EquipSlot | 'all', item: GameItem | null) => {
    if (slot !== 'all') {
      setSelectedSlot(slot);
      setActiveTab('equipment');
      const candidates = cleanEquipmentInventory.filter(i => matchSlot(i, slot));
      setSelectedCandidateItemId(candidates.length > 0 ? candidates[0].id : null);
    }
  };

  // Execute Equip / Swap Action
  const handleSwapEquip = (itemToEquip: GameItem) => {
    equipItem(itemToEquip, selectedSlot);
    setTimeout(() => {
      const remaining = cleanEquipmentInventory.filter(i => matchSlot(i, selectedSlot) && i.id !== itemToEquip.id);
      setSelectedCandidateItemId(remaining.length > 0 ? remaining[0].id : null);
    }, 50);
  };

  // Socket a single rune into item
  const handleSocketRune = (targetItemId: string, runeKey: string) => {
    socketRuneIntoItem(targetItemId, runeKey);
  };

  // Stacked candidates for slot view
  const stackedCandidates = useMemo((): StackedItemEntry[] => {
    const map = new Map<string, StackedItemEntry>();
    slotCandidateItems.forEach(item => {
      const groupKey = `${item.name}_${item.rarity}_${item.sockets || 0}_${(item.socketedRunes || []).join('-')}_${item.isIdentified !== false}_${Boolean(item.isLocked)}`;
      const existing = map.get(groupKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(groupKey, { item, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [slotCandidateItems]);

  // Filter & sort for All Bag View
  const allBagFilteredItems = useMemo(() => {
    let list = cleanEquipmentInventory;
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
      return sortOrder === 'desc' ? weightB - weightA : weightA - weightB;
    });
  }, [cleanEquipmentInventory, categoryFilter, sortOrder]);

  const stackedAllBagItems = useMemo((): StackedItemEntry[] => {
    const map = new Map<string, StackedItemEntry>();
    allBagFilteredItems.forEach(item => {
      const groupKey = `${item.name}_${item.rarity}_${item.sockets || 0}_${(item.socketedRunes || []).join('-')}_${item.isIdentified !== false}_${Boolean(item.isLocked)}`;
      const existing = map.get(groupKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(groupKey, { item, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [allBagFilteredItems]);

  // Filter & sort for Stash View
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
      return sortOrder === 'desc' ? weightB - weightA : weightA - weightB;
    });
  }, [cleanEquipmentStash, categoryFilter, sortOrder]);

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

  // Category counts
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

  // Bulk Sell Action
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
        setSelectedCandidateItemId(null);
      }
    });
  };

  const handleSingleSell = (item: GameItem) => {
    if (item.isLocked) {
      alert('🔒 잠금된 아이템은 판매할 수 없습니다.');
      return;
    }
    sellItem(item.id);
    if (selectedCandidateItemId === item.id) {
      setSelectedCandidateItemId(null);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmDialogState?.isOpen) return;
      const key = e.key.toLowerCase();
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (key === '1') {
        e.preventDefault();
        setActiveTab('equipment');
        return;
      }
      if (key === '2') {
        e.preventDefault();
        setActiveTab('all_bag');
        return;
      }
      if (key === '3') {
        e.preventDefault();
        setActiveTab('stash');
        return;
      }
      if (key === '4') {
        e.preventDefault();
        setActiveTab('runes');
        return;
      }
      if (key === 'e' && activeCandidateItem && !isCombatMode) {
        e.preventDefault();
        handleSwapEquip(activeCandidateItem);
        return;
      }
      if (key === 'a' && !isCombatMode) {
        e.preventDefault();
        autoEquipBestItems();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeCandidateItem, selectedSlot, isCombatMode, confirmDialogState?.isOpen]);

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-2.5 sm:p-4 w-full max-w-5xl max-h-[92dvh] overflow-y-auto shadow-[0_0_40px_rgba(251,191,36,0.2)] text-xs md:text-sm select-none font-sans ui-ornate">
      
      {/* ═══ Header & Mode Tabs (Sticky) ═══ */}
      <div className="sticky -top-2.5 sm:-top-4 bg-iron-950/98 backdrop-blur z-20 pt-0.5 pb-2.5 -mx-2.5 sm:-mx-4 px-2.5 sm:px-4 border-b border-iron-750 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Mode Tabs */}
          <div className="flex bg-iron-900 p-0.5 rounded-lg border border-iron-750 font-cinzel font-bold text-xs">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'equipment'
                  ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              <span>장비 교체</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-brass-300 border border-iron-750 hidden sm:inline">1</kbd>
            </button>

            <button
              onClick={() => setActiveTab('all_bag')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all_bag'
                  ? 'bg-iron-800 text-brass-200 border-2 border-brass-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>가방 전체 ({cleanEquipmentInventory.length})</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-brass-300 border border-iron-750 hidden sm:inline">2</kbd>
            </button>

            <button
              onClick={() => setActiveTab('stash')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stash'
                  ? 'bg-iron-800 text-indigo-300 border-2 border-indigo-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>보관함 ({cleanEquipmentStash.length})</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-indigo-300 border border-iron-750 hidden sm:inline">3</kbd>
            </button>

            <button
              onClick={() => setActiveTab('runes')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'runes'
                  ? 'bg-iron-800 text-purple-300 border-2 border-purple-400 shadow-inner font-black'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>룬 보관함</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-purple-300 border border-iron-750 hidden sm:inline">4</kbd>
            </button>
          </div>
        </div>

        {/* Right Status & Close Button */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {isCombatMode && (
            <span className="flex items-center gap-1 bg-blood-950 text-blood-300 border border-blood-600 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              전투 중 (조회)
            </span>
          )}
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: 🛡️ SLOT-DRIVEN EQUIPMENT COMPARE & SWAP WORKSPACE (메인 화면) */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'equipment' && (
        <div className="space-y-2.5">
          
          {/* Quick Auto-Equip Action Header */}
          <div className="flex items-center justify-between bg-iron-900/90 p-2 rounded-lg border border-iron-750 gap-2 flex-wrap shadow">
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel font-black text-amber-300 text-xs sm:text-sm flex items-center gap-1">
                <span>🛡️ 장비 슬롯을 누르면 해당 부위 교체 후보가 바로 연동됩니다</span>
              </span>
            </div>

            {!isCombatMode && (
              <button
                onClick={autoEquipBestItems}
                className="px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-iron-950 border border-amber-300 ring-1 ring-amber-300/80 shadow flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
                title="소지품에서 가장 우수한 상위 장비를 자동 일괄 장착합니다 [A]"
              >
                <Sparkles className="w-3.5 h-3.5 fill-iron-950" />
                <span>추천 일괄 장착 [A]</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* ═══ Left 5 Cols: 9 Equipment Slots (Paperdoll) ═══ */}
            <div className="md:col-span-5">
              <EquippedPaperdoll
                equipment={equipment}
                selectedSlot={selectedSlot}
                isCombatMode={isCombatMode}
                onSelectSlot={handleSelectSlot}
                onUnequipSlot={(slot) => unequipItem(slot)}
                onOpenRuneVault={() => setActiveTab('runes')}
              />
            </div>

            {/* ═══ Right 7 Cols: Selected Slot Candidates + 1:1 Live Diff Comparison ═══ */}
            <div className="md:col-span-7 flex flex-col space-y-2.5">
              
              {/* Slot Candidate Header */}
              <div className="bg-iron-900/95 p-2 rounded-lg border border-iron-750 flex items-center justify-between shadow">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-cinzel font-black text-white">
                    🔍 [{SLOT_NAMES[selectedSlot]}] 교체 후보
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-mono font-bold text-[10px]">
                    {slotCandidateItems.length}개 보유
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {currentEquippedItem ? `현재 장착: ${currentEquippedItem.name}` : '현재 미장착'}
                </span>
              </div>

              {/* Candidate Items Horizontal Grid (Compact Thumbnails) */}
              {slotCandidateItems.length === 0 ? (
                <div className="p-4 bg-iron-900/60 border border-dashed border-iron-800 rounded-lg text-center text-gray-500 font-mono text-xs space-y-1">
                  <div>📦 가방에 교체 가능한 [{SLOT_NAMES[selectedSlot]}] 장비가 없습니다.</div>
                  <div className="text-[11px] text-amber-400/80">던전 파밍이나 기드의 도박장에서 획득할 수 있습니다.</div>
                </div>
              ) : (
                <div className="bg-iron-900/70 p-2 rounded-lg border border-iron-750">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {stackedCandidates.map(({ item, count }) => {
                      const isSelected = activeCandidateItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedCandidateItemId(item.id)}
                          className={`p-1.5 rounded-lg border text-left transition relative flex flex-col justify-between min-h-[50px] cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/80 border-2 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                              : 'bg-iron-950/90 border-iron-800 hover:border-iron-600 hover:bg-iron-900'
                          }`}
                        >
                          <div className="flex items-center justify-between leading-none w-full">
                            <span className="text-[8px] font-mono text-gray-400">{item.rarity.toUpperCase()}</span>
                            {count > 1 && (
                              <span className="text-[8px] font-mono font-bold text-amber-300 bg-black/60 px-1 rounded">x{count}</span>
                            )}
                          </div>
                          <div className="font-bold text-[10px] truncate text-white leading-tight my-0.5">
                            {item.name}
                          </div>
                          <div className="text-[8px] font-mono font-bold text-amber-300">
                            {item.stats.minDmg ? `⚔️${item.stats.minDmg}~${item.stats.maxDmg}` : item.stats.defense ? `🛡️+${item.stats.defense}` : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══ 1:1 Side-by-Side Live Comparison & Decision Swap Workspace ═══ */}
              {activeCandidateItem ? (
                <div className="bg-iron-900/95 p-3 rounded-lg border border-brass-500/80 shadow-2xl space-y-2.5 animate-fade-in">
                  
                  {/* Sub-Tabs Selector for Normal Runeword Base or Unique Socket Item */}
                  {((activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0) || isSingleSocketTarget) && (
                    <div className="flex bg-iron-950 p-1 rounded-lg border border-iron-750 gap-1 font-cinzel font-bold text-xs">
                      <button
                        onClick={() => setDetailSubTab('compare')}
                        className={`flex-1 py-1 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          detailSubTab === 'compare'
                            ? 'bg-iron-800 text-brass-200 border border-brass-400 font-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>장비 스탯 비교</span>
                      </button>

                      {activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0 && (
                        <button
                          onClick={() => setDetailSubTab('craft')}
                          className={`flex-1 py-1 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            detailSubTab === 'craft'
                              ? 'bg-amber-950 text-amber-200 border border-amber-400 font-black shadow'
                              : 'text-gray-400 hover:text-amber-300'
                          }`}
                        >
                          <Hammer className="w-3.5 h-3.5 text-amber-400" />
                          <span>룬워드 제련 ({eligibleRuneWords.length}종)</span>
                        </button>
                      )}

                      {isSingleSocketTarget && (
                        <button
                          onClick={() => setDetailSubTab('socket')}
                          className={`flex-1 py-1 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            detailSubTab === 'socket'
                              ? 'bg-purple-950 text-purple-200 border border-purple-400 font-black shadow'
                              : 'text-gray-400 hover:text-purple-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>소켓 룬 각인</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Panel 1: RuneWord Crafting Panel for Normal Socket Base */}
                  {detailSubTab === 'craft' && activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0 && (
                    <RuneCraftPanel
                      selectedItem={activeCandidateItem}
                      eligibleRuneWords={eligibleRuneWords}
                      onDirectCraft={(targetId, recipeId) => craftRuneWord(targetId, recipeId)}
                      onTransmuteCraft={(targetId, recipeId) => craftRuneWordWithTransmute(targetId, recipeId)}
                    />
                  )}

                  {/* Panel 2: Single Socket Rune Panel for Unique/Rare/Set Socket Items */}
                  {detailSubTab === 'socket' && isSingleSocketTarget && (
                    <SingleSocketRunePanel
                      selectedItem={activeCandidateItem}
                      runesVault={runesVault}
                      onSocketRune={handleSocketRune}
                    />
                  )}

                  {/* Panel 3: 1:1 Side-by-Side Dual Card Compare View */}
                  {detailSubTab === 'compare' && (
                    <div className="space-y-2">
                      {currentEquippedItem ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {/* Left: Currently Equipped Item */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-cinzel font-bold text-gray-400 px-1 flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              <span>현재 착용 중인 장비</span>
                            </div>
                            <ItemDetailCard
                              item={currentEquippedItem}
                              onToggleLock={toggleItemLock}
                              isInStash={false}
                            />
                          </div>

                          {/* Right: Selected Candidate Item (with Diff against equipped) */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-cinzel font-bold text-amber-300 px-1 flex items-center gap-1">
                              <Sword className="w-3 h-3 text-amber-400" />
                              <span>교체 대상 후보 장비</span>
                            </div>
                            <ItemDetailCard
                              item={activeCandidateItem}
                              comparedItem={currentEquippedItem}
                              onToggleLock={toggleItemLock}
                              onDeposit={depositToStash}
                              onSell={handleSingleSell}
                              sellPrice={getItemSellPrice ? getItemSellPrice(activeCandidateItem) : activeCandidateItem.value || 5}
                              isInStash={false}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[10px] font-cinzel font-bold text-amber-300 px-1 flex items-center gap-1">
                            <Sword className="w-3 h-3 text-amber-400" />
                            <span>신규 장착 대상 장비</span>
                          </div>
                          <ItemDetailCard
                            item={activeCandidateItem}
                            onToggleLock={toggleItemLock}
                            onDeposit={depositToStash}
                            onSell={handleSingleSell}
                            sellPrice={getItemSellPrice ? getItemSellPrice(activeCandidateItem) : activeCandidateItem.value || 5}
                            isInStash={false}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Big Decision Swap / Equip Button */}
                  <div className="pt-2 border-t border-iron-750 flex items-center gap-2">
                    {!isCombatMode && (
                      <button
                        onClick={() => handleSwapEquip(activeCandidateItem)}
                        className="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-iron-950 shadow-lg border border-amber-300 ring-2 ring-amber-400/90 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                      >
                        <Sword className="w-4 h-4 fill-iron-950" />
                        <span>[⚔️ 이 장비로 {currentEquippedItem ? '교체하기' : '장착하기'}]</span>
                        <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-iron-950 font-black border border-amber-600/50 hidden sm:inline">E</kbd>
                      </button>
                    )}

                    {currentEquippedItem && !isCombatMode && (
                      <button
                        onClick={() => unequipItem(selectedSlot)}
                        className="px-3 py-2.5 rounded-lg text-xs font-bold bg-blood-950/80 hover:bg-blood-900 text-blood-300 border border-blood-700 cursor-pointer active:scale-95"
                        title="현재 슬롯의 장착을 해제합니다"
                      >
                        장착 해제
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-iron-900/40 border border-iron-850 rounded-lg text-center text-gray-500 font-cinzel italic text-xs">
                  {currentEquippedItem ? (
                    <div className="space-y-1">
                      <div className="text-gray-300 font-bold">현재 [{currentEquippedItem.name}] 착용 중</div>
                      <div className="text-[11px]">위 후보 목록에서 아이템을 선택하여 스탯을 비교하고 교체할 수 있습니다.</div>
                    </div>
                  ) : (
                    <div>왼쪽에서 장비 슬롯을 선택하면 교체 가능한 장비와 스탯 비교가 표시됩니다.</div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: 🎒 FULL 60-GRID BAG VIEW (가방 전체 정리 & 일괄 판매 모드) */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'all_bag' && (
        <div className="space-y-2.5">
          <InventoryFilterBar
            categoryFilter={categoryFilter}
            selectedSlot="all"
            categoryCounts={categoryCounts}
            sortOrder={sortOrder}
            sellableCount={sellableItems.length}
            totalSellGold={totalSellGold}
            onSelectCategory={(cat) => setCategoryFilter(cat)}
            onToggleSortOrder={(order) => setSortOrder(order)}
            onBulkSell={handleSellAll}
            onAutoEquip={autoEquipBestItems}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7">
              <InventoryItemsGrid
                stackedFilteredItems={stackedAllBagItems}
                totalFilteredCount={allBagFilteredItems.length}
                selectedSlot="all"
                categoryFilter={categoryFilter}
                selectedItem={activeCandidateItem}
                isCombatMode={isCombatMode}
                onSelectItem={(item) => setSelectedCandidateItemId(item.id)}
                onEquipItem={(item) => handleSwapEquip(item)}
              />
            </div>

            <div className="md:col-span-5">
              {activeCandidateItem ? (
                <div className="bg-iron-900 p-3 rounded-lg border-2 border-brass-500 shadow-xl space-y-2.5">
                  <ItemDetailCard
                    item={activeCandidateItem}
                    onToggleLock={toggleItemLock}
                    onDeposit={depositToStash}
                    onSell={handleSingleSell}
                    sellPrice={getItemSellPrice ? getItemSellPrice(activeCandidateItem) : activeCandidateItem.value || 5}
                    isInStash={false}
                  />

                  {currentEquippedItem && currentEquippedItem.id !== activeCandidateItem.id && (
                    <ItemCompareTable
                      equippedItem={currentEquippedItem}
                      selectedItem={activeCandidateItem}
                    />
                  )}

                  <div className="pt-2 border-t border-iron-750 flex items-center gap-2">
                    {!isCombatMode && (
                      <button
                        onClick={() => handleSwapEquip(activeCandidateItem)}
                        className="w-full py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-iron-950 shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Sword className="w-3.5 h-3.5" />
                        <span>원터치 장착하기</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-iron-900/40 border border-iron-850 rounded-lg text-center text-gray-500 font-cinzel italic text-xs">
                  아이템을 클릭하면 상세 정보와 판매/잠금 버튼이 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: 📦 PERSONAL STASH VAULT (창고 보관함) */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stash' && (
        <div className="space-y-2.5">
          <InventoryFilterBar
            categoryFilter={categoryFilter}
            selectedSlot="all"
            categoryCounts={categoryCounts}
            sortOrder={sortOrder}
            sellableCount={0}
            totalSellGold={0}
            onSelectCategory={(cat) => setCategoryFilter(cat)}
            onToggleSortOrder={(order) => setSortOrder(order)}
            onBulkSell={() => {}}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7">
              <InventoryItemsGrid
                stackedFilteredItems={stackedStashItems}
                totalFilteredCount={filteredStashItems.length}
                selectedSlot="all"
                categoryFilter={categoryFilter}
                selectedItem={activeCandidateItem}
                isCombatMode={isCombatMode}
                onSelectItem={(item) => setSelectedCandidateItemId(item.id)}
                onEquipItem={(item) => withdrawFromStash(item.id)}
              />
            </div>

            <div className="md:col-span-5">
              {activeCandidateItem ? (
                <div className="bg-iron-900 p-3 rounded-lg border-2 border-indigo-500 shadow-xl space-y-2.5">
                  <ItemDetailCard
                    item={activeCandidateItem}
                    onToggleLock={toggleItemLock}
                    onWithdraw={withdrawFromStash}
                    sellPrice={getItemSellPrice ? getItemSellPrice(activeCandidateItem) : activeCandidateItem.value || 5}
                    isInStash={true}
                  />
                </div>
              ) : (
                <div className="p-6 bg-iron-900/40 border border-iron-850 rounded-lg text-center text-gray-500 font-cinzel italic text-xs">
                  보관함 아이템을 클릭하면 인벤토리로 꺼낼 수 있습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: ✨ RUNE VAULT TAB */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'runes' && (
        <RuneVaultTab
          runesVault={runesVault}
          onTransmuteRune={transmuteRunesInVault}
        />
      )}

    </div>
  );
};
