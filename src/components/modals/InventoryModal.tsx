import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { EquipSlot, GameItem, ItemRarity, RuneWordRecipe } from '../../types/game';
import { RUNEWORD_RECIPES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import { isRuneWordSlotCompatible } from '../../state/helpers/runeWordCalculator';
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
      const isSlotMatching = isRuneWordSlotCompatible(activeCandidateItem.slot, recipe);
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

  const normalMagicSellableItems = useMemo(() => {
    return cleanEquipmentInventory.filter(i => !i.isLocked && (i.rarity === 'normal' || i.rarity === 'magic'));
  }, [cleanEquipmentInventory]);

  const normalMagicSellGold = useMemo(() => {
    return normalMagicSellableItems.reduce((acc, item) => acc + (getItemSellPrice ? getItemSellPrice(item) : (item.value || 5)), 0);
  }, [normalMagicSellableItems, getItemSellPrice]);

  const totalSellGold = useMemo(() => {
    return sellableItems.reduce((acc, item) => acc + (getItemSellPrice ? getItemSellPrice(item) : (item.value || 5)), 0);
  }, [sellableItems, getItemSellPrice]);

  const handleBulkSellNormalMagic = () => {
    if (normalMagicSellableItems.length === 0) {
      alert('판매할 수 있는 일반/마법 장비가 없습니다.\n(🔒 잠금된 아이템은 안전하게 보호됩니다)');
      return;
    }

    openConfirmModal({
      title: '일반/마법 장비 일괄 판매',
      message: `인벤토리의 일반 및 마법 등급 미장착 장비 총 ${normalMagicSellableItems.length}개를 일괄 판매하시겠습니까?\n\n• 총 획득 골드: +${normalMagicSellGold.toLocaleString()}G\n• 🔒 잠금된 아이템과 희귀(레어) 이상 장비는 안전하게 보호됩니다.`,
      confirmText: `일괄 판매 (+${normalMagicSellGold.toLocaleString()}G)`,
      type: 'warning',
      onConfirm: () => {
        bulkSellItems(['normal', 'magic']);
        setSelectedCandidateItemId(null);
      }
    });
  };

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
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-2.5 sm:p-3 w-full max-w-5xl h-[96dvh] max-h-[96dvh] overflow-hidden flex flex-col shadow-[0_0_40px_rgba(251,191,36,0.2)] text-xs md:text-sm select-none font-sans ui-ornate">
      
      {/* ═══ Header & Mode Tabs (Left: Main Tabs / Right: Actions + Close X) ═══ */}
      <div className="bg-iron-950 pb-2 border-b border-iron-750 flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        {/* Left: Main Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-iron-900 p-0.5 rounded-lg border border-iron-750 font-cinzel font-bold text-xs">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'equipment'
                  ? 'bg-iron-800 text-brass-200 border border-brass-400 font-black shadow'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              <span>장비 교체</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-brass-300 border border-iron-750 hidden sm:inline">1</kbd>
            </button>

            <button
              onClick={() => setActiveTab('all_bag')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all_bag'
                  ? 'bg-iron-800 text-brass-200 border border-brass-400 font-black shadow'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>가방 ({cleanEquipmentInventory.length})</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-brass-300 border border-iron-750 hidden sm:inline">2</kbd>
            </button>

            <button
              onClick={() => setActiveTab('stash')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stash'
                  ? 'bg-iron-800 text-indigo-300 border border-indigo-400 font-black shadow'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>보관함 ({cleanEquipmentStash.length})</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-indigo-300 border border-iron-750 hidden sm:inline">3</kbd>
            </button>

            <button
              onClick={() => setActiveTab('runes')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'runes'
                  ? 'bg-iron-800 text-purple-300 border border-purple-400 font-black shadow'
                  : 'text-gray-400 hover:text-white font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>룬 보관함</span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-purple-300 border border-iron-750 hidden sm:inline">4</kbd>
            </button>
          </div>
        </div>

        {/* Right: Bulk Sell + Quick Auto-Equip + [X] Close Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isCombatMode && (
            <button
              onClick={handleBulkSellNormalMagic}
              disabled={normalMagicSellableItems.length === 0}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 border shadow cursor-pointer active:scale-95 ${
                normalMagicSellableItems.length > 0
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900 hover:border-amber-400 ring-1 ring-amber-500/30'
                  : 'bg-iron-900 text-gray-600 border-iron-800 cursor-not-allowed opacity-50'
              }`}
              title="인벤토리의 일반 및 마법 등급 장비를 일괄 판매합니다 (잠금 장비 안전 보호)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>일반/마법 일괄판매</span>
              {normalMagicSellableItems.length > 0 && (
                <span className="text-[10px] font-mono font-black text-amber-200 bg-black/50 px-1 rounded border border-amber-700/60">
                  {normalMagicSellableItems.length}
                </span>
              )}
            </button>
          )}

          {!isCombatMode && (
            <button
              onClick={autoEquipBestItems}
              className="px-2.5 py-1 rounded text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-iron-950 border border-amber-300 ring-1 ring-amber-400 flex items-center gap-1 cursor-pointer active:scale-95 shadow"
              title="최상위 장비 자동 일괄 장착 [A]"
            >
              <Sparkles className="w-3 h-3 fill-iron-950" />
              <span>추천 일괄 장착 [A]</span>
            </button>
          )}

          {isCombatMode && (
            <span className="flex items-center gap-1 bg-blood-950 text-blood-300 border border-blood-600 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              전투 중 (조회)
            </span>
          )}

          {/* Unified Top-Right Close Button */}
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-iron-800 bg-iron-900 border border-iron-750 transition cursor-pointer flex items-center justify-center shadow group ml-1"
            aria-label="닫기"
            title="인벤토리 닫기 (Esc)"
          >
            <X className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MAIN BODY: 0-SCROLL ADAPTIVE WORKSPACE */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 overflow-hidden pt-2">
        {/* TAB 1: 🛡️ SLOT-DRIVEN EQUIPMENT COMPARE & SWAP WORKSPACE */}
        {activeTab === 'equipment' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 h-full min-h-0 overflow-hidden">
            
            {/* ═══ Left 5 Cols: 9 Equipment Slots (Paperdoll) ═══ */}
            <div className="md:col-span-5 flex flex-col justify-between h-full min-h-0 overflow-hidden">
              <EquippedPaperdoll
                equipment={equipment}
                selectedSlot={selectedSlot}
                isCombatMode={isCombatMode}
                onSelectSlot={handleSelectSlot}
                onUnequipSlot={(slot) => unequipItem(slot)}
                onOpenRuneVault={() => setActiveTab('runes')}
              />
            </div>

            {/* ═══ Right 7 Cols: Selected Slot Candidates + Single Focus Diff Card ═══ */}
            <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 space-y-1.5 overflow-hidden">
              
              {/* Candidate Horizontal Ribbon Bar (Expanded 2~3 Rows & Full Stats Range) */}
              <div className="bg-iron-900/90 p-1.5 rounded-lg border border-iron-750 flex-shrink-0 shadow">
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-gray-300">
                  <span className="font-bold text-amber-300">
                    🔍 [{SLOT_NAMES[selectedSlot]}] 교체 후보 ({slotCandidateItems.length}개)
                  </span>
                  <span className="text-gray-400">
                    {currentEquippedItem ? `현재: ${currentEquippedItem.name}` : '미장착'}
                  </span>
                </div>

                {slotCandidateItems.length === 0 ? (
                  <div className="py-2 text-center text-gray-500 font-mono text-[10px]">
                    📦 가방에 교체 가능한 [{SLOT_NAMES[selectedSlot]}] 장비가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 max-h-[118px] overflow-y-auto pr-0.5">
                    {stackedCandidates.map(({ item, count }) => {
                      const isSelected = activeCandidateItem?.id === item.id;
                      const isWeapon = item.slot === 'weapon';
                      const isArmor = isArmorSlot(item.slot);

                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedCandidateItemId(item.id)}
                          className={`p-1 rounded border text-left transition relative flex flex-col justify-between min-h-[44px] cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/90 border-amber-400 ring-1 ring-amber-400 text-white shadow'
                              : 'bg-iron-950 border-iron-800 hover:border-iron-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between leading-none w-full text-[8px] font-mono">
                            <span className="text-gray-400 uppercase">{item.rarity.slice(0, 3)}</span>
                            {count > 1 && (
                              <span className="text-amber-300 font-bold bg-black/60 px-0.5 rounded">x{count}</span>
                            )}
                          </div>
                          <div className="font-bold text-[9px] truncate leading-tight my-0.5">
                            {item.name}
                          </div>
                          <div className="text-[8px] font-mono font-bold text-amber-400 leading-none truncate">
                            {isWeapon || item.stats.minDmg !== undefined || item.stats.maxDmg !== undefined
                              ? `⚔️${item.stats.minDmg ?? 0}~${item.stats.maxDmg ?? 0}`
                              : isArmor && item.stats.defense
                              ? `🛡️${item.stats.defense}`
                              : item.stats.allResist
                              ? `✨저항+${item.stats.allResist}`
                              : item.stats.hp
                              ? `❤️+${item.stats.hp}`
                              : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Single Focus Diff Card or Sub-Tabs Workspace */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {activeCandidateItem ? (
                  <div className="space-y-1.5">
                    {/* Sub-Tabs Selector for Normal Runeword Base or Unique Socket Item */}
                    {((activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0) || isSingleSocketTarget) && (
                      <div className="flex bg-iron-950 p-1 rounded border border-iron-750 gap-1 font-cinzel font-bold text-xs">
                        <button
                          onClick={() => setDetailSubTab('compare')}
                          className={`flex-1 py-0.5 rounded text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                            detailSubTab === 'compare'
                              ? 'bg-iron-800 text-brass-200 border border-brass-400 font-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                          <span>장비 스탯</span>
                        </button>

                        {activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0 && (
                          <button
                            onClick={() => setDetailSubTab('craft')}
                            className={`flex-1 py-0.5 rounded text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                              detailSubTab === 'craft'
                                ? 'bg-amber-950 text-amber-200 border border-amber-400 font-black'
                                : 'text-gray-400 hover:text-amber-300'
                            }`}
                          >
                            <Hammer className="w-3.5 h-3.5 text-amber-400" />
                            <span>룬워드 제련</span>
                          </button>
                        )}

                        {isSingleSocketTarget && (
                          <button
                            onClick={() => setDetailSubTab('socket')}
                            className={`flex-1 py-0.5 rounded text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                              detailSubTab === 'socket'
                                ? 'bg-purple-950 text-purple-200 border border-purple-400 font-black'
                                : 'text-gray-400 hover:text-purple-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>소켓 룬</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Panel 1: RuneWord Crafting */}
                    {detailSubTab === 'craft' && activeCandidateItem.rarity === 'normal' && activeCandidateItem.sockets && activeCandidateItem.sockets > 0 && (
                      <RuneCraftPanel
                        selectedItem={activeCandidateItem}
                        eligibleRuneWords={eligibleRuneWords}
                        onDirectCraft={(targetId, recipeId) => craftRuneWord(targetId, recipeId)}
                        onTransmuteCraft={(targetId, recipeId) => craftRuneWordWithTransmute(targetId, recipeId)}
                      />
                    )}

                    {/* Panel 2: Single Socket Rune */}
                    {detailSubTab === 'socket' && isSingleSocketTarget && (
                      <SingleSocketRunePanel
                        selectedItem={activeCandidateItem}
                        runesVault={runesVault}
                        onSocketRune={handleSocketRune}
                      />
                    )}

                    {/* Panel 3: Single Focus Diff Card (Integrated Delta & Equip Button) */}
                    {detailSubTab === 'compare' && (
                      <ItemDetailCard
                        item={activeCandidateItem}
                        comparedItem={currentEquippedItem}
                        onToggleLock={toggleItemLock}
                        onDeposit={depositToStash}
                        onSell={handleSingleSell}
                        onEquip={handleSwapEquip}
                        sellPrice={getItemSellPrice ? getItemSellPrice(activeCandidateItem) : activeCandidateItem.value || 5}
                        isInStash={false}
                        isCombatMode={isCombatMode}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-iron-900/40 border border-iron-800 rounded-lg text-center text-gray-500 font-cinzel italic text-xs">
                    {currentEquippedItem ? (
                      <div className="space-y-1">
                        <div className="text-gray-300 font-bold">현재 [{currentEquippedItem.name}] 착용 중</div>
                        <div className="text-[10px]">위 후보 목록에서 아이템을 선택하면 스탯 비교와 교체가 즉시 가능합니다.</div>
                      </div>
                    ) : (
                      <div>왼쪽에서 장비 슬롯을 선택하면 교체 가능한 장비가 표시됩니다.</div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>


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
