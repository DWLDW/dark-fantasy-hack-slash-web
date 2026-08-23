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

  return (
    <div className="w-[140px] flex items-center justify-end gap-1.5 flex-shrink-0">
      {/* Slot 1: [+1] Button Slot (Strictly Fixed 36px width) */}
      <div className="w-9 h-7 flex-shrink-0">
        {availablePoints >= 1 ? (
          <button
            {...holdProps}
            className="w-full h-full bg-gradient-to-r from-brass-500 to-amber-500 hover:from-brass-400 hover:to-amber-400 text-iron-950 rounded flex items-center justify-center font-black text-xs shadow transition transform active:scale-95 cursor-pointer select-none ring-1 ring-brass-300"
            title="클릭: +1P / Shift+클릭: +10P / 길게 꾹 누르면 연속 자동 투자"
          >
            <Plus className="w-3.5 h-3.5 mr-0.2" />
            <span>1</span>
          </button>
        ) : (
          <div className="w-full h-full rounded bg-iron-950 border border-iron-850 text-gray-700 flex items-center justify-center text-xs font-mono select-none">
            -
          </div>
        )}
      </div>

      {/* Slot 2: [+10] Button Slot (Strictly Fixed 48px width) */}
      <div className="w-12 h-7 flex-shrink-0">
        {availablePoints >= 2 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade(statKey, Math.min(10, availablePoints));
            }}
            className="w-full h-full bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center justify-center font-mono font-black text-xs shadow transition transform active:scale-95 cursor-pointer select-none border border-amber-400"
            title={`한 번에 +${Math.min(10, availablePoints)}P 즉시 투자`}
          >
            +{Math.min(10, availablePoints)}
          </button>
        ) : (
          <div className="w-full h-full rounded bg-iron-950 border border-iron-850 text-gray-700 flex items-center justify-center text-xs font-mono select-none">
            -
          </div>
        )}
      </div>

      {/* Slot 3: [MAX] Button Slot (Strictly Fixed 44px width) */}
      <div className="w-11 h-7 flex-shrink-0">
        {availablePoints >= 10 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade(statKey, availablePoints);
            }}
            className="w-full h-full bg-blood-600 hover:bg-blood-500 text-white rounded flex items-center justify-center font-mono font-black text-[10px] shadow transition transform active:scale-95 cursor-pointer select-none border border-blood-400"
            title={`잔여 ${availablePoints}P 올인 투자`}
          >
            MAX
          </button>
        ) : (
          <div className="w-full h-full rounded bg-iron-950 border border-iron-850 text-gray-700 flex items-center justify-center text-[10px] font-mono select-none">
            -
          </div>
        )}
      </div>
    </div>
  );
};

