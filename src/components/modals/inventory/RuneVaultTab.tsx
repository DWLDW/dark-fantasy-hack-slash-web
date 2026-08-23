import React, { useState } from 'react';
import { D2_RUNES } from '../../../data/gameData';

export interface RuneVaultTabProps {
  runesVault: Record<string, number>;
  onTransmuteRune: (runeKey: string) => void;
}

export const RuneVaultTab: React.FC<RuneVaultTabProps> = ({
  runesVault,
  onTransmuteRune
}) => {
  const [hoveredRuneKey, setHoveredRuneKey] = useState<string | null>(null);
  const allRuneKeys = Object.keys(D2_RUNES);
  const totalRunesCount = Object.values(runesVault).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-iron-900 p-2.5 rounded-lg border border-iron-750">
        <div className="text-xs text-gray-200">
          💎 디아블로 2 정통 룬 보관함. 룬 3개를 보유하면 상위 룬으로 즉시 합성할 수 있습니다.
        </div>
        <div className="text-xs font-mono text-brass-300 font-bold">
          총 보유 룬: {totalRunesCount}개
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
                  onClick={() => onTransmuteRune(rKey)}
                  className="w-full py-0.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-black text-[9px] rounded transition shadow cursor-pointer"
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
            <span className="font-bold text-brass-200 text-sm">
              {D2_RUNES[hoveredRuneKey].name} (룬 #{D2_RUNES[hoveredRuneKey].number})
            </span>
            <span className="text-purple-300 font-bold">
              보유: {runesVault[hoveredRuneKey] || 0}개
            </span>
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
  );
};

