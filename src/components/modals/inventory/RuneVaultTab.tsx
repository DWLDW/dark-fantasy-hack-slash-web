import React, { useState } from 'react';
import { D2_RUNES } from '../../../data/gameData';
import { Sparkles, ArrowRight, Shield, Sword } from 'lucide-react';

export interface RuneVaultTabProps {
  runesVault: Record<string, number>;
  onTransmuteRune: (runeKey: string) => void;
}

export const RuneVaultTab: React.FC<RuneVaultTabProps> = ({
  runesVault,
  onTransmuteRune
}) => {
  const allRuneKeys = Object.keys(D2_RUNES);
  const [hoveredRuneKey, setHoveredRuneKey] = useState<string | null>(allRuneKeys[0] || null);
  const totalRunesCount = Object.values(runesVault).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-iron-900 p-2.5 rounded-lg border border-iron-750">
        <div className="text-xs text-gray-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>디아블로 2 정통 룬 보관함. 동일 룬 3개를 상위 룬으로 즉시 합성할 수 있습니다.</span>
        </div>
        <div className="text-xs font-mono text-brass-300 font-bold">
          총 보유 룬: {totalRunesCount}개
        </div>
      </div>

      {/* Chessboard Grid for all 33 Runes */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {allRuneKeys.map((rKey, rIdx) => {
          const def = D2_RUNES[rKey];
          const ownedCount = runesVault[rKey] || 0;
          const canTransmute = ownedCount >= 3;
          const isHovered = hoveredRuneKey === rKey;
          const nextRuneKey = rIdx < allRuneKeys.length - 1 ? allRuneKeys[rIdx + 1] : null;
          const nextRuneDef = nextRuneKey ? D2_RUNES[nextRuneKey] : null;

          return (
            <div
              key={rKey}
              onClick={() => setHoveredRuneKey(rKey)}
              onMouseEnter={() => setHoveredRuneKey(rKey)}
              className={`p-2 rounded-lg border-2 text-center transition relative flex flex-col justify-between min-h-[82px] shadow cursor-pointer ${
                ownedCount > 0
                  ? 'bg-iron-900 border-brass-600/80 text-gray-100 hover:border-brass-400'
                  : 'bg-iron-950/50 border-iron-800 text-gray-600 opacity-60 hover:opacity-80'
              } ${isHovered ? 'ring-2 ring-purple-400 scale-105 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : ''}`}
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

              {canTransmute && nextRuneDef ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransmuteRune(rKey);
                  }}
                  className="w-full py-0.5 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-black text-[9px] rounded transition shadow cursor-pointer"
                  title={`${def.name} 3개 ➔ ${nextRuneDef.name} 1개 합성 (총 ${Math.floor(ownedCount / 3)}회 가능)`}
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

      {/* Selected / Hovered Rune Details */}
      {hoveredRuneKey && D2_RUNES[hoveredRuneKey] && (() => {
        const curDef = D2_RUNES[hoveredRuneKey];
        const curIdx = allRuneKeys.indexOf(hoveredRuneKey);
        const nextKey = curIdx < allRuneKeys.length - 1 ? allRuneKeys[curIdx + 1] : null;
        const nextDef = nextKey ? D2_RUNES[nextKey] : null;
        const count = runesVault[hoveredRuneKey] || 0;

        return (
          <div className="p-3 bg-iron-900 rounded-lg border-2 border-iron-750 font-mono text-xs space-y-1.5 shadow">
            <div className="flex justify-between items-center border-b border-iron-750 pb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-brass-200 text-sm font-cinzel">
                  {curDef.name} (룬 #{curDef.number})
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600/60 font-bold">
                  보유: {count}개
                </span>
              </div>

              {nextDef ? (
                <div className="text-[11px] text-purple-300 flex items-center gap-1 font-bold">
                  <span>3개 합성 공식:</span>
                  <span className="text-gray-300">{curDef.name.split(' ')[0]} x3</span>
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                  <span className="text-amber-300">{nextDef.name} x1</span>
                </div>
              ) : (
                <span className="text-[11px] text-amber-400 font-black">
                  ❖ 성역 최상위 조드(Zod) 룬 (합성 불가)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div className="p-1.5 rounded bg-iron-950/80 border border-iron-800 flex items-start gap-1.5 text-gray-300">
                <Sword className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-amber-300">무기 소켓 장착 효과:</strong>
                  <div className="text-[11px] text-gray-200">{curDef.weaponBonus}</div>
                </div>
              </div>

              <div className="p-1.5 rounded bg-iron-950/80 border border-iron-800 flex items-start gap-1.5 text-gray-300">
                <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-blue-300">방어구 소켓 장착 효과:</strong>
                  <div className="text-[11px] text-gray-200">{curDef.armorBonus}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