export const CharacterModal: React.FC = React.memo(() => {
  const { playerStats, totalStats, upgradeStat, resetStatPoints, closeModal, openConfirmModal } = useGame();

  const attributes = [
    { key: 'str', label: '힘 (STR)', desc: '물리 공격력 및 중장비 요구조건', val: totalStats.str, base: playerStats.str },
    { key: 'dex', label: '민첩 (DEX)', desc: '치명타율, 공격 속도, 회피율', val: totalStats.dex, base: playerStats.dex },
    { key: 'con', label: '체력 (CON)', desc: '최대 HP, 물리 방어력, 상태이상 저항', val: totalStats.con, base: playerStats.con },
    { key: 'int', label: '지능 (INT)', desc: '마법 주문력, 최대 마나', val: totalStats.int, base: playerStats.int },
    { key: 'wis', label: '지혜 (WIS)', desc: '마법 저항, 룬 효과 증폭', val: totalStats.wis, base: playerStats.wis },
    { key: 'cha', label: '매력 (CHA)', desc: '아이템 희귀도 상승(MF), 상점 할인', val: totalStats.cha, base: playerStats.cha },
  ] as const;

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-xs md:text-sm select-none font-sans">
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
            onClick={() => openConfirmModal({
            title: "캐릭터 스탯 초기화",
            message: "투자한 모든 기본 6대 스탯 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n회수된 모든 포인트는 즉시 다시 자유롭게 분배할 수 있습니다.",
            confirmText: "스탯 초기화",
            type: "warning",
            onConfirm: resetStatPoints
          })}
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
        {/* Left Column: 6 Core Attributes with Bulletproof Zero-Movement Layout */}
        <div className="bg-iron-900/90 p-3.5 sm:p-4 rounded-lg border border-iron-750 space-y-3 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blood-400" />
            기본 6대 스탯 투자
          </h3>

          <div className="space-y-2">
            {attributes.map(attr => (
              <div
                key={attr.key}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-iron-950 border border-iron-800 hover:border-iron-700 transition"
              >
                {/* 1. Label & Description (Flex-1) */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-black text-white text-xs md:text-sm truncate">{attr.label}</div>
                  <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">{attr.desc}</div>
                </div>

                {/* 2. Stat Current Value (Strictly Fixed 70px Width) */}
                <div className="w-[70px] text-right pr-2 flex-shrink-0 font-mono font-black text-xs sm:text-sm text-brass-200">
                  {attr.val}
                  {attr.val > attr.base && (
                    <span className="text-[11px] text-emerald-400 ml-0.5 font-bold">
                      (+{attr.val - attr.base})
                    </span>
                  )}
                </div>

                {/* 3. Button Slots (Strictly Fixed 140px Width) */}
                <StatUpgradeButtons
                  statKey={attr.key}
                  availablePoints={playerStats.statPoints}
                  onUpgrade={upgradeStat}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Combat Stats & Resistances */}
        <div className="bg-iron-900/90 p-4 rounded-lg border border-iron-750 space-y-2.5 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-1.5 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            전투 능력치 & 저항 속성
          </h3>

          <div className="space-y-1.5 text-xs font-mono">
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
            {totalStats.turnRageRegen > 0 && (
              <StatRow
                label="🧘 명상 오라 (턴당 분노 충전)"
                value={`+${totalStats.turnRageRegen} Rage/Turn`}
                highlight="text-amber-400 font-black"
              />
            )}
            
            {/* Elemental Resistances */}
            <div className="pt-2 border-t border-iron-750 font-bold text-gray-300 text-[11px] flex items-center justify-between">
              <span>원소 저항 속성</span>
              <span className="text-[10px] text-gray-400 font-mono">최대 75%</span>
            </div>
            <StatRow
              label="🔮 모든 원소 저항 (All Resist)"
              value={`+${totalStats.allResist || 0}%`}
              highlight="text-purple-300 font-black"
            />
            <StatRow
              label="🔥 화염 저항 (Fire Resist)"
              value={`+${totalStats.allResist || 0}%`}
              highlight="text-rose-400 font-mono"
            />
            <StatRow
              label="❄️ 냉기 저항 (Cold Resist)"
              value={`+${totalStats.allResist || 0}%`}
              highlight="text-sky-300 font-mono"
            />
            <StatRow
              label="⚡ 번개 저항 (Lightning Resist)"
              value={`+${totalStats.allResist || 0}%`}
              highlight="text-amber-300 font-mono"
            />
            <StatRow
              label="🧪 독 저항 (Poison Resist)"
              value={`+${totalStats.allResist || 0}%`}
              highlight="text-emerald-300 font-mono"
            />

            <div className="pt-2 border-t border-iron-750" />
            <StatRow
              label="✨ 아이템 희귀도 상승 (Item Rarity Boost %)"
              value={`+${totalStats.fortune}%`}
              highlight="text-teal-300 font-black text-sm"
            />
          </div>

          <div className="mt-2 p-2 bg-iron-950 rounded border border-iron-800 text-[11px] text-gray-300 leading-relaxed font-mono">
            💡 <strong className="text-brass-300">스탯 고정 배치:</strong> 잔여 포인트 변동 시에도 [+1], [+10], [MAX] 버튼 위치가 절대 흔들리거나 이동하지 않습니다.
          </div>
        </div>
      </div>
    </div>
  );
});

CharacterModal.displayName = 'CharacterModal';

const StatRow: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight = 'text-gray-100' }) => (
  <div className="flex justify-between py-1 border-b border-iron-800/80">
    <span className="text-gray-300 font-medium">{label}:</span>
    <span className={highlight}>{value}</span>
  </div>
);
