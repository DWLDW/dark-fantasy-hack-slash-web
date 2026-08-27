import React, { useState, useMemo } from 'react';
import { GameItem } from '../../../types/game';
import { D2_RUNES, D2RuneDef } from '../../../data/runes';
import { Sparkles, ArrowRight, Shield, Sword, Plus } from 'lucide-react';

export interface SingleSocketRunePanelProps {
  selectedItem: GameItem;
  runesVault: Record<string, number>;
  onSocketRune: (targetItemId: string, runeKey: string) => void;
}

export const SingleSocketRunePanel: React.FC<SingleSocketRunePanelProps> = ({
  selectedItem,
  runesVault,
  onSocketRune
}) => {
  const isWeapon = selectedItem.slot === 'weapon';
  const availableRunes = useMemo(() => {
    return Object.entries(runesVault)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => ({
        key,
        count,
        def: D2_RUNES[key]
      }))
      .filter(item => Boolean(item.def));
  }, [runesVault]);

  const [selectedRuneKey, setSelectedRuneKey] = useState<string | null>(
    availableRunes.length > 0 ? availableRunes[0].key : null
  );

  const currentRuneDef = selectedRuneKey ? D2_RUNES[selectedRuneKey] : null;

  const bonusPreview = useMemo(() => {
    if (!currentRuneDef) return null;
    return isWeapon ? currentRuneDef.statsWeapon : currentRuneDef.statsArmor;
  }, [currentRuneDef, isWeapon]);

  const emptySocketCount = (selectedItem.sockets || 0) - (selectedItem.socketedRunes?.length || 0);

  if (emptySocketCount <= 0) return null;

  return (
    <div className="bg-iron-950/95 p-3 rounded-lg border-2 border-purple-500/80 space-y-2.5 shadow-lg select-none">
      <div className="flex items-center justify-between border-b border-iron-800 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-cinzel font-black text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>🔮 소켓에 룬 각인하기 ({selectedItem.rarity.toUpperCase()})</span>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-700">
          빈 소켓: {emptySocketCount}개 남음
        </span>
      </div>

      {availableRunes.length === 0 ? (
        <div className="p-3 bg-iron-900/60 rounded border border-dashed border-iron-800 text-center text-gray-400 font-mono text-xs">
          📦 보유 중인 룬이 없습니다. 던전에서 룬을 파밍해 보세요!
        </div>
      ) : (
        <div className="space-y-2">
          {/* Available Runes Grid */}
          <div className="text-[10px] text-gray-400 font-mono">보유 중인 룬을 선택하세요:</div>
          <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {availableRunes.map(({ key, count, def }) => {
              const isSelected = selectedRuneKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedRuneKey(key)}
                  className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950 text-purple-100 border-purple-400 ring-2 ring-purple-400/80 shadow-[0_0_10px_rgba(192,132,252,0.5)]'
                      : 'bg-iron-900 text-gray-300 border-iron-750 hover:border-purple-600'
                  }`}
                >
                  <span className="text-purple-300">#{def.number}</span>
                  <span>{key}</span>
                  <span className="text-[9px] bg-black/60 px-1 rounded text-amber-300">x{count}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Rune Stat Preview & Socket Button */}
          {currentRuneDef && (
            <div className="bg-iron-900/90 p-2.5 rounded-lg border border-purple-500/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-purple-200">
                  [{currentRuneDef.name}] 각인 시 추가 능력치:
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {isWeapon ? '⚔️ 무기 전용 효과' : '🛡️ 방어구/악세서리 효과'}
                </span>
              </div>

              <div className="text-xs font-mono text-amber-300 bg-iron-950 p-1.5 rounded border border-iron-800">
                {isWeapon ? currentRuneDef.weaponBonus : currentRuneDef.armorBonus}
              </div>

              {bonusPreview && (
                <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                  {Object.entries(bonusPreview).map(([statKey, val]) => (
                    <span
                      key={statKey}
                      className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-700/60 font-bold"
                    >
                      +{val} {statKey}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  if (selectedRuneKey) {
                    onSocketRune(selectedItem.id, selectedRuneKey);
                  }
                }}
                className="w-full py-2 rounded-lg text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400 shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>[{currentRuneDef.name}] 소켓에 각인하기</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
