import React from 'react';
import { Sparkles, Shield, Sword, Lock, Unlock, Package, ArrowLeftRight, Download, Upload } from 'lucide-react';
import { GameItem } from '../../../types/game';
import { SET_DEFINITIONS } from '../../../data/setItems';

export interface ItemDetailCardProps {
  item: GameItem;
  comparedItem?: GameItem | null;
  getRarityBadge?: (rarity: GameItem['rarity']) => React.ReactNode;
  onToggleLock?: (itemId: string) => void;
  onDeposit?: (itemId: string) => void;
  onWithdraw?: (itemId: string) => void;
  onSell?: (item: GameItem) => void;
  onEquip?: (item: GameItem) => void;
  sellPrice?: number;
  isInStash?: boolean;
  isCombatMode?: boolean;
}

const defaultGetRarityBadge = (rarity: GameItem['rarity']) => {
  switch (rarity) {
    case 'legendary': return <span className="bg-rose-950/90 text-rose-300 border border-rose-500/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">Legendary</span>;
    case 'unique': return <span className="bg-orange-950/90 text-orange-300 border border-orange-500/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">Unique</span>;
    case 'set': return <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">Set</span>;
    case 'runeword': return <span className="bg-amber-950/90 text-amber-300 border border-amber-400/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">RuneWord</span>;
    case 'rare': return <span className="bg-yellow-950/90 text-yellow-300 border border-yellow-500/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">Rare</span>;
    case 'magic': return <span className="bg-blue-950/90 text-blue-300 border border-blue-500/80 px-1 py-0.2 rounded text-[8px] font-black uppercase">Magic</span>;
    default: return <span className="bg-iron-900 text-gray-400 border border-iron-700 px-1 py-0.2 rounded text-[8px] font-mono uppercase">Normal</span>;
  }
};

const SLOT_LABEL: Record<string, string> = {
  weapon: '무기',
  armor: '갑옷',
  shield: '방패',
  helm: '투구',
  gloves: '장갑',
  boots: '신발',
  ring: '반지',
  ring1: '반지 1',
  ring2: '반지 2',
  amulet: '목걸이'
};

const AFFIX_DEFINITIONS = [
  { key: 'attackSpeed', label: '공속', unit: '%', colorClass: 'text-cyan-300' },
  { key: 'critChance', label: '치명타율', unit: '%', colorClass: 'text-rose-300' },
  { key: 'critDamage', label: '치명타피해', unit: '%', colorClass: 'text-rose-400' },
  { key: 'hp', label: '생명력', unit: '', colorClass: 'text-red-300' },
  { key: 'str', label: '힘(STR)', unit: '', colorClass: 'text-red-200' },
  { key: 'dex', label: '민첩(DEX)', unit: '', colorClass: 'text-emerald-200' },
  { key: 'con', label: '체력(CON)', unit: '', colorClass: 'text-yellow-200' },
  { key: 'evasion', label: '회피율', unit: '%', colorClass: 'text-teal-200' },
  { key: 'lifeSteal', label: '생명흡수', unit: '%', colorClass: 'text-red-400' },
  { key: 'overkillEfficiency', label: '오버킬', unit: '%', colorClass: 'text-orange-300' },
  { key: 'damageReduction', label: '피해감소', unit: '%', colorClass: 'text-purple-300' },
  { key: 'allResist', label: '모든저항', unit: '%', colorClass: 'text-indigo-300' },
  { key: 'allSkills', label: '스킬레벨', unit: 'Lv', colorClass: 'text-amber-300' },
  { key: 'fortune', label: 'MF찬스', unit: '%', colorClass: 'text-teal-300' },
  { key: 'goldFind', label: '골드획득', unit: '%', colorClass: 'text-yellow-300' },
  { key: 'turnRageRegen', label: '분노회복', unit: '', colorClass: 'text-amber-200' }
] as const;

