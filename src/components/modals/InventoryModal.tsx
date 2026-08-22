import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { EquipSlot, GameItem } from '../../types/game';
import { X, ShieldAlert, Sparkles, Sword, Shield, Footprints, HardHat, CircleDot, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';

export const InventoryModal: React.FC = () => {
  const { equipment, inventory, equipItem, unequipItem, viewMode, closeModal, identifyItem } = useGame();
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);

  const isCombatMode = viewMode === 'battle';

  const getRarityColor = (rarity: GameItem['rarity'], isIdentified = true) => {
    if (!isIdentified) return 'border-red-600/80 text-red-400 bg-red-950/30';
    switch (rarity) {
      case 'runeword': return 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold';
      case 'magic': return 'border-blue-500/80 text-blue-400 bg-blue-950/20';
      case 'rare': return 'border-yellow-500/80 text-yellow-400 bg-yellow-950/20';
      case 'unique': return 'border-orange-500/80 text-orange-400 bg-orange-950/20';
      case 'legendary': return 'border-rose-500/80 text-rose-400 bg-rose-950/20';
      default: return 'border-gray-600 text-gray-300 bg-iron-900/40';
    }
  };

  const equippedInSameSlot = selectedItem?.slot && selectedItem.slot !== 'rune' && selectedItem.slot !== 'consumable' && selectedItem.slot !== 'gem' && selectedItem.slot !== 'material'
    ? equipment[selectedItem.slot as EquipSlot]
    : null;

  return (
    <div className="bg-iron-950 border border-brass-600/80 rounded-md p-3 md:p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-800 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-cinzel font-bold text-brass-300 tracking-wider">
            장비 & 인벤토리
          </h2>
          {isCombatMode ? (
            <span className="flex items-center gap-1 bg-blood-950 text-blood-400 border border-blood-700 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              전투 중 (장비 교체 불가 / 조회 전용)
            </span>
          ) : (
            <span className="text-gray-400 text-xs">(더블클릭으로 장착/해제)</span>
          )}
        </div>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-100 p-1 rounded hover:bg-iron-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left 5 Cols: Equipment Slots */}
        <div className="md:col-span-5 bg-iron-900/60 p-3 rounded border border-iron-800">
          <h3 className="font-cinzel font-bold text-gray-300 mb-3 text-center border-b border-iron-800 pb-1">
            착용 중인 장비
          </h3>

          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto py-2">
            <div className="col-start-2">
              <EquipSlotBox
                slot="helm"
                label="투구"
                item={equipment.helm}
                onClick={() => setSelectedItem(equipment.helm || null)}
                onUnequip={() => unequipItem('helm')}
                isCombatMode={isCombatMode}
              />
            </div>

            <div className="col-start-1">
              <EquipSlotBox
                slot="weapon"
                label="무기"
                item={equipment.weapon}
                onClick={() => setSelectedItem(equipment.weapon || null)}
                onUnequip={() => unequipItem('weapon')}
                isCombatMode={isCombatMode}
              />
            </div>
            <div className="col-start-2">
              <EquipSlotBox
                slot="armor"
                label="갑옷"
                item={equipment.armor}
                onClick={() => setSelectedItem(equipment.armor || null)}
                onUnequip={() => unequipItem('armor')}
                isCombatMode={isCombatMode}
              />
            </div>
            <div className="col-start-3">
              <EquipSlotBox
                slot="shield"
                label="방패"
                item={equipment.shield}
                onClick={() => setSelectedItem(equipment.shield || null)}
                onUnequip={() => unequipItem('shield')}
                isCombatMode={isCombatMode}
              />
            </div>

            <div className="col-start-1">
              <EquipSlotBox
                slot="ring1"
                label="반지"
                item={equipment.ring1}
                onClick={() => setSelectedItem(equipment.ring1 || null)}
                onUnequip={() => unequipItem('ring1')}
                isCombatMode={isCombatMode}
              />
            </div>
            <div className="col-start-2">
              <EquipSlotBox
                slot="boots"
                label="신발"
                item={equipment.boots}
                onClick={() => setSelectedItem(equipment.boots || null)}
                onUnequip={() => unequipItem('boots')}
                isCombatMode={isCombatMode}
              />
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Inventory Grid + Diablo 2 Item Tooltip */}
        <div className="md:col-span-7 flex flex-col space-y-3">
          {/* Inventory Grid */}
          <div className="bg-iron-900/60 p-3 rounded border border-iron-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-cinzel font-bold text-gray-300">
                소지품 ({inventory.length}/36)
              </h3>
            </div>

            <div className="grid grid-cols-6 gap-1.5 min-h-[140px]">
              {Array.from({ length: 24 }).map((_, idx) => {
                const item = inventory[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => item && setSelectedItem(item)}
                    onDoubleClick={() => item && !isCombatMode && item.isIdentified !== false && equipItem(item)}
                    className={`aspect-square rounded border flex items-center justify-center p-1 cursor-pointer transition relative group ${
                      item
                        ? getRarityColor(item.rarity, item.isIdentified)
                        : 'border-iron-800/80 bg-iron-950/40 hover:border-iron-700'
                    } ${selectedItem?.id === item?.id ? 'ring-2 ring-brass-400' : ''}`}
                  >
                    {item && (
                      <>
                        {item.isIdentified === false ? (
                          <HelpCircle className="w-5 h-5 text-red-500 animate-pulse" />
                        ) : (
                          <span className="text-xs font-bold text-center truncate pointer-events-none">
                            {item.name.substring(0, 3)}
                          </span>
                        )}
                        {item.sockets && item.sockets > 0 && (
                          <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                            {Array.from({ length: item.sockets }).map((_, sIdx) => (
                              <div
                                key={sIdx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.socketedRunes && item.socketedRunes[sIdx]
                                    ? 'bg-purple-400'
                                    : 'bg-iron-700 border border-iron-500'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* D2 Style Item Details Tooltip */}
          {selectedItem ? (
            <div className="bg-iron-900 border border-iron-700 rounded p-3 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className={`font-bold font-cinzel text-sm ${
                    selectedItem.isIdentified === false ? 'text-red-400' :
                    selectedItem.rarity === 'runeword' ? 'text-amber-400 font-black' :
                    selectedItem.rarity === 'unique' ? 'text-orange-400' :
                    selectedItem.rarity === 'rare' ? 'text-yellow-400' :
                    selectedItem.rarity === 'magic' ? 'text-blue-400' : 'text-gray-200'
                  }`}>
                    {selectedItem.name}
                  </div>
                  {selectedItem.baseItemName && (
                    <div className="text-[10px] text-gray-400">
                      베이스: {selectedItem.baseItemName}
                    </div>
                  )}
                </div>

                {/* Actions: Equip or Identify */}
                <div>
                  {selectedItem.isIdentified === false ? (
                    <button
                      onClick={() => identifyItem(selectedItem.id)}
                      className="px-2.5 py-1 bg-blood-800 hover:bg-blood-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      식별하기
                    </button>
                  ) : isCombatMode ? (
                    <button
                      disabled
                      className="px-2.5 py-1 bg-iron-800 text-gray-500 rounded border border-iron-700 cursor-not-allowed text-xs flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-blood-500" />
                      전투 중 변경 불가
                    </button>
                  ) : (
                    inventory.some(i => i.id === selectedItem.id) && selectedItem.slot !== 'rune' && selectedItem.slot !== 'gem' && selectedItem.slot !== 'material' && selectedItem.slot !== 'consumable' && (
                      <button
                        onClick={() => equipItem(selectedItem)}
                        className="px-3 py-1 bg-brass-600 hover:bg-brass-500 text-iron-950 font-bold rounded transition text-xs shadow"
                      >
                        장착하기
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Socket Display */}
              {selectedItem.sockets && selectedItem.sockets > 0 && (
                <div className="flex items-center gap-1.5 p-1.5 bg-iron-950 rounded border border-iron-800 font-mono text-[11px]">
                  <span className="text-gray-400">소켓 ({selectedItem.socketedRunes?.length || 0}/{selectedItem.sockets}):</span>
                  <div className="flex gap-1">
                    {Array.from({ length: selectedItem.sockets }).map((_, sIdx) => {
                      const rune = selectedItem.socketedRunes && selectedItem.socketedRunes[sIdx];
                      return (
                        <span
                          key={sIdx}
                          className={`px-1.5 py-0.5 rounded border text-[10px] ${
                            rune
                              ? 'bg-purple-950 text-purple-300 border-purple-700 font-bold'
                              : 'bg-iron-900 text-gray-600 border-iron-800 border-dashed'
                          }`}
                        >
                          {rune ? rune : '빈 소켓'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats and Special Effects */}
              <div className="bg-iron-950/80 p-2.5 rounded border border-iron-800 font-mono text-[11px] space-y-1">
                {selectedItem.stats.minDmg && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">한손 대미지:</span>
                    <span className="text-brass-300 font-bold">
                      {selectedItem.stats.minDmg} ~ {selectedItem.stats.maxDmg}
                    </span>
                  </div>
                )}
                {selectedItem.stats.defense && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">방어력:</span>
                    <span className="text-blue-300 font-bold">+{selectedItem.stats.defense}</span>
                  </div>
                )}
                {selectedItem.subAffixes && selectedItem.subAffixes.map(affix => (
                  <div key={affix.id} className="text-blue-300">
                    ✦ {affix.label}
                  </div>
                ))}
                {selectedItem.specialEffect && (
                  <div className="pt-1 border-t border-iron-800 text-amber-300 font-bold">
                    ★ {selectedItem.specialEffect}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 italic">
                "{selectedItem.description}"
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-xs bg-iron-900/40 rounded border border-iron-800/60">
              아이템을 클릭하면 상세 소켓 및 능력치를 확인할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EquipSlotBoxProps {
  slot: EquipSlot;
  label: string;
  item?: GameItem;
  onClick: () => void;
  onUnequip: () => void;
  isCombatMode: boolean;
}

const EquipSlotBox: React.FC<EquipSlotBoxProps> = ({ label, item, onClick, onUnequip, isCombatMode }) => {
  return (
    <div
      onClick={onClick}
      className={`relative h-16 rounded border flex flex-col items-center justify-center cursor-pointer transition p-1 ${
        item
          ? item.rarity === 'runeword' ? 'border-amber-400 bg-amber-950/40' :
            item.rarity === 'unique' ? 'border-orange-500 bg-orange-950/30' :
            item.rarity === 'rare' ? 'border-yellow-500 bg-yellow-950/30' :
            item.rarity === 'magic' ? 'border-blue-500 bg-blue-950/30' : 'border-gray-600 bg-iron-900'
          : 'border-dashed border-iron-700 bg-iron-950/50 hover:border-iron-600'
      }`}
    >
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
      {item ? (
        <>
          <span className="text-[11px] font-bold text-center truncate max-w-full px-1">
            {item.name}
          </span>
          {item.socketedRunes && item.socketedRunes.length > 0 && (
            <span className="text-[9px] text-purple-300 font-mono">
              [{item.socketedRunes.join('+')}]
            </span>
          )}
          {!isCombatMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip();
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blood-900 hover:bg-blood-700 text-white rounded-full text-[9px] flex items-center justify-center border border-blood-600"
              title="해제"
            >
              ×
            </button>
          )}
        </>
      ) : (
        <span className="text-[9px] text-iron-600">비어있음</span>
      )}
    </div>
  );
};
