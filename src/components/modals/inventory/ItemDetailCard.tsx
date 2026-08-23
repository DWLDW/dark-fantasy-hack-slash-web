import React from 'react';
import { Sparkles, Shield, Sword } from 'lucide-react';
import { GameItem } from '../../../types/game';
import { SET_DEFINITIONS } from '../../../data/setItems';

export interface ItemDetailCardProps {
  item: GameItem;
  getRarityBadge?: (rarity: GameItem['rarity']) => React.ReactNode;
}

const defaultGetRarityBadge = (rarity: GameItem['rarity']) => {
  switch (rarity) {
    case 'legendary': return <span className="bg-rose-950 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Legendary</span>;
    case 'unique': return <span className="bg-orange-950 text-orange-300 border border-orange-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Unique</span>;
    case 'set': return <span className="bg-emerald-950 text-emerald-300 border border-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Set</span>;
    case 'runeword': return <span className="bg-amber-950 text-amber-300 border border-amber-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">RuneWord</span>;
    case 'rare': return <span className="bg-yellow-950 text-yellow-300 border border-yellow-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Rare</span>;
    case 'magic': return <span className="bg-blue-950 text-blue-300 border border-blue-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Magic</span>;
    default: return <span className="bg-iron-850 text-gray-400 border border-iron-700 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase">Normal</span>;
  }
};

