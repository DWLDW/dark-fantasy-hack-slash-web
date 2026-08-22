import React from 'react';
import { useGame } from '../../state/gameStore';
import { X, Plus, Shield, Swords, Zap, Sparkles, Heart, Activity } from 'lucide-react';

export const CharacterModal: React.FC = () => {
  const { playerStats, totalStats, upgradeStat, closeModal } = useGame();

  const attributes = [
    { key: 'str', label: '힘 (STR)', desc: '물리 공격력 및 중장비 요구조건', val: totalStats.str, base: playerStats.str },
    { key: 'dex', label: '민첩 (DEX)', desc: '치명타율, 공격 속도, 회피율', val: totalStats.dex, base: playerStats.dex },
    { key: 'con', label: '체력 (CON)', desc: '최대 HP, 물리 방어력, 상태이상 저항', val: totalStats.con, base: playerStats.con },
    { key: 'int', label: '지능 (INT)', desc: '마법 주문력, 최대 마나', val: totalStats.int, base: playerStats.int },
    { key: 'wis', label: '지혜 (WIS)', desc: '마법 저항, 룬 효과 증폭', val: totalStats.wis, base: playerStats.wis },
    { key: 'cha', label: '매력 (CHA)', desc: '행운(MF - 매직/유니크 드랍률), 상점 할인', val: totalStats.cha, base: playerStats.cha },
  ] as const;

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider">
            캐릭터 능력치 & 스탯
          </h2>
          {playerStats.statPoints > 0 && (
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2.5 py-0.5 rounded text-xs font-black animate-pulse">
              잔여 포인트: {playerStats.statPoints}P
            </span>
          )}
        </div>
        <button
          onClick={closeModal}
          className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: 6 Core Attributes */}
        <div className="bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-3 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blood-400" />
            기본 6대 스탯
          </h3>

          <div className="space-y-2">
            {attributes.map(attr => (
              <div
                key={attr.key}
                className="flex items-center justify-between p-2.5 rounded bg-iron-950 border border-iron-700 hover:border-iron-500 transition"
              >
                <div>
                  <div className="font-black text-white text-xs md:text-sm">{attr.label}</div>
                  <div className="text-[11px] text-gray-300 font-medium">{attr.desc}</div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-black text-sm md:text-base text-brass-200">
                    {attr.val}
                    {attr.val > attr.base && (
                      <span className="text-xs text-emerald-400 ml-1 font-bold">
                        (+{attr.val - attr.base})
                      </span>
                    )}
                  </span>
                  {playerStats.statPoints > 0 && (
                    <button
                      onClick={() => upgradeStat(attr.key)}
                      className="w-6 h-6 bg-brass-500 hover:bg-brass-400 text-iron-950 rounded flex items-center justify-center font-black text-sm shadow transition"
                      title="1 포인트 투자"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Combat Stats */}
        <div className="bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-3 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-2 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            전투 및 파밍 세부 수치
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <StatRow
              label="물리 피해량 (Physical Power)"
              value={`${totalStats.minDmg} ~ ${totalStats.maxDmg}`}
              highlight="text-brass-200 font-black text-sm"
            />
            <StatRow
              label="물리 방어력 (Armor)"
              value={`${totalStats.defense}`}
              highlight="text-blue-300 font-bold"
            />
            <StatRow
              label="치명타 확률 (Crit Chance)"
              value={`${totalStats.critChance}%`}
              highlight="text-yellow-300 font-bold"
            />
            <StatRow
              label="치명타 피해 (Crit Damage)"
              value={`${totalStats.critDamage}%`}
              highlight="text-yellow-300 font-bold"
            />
            <StatRow
              label="오버킬 잔여 피해 전이 효율"
              value={`${totalStats.overkillEfficiency}%`}
              highlight="text-orange-300 font-black"
            />
            <StatRow
              label="생명력 흡수 (Life Steal)"
              value={`${totalStats.lifeSteal}%`}
              highlight="text-blood-300 font-bold"
            />
            <div className="pt-2 border-t border-iron-750" />
            <StatRow
              label="매직 발견확률 (Magic Find %)"
              value={`+${totalStats.fortune}%`}
              highlight="text-purple-300 font-black text-sm"
            />
          </div>

          <div className="mt-3 p-2.5 bg-iron-950 rounded border border-iron-750 text-xs text-gray-300 leading-relaxed font-medium">
            💡 <strong className="text-brass-300">오버킬 효율이란?</strong> 몬스터를 처치하고 남은 잉여 대미지가 뒤쪽 또는 인접 레인의 적에게 전이되는 비율입니다.
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight = 'text-gray-100' }) => (
  <div className="flex justify-between py-1.5 border-b border-iron-800">
    <span className="text-gray-300 font-medium">{label}:</span>
    <span className={highlight}>{value}</span>
  </div>
);
