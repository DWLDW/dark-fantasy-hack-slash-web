import React, { useMemo } from 'react';
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
  const visibleStats = useMemo(() => {
    return COMPARISON_STATS.filter(({ key }) => {
      const curVal = (equippedItem?.stats?.[key] as number) || 0;
      const nextVal = (selectedItem.stats?.[key] as number) || 0;
      return curVal !== 0 || nextVal !== 0;
    });
  }, [selectedItem, equippedItem]);

  return (
    <div className="bg-iron-950/80 p-2 rounded-lg border border-iron-800 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span className="font-bold flex items-center gap-1 text-brass-300">
          <Scale className="w-3 h-3" /> 착용 장비 대비 스탯 변화
        </span>
        <span className="text-gray-500 truncate max-w-[120px]">
          [{equippedItem ? equippedItem.name : '미착용'}]
        </span>
      </div>

      {visibleStats.length === 0 ? (
        <div className="text-center py-1.5 text-gray-500 font-mono text-[10px]">
          모든 기본 스탯 수치가 동일합니다.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto">
          {visibleStats.map(({ key, label, isPercent, icon }) => {
            const curVal = (equippedItem?.stats?.[key] as number) || 0;
            const nextVal = (selectedItem.stats?.[key] as number) || 0;
            const diff = nextVal - curVal;

            return (
              <span
                key={key}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
                  diff > 0
                    ? 'bg-green-950/60 text-green-300 border-green-700/60'
                    : diff < 0
                    ? 'bg-red-950/60 text-red-300 border-red-700/60'
                    : 'bg-iron-900 text-gray-400 border-iron-800'
                }`}
              >
                <span>{icon} {label}</span>
                <span className="font-black">
                  {diff > 0 ? `+${diff}` : diff}{isPercent ? '%' : ''}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});
ItemCompareTable.displayName = 'ItemCompareTable';