export const ItemDetailCard: React.FC<ItemDetailCardProps> = React.memo(({ item, getRarityBadge = defaultGetRarityBadge }) => {
  return (
    <div className="bg-iron-900/90 p-3 rounded-lg border-2 border-brass-500/80 shadow-lg space-y-2">
      {/* Header: Name, Slot, Tier & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-iron-750 pb-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brass-400 animate-pulse"></span>
            <span
              className="font-cinzel font-black text-sm sm:text-base tracking-wide"
              style={{
                color:
                  item.rarity === 'runeword'
                    ? '#fcd34d'
                    : item.rarity === 'set'
                    ? '#34d399'
                    : item.rarity === 'unique'
                    ? '#fb923c'
                    : item.rarity === 'rare'
                    ? '#facc15'
                    : item.rarity === 'magic'
                    ? '#60a5fa'
                    : '#e5e7eb'
              }}
            >
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 flex-wrap">
            {getRarityBadge(item.rarity)}
            {item.setName && (
              <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-600">
                세트: {item.setName}
              </span>
            )}
            {item.requiredLevel && (
              <span className="text-orange-300 font-bold bg-orange-950/80 px-1 py-0.2 rounded border border-orange-700">
                요구 레벨: Lv.{item.requiredLevel}
              </span>
            )}
            <span className="uppercase text-amber-400 font-bold bg-iron-950 px-1 py-0.2 rounded border border-iron-700">
              {item.tier || 'NORMAL'}
            </span>
            <span className="text-gray-300 font-mono">
              [{item.slot === 'weapon'
                ? '무기'
                : item.slot === 'armor'
                ? '갑옷'
                : item.slot === 'shield'
                ? '방패'
                : item.slot === 'helm'
                ? '투구'
                : item.slot === 'ring1' || item.slot === 'ring2' || item.slot === 'ring'
                ? '반지'
                : item.slot === 'amulet'
                ? '목걸이'
                : item.slot}]
            </span>
            {item.sockets ? (
              <span className="text-purple-300 font-bold bg-purple-950/80 px-1 rounded border border-purple-700">
                {item.socketedRunes?.length || 0}/{item.sockets} 소켓
              </span>
            ) : null}
            {item.isRuneWord && <span className="text-amber-300 font-black">[고대 룬워드]</span>}
          </div>
        </div>

        {/* Primary Core Stat Badge (Attack / Defense) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.slot === 'weapon' && (
            <div className="bg-iron-950 px-2.5 py-1 rounded border border-amber-500/70 shadow text-right">
              <div className="text-[9px] text-gray-400 font-mono">기본 공격력</div>
              <div className="text-sm sm:text-base font-cinzel font-black text-amber-300">
                ⚔️ {item.stats.minDmg || 0} ~ {item.stats.maxDmg || 0}
              </div>
            </div>
          )}
          {(item.slot === 'armor' || item.slot === 'shield' || item.slot === 'helm') && (
            <div className="bg-iron-950 px-2.5 py-1 rounded border border-blue-500/70 shadow text-right">
              <div className="text-[9px] text-gray-400 font-mono">기본 방어력</div>
              <div className="text-sm sm:text-base font-cinzel font-black text-blue-300">
                🛡️ +{item.stats.defense || 0}
              </div>
            </div>
          )}
        </div>
      </div>

            {/* Socketed Runes & RuneWord Details Banner */}
      {item.socketedRunes && item.socketedRunes.length > 0 && (
        <div className="p-2 bg-gradient-to-r from-purple-950/70 via-iron-900 to-amber-950/70 rounded border border-purple-500/70 text-[11px] space-y-1 shadow">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>각인된 룬: [{item.socketedRunes.join(' + ')}]</span>
            </div>
            {item.isRuneWord && (
              <span className="text-amber-300 font-black px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-400/70 font-mono animate-pulse">
                ❖ [{item.runeWordName || item.name}] 룬워드 발동!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Full Detailed Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
        {item.stats.minDmg !== undefined && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-amber-200">
            <span>⚔️ 최소 공격력</span>
            <strong>+{item.stats.minDmg}</strong>
          </div>
        )}
        {item.stats.maxDmg !== undefined && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-amber-200">
            <span>💥 최대 공격력</span>
            <strong>+{item.stats.maxDmg}</strong>
          </div>
        )}
        {item.stats.defense !== undefined && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-blue-200">
            <span>🛡️ 방어력</span>
            <strong>+{item.stats.defense}</strong>
          </div>
        )}
        {item.stats.str !== undefined && item.stats.str > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-red-200">
            <span>💪 힘 (STR)</span>
            <strong>+{item.stats.str}</strong>
          </div>
        )}
        {item.stats.dex !== undefined && item.stats.dex > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-emerald-200">
            <span>🏃 민첩 (DEX)</span>
            <strong>+{item.stats.dex}</strong>
          </div>
        )}
        {item.stats.con !== undefined && item.stats.con > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-rose-200">
            <span>🩸 체력 (CON)</span>
            <strong>+{item.stats.con}</strong>
          </div>
        )}
        {item.stats.critChance !== undefined && item.stats.critChance > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-yellow-300 font-bold">
            <span>🎯 치명타율</span>
            <strong>+{item.stats.critChance}%</strong>
          </div>
        )}
        {item.stats.critDamage !== undefined && item.stats.critDamage > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-yellow-300 font-bold">
            <span>⚡ 치명타 피해</span>
            <strong>+{item.stats.critDamage}%</strong>
          </div>
        )}
        {item.stats.overkillEfficiency !== undefined && item.stats.overkillEfficiency > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-orange-300 font-bold">
            <span>🌪️ 오버킬 전이</span>
            <strong>+{item.stats.overkillEfficiency}%</strong>
          </div>
        )}
        {item.stats.lifeSteal !== undefined && item.stats.lifeSteal > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-rose-300">
            <span>🩸 타격 흡혈</span>
            <strong>+{item.stats.lifeSteal}%</strong>
          </div>
        )}
        {item.stats.allResist !== undefined && item.stats.allResist > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-indigo-300">
            <span>🔮 모든 원소 저항</span>
            <strong>+{item.stats.allResist}%</strong>
          </div>
        )}
        {item.stats.fortune !== undefined && item.stats.fortune > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-teal-300">
            <span>✨ 매직 발견(MF)</span>
            <strong>+{item.stats.fortune}%</strong>
          </div>
        )}
      </div>

      {/* Special Effects & Affixes */}
      {item.specialEffect && (
        <div className="p-1.5 bg-amber-950/40 rounded border border-amber-600/80 text-[11px] text-amber-300">
          <span className="font-black text-amber-400">★ [고유 효과]: </span>
          {item.specialEffect}
        </div>
      )}

      {/* Set Items & Bonuses Section */}
      {item.setName && SET_DEFINITIONS[item.setName] && (
        <div className="p-2 bg-emerald-950/40 rounded border border-emerald-600/80 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-emerald-800/80 pb-1">
            <span>🌿 [{item.setName}] 세트 구성품</span>
            <span className="text-[10px] text-emerald-400/80">({SET_DEFINITIONS[item.setName].totalPieces}부위)</span>
          </div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {SET_DEFINITIONS[item.setName].pieceNames.map((pName, pIdx) => {
              const isThisItem = item.name.includes(pName.split(' ')[0]);
              return (
                <div key={pIdx} className={isThisItem ? 'text-emerald-300 font-black' : 'text-gray-400'}>
                  {isThisItem ? '● ' : '○ '} {pName}
                </div>
              );
            })}
          </div>
          <div className="pt-1 border-t border-emerald-800/60 space-y-0.5">
            <div className="text-[10px] font-bold text-emerald-400">★ 세트 보너스 효과:</div>
            {SET_DEFINITIONS[item.setName].bonuses.map((b, bIdx) => (
              <div key={bIdx} className="text-[10px] text-emerald-200/90 font-mono">
                ({b.piecesRequired}세트) {b.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {item.subAffixes && item.subAffixes.length > 0 && (
        <div className="p-1.5 bg-blue-950/40 rounded border border-blue-700/60 text-[11px] text-blue-300 flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-blue-400 flex-shrink-0">🔮 [추가 접사 옵션]:</span>
          {item.subAffixes.map((aff, idx) => (
            <span key={idx} className="bg-iron-950 px-1.5 py-0.5 rounded border border-blue-600/60 text-[10px] text-blue-200 font-bold">
              {aff.label}
            </span>
          ))}
        </div>
      )}

      {/* Flavor Description */}
      {item.description && (
        <p className="text-[10px] sm:text-[11px] text-gray-400 italic pt-0.5">
          "{item.description}"
        </p>
      )}
    </div>
  );
});
ItemDetailCard.displayName = 'ItemDetailCard';
