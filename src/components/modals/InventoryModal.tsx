import React, { useState, useMemo } from 'react';
import { useGame } from '../../state/gameStore';
import { EquipSlot, GameItem, RuneWordRecipe } from '../../types/game';
import { D2_RUNES, RUNEWORD_RECIPES } from '../../data/gameData';
import { simulateRuneWordCrafting } from '../../utils/runeCrafting';
import {
  X,
  ShieldAlert,
  Sparkles,
  Sword,
  Shield,
  Footprints,
  HardHat,
  CircleDot,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Hammer,
  Layers,
  Zap,
  RotateCcw,
  Wind
} from 'lucide-react';

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
    closeModal,
    identifyItem
  } = useGame();

  const [activeTab, setActiveTab] = useState<'inventory' | 'runes'>('inventory');
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | 'all'>('weapon');
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [hoveredRuneKey, setHoveredRuneKey] = useState<string | null>(null);

  const isCombatMode = viewMode === 'battle';

  // Pure equipment items
  const cleanEquipmentInventory = inventory.filter(item => item.slot !== 'rune' && item.slot !== 'consumable');

  // Filter items matching currently selected slot
  const filteredItems = useMemo(() => {
    if (selectedSlot === 'all') return cleanEquipmentInventory;
    return cleanEquipmentInventory.filter(item => {
      if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
        return item.slot === 'ring1' || item.slot === 'ring2';
      }
      return item.slot === selectedSlot;
    });
  }, [cleanEquipmentInventory, selectedSlot]);

  // Group stacked items (e.g. 3 of same 4-socket Crystal Sword or Unidentified items)
  interface StackedItemEntry {
    item: GameItem;
    count: number;
  }

  const stackedFilteredItems = useMemo(() => {
    const map = new Map<string, StackedItemEntry>();

    filteredItems.forEach(item => {
      // Group key by name, rarity, sockets, socketedRunes, isIdentified
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

  // Filter craftable / relevant RuneWords if selected item is a normal socket base
  const eligibleRuneWords: {
    recipe: RuneWordRecipe;
    canDirectCraft: boolean;
    canTransmuteCraft: boolean;
    directMissingRunes: string[];
    transmutedRunesCost: Record<string, number>;
  }[] = [];

  if (selectedItem && selectedItem.rarity === 'normal' && selectedItem.sockets && selectedItem.sockets > 0) {
    RUNEWORD_RECIPES.forEach(recipe => {
      const isSlotMatching = recipe.allowedSlot === selectedItem.slot ||
        ((selectedItem.slot === 'ring1' || selectedItem.slot === 'ring2') && (recipe.allowedSlot === 'ring1' || recipe.allowedSlot === 'ring2'));

      if (isSlotMatching && recipe.requiredSockets === selectedItem.sockets) {
        const sim = simulateRuneWordCrafting(recipe, runesVault);
        eligibleRuneWords.push({
          recipe,
          canDirectCraft: sim.canDirectCraft,
          canTransmuteCraft: sim.canTransmuteCraft,
          directMissingRunes: sim.directMissingRunes,
          transmutedRunesCost: sim.transmutedRunesCost
        });
      }
    });
  }

  const getRarityColor = (rarity: GameItem['rarity'], isIdentified = true) => {
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

  const getSpeedCategoryBadge = (speed?: string) => {
    switch (speed) {
      case 'very_fast': return <span className="text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600 text-[9px] flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />매우 빠름 (ATB +30%)</span>;
      case 'fast': return <span className="text-emerald-300 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600 text-[9px] flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />빠름 (ATB +15%)</span>;
      case 'slow': return <span className="text-rose-300 font-bold bg-rose-950 px-1.5 py-0.5 rounded border border-rose-600 text-[9px]">느림 (한방 묵직)</span>;
      default: return <span className="text-gray-300 font-bold bg-iron-900 px-1.5 py-0.5 rounded border border-iron-700 text-[9px]">보통 공속</span>;
    }
  };

  const allRuneKeys = Object.keys(D2_RUNES);

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-3 md:p-5 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-iron-750 mb-3 gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider">
            소지품 & 룬 보관함
          </h2>

          {/* Mode Switch Tabs */}
          <div className="flex bg-iron-900 p-1 rounded-lg border border-iron-750">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-brass-500 text-iron-950 shadow'
                  : 'text-gray-300 hover:text-white'
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
                  : 'text-gray-300 hover:text-white'
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
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EQUIPMENT & INVENTORY WITH SLOT-SELECTION FILTERING INTERFACE */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left 5 Cols: Full 9 Equipment Slots (Diablo II Paperdoll) */}
          <div className="md:col-span-5 bg-iron-900/90 p-3 rounded-lg border-2 border-iron-750 flex flex-col justify-between shadow">
            <div>
              <div className="flex justify-between items-center mb-2.5 border-b border-iron-750 pb-1">
                <h3 className="font-cinzel font-bold text-gray-200 text-xs">
                  착용 중인 장비 (부위 선택 시 해당 장비만 필터링)
                </h3>
                <button
                  onClick={() => setSelectedSlot('all')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border transition ${
                    selectedSlot === 'all'
                      ? 'bg-brass-500 text-iron-950 border-brass-400'
                      : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-white'
                  }`}
                >
                  전체 보기
                </button>
              </div>

              {/* 3x3 Paperdoll Grid: All 9 slots */}
              <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto py-1">
                {/* Row 1 */}
                <EquipSlotBox
                  slot="weapon"
                  label="무기"
                  item={equipment.weapon}
                  isSelected={selectedSlot === 'weapon'}
                  onClick={() => {
                    setSelectedSlot('weapon');
                    setSelectedItem(equipment.weapon || null);
                  }}
                  onUnequip={() => unequipItem('weapon')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="helm"
                  label="투구"
                  item={equipment.helm}
                  isSelected={selectedSlot === 'helm'}
                  onClick={() => {
                    setSelectedSlot('helm');
                    setSelectedItem(equipment.helm || null);
                  }}
                  onUnequip={() => unequipItem('helm')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="amulet"
                  label="목걸이"
                  item={equipment.amulet}
                  isSelected={selectedSlot === 'amulet'}
                  onClick={() => {
                    setSelectedSlot('amulet');
                    setSelectedItem(equipment.amulet || null);
                  }}
                  onUnequip={() => unequipItem('amulet')}
                  isCombatMode={isCombatMode}
                />

                {/* Row 2 */}
                <EquipSlotBox
                  slot="gloves"
                  label="장갑"
                  item={equipment.gloves}
                  isSelected={selectedSlot === 'gloves'}
                  onClick={() => {
                    setSelectedSlot('gloves');
                    setSelectedItem(equipment.gloves || null);
                  }}
                  onUnequip={() => unequipItem('gloves')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="armor"
                  label="갑옷"
                  item={equipment.armor}
                  isSelected={selectedSlot === 'armor'}
                  onClick={() => {
                    setSelectedSlot('armor');
                    setSelectedItem(equipment.armor || null);
                  }}
                  onUnequip={() => unequipItem('armor')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="shield"
                  label="방패"
                  item={equipment.shield}
                  isSelected={selectedSlot === 'shield'}
                  onClick={() => {
                    setSelectedSlot('shield');
                    setSelectedItem(equipment.shield || null);
                  }}
                  onUnequip={() => unequipItem('shield')}
                  isCombatMode={isCombatMode}
                />

                {/* Row 3 */}
                <EquipSlotBox
                  slot="ring1"
                  label="반지 1"
                  item={equipment.ring1}
                  isSelected={selectedSlot === 'ring1'}
                  onClick={() => {
                    setSelectedSlot('ring1');
                    setSelectedItem(equipment.ring1 || null);
                  }}
                  onUnequip={() => unequipItem('ring1')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="boots"
                  label="신발"
                  item={equipment.boots}
                  isSelected={selectedSlot === 'boots'}
                  onClick={() => {
                    setSelectedSlot('boots');
                    setSelectedItem(equipment.boots || null);
                  }}
                  onUnequip={() => unequipItem('boots')}
                  isCombatMode={isCombatMode}
                />
                <EquipSlotBox
                  slot="ring2"
                  label="반지 2"
                  item={equipment.ring2}
                  isSelected={selectedSlot === 'ring2'}
                  onClick={() => {
                    setSelectedSlot('ring2');
                    setSelectedItem(equipment.ring2 || null);
                  }}
                  onUnequip={() => unequipItem('ring2')}
                  isCombatMode={isCombatMode}
                />
              </div>
            </div>

            <div className="text-center pt-2 border-t border-iron-750">
              <button
                onClick={() => setActiveTab('runes')}
                className="w-full py-2 bg-iron-950 hover:bg-iron-800 border border-purple-600/70 text-purple-200 hover:text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>보유 룬 바둑판 보관함 열기</span>
              </button>
            </div>
          </div>

          {/* Right 7 Cols: Filtered Items Grid + Details / Smart RuneWord Crafting Section */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            {/* Filtered Inventory Grid */}
            <div className="bg-iron-900/90 p-3 rounded-lg border-2 border-iron-750 shadow">
              <div className="flex justify-between items-center mb-2 border-b border-iron-750 pb-1">
                <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                  <span className="text-brass-300">[{selectedSlot === 'all' ? '전체 부위' : selectedSlot.toUpperCase()}]</span>
                  <span>장착 가능한 아이템 목록 ({filteredItems.length})</span>
                </span>
                <span className="text-gray-400 text-xs font-mono">클릭 시 상세 / 더블클릭 시 장착</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[210px] overflow-y-auto p-1">
                {stackedFilteredItems.map(({ item, count }) => {
                  const isSelected = selectedItem?.id === item.id;
                  const rarityStyle = getRarityColor(item.rarity, item.isIdentified);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => !isCombatMode && item.isIdentified !== false && equipItem(item)}
                      className={`p-2 rounded-lg border-2 text-center cursor-pointer transition flex flex-col justify-between items-center min-h-[72px] shadow relative ${rarityStyle} ${
                        isSelected ? 'ring-2 ring-brass-400 scale-105 shadow-[0_0_10px_rgba(222,178,67,0.4)]' : 'hover:border-iron-500'
                      }`}
                    >
                      {/* Stack Badge (e.g. x3) */}
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
                          <span className="text-yellow-300 font-bold">공격 {item.stats.minDmg}~{item.stats.maxDmg}</span>
                        ) : item.stats.defense ? (
                          <span className="text-blue-300 font-bold">방어 {item.stats.defense}</span>
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

                      {!item.isIdentified && (
                        <div className="absolute -top-1 -right-1 text-[9px] font-black bg-blood-600 text-white px-1 rounded-full animate-pulse">
                          ?
                        </div>
                      )}
                    </div>
                  );
                })}

                {stackedFilteredItems.length === 0 && (
                  <div className="col-span-4 py-8 text-center text-gray-400 font-bold italic">
                    해당 부위([{selectedSlot.toUpperCase()}])에 장착 가능한 아이템이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* Smart Auto-RuneWord Section (Triggered when socket item selected) */}
            {selectedItem && selectedItem.rarity === 'normal' && selectedItem.sockets && selectedItem.sockets > 0 ? (
              <div className="bg-iron-950 p-3 rounded-lg border-2 border-brass-500 space-y-2 shadow-lg">
                <div className="flex justify-between items-center border-b border-iron-750 pb-1.5">
                  <div className="font-bold text-xs text-brass-200 flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-amber-400" />
                    <span>[{selectedItem.name}] 전용 스마트 룬워드 공방</span>
                  </div>
                  <span className="text-[11px] text-gray-300 font-mono font-bold">
                    {eligibleRuneWords.length}개 룬워드 매칭됨
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {eligibleRuneWords.map(({ recipe, canDirectCraft, canTransmuteCraft, directMissingRunes }) => (
                    <div
                      key={recipe.id}
                      className={`p-2.5 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                        canDirectCraft
                          ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : canTransmuteCraft
                          ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]'
                          : 'bg-iron-900 border-iron-750 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="font-black text-xs md:text-sm text-gray-100 flex items-center gap-2">
                          <span className={canDirectCraft ? 'text-amber-300' : canTransmuteCraft ? 'text-purple-300' : 'text-gray-300'}>
                            {recipe.name}
                          </span>
                          <span className="text-[10px] font-mono text-purple-300 font-bold bg-iron-950 px-1.5 py-0.5 rounded border border-iron-700">
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

                      {/* Dual Craft Buttons: Direct Craft vs Auto-Transmute Craft */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => selectedItem && craftRuneWord(selectedItem.id, recipe.id)}
                          disabled={!canDirectCraft}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                            canDirectCraft
                              ? 'bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 ring-1 ring-brass-300 animate-pulse'
                              : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                          }`}
                          title={canDirectCraft ? '보유한 상위 룬으로 즉시 제작' : '해당 상위 룬 직접 부족'}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ 즉시 제작</span>
                        </button>

                        <button
                          onClick={() => selectedItem && craftRuneWordWithTransmute(selectedItem.id, recipe.id)}
                          disabled={!canTransmuteCraft}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition shadow flex items-center gap-1 ${
                            canTransmuteCraft
                              ? 'bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white ring-1 ring-purple-300'
                              : 'bg-iron-800 text-gray-500 border border-iron-700 cursor-not-allowed opacity-50'
                          }`}
                          title={canTransmuteCraft ? '하위 룬들을 자동으로 합성하여 상위 룬을 충당한 뒤 제작' : '하위 룬 총량 부족'}
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          <span>🔮 합성 후 제작</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {eligibleRuneWords.length === 0 && (
                    <div className="text-xs text-gray-400 italic text-center py-2">
                      이 장비의 부위/소켓에 일치하는 룬워드가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : selectedItem ? (
              /* Diablo II Style Item Details Tooltip */
              <div className="bg-iron-950 p-3 rounded-lg border-2 border-iron-750 space-y-2 shadow-lg">
                <div className="flex justify-between items-start border-b border-iron-800 pb-2">
                  <div>
                    <h4 className={`font-cinzel font-black text-sm md:text-base ${getRarityColor(selectedItem.rarity, selectedItem.isIdentified)}`}>
                      {selectedItem.name}
                    </h4>
                    <div className="text-[11px] text-gray-300 font-mono mt-0.5 flex items-center gap-2">
                      <span className="uppercase text-amber-400 font-bold">{selectedItem.tier || 'NORMAL'} TIER</span>
                      <span>| {selectedItem.slot.toUpperCase()}</span>
                      {selectedItem.speedCategory && getSpeedCategoryBadge(selectedItem.speedCategory)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isCombatMode && selectedItem.isIdentified !== false && (
                      <button
                        onClick={() => equipItem(selectedItem)}
                        className="px-4 py-1.5 bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 font-black rounded-lg text-xs transition shadow animate-pulse"
                      >
                        장착하기
                      </button>
                    )}
                    {selectedItem.isIdentified === false && (
                      <button
                        onClick={() => identifyItem(selectedItem.id)}
                        className="px-3 py-1.5 bg-blood-600 hover:bg-blood-500 text-white font-black rounded text-xs transition shadow flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        식별하기
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {selectedItem.stats.minDmg !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-yellow-300 font-bold">
                      ⚔️ 기본 공격력: {selectedItem.stats.minDmg} ~ {selectedItem.stats.maxDmg}
                    </div>
                  )}
                  {selectedItem.stats.defense !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-blue-300 font-bold">
                      🛡️ 방어력: +{selectedItem.stats.defense}
                    </div>
                  )}
                  {selectedItem.stats.evasion !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-emerald-300 font-bold flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      <span>회피율: +{selectedItem.stats.evasion}%</span>
                    </div>
                  )}
                  {selectedItem.stats.damageReduction !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-purple-300 font-bold">
                      🛡️ 피해 감소: {selectedItem.stats.damageReduction}%
                    </div>
                  )}
                  {selectedItem.stats.fortune !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-amber-300 font-bold">
                      ✨ 매직 발견(MF): +{selectedItem.stats.fortune}%
                    </div>
                  )}
                  {selectedItem.stats.allResist !== undefined && (
                    <div className="p-1.5 bg-iron-900 rounded border border-iron-800 text-cyan-300 font-bold">
                      🔮 모든 저항: +{selectedItem.stats.allResist}%
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {selectedItem.description}
                </p>

                {selectedItem.specialEffect && (
                  <div className="text-xs font-bold text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-600 shadow">
                    ★ 고유 옵션: {selectedItem.specialEffect}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-iron-950/50 rounded-lg border border-dashed border-iron-750 text-center text-xs text-gray-400">
                장비 슬롯을 누르면 해당 부위의 장비 목록이 정렬되며, 아이템을 클릭하면 상세 수치 비교와 스마트 룬워드 제작이 가능합니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEDICATED RUNE VAULT GRID (1 to 33 Runes Grid with Transmute) */}
      {/* ========================================================================= */}
      {activeTab === 'runes' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-iron-900 p-2.5 rounded-lg border border-iron-750">
            <div className="text-xs text-gray-200">
              💎 디아블로 2 정통 룬 보관함. 룬 3개를 보유하면 상위 룬으로 즉시 합성할 수 있습니다.
            </div>
            <div className="text-xs font-mono text-brass-300 font-bold">
              총 보유 룬: {Object.values(runesVault).reduce((a, b) => a + b, 0)}개
            </div>
          </div>

          {/* 7-Columns Chessboard Grid for 28 Runes */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {allRuneKeys.map(rKey => {
              const def = D2_RUNES[rKey];
              const ownedCount = runesVault[rKey] || 0;
              const canTransmute = ownedCount >= 3;
              const isHovered = hoveredRuneKey === rKey;

              return (
                <div
                  key={rKey}
                  onMouseEnter={() => setHoveredRuneKey(rKey)}
                  className={`p-2 rounded-lg border-2 text-center transition relative flex flex-col justify-between min-h-[78px] shadow ${
                    ownedCount > 0
                      ? 'bg-iron-900 border-brass-600/80 text-gray-100 hover:border-brass-400'
                      : 'bg-iron-950/50 border-iron-800 text-gray-600 opacity-60'
                  } ${isHovered ? 'ring-2 ring-purple-400' : ''}`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                    <span className="text-gray-400">#{def.number}</span>
                    <span className={`font-bold ${ownedCount > 0 ? 'text-amber-300' : 'text-gray-600'}`}>
                      x{ownedCount}
                    </span>
                  </div>

                  <div className="font-black font-cinzel text-xs md:text-sm my-1 text-brass-200 truncate">
                    {rKey}
                  </div>

                  {canTransmute ? (
                    <button
                      onClick={() => transmuteRunesInVault(rKey)}
                      className="w-full py-0.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-black text-[9px] rounded transition shadow"
                      title="동일 룬 3개 ➔ 1단계 상위 룬 합성"
                    >
                      🔮 3개 합성
                    </button>
                  ) : (
                    <div className="text-[9px] text-gray-400 font-mono">
                      {def.name.split(' ')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hovered Rune Details */}
          {hoveredRuneKey && D2_RUNES[hoveredRuneKey] && (
            <div className="p-3 bg-iron-900 rounded-lg border-2 border-iron-750 font-mono text-xs space-y-1 shadow">
              <div className="flex justify-between items-center border-b border-iron-750 pb-1">
                <span className="font-bold text-brass-200 text-sm">{D2_RUNES[hoveredRuneKey].name} (룬 #{D2_RUNES[hoveredRuneKey].number})</span>
                <span className="text-purple-300 font-bold">보유: {runesVault[hoveredRuneKey] || 0}개</span>
              </div>
              <div className="text-gray-300">
                <strong className="text-white">무기 장착 옵션:</strong> {D2_RUNES[hoveredRuneKey].weaponBonus}
              </div>
              <div className="text-gray-300">
                <strong className="text-white">방어구 장착 옵션:</strong> {D2_RUNES[hoveredRuneKey].armorBonus}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EquipSlotBox: React.FC<{
  slot: EquipSlot;
  label: string;
  item?: GameItem;
  isSelected: boolean;
  onClick: () => void;
  onUnequip: () => void;
  isCombatMode: boolean;
}> = ({ label, item, isSelected, onClick, onUnequip, isCombatMode }) => {
  return (
    <div
      onClick={onClick}
      onDoubleClick={() => !isCombatMode && item && onUnequip()}
      className={`p-2 rounded-lg border-2 text-center cursor-pointer transition min-h-[68px] flex flex-col justify-between items-center relative shadow ${
        isSelected
          ? 'ring-2 ring-brass-400 border-brass-400 bg-iron-850 scale-105 shadow-[0_0_10px_rgba(222,178,67,0.5)]'
          : item
          ? item.rarity === 'runeword'
            ? 'bg-amber-950/40 border-amber-400 text-amber-200 font-bold'
            : item.rarity === 'unique'
            ? 'bg-orange-950/30 border-orange-400 text-orange-200'
            : item.rarity === 'rare'
            ? 'bg-yellow-950/30 border-yellow-400 text-yellow-200'
            : 'bg-iron-900 border-iron-700 text-gray-200'
          : 'bg-iron-950 border-dashed border-iron-800 text-gray-500 hover:border-iron-700'
      }`}
    >
      <div className={`text-[10px] font-mono font-bold leading-none ${isSelected ? 'text-brass-300 underline' : 'text-gray-400'}`}>
        {label}
      </div>
      {item ? (
        <div className="font-black text-[11px] truncate w-full leading-tight mt-1">{item.name}</div>
      ) : (
        <div className="text-[10px] text-gray-600 font-mono">[빈 슬롯]</div>
      )}
      {item?.isRuneWord && (
        <div className="text-[8px] font-mono text-amber-300 font-black">[룬워드]</div>
      )}
    </div>
  );
};
