import React from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { X, Plus, Swords, Activity, Zap } from 'lucide-react';

const StatUpgradeButtons: React.FC<{
  statKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  availablePoints: number;
  onUpgrade: (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', amount: number) => void;
}> = ({ statKey, availablePoints, onUpgrade }) => {
  const canUpgrade = availablePoints > 0;
  const holdProps = useHoldAction((e?: React.SyntheticEvent) => {
    if (availablePoints <= 0) return;
    const isShift = (e as React.MouseEvent)?.shiftKey;
    const amount = isShift ? Math.min(10, availablePoints) : 1;
    onUpgrade(statKey, amount);
  }, 280, 50, canUpgrade);

  if (!canUpgrade) return null;

  return (
    <div className="flex items-center gap-1">
      {/* +1 Button with Rapid Continuous Hold-Down & Shift+Click for +10 */}
      <button
        {...holdProps}
        className="px-2 py-1 bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 rounded flex items-center justify-center font-black text-xs shadow transition transform active:scale-95 cursor-pointer select-none ring-1 ring-brass-300"
        title="클릭: +1P / Shift+클릭: +10P / 길게 꾹 누르면 연속 자동 투자"
      >
        <Plus className="w-3.5 h-3.5 mr-0.5" />
        <span>1</span>
      </button>

      {/* +10 Button (Instant 10 points) */}
      {availablePoints >= 2 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade(statKey, Math.min(10, availablePoints));
          }}
          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center justify-center font-mono font-black text-xs shadow transition transform active:scale-95 cursor-pointer select-none border border-amber-400"
          title={`한 번에 +${Math.min(10, availablePoints)}P 즉시 투자`}
        >
          +{Math.min(10, availablePoints)}
        </button>
      )}

      {/* +MAX Button if high points */}
      {availablePoints >= 15 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade(statKey, availablePoints);
          }}
          className="px-1.5 py-1 bg-blood-600 hover:bg-blood-500 text-white rounded flex items-center justify-center font-mono font-black text-[10px] shadow transition transform active:scale-95 cursor-pointer select-none border border-blood-400"
          title={`잔여 ${availablePoints}P 올인 투자`}
        >
          MAX
        </button>
      )}
    </div>
  );
};

export const CharacterModal: React.FC = React.memo(() => {
  const { playerStats, totalStats, upgradeStat, resetStatPoints, closeModal } = useGame();

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
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base md:text-lg font-cinzel font-black text-brass-200 tracking-wider">
            캐릭터 능력치 & 스탯
          </h2>
          {playerStats.statPoints > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500/30 text-amber-200 border border-amber-400 px-2.5 py-0.5 rounded text-xs font-black animate-pulse">
                잔여: {playerStats.statPoints}P
              </span>
              <span className="text-[10px] text-amber-300/90 font-mono bg-iron-900 px-1.5 py-0.5 rounded border border-iron-750 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Shift+클릭 또는 [+10] 버튼으로 일괄 투자</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetStatPoints}
            className="px-2.5 py-1 rounded bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer"
            title="투자한 모든 스탯 포인트를 회수하여 다시 분배합니다"
          >
            🔄 <span>스탯 초기화</span>
          </button>
          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
                  
                  <StatUpgradeButtons
                    statKey={attr.key}
                    availablePoints={playerStats.statPoints}
                    onUpgrade={upgradeStat}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Combat Stats */}
        <div className="bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-3 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-2 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            전투 및 공속 / 자원 수치
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <StatRow
              label="물리 피해량 (Physical Power)"
              value={`${totalStats.minDmg} ~ ${totalStats.maxDmg}`}
              highlight="text-brass-200 font-black text-sm"
            />
            <StatRow
              label="공격 속도 (IAS %)"
              value={`+${totalStats.attackSpeed || 0}% (신속 연격 ${Math.min(75, Math.floor((totalStats.attackSpeed || 0) * 0.6))}%, 선제 ${totalStats.baseAtbPercent}%)`}
              highlight="text-amber-300 font-bold"
            />
            <StatRow
              label="물리 방어력 (Armor)"
              value={`${totalStats.defense}`}
              highlight="text-blue-300 font-bold"
            />
            <StatRow
              label="회피율 (Dodge Chance)"
              value={`${totalStats.evasion}%`}
              highlight="text-emerald-300 font-bold"
            />
            <StatRow
              label="물리 피해 감소 (Damage Reduction)"
              value={`${totalStats.damageReduction}%`}
              highlight="text-cyan-300 font-bold"
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
            {totalStats.turnRageRegen > 0 && (
              <StatRow
                label="🧘 명상 오라 (턴당 분노 충전)"
                value={`+${totalStats.turnRageRegen} Rage/Turn`}
                highlight="text-amber-400 font-black"
              />
            )}
            {totalStats.rageCostReduction > 0 && (
              <StatRow
                label="⚡ 스킬 분노 소모량 감소"
                value={`-${totalStats.rageCostReduction}%`}
                highlight="text-emerald-400 font-bold"
              />
            )}
            <div className="pt-2 border-t border-iron-750" />
            <StatRow
              label="매직 발견확률 (Magic Find %)"
              value={`+${totalStats.fortune}%`}
              highlight="text-purple-300 font-black text-sm"
            />

            {totalStats.activeSetBonuses && totalStats.activeSetBonuses.length > 0 && (
              <div className="mt-2 p-2 bg-emerald-950/50 rounded border border-emerald-600/80 space-y-1">
                <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                  <span>🌿 [활성화된 세트 효과]</span>
                </div>
                {totalStats.activeSetBonuses.map((sb, sbIdx) => (
                  <div key={sbIdx} className="text-[10px] text-emerald-200 font-mono">
                    • <strong>{sb.setName}</strong>: {sb.description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 p-2.5 bg-iron-950 rounded border border-iron-750 text-xs text-gray-300 leading-relaxed font-medium">
            💡 <strong className="text-brass-300">편리한 스탯 분배:</strong> <span className="text-amber-300 font-bold">[+10]</span> 버튼을 누르거나, <span className="text-brass-400 font-bold">[+1]</span> 버튼을 <strong>Shift+클릭</strong> 또는 <strong>꾹 누르고 있으면(롱프레스)</strong> 즉시 대량으로 투자됩니다.
          </div>
        </div>
      </div>
    </div>
  );
});

CharacterModal.displayName = 'CharacterModal';

const StatRow: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight = 'text-gray-100' }) => (
  <div className="flex justify-between py-1.5 border-b border-iron-800">
    <span className="text-gray-300 font-medium">{label}:</span>
    <span className={highlight}>{value}</span>
  </div>
);
