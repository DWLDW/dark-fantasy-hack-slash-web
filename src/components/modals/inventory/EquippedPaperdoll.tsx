import React, { useMemo } from 'react';
import { EquipSlot, GameItem } from '../../../types/game';
import { Sword, Sparkles, Shield, Flame } from 'lucide-react';

export interface EquipSlotBoxProps {
  slot: EquipSlot;
  label: string;
  item?: GameItem;
  isSelected: boolean;
  onClick: () => void;
  onUnequip: () => void;
  isCombatMode: boolean;
}

export const EquipSlotBox: React.FC<EquipSlotBoxProps> = ({
  label,
  item,
  isSelected,
  onClick,
  onUnequip,
  isCombatMode
}) => {
  const statBadge = useMemo(() => {
    if (!item) return null;
    if (item.slot === 'weapon') {
      return (
        <span className="text-[9px] font-mono font-black text-amber-300 bg-iron-950/90 px-1 rounded border border-amber-500/40">
          ⚔️ {item.stats.minDmg || 0}~{item.stats.maxDmg || 0}
        </span>
      );
    }
    if (item.slot === 'armor' || item.slot === 'shield' || item.slot === 'helm') {
      return (
        <span className="text-[9px] font-mono font-black text-blue-300 bg-iron-950/90 px-1 rounded border border-blue-500/40">
          🛡️ +{item.stats.defense || 0}
        </span>
      );
    }
    if (item.slot === 'gloves' || item.slot === 'boots') {
      return (
        <span className="text-[9px] font-mono font-black text-blue-300 bg-iron-950/90 px-1 rounded border border-blue-500/40">
          🛡️ +{item.stats.defense || 0}
        </span>
      );
    }
    if (item.stats.allResist) {
      return <span className="text-[9px] font-mono font-black text-purple-300 bg-iron-950/90 px-1 rounded border border-purple-500/40">🔮 +{item.stats.allResist}%</span>;
    }
    if (item.stats.fortune) {
      return <span className="text-[9px] font-mono font-black text-teal-300 bg-iron-950/90 px-1 rounded border border-teal-500/40">✨ +{item.stats.fortune}%</span>;
    }
    if (item.stats.str || item.stats.dex) {
      return <span className="text-[9px] font-mono font-black text-red-300 bg-iron-950/90 px-1 rounded border border-red-500/40">+{item.stats.str || item.stats.dex} 스탯</span>;
    }
    return null;
  }, [item]);

  return (
    <div
      onClick={onClick}
      onDoubleClick={() => !isCombatMode && item && onUnequip()}
      className={`p-1.5 rounded-lg border-2 text-center cursor-pointer transition min-h-[72px] flex flex-col justify-between items-center relative shadow ${
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
      <div className="w-full flex items-center justify-between">
        <span className={`text-[10px] font-mono font-bold leading-none ${isSelected ? 'text-brass-300 underline' : 'text-gray-400'}`}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          {item?.isLocked && (
            <span className="text-[9px]" title="잠금된 장비">🔒</span>
          )}
          {item?.isRuneWord && (
            <span className="text-[8px] font-mono text-amber-300 font-black px-1 rounded bg-amber-950/80 border border-amber-500/50">RW</span>
          )}
          {item && !isCombatMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip();
              }}
              className="text-[8px] px-1 py-0.2 rounded bg-blood-950 text-blood-300 hover:bg-blood-900 border border-blood-700 cursor-pointer active:scale-90"
              title="장착 해제"
            >
              해제
            </button>
          )}
        </div>
      </div>

      {item ? (
        <div className="font-black text-[11px] truncate w-full leading-tight my-0.5" title={item.name}>
          {item.name}
        </div>
      ) : (
        <div className="text-[10px] text-gray-600 font-mono my-auto">[빈 슬롯]</div>
      )}

      <div className="w-full flex items-center justify-center">
        {statBadge}
      </div>
    </div>
  );
};

export interface EquippedPaperdollProps {
  equipment: Record<string, GameItem>;
  selectedSlot: EquipSlot | 'all';
  isCombatMode: boolean;
  onSelectSlot: (slot: EquipSlot | 'all', item: GameItem | null) => void;
  onUnequipSlot: (slot: EquipSlot) => void;
  onOpenRuneVault: () => void;
}

export const EquippedPaperdoll: React.FC<EquippedPaperdollProps> = React.memo(({
  equipment,
  selectedSlot,
  isCombatMode,
  onSelectSlot,
  onUnequipSlot,
  onOpenRuneVault
}) => {
  // Aggregate Equipped Total Combat Stats
  const equippedSummary = useMemo(() => {
    let totalDefense = 0;
    let minDmg = 0;
    let maxDmg = 0;

    Object.values(equipment).forEach(item => {
      if (!item) return;
      if (item.stats.defense) totalDefense += item.stats.defense;
      if (item.slot === 'weapon') {
        minDmg = item.stats.minDmg || 0;
        maxDmg = item.stats.maxDmg || 0;
      }
    });

    return { totalDefense, minDmg, maxDmg };
  }, [equipment]);

  return (
    <div className="bg-iron-900/90 p-3 rounded-lg border-2 border-iron-750 flex flex-col justify-between shadow">
      <div>
        <div className="flex justify-between items-center mb-2 border-b border-iron-750 pb-1">
          <h3 className="font-cinzel font-bold text-gray-200 text-xs flex items-center gap-1">
            <Sword className="w-3.5 h-3.5 text-brass-400" />
            <span>착용 중인 장비 (3x3 슬롯)</span>
          </h3>
          <button
            onClick={() => onSelectSlot('all', null)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border transition ${
              selectedSlot === 'all'
                ? 'bg-brass-500 text-iron-950 border-brass-400'
                : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-white'
            }`}
          >
            전체 보기
          </button>
        </div>

        {/* Total Equipment Stats Indicator Banner */}
        <div className="mb-2 p-1.5 rounded bg-iron-950/90 border border-iron-750 flex items-center justify-around text-[11px] font-mono shadow">
          <div className="flex items-center gap-1 text-amber-300">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>무기: <strong>{equippedSummary.minDmg}~{equippedSummary.maxDmg}</strong></span>
          </div>
          <div className="w-[1px] h-3.5 bg-iron-750" />
          <div className="flex items-center gap-1 text-blue-300">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>장비 방어력: <strong>+{equippedSummary.totalDefense}</strong></span>
          </div>
        </div>

        {/* 3x3 Paperdoll Grid: All 9 slots */}
        <div className="grid grid-cols-3 gap-2 max-w-[320px] mx-auto py-1">
          {/* Row 1 */}
          <EquipSlotBox
            slot="weapon"
            label="무기"
            item={equipment.weapon}
            isSelected={selectedSlot === 'weapon'}
            onClick={() => onSelectSlot('weapon', equipment.weapon || null)}
            onUnequip={() => onUnequipSlot('weapon')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="helm"
            label="투구"
            item={equipment.helm}
            isSelected={selectedSlot === 'helm'}
            onClick={() => onSelectSlot('helm', equipment.helm || null)}
            onUnequip={() => onUnequipSlot('helm')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="amulet"
            label="목걸이"
            item={equipment.amulet}
            isSelected={selectedSlot === 'amulet'}
            onClick={() => onSelectSlot('amulet', equipment.amulet || null)}
            onUnequip={() => onUnequipSlot('amulet')}
            isCombatMode={isCombatMode}
          />

          {/* Row 2 */}
          <EquipSlotBox
            slot="gloves"
            label="장갑"
            item={equipment.gloves}
            isSelected={selectedSlot === 'gloves'}
            onClick={() => onSelectSlot('gloves', equipment.gloves || null)}
            onUnequip={() => onUnequipSlot('gloves')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="armor"
            label="갑옷"
            item={equipment.armor}
            isSelected={selectedSlot === 'armor'}
            onClick={() => onSelectSlot('armor', equipment.armor || null)}
            onUnequip={() => onUnequipSlot('armor')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="shield"
            label="방패"
            item={equipment.shield}
            isSelected={selectedSlot === 'shield'}
            onClick={() => onSelectSlot('shield', equipment.shield || null)}
            onUnequip={() => onUnequipSlot('shield')}
            isCombatMode={isCombatMode}
          />

          {/* Row 3 */}
          <EquipSlotBox
            slot="ring1"
            label="반지 1"
            item={equipment.ring1}
            isSelected={selectedSlot === 'ring1'}
            onClick={() => onSelectSlot('ring1', equipment.ring1 || null)}
            onUnequip={() => onUnequipSlot('ring1')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="boots"
            label="신발"
            item={equipment.boots}
            isSelected={selectedSlot === 'boots'}
            onClick={() => onSelectSlot('boots', equipment.boots || null)}
            onUnequip={() => onUnequipSlot('boots')}
            isCombatMode={isCombatMode}
          />
          <EquipSlotBox
            slot="ring2"
            label="반지 2"
            item={equipment.ring2}
            isSelected={selectedSlot === 'ring2'}
            onClick={() => onSelectSlot('ring2', equipment.ring2 || null)}
            onUnequip={() => onUnequipSlot('ring2')}
            isCombatMode={isCombatMode}
          />
        </div>
      </div>

      <div className="text-center pt-2 border-t border-iron-750">
        <button
          onClick={onOpenRuneVault}
          className="w-full py-2 bg-iron-950 hover:bg-iron-800 border border-purple-600/70 text-purple-200 hover:text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>보유 룬 바둑판 보관함 열기</span>
        </button>
      </div>
    </div>
  );
});
EquippedPaperdoll.displayName = 'EquippedPaperdoll';
