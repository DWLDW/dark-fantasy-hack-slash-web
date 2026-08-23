import React from 'react';
import { GameItem, ItemStats } from '../../../types/game';
import { Scale, ArrowRight } from 'lucide-react';

export interface ItemCompareTableProps {
  selectedItem: GameItem;
  equippedItem: GameItem | null;
}

interface StatConfig {
  key: keyof ItemStats;
  label: string;
  isPercent?: boolean;
  icon: string;
}

export const COMPARISON_STATS: StatConfig[] = [
  { key: 'minDmg', label: '최소 공격력', icon: '⚔️' },
  { key: 'maxDmg', label: '최대 공격력', icon: '💥' },
  { key: 'attackSpeed', label: '공격 속도', isPercent: true, icon: '⚡' },
  { key: 'defense', label: '방어력', icon: '🛡️' },
  { key: 'hp', label: '생명력', icon: '❤️' },
  { key: 'str', label: '힘 (STR)', icon: '💪' },
  { key: 'dex', label: '민첩 (DEX)', icon: '🏃' },
  { key: 'con', label: '체력 (CON)', icon: '🩸' },
  { key: 'critChance', label: '치명타율', isPercent: true, icon: '🎯' },
  { key: 'critDamage', label: '치명타 피해', isPercent: true, icon: '⚡' },
  { key: 'overkillEfficiency', label: '오버킬 전이', isPercent: true, icon: '🌪️' },
  { key: 'fortune', label: '매직 찬스(MF)', isPercent: true, icon: '✨' },
  { key: 'lifeSteal', label: '생명력 흡수', isPercent: true, icon: '🧛' },
  { key: 'evasion', label: '회피율', isPercent: true, icon: '💨' },
  { key: 'damageReduction', label: '피해 감소', isPercent: true, icon: '🔰' },
  { key: 'allResist', label: '모든 저항', isPercent: true, icon: '🔮' }
];

export const ItemCompareTable: React.FC<ItemCompareTableProps> = React.memo(({ selectedItem, equippedItem }) => {
  return (
    <div className="bg-iron-900/90 p-2.5 rounded-lg border border-iron-750 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono border-b border-iron-800 pb-1.5">
        <span className="text-gray-300 font-bold flex items-center gap-1">
          <Scale className="w-3.5 h-3.5 text-brass-400" />
          <span>
            현재 착용 장비([<strong className="text-gray-200">{equippedItem ? equippedItem.name : '미착용'}</strong>])와의 스탯 비교표
          </span>
        </span>
        <span className="text-gray-500 text-[9px]">
          증가: <span className="text-green-400 font-bold">녹색(+)</span> / 감소: <span className="text-red-400 font-bold">빨간색(-)</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5">
        {COMPARISON_STATS.map(({ key, label, isPercent, icon }) => {
          const curVal = (equippedItem?.stats?.[key] as number) || 0;
          const nextVal = (selectedItem.stats?.[key] as number) || 0;
          const diff = nextVal - curVal;

          const isCore = ['minDmg', 'maxDmg', 'attackSpeed', 'defense', 'hp', 'str', 'dex', 'con'].includes(key);
          if (!isCore && curVal === 0 && nextVal === 0) return null;

          return (
            <div
              key={key}
              className={`p-1.5 rounded border text-[11px] font-mono flex items-center justify-between transition ${
                diff > 0
                  ? 'bg-green-950/30 border-green-700/60'
                  : diff < 0
                  ? 'bg-red-950/30 border-red-700/60'
                  : 'bg-iron-950/60 border-iron-800'
              }`}
            >
              <div className="text-gray-300 truncate mr-1 flex items-center gap-1">
                <span className="text-[10px]">{icon}</span>
                <span className="text-[10px] font-sans">{label}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-gray-400 text-[10px]">
                  {curVal}{isPercent ? '%' : ''}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                <span className={`font-black ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {nextVal}{isPercent ? '%' : ''}
                </span>

                {diff !== 0 && (
                  <span
                    className={`text-[10px] font-black px-1 rounded ml-0.5 ${
                      diff > 0
                        ? 'text-green-400 bg-green-950 border border-green-600/50'
                        : 'text-red-400 bg-red-950 border border-red-600/50'
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : `${diff}`}{isPercent ? '%' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ItemCompareTable.displayName = 'ItemCompareTable';
