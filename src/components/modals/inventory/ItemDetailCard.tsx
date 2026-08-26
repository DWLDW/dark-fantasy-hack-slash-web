import React from 'react';
import { Sparkles, Shield, Sword, Lock, Unlock, Package, ArrowLeftRight, Download, Upload } from 'lucide-react';
import { GameItem } from '../../../types/game';
import { SET_DEFINITIONS } from '../../../data/setItems';

export interface ItemDetailCardProps {
  item: GameItem;
  getRarityBadge?: (rarity: GameItem['rarity']) => React.ReactNode;
  onToggleLock?: (itemId: string) => void;
  onDeposit?: (itemId: string) => void;
  onWithdraw?: (itemId: string) => void;
  isInStash?: boolean;
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

const SLOT_LABEL: Record<string, string> = {
  weapon: '무기 (Weapon)',
  armor: '갑옷 (Armor)',
  shield: '방패 (Shield)',
  helm: '투구 (Helm)',
  gloves: '장갑 (Gloves)',
  boots: '신발 (Boots)',
  ring: '반지 (Ring)',
  ring1: '반지 1 (Ring)',
  ring2: '반지 2 (Ring)',
  amulet: '목걸이 (Amulet)'
};

export const ItemDetailCard: React.FC<ItemDetailCardProps> = React.memo(({
  item,
  getRarityBadge = defaultGetRarityBadge,
  onToggleLock,
  onDeposit,
  onWithdraw,
  isInStash = false
}) => {
  const isLocked = Boolean(item.isLocked);
  const slotText = SLOT_LABEL[item.slot] || item.slot;

  return (
    <div className="bg-iron-900/95 p-3 sm:p-3.5 rounded-xl border-2 border-brass-500/80 shadow-xl space-y-2.5 font-sans select-none text-gray-200">
      
      {/* Header: Name, Badges & Icon Action Controls */}
      <div className="flex items-start justify-between gap-2 border-b border-iron-750 pb-2">
        <div className="space-y-1 min-w-0 flex-1">
          {/* Item Name */}
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
                <Lock className="w-3 h-3 text-amber-400" /> 잠금됨
              </span>
            )}
          </div>

          {/* Clean Property Badges Row (No redundant [고대 룬워드]) */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono flex-wrap">
            {getRarityBadge(item.rarity)}
            <span className="text-gray-300 font-bold bg-iron-950 px-1.5 py-0.5 rounded border border-iron-750">
              {slotText}
            </span>
            {item.requiredLevel && (
              <span className="text-orange-300 font-bold bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-700">
                Lv.{item.requiredLevel} 요구
              </span>
            )}
            {item.setName && (
              <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600">
                세트: {item.setName}
              </span>
            )}
            <span className="uppercase text-amber-400 font-bold bg-iron-950 px-1 py-0.5 rounded border border-iron-750">
              {item.tier || 'NORMAL'}
            </span>
            {item.sockets ? (
              <span className="text-purple-300 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-700">
                {item.socketedRunes?.length || 0}/{item.sockets} 소켓
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: Icon-Only Action Buttons & Core Stat Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Icon-Only Lock Toggle Button */}
          {onToggleLock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(item.id);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer border shadow ${
                isLocked
                  ? 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'bg-iron-950 text-gray-400 border-iron-750 hover:text-white hover:border-gray-500'
              }`}
              title={isLocked ? "아이템 잠금 해제 [L]" : "아이템 잠금 (판매/소실 방지) [L]"}
            >
              {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-gray-400" />}
            </button>
          )}

          {/* Icon-Only Stash Deposit / Withdraw Button */}
          {isInStash && onWithdraw && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw(item.id);
              }}
              className="w-8 h-8 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-400 flex items-center justify-center shadow transition cursor-pointer"
              title="보관함에서 가방으로 꺼내기 [D]"
            >
              <Upload className="w-4 h-4 text-indigo-200" />
            </button>
          )}

          {!isInStash && onDeposit && item.slot !== 'rune' && item.slot !== 'consumable' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeposit(item.id);
              }}
              className="w-8 h-8 rounded-lg bg-iron-950 hover:bg-iron-800 text-gray-200 border border-iron-700 hover:border-indigo-400 flex items-center justify-center shadow transition cursor-pointer"
              title="가방에서 모험가 보관함(Stash)으로 보관 [D]"
            >
              <Download className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {/* Core Main Stat Header Badge */}
          {item.slot === 'weapon' && (
            <div className="bg-iron-950 px-2.5 py-1 rounded-lg border border-amber-500/70 shadow text-right min-w-[70px]">
              <div className="text-[9px] text-gray-400 font-mono">기본 공격력</div>
              <div className="text-xs sm:text-sm font-cinzel font-black text-amber-300">
                ⚔️ {item.stats.minDmg || 0}~{item.stats.maxDmg || 0}
              </div>
            </div>
          )}
          {(item.slot === 'armor' || item.slot === 'shield' || item.slot === 'helm') && (
            <div className="bg-iron-950 px-2.5 py-1 rounded-lg border border-blue-500/70 shadow text-right min-w-[70px]">
              <div className="text-[9px] text-gray-400 font-mono">기본 방어력</div>
              <div className="text-xs sm:text-sm font-cinzel font-black text-blue-300">
                🛡️ +{item.stats.defense || 0}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Full Detailed Stats Grid (Primary Attributes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
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
        {item.stats.hp !== undefined && item.stats.hp > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-rose-300">
            <span>❤️ 생명력 (HP)</span>
            <strong>+{item.stats.hp}</strong>
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
            <span>⚡ 민첩 (DEX)</span>
            <strong>+{item.stats.dex}</strong>
          </div>
        )}
        {item.stats.con !== undefined && item.stats.con > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-yellow-200">
            <span>🛡️ 체력 (CON)</span>
            <strong>+{item.stats.con}</strong>
          </div>
        )}
        {item.stats.evasion !== undefined && item.stats.evasion > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-teal-200">
            <span>💨 회피율</span>
            <strong>+{item.stats.evasion}%</strong>
          </div>
        )}
        {item.stats.critChance !== undefined && item.stats.critChance > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-rose-300">
            <span>🎯 치명타 확률</span>
            <strong>+{item.stats.critChance}%</strong>
          </div>
        )}
        {item.stats.critDamage !== undefined && item.stats.critDamage > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-rose-300">
            <span>💥 치명타 피해</span>
            <strong>+{item.stats.critDamage}%</strong>
          </div>
        )}
        {item.stats.lifeSteal !== undefined && item.stats.lifeSteal > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-red-300">
            <span>🩸 생명력 흡수</span>
            <strong>+{item.stats.lifeSteal}%</strong>
          </div>
        )}
        {item.stats.attackSpeed !== undefined && item.stats.attackSpeed > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-cyan-300">
            <span>⚡ 공격 속도</span>
            <strong>+{item.stats.attackSpeed}%</strong>
          </div>
        )}
        {item.stats.overkillEfficiency !== undefined && item.stats.overkillEfficiency > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-orange-300">
            <span>🔥 오버킬 효율</span>
            <strong>+{item.stats.overkillEfficiency}%</strong>
          </div>
        )}
        {item.stats.damageReduction !== undefined && item.stats.damageReduction > 0 && (
          <div className="bg-iron-950/80 px-2 py-1 rounded border border-iron-800 flex justify-between text-purple-300">
            <span>🛡️ 피해 감소율</span>
            <strong>+{item.stats.damageReduction}%</strong>
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

      {/* 2. Special Effects & Unique Affixes */}
      {item.specialEffect && (
        <div className="p-2 bg-amber-950/50 rounded-lg border border-amber-600/80 text-[11px] text-amber-300 space-y-0.5">
          <div className="font-black text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>고유 특수 효과</span>
          </div>
          <p className="leading-relaxed font-mono">{item.specialEffect}</p>
        </div>
      )}

      {/* 3. Socketed Runes & RuneWord Details (Now placed below stats as requested!) */}
      {item.socketedRunes && item.socketedRunes.length > 0 && (
        <div className="p-2 bg-gradient-to-r from-purple-950/80 via-iron-900 to-amber-950/80 rounded-lg border border-purple-500/70 text-[11px] space-y-1 shadow">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>각인된 룬 목록: [{item.socketedRunes.join(' + ')}]</span>
            </div>
            {item.isRuneWord && (
              <span className="text-amber-300 font-black px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-400 font-mono animate-pulse">
                ❖ [{item.runeWordName || item.name}] 룬워드 완성
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Set Items & Bonuses Section */}
      {item.setName && SET_DEFINITIONS[item.setName] && (
        <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-600/80 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-emerald-800/80 pb-1">
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

      {/* 5. Description & Flavor Text */}
      {item.description && (
        <div className="text-[10px] text-gray-400 italic bg-iron-950/60 p-1.5 rounded border border-iron-800 leading-relaxed font-mono">
          "{item.description}"
        </div>
      )}
    </div>
  );
});

ItemDetailCard.displayName = 'ItemDetailCard';

