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
  sellPrice?: number;
  isInStash?: boolean;
  compact?: boolean;
}

const defaultGetRarityBadge = (rarity: GameItem['rarity']) => {
  switch (rarity) {
    case 'legendary': return <span className="bg-rose-950/90 text-rose-300 border border-rose-500/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">Legendary</span>;
    case 'unique': return <span className="bg-orange-950/90 text-orange-300 border border-orange-500/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">Unique</span>;
    case 'set': return <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">Set</span>;
    case 'runeword': return <span className="bg-amber-950/90 text-amber-300 border border-amber-400/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">RuneWord</span>;
    case 'rare': return <span className="bg-yellow-950/90 text-yellow-300 border border-yellow-500/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">Rare</span>;
    case 'magic': return <span className="bg-blue-950/90 text-blue-300 border border-blue-500/80 px-1.5 py-0.2 rounded text-[9px] font-black uppercase shadow">Magic</span>;
    default: return <span className="bg-iron-900 text-gray-400 border border-iron-700 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase">Normal</span>;
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

interface AffixDefinition {
  key: keyof GameItem['stats'];
  label: string;
  unit: string;
  icon?: string;
  isPercent?: boolean;
  colorClass: string;
}

const AFFIX_DEFINITIONS: AffixDefinition[] = [
  { key: 'attackSpeed', label: '공격 속도', unit: '%', icon: '⚡', isPercent: true, colorClass: 'text-cyan-300' },
  { key: 'critChance', label: '치명타 확률', unit: '%', icon: '🎯', isPercent: true, colorClass: 'text-rose-300' },
  { key: 'critDamage', label: '치명타 피해', unit: '%', icon: '💥', isPercent: true, colorClass: 'text-rose-400' },
  { key: 'hp', label: '생명력 (HP)', unit: '', icon: '❤️', colorClass: 'text-red-300' },
  { key: 'str', label: '힘 (STR)', unit: '', icon: '💪', colorClass: 'text-red-200' },
  { key: 'dex', label: '민첩 (DEX)', unit: '', icon: '⚡', colorClass: 'text-emerald-200' },
  { key: 'con', label: '체력 (CON)', unit: '', icon: '🛡️', colorClass: 'text-yellow-200' },
  { key: 'evasion', label: '회피율', unit: '%', icon: '💨', isPercent: true, colorClass: 'text-teal-200' },
  { key: 'lifeSteal', label: '생명력 흡수', unit: '%', icon: '🩸', isPercent: true, colorClass: 'text-red-400' },
  { key: 'overkillEfficiency', label: '오버킬 효율', unit: '%', icon: '🔥', isPercent: true, colorClass: 'text-orange-300' },
  { key: 'damageReduction', label: '피해 감소율', unit: '%', icon: '🛡️', isPercent: true, colorClass: 'text-purple-300' },
  { key: 'allResist', label: '모든 원소 저항', unit: '%', icon: '🔮', isPercent: true, colorClass: 'text-indigo-300' },
  { key: 'allSkills', label: '모든 스킬 레벨', unit: '', icon: '👑', colorClass: 'text-amber-300' },
  { key: 'fortune', label: '매직 아이템 발견 (MF)', unit: '%', icon: '✨', isPercent: true, colorClass: 'text-teal-300' },
  { key: 'goldFind', label: '골드 획득량', unit: '%', icon: '💰', isPercent: true, colorClass: 'text-yellow-300' },
  { key: 'turnRageRegen', label: '턴당 분노 회복', unit: '', icon: '⚡', colorClass: 'text-amber-200' },
  { key: 'rageCostReduction', label: '분노 소모 감소', unit: '%', icon: '🔥', isPercent: true, colorClass: 'text-orange-200' }
];

export const ItemDetailCard: React.FC<ItemDetailCardProps> = React.memo(({
  item,
  comparedItem,
  getRarityBadge = defaultGetRarityBadge,
  onToggleLock,
  onDeposit,
  onWithdraw,
  onSell,
  sellPrice,
  isInStash = false,
  compact = false
}) => {
  const isLocked = Boolean(item.isLocked);
  const slotText = SLOT_LABEL[item.slot] || item.slot;

  // Primary Stat Calculations
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
    <div className="bg-iron-950/95 p-3 rounded-xl border border-brass-600/60 shadow-2xl space-y-2.5 font-sans select-none text-gray-200">
      
      {/* 1. Header: Item Name, Badges & Mini Action Toolbar */}
      <div className="flex items-start justify-between gap-2 border-b border-iron-800 pb-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="font-cinzel font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5 truncate"
              style={{
                color:
                  item.rarity === 'runeword'
                    ? '#fcd34d'
                    : item.rarity === 'set'
                    ? '#34d399'
                    : item.rarity === 'unique' || item.rarity === 'legendary'
                    ? '#fb923c'
                    : item.rarity === 'rare'
                    ? '#facc15'
                    : item.rarity === 'magic'
                    ? '#60a5fa'
                    : '#e5e7eb'
              }}
            >
              <span>{item.name}</span>
            </span>

            {isLocked && (
              <span className="text-amber-400 text-[10px] bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-400 flex items-center gap-0.5 font-mono font-bold shadow">
                <Lock className="w-2.5 h-2.5 text-amber-400" /> 잠금
              </span>
            )}
          </div>

          {/* Clean Property Badges Row */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono flex-wrap">
            {getRarityBadge(item.rarity)}
            <span className="text-gray-300 font-bold bg-iron-900 px-1.5 py-0.2 rounded border border-iron-750">
              {slotText}
            </span>
            {item.requiredLevel ? (
              <span className="text-orange-300 font-bold bg-orange-950/70 px-1.5 py-0.2 rounded border border-orange-700/80">
                Lv.{item.requiredLevel} 요구
              </span>
            ) : null}
            {item.setName && (
              <span className="text-emerald-300 font-bold bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-600/80">
                세트: {item.setName}
              </span>
            )}
            <span className="uppercase text-amber-400/90 font-bold bg-iron-900 px-1 py-0.2 rounded border border-iron-800">
              {item.tier || 'NORMAL'}
            </span>
            {item.sockets ? (
              <span className="text-purple-300 font-bold bg-purple-950/70 px-1.5 py-0.2 rounded border border-purple-700/80">
                {item.socketedRunes?.length || 0}/{item.sockets} 소켓
              </span>
            ) : null}
          </div>
        </div>

        {/* Mini Action Toolbar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(item.id);
              }}
              className={`w-7 h-7 rounded flex items-center justify-center transition cursor-pointer border shadow ${
                isLocked
                  ? 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                  : 'bg-iron-900 text-gray-400 border-iron-750 hover:text-white hover:border-gray-500'
              }`}
              title={isLocked ? "잠금 해제 [L]" : "아이템 잠금 [L]"}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          )}

          {isInStash && onWithdraw && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw(item.id);
              }}
              className="w-7 h-7 rounded bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-400 flex items-center justify-center shadow transition cursor-pointer"
              title="가방으로 꺼내기 [D]"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          )}

          {!isInStash && onDeposit && item.slot !== 'rune' && item.slot !== 'consumable' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeposit(item.id);
              }}
              className="w-7 h-7 rounded bg-iron-900 hover:bg-iron-800 text-gray-300 border border-iron-700 hover:border-indigo-400 flex items-center justify-center shadow transition cursor-pointer"
              title="보관함에 넣기 [D]"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}

          {!isInStash && onSell && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked) onSell(item);
              }}
              disabled={isLocked}
              className={`h-7 px-2 rounded text-[10px] font-bold font-mono transition flex items-center justify-center border shadow cursor-pointer ${
                isLocked
                  ? 'bg-iron-900 text-gray-600 border-iron-800 cursor-not-allowed opacity-50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900 hover:border-amber-400'
              }`}
              title={isLocked ? "잠금된 아이템은 판매 불가" : `상점에 판매 (+${(sellPrice ?? item.value ?? 5).toLocaleString()}G) [S]`}
            >
              판매 (+{(sellPrice ?? item.value ?? 5).toLocaleString()}G)
            </button>
          )}
        </div>
      </div>

      {/* 2. Large Primary Core Stat Plate */}
      {isWeapon && (
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-950/60 via-iron-900 to-amber-950/60 border border-amber-500/60 shadow flex items-center justify-between">
          <div>
            <div className="text-[10px] text-amber-400/90 font-mono font-bold flex items-center gap-1">
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              <span>기본 물리 피해량 (Damage)</span>
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-black text-amber-200 tracking-wider">
              {currentMinDmg} ~ {currentMaxDmg}
            </div>
          </div>

          {comparedItem && diffAvgDmg !== 0 && (
            <div className={`text-right font-mono font-bold text-xs px-2 py-1 rounded border ${
              diffAvgDmg > 0
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/80'
            }`}>
              <div>{diffAvgDmg > 0 ? `▲ +${diffAvgDmg}` : `▼ ${diffAvgDmg}`}</div>
              <div className="text-[8px] opacity-80">평균 피해</div>
            </div>
          )}
        </div>
      )}

      {isArmor && currentDef > 0 && (
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-950/60 via-iron-900 to-blue-950/60 border border-blue-500/60 shadow flex items-center justify-between">
          <div>
            <div className="text-[10px] text-blue-400/90 font-mono font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>기본 방어력 (Defense)</span>
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-black text-blue-200 tracking-wider">
              +{currentDef}
            </div>
          </div>

          {comparedItem && diffDef !== 0 && (
            <div className={`text-right font-mono font-bold text-xs px-2 py-1 rounded border ${
              diffDef > 0
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/80'
            }`}>
              <div>{diffDef > 0 ? `▲ +${diffDef}` : `▼ ${diffDef}`}</div>
              <div className="text-[8px] opacity-80">방어력</div>
            </div>
          )}
        </div>
      )}

      {/* 3. Clean Vertical Bullet Affix List */}
      <div className="space-y-1 bg-iron-900/90 p-2.5 rounded-lg border border-iron-800 text-xs font-mono">
        <div className="text-[10px] font-cinzel font-bold text-gray-400 border-b border-iron-800 pb-1 flex items-center justify-between">
          <span>마법 속성 및 보너스 (Affixes)</span>
          {comparedItem && <span className="text-[9px] text-amber-400">vs 착용 장비 비교</span>}
        </div>

        <div className="space-y-1 pt-0.5">
          {AFFIX_DEFINITIONS.map(affix => {
            const val = item.stats[affix.key];
            if (val === undefined || val === null || val === 0) return null;

            const compVal = comparedItem ? (comparedItem.stats[affix.key] || 0) : 0;
            const diff = comparedItem ? (Number(val) - Number(compVal)) : 0;

            return (
              <div key={affix.key} className="flex items-center justify-between py-0.5 hover:bg-iron-850/60 px-1 rounded transition">
                <div className={`flex items-center gap-1.5 ${affix.colorClass}`}>
                  <span className="text-gray-500">•</span>
                  <span>{affix.label}</span>
                  <strong className="font-black">+{val}{affix.unit}</strong>
                </div>

                {comparedItem && diff !== 0 && (
                  <span className={`text-[10px] font-bold px-1 rounded ${
                    diff > 0
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-600/70'
                      : 'text-rose-400 bg-rose-950/80 border border-rose-700/70'
                  }`}>
                    {diff > 0 ? `+${diff}${affix.unit}` : `${diff}${affix.unit}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Special Effects & Unique Affixes (Highlighted Embossed Gold Box) */}
      {item.specialEffect && (
        <div className="p-2.5 bg-gradient-to-r from-amber-950/70 via-iron-900 to-amber-950/70 rounded-lg border-2 border-amber-500/80 text-xs text-amber-200 space-y-1 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <div className="font-cinzel font-black text-amber-400 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>고유 특수 효과 (Special Effect)</span>
          </div>
          <p className="leading-relaxed font-mono text-[11px] text-amber-100">{item.specialEffect}</p>
        </div>
      )}

      {/* 5. Socketed Runes Details */}
      {item.socketedRunes && item.socketedRunes.length > 0 && (
        <div className="p-2 bg-gradient-to-r from-purple-950/80 via-iron-900 to-amber-950/80 rounded-lg border border-purple-500/70 text-xs space-y-1 shadow">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>각인된 룬: [{item.socketedRunes.join(' + ')}]</span>
            </div>
            {item.isRuneWord && (
              <span className="text-amber-300 font-black px-1.5 py-0.2 rounded bg-amber-950 border border-amber-400 font-mono text-[10px] animate-pulse">
                ❖ [{item.runeWordName || item.name}] 룬워드 완성
              </span>
            )}
          </div>
        </div>
      )}

      {/* 6. Set Items & Bonuses Section */}
      {item.setName && SET_DEFINITIONS[item.setName] && (
        <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-600/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-emerald-800/80 pb-1 text-[11px]">
            <span>🌿 [{item.setName}] 세트 구성품</span>
            <span className="text-[10px] text-emerald-400/80">({SET_DEFINITIONS[item.setName].totalPieces}부위)</span>
          </div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {SET_DEFINITIONS[item.setName].pieceNames.map((pName, pIdx) => {
              const isEquippedPiece = pName === item.name;
              return (
                <div key={pIdx} className={isEquippedPiece ? 'text-emerald-300 font-bold' : 'text-gray-500'}>
                  • {pName} {isEquippedPiece && '✓ (장착중)'}
                </div>
              );
            })}
          </div>
          <div className="border-t border-emerald-800/80 pt-1 space-y-0.5 text-[10px] font-mono">
            {SET_DEFINITIONS[item.setName].bonuses.map((b, bIdx) => (
              <div key={bIdx} className="text-emerald-200">
                ({b.piecesRequired}세트) {b.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Description & Flavor Text (Subtle at Bottom) */}
      {item.description && (
        <div className="text-[10px] text-gray-500 italic bg-iron-950/40 p-1.5 rounded border border-iron-850 leading-relaxed font-mono">
          "{item.description}"
        </div>
      )}
    </div>
  );
});

ItemDetailCard.displayName = 'ItemDetailCard';