export const ItemDetailCard: React.FC<ItemDetailCardProps> = React.memo(({
  item,
  comparedItem,
  getRarityBadge = defaultGetRarityBadge,
  onToggleLock,
  onDeposit,
  onWithdraw,
  onSell,
  onEquip,
  sellPrice,
  isInStash = false,
  isCombatMode = false
}) => {
  const isLocked = Boolean(item.isLocked);
  const slotText = SLOT_LABEL[item.slot] || item.slot;

  const isWeapon = item.slot === 'weapon';
  const isArmor = ['armor', 'shield', 'helm', 'gloves', 'boots'].includes(item.slot);

  const currentMinDmg = item.stats.minDmg || 0;
  const currentMaxDmg = item.stats.maxDmg || 0;
  const currentAvgDmg = Math.round((currentMinDmg + currentMaxDmg) / 2);
  const currentDef = item.stats.defense || 0;

  const compMinDmg = comparedItem?.stats.minDmg || 0;
  const compMaxDmg = comparedItem?.stats.maxDmg || 0;
  const compAvgDmg = Math.round((compMinDmg + compMaxDmg) / 2);
  const compDef = comparedItem?.stats.defense || 0;

  const diffAvgDmg = comparedItem ? currentAvgDmg - compAvgDmg : 0;
  const diffDef = comparedItem ? currentDef - compDef : 0;

  return (
    <div className="bg-iron-950/95 p-2 rounded-lg border border-brass-600/70 shadow-xl space-y-1.5 font-sans select-none text-gray-200 text-xs">
      
      {/* 1. Header: Name & Badges & Action Icons */}
      <div className="flex items-center justify-between gap-1.5 border-b border-iron-800 pb-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap leading-tight">
            <span
              className="font-cinzel font-black text-xs sm:text-sm tracking-wide truncate"
              style={{
                color:
                  item.rarity === 'runeword' ? '#fcd34d' :
                  item.rarity === 'set' ? '#34d399' :
                  item.rarity === 'unique' || item.rarity === 'legendary' ? '#fb923c' :
                  item.rarity === 'rare' ? '#facc15' :
                  item.rarity === 'magic' ? '#60a5fa' : '#e5e7eb'
              }}
            >
              {item.name}
            </span>
            {isLocked && (
              <span className="text-amber-400 text-[8px] bg-amber-950/90 px-1 py-0.2 rounded border border-amber-400 flex items-center font-mono font-bold">
                <Lock className="w-2 h-2 mr-0.5" /> 잠금
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono mt-0.5 flex-wrap">
            {getRarityBadge(item.rarity)}
            <span className="bg-iron-900 px-1 py-0.2 rounded border border-iron-750 text-gray-300 font-bold">{slotText}</span>
            {item.requiredLevel ? <span className="bg-orange-950/60 px-1 py-0.2 rounded border border-orange-700/70 text-orange-300">Lv.{item.requiredLevel}</span> : null}
            {item.sockets ? <span className="bg-purple-950/60 px-1 py-0.2 rounded border border-purple-700/70 text-purple-300">{item.socketedRunes?.length || 0}/{item.sockets}소켓</span> : null}
            {comparedItem && (
              <span className="text-[9px] text-amber-400 font-bold truncate max-w-[140px]">
                vs [{comparedItem.name}]
              </span>
            )}
          </div>
        </div>

        {/* Mini Action Toolbar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleLock && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock(item.id); }}
              className={`w-6 h-6 rounded flex items-center justify-center transition border cursor-pointer ${
                isLocked ? 'bg-amber-950 text-amber-300 border-amber-400' : 'bg-iron-900 text-gray-400 border-iron-750 hover:text-white'
              }`}
              title="잠금/해제"
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          )}

          {!isInStash && onDeposit && item.slot !== 'rune' && item.slot !== 'consumable' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeposit(item.id); }}
              className="w-6 h-6 rounded bg-iron-900 text-gray-300 border border-iron-750 hover:border-indigo-400 flex items-center justify-center cursor-pointer"
              title="보관함에 넣기"
            >
              <Download className="w-3 h-3 text-indigo-400" />
            </button>
          )}

          {isInStash && onWithdraw && (
            <button
              onClick={(e) => { e.stopPropagation(); onWithdraw(item.id); }}
              className="w-6 h-6 rounded bg-indigo-900 text-indigo-100 border border-indigo-400 flex items-center justify-center cursor-pointer"
              title="가방으로 꺼내기"
            >
              <Upload className="w-3 h-3" />
            </button>
          )}

          {!isInStash && onSell && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!isLocked) onSell(item); }}
              disabled={isLocked}
              className={`h-6 px-1.5 rounded text-[9px] font-bold font-mono transition border cursor-pointer ${
                isLocked ? 'bg-iron-900 text-gray-600 border-iron-800 opacity-50' : 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900'
              }`}
            >
              판매(+{(sellPrice ?? item.value ?? 5).toLocaleString()}G)
            </button>
          )}
        </div>
      </div>

      {/* 2. Core Damage / Defense with Integrated Diff Indicator */}
      {isWeapon && (
        <div className="px-2 py-1 rounded bg-iron-900 border border-amber-500/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-300 font-bold font-mono">기본 공격력:</span>
            <span className="text-sm font-cinzel font-black text-amber-100">{currentMinDmg} ~ {currentMaxDmg}</span>
          </div>
          {comparedItem && diffAvgDmg !== 0 && (
            <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded border ${
              diffAvgDmg > 0 ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-rose-950 text-rose-300 border-rose-500'
            }`}>
              {diffAvgDmg > 0 ? `▲ +${diffAvgDmg}` : `▼ ${diffAvgDmg}`}
            </span>
          )}
        </div>
      )}

      {isArmor && currentDef > 0 && (
        <div className="px-2 py-1 rounded bg-iron-900 border border-blue-500/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-blue-300 font-bold font-mono">기본 방어력:</span>
            <span className="text-sm font-cinzel font-black text-blue-100">+{currentDef}</span>
          </div>
          {comparedItem && diffDef !== 0 && (
            <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded border ${
              diffDef > 0 ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-rose-950 text-rose-300 border-rose-500'
            }`}>
              {diffDef > 0 ? `▲ +${diffDef}` : `▼ ${diffDef}`}
            </span>
          )}
        </div>
      )}

      {/* 3. Affixes 2-Column Compact Grid with In-line Diff Badges */}
      <div className="grid grid-cols-2 gap-1 bg-iron-900/80 p-1.5 rounded border border-iron-800 text-[10px] font-mono">
        {AFFIX_DEFINITIONS.map(affix => {
          const val = item.stats[affix.key as keyof GameItem['stats']];
          if (val === undefined || val === null || val === 0) return null;

          const compVal = comparedItem ? (comparedItem.stats[affix.key as keyof GameItem['stats']] || 0) : 0;
          const diff = comparedItem ? (Number(val) - Number(compVal)) : 0;

          return (
            <div key={affix.key} className="flex items-center justify-between bg-iron-950/60 px-1.5 py-0.5 rounded border border-iron-850">
              <span className={`${affix.colorClass} truncate`}>
                • {affix.label} <strong className="text-white">+{val}{affix.unit}</strong>
              </span>
              {comparedItem && diff !== 0 && (
                <span className={`text-[9px] font-bold ml-1 ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {diff > 0 ? `▲+${diff}` : `▼${diff}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Special Effects / RuneWord / Set Compact Row */}
      {item.specialEffect && (
        <div className="p-1.5 bg-amber-950/40 rounded border border-amber-500/60 text-[10px] text-amber-200 font-mono leading-tight">
          <span className="font-bold text-amber-400">✨ 특수 효과: </span>
          <span>{item.specialEffect}</span>
        </div>
      )}

      {item.socketedRunes && item.socketedRunes.length > 0 && (
        <div className="p-1 bg-purple-950/40 rounded border border-purple-600/60 text-[9px] text-purple-200 font-mono flex items-center justify-between">
          <span>각인된 룬: [{item.socketedRunes.join(' + ')}]</span>
          {item.isRuneWord && <span className="text-amber-300 font-black">❖ 룬워드 완성</span>}
        </div>
      )}

      {item.setName && SET_DEFINITIONS[item.setName] && (
        <div className="p-1 bg-emerald-950/40 rounded border border-emerald-600/60 text-[9px] text-emerald-300 font-mono truncate">
          🌿 세트: {item.setName} ({SET_DEFINITIONS[item.setName].totalPieces}부위)
        </div>
      )}

      {/* 5. Integrated One-Touch Equip Action Button */}
      {onEquip && !isCombatMode && !isInStash && (
        <button
          onClick={() => onEquip(item)}
          className="w-full py-2 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-iron-950 shadow-md border border-amber-300 ring-1 ring-amber-400 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition mt-1"
        >
          <Sword className="w-3.5 h-3.5 fill-iron-950" />
          <span>[⚔️ 이 장비로 {comparedItem ? '교체하기' : '장착하기'}]</span>
        </button>
      )}
    </div>
  );
});

ItemDetailCard.displayName = 'ItemDetailCard';


