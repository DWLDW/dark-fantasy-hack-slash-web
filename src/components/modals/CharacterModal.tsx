import React from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { calculateResetShardCost } from '../../state/helpers/skillManager';
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
            className="w-full h-full bg-iron-800 hover:bg-iron-750 text-amber-300 rounded flex items-center justify-center font-mono font-black text-xs shadow-inner transition transform active:scale-95 cursor-pointer select-none border border-amber-500/80"
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
            className="w-full h-full bg-iron-900 hover:bg-iron-800 text-brass-200 rounded flex items-center justify-center font-mono font-black text-[10px] shadow-inner transition transform active:scale-95 cursor-pointer select-none border border-brass-500 hover:border-brass-400"
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
    <div className="bg-iron-950 border-2 border-brass-500 rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(251,191,36,0.18)] text-xs md:text-sm select-none font-sans ui-ornate">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-iron-750 mb-4 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <img
            src="/images/player/berserker_idle.png"
            alt="광전사"
            className="pixel-sprite h-14 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            draggable={false}
          />
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
          {/* Tier 5: Warning Reset Button with Shard Cost */}
          {(() => {
            const shardCost = calculateResetShardCost(playerStats.level);
            const hasEnoughShards = (playerStats.shards || 0) >= shardCost;
            return (
              <button
                onClick={() => openConfirmModal({
                  title: "캐릭터 스탯 초기화",
                  message: `투자한 모든 기본 6대 스탯 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n💎 필요 샤드: ${shardCost}개 (보유: ${playerStats.shards || 0}개)\n회수된 모든 포인트는 즉시 다시 자유롭게 분배할 수 있습니다.`,
                  confirmText: `스탯 초기화 (💎 ${shardCost}개)`,
                  type: "warning",
                  onConfirm: resetStatPoints
                })}
                className={`px-2.5 py-1 rounded border text-xs font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer ${
                  hasEnoughShards
                    ? 'bg-iron-900 hover:bg-amber-950/40 border-iron-700 hover:border-amber-500/80 text-gray-300 hover:text-amber-200'
                    : 'bg-iron-950 border-iron-800 text-gray-500 opacity-70'
                }`}
                title={`스탯 초기화 (필요: 샤드 ${shardCost}개)`}
              >
                🔄 <span>스탯 초기화</span>
                <span className={`text-[10px] ${hasEnoughShards ? 'text-amber-300 font-bold' : 'text-red-400'}`}>
                  (💎 {shardCost})
                </span>
              </button>
            );
          })()}
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
        <div className="bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750 space-y-2.5 shadow">
          <h3 className="font-cinzel font-bold text-gray-100 border-b border-iron-750 pb-1.5 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            전투 상세 능력치 & 저항 속성
          </h3>

          {/* Group 1: 공격 & 연계 (Offense) */}
          <div className="space-y-1 bg-iron-950/80 p-2 rounded-lg border border-iron-800 text-xs font-mono">
            <div className="text-[10px] font-cinzel font-black text-amber-400 mb-0.5">⚔️ 공격 및 연계 메트릭</div>
            <StatRow
              label="물리 피해량"
              value={`${totalStats.minDmg} ~ ${totalStats.maxDmg}`}
              highlight="text-brass-200 font-black text-sm"
            />
            <StatRow
              label="공격 / 시전 속도"
              value={`+${totalStats.attackSpeed || 0}% (분노 소모 -${totalStats.rageCostReduction || 0}%)`}
              highlight="text-amber-300 font-bold"
            />
            <StatRow
              label="치명타 확률 / 피해"
              value={`${totalStats.critChance}% / +${totalStats.critDamage}%`}
              highlight="text-yellow-300 font-bold"
            />
            <StatRow
              label="⚡ 신속 연계 콤보"
              value={`타격당 +${30 + Math.floor((totalStats.attackSpeed || 0) * 0.5)}%`}
              highlight="text-amber-400 font-black"
            />
            <StatRow
              label="오버킬 전이 효율"
              value={`${totalStats.overkillEfficiency}%`}
              highlight="text-orange-300 font-black"
            />
          </div>

          {/* Group 2: 방어 & 생존 (Defense) */}
          <div className="space-y-1 bg-iron-950/80 p-2 rounded-lg border border-iron-800 text-xs font-mono">
            <div className="text-[10px] font-cinzel font-black text-blue-400 mb-0.5">🛡️ 방어 및 생존 메트릭</div>
            <StatRow
              label="물리 방어력"
              value={`${totalStats.defense}`}
              highlight="text-blue-300 font-bold"
            />
            <StatRow
              label="피해 감소율 / 회피율"
              value={`${totalStats.damageReduction}% / ${totalStats.evasion}%`}
              highlight="text-cyan-300 font-bold"
            />
            <StatRow
              label="생명력 흡수 (Life Steal)"
              value={`+${totalStats.lifeSteal || 0}%`}
              highlight={totalStats.lifeSteal > 0 ? "text-rose-400 font-black" : "text-gray-400"}
            />
          </div>

          {/* Group 3: 4대 원소 저항 4열 칩 그리드 */}
          <div className="bg-iron-950/80 p-2 rounded-lg border border-iron-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-cinzel font-black text-purple-300">
              <span>🔮 4대 원소 저항</span>
              <span className="font-mono text-gray-400 text-[9px]">모든 저항: +{totalStats.allResist || 0}% (최대 75%)</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-rose-950/50 border border-rose-800/80 text-rose-300 font-bold">🔥 +{totalStats.allResist || 0}%</div>
              <div className="p-1 rounded bg-sky-950/50 border border-sky-800/80 text-sky-300 font-bold">❄️ +{totalStats.allResist || 0}%</div>
              <div className="p-1 rounded bg-amber-950/50 border border-amber-800/80 text-amber-300 font-bold">⚡ +{totalStats.allResist || 0}%</div>
              <div className="p-1 rounded bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 font-bold">🧪 +{totalStats.allResist || 0}%</div>
            </div>
          </div>

          {/* Group 4: 파밍 & 유틸리티 */}
          <div className="bg-iron-950/80 p-2 rounded-lg border border-iron-800 space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center py-0.5 border-b border-iron-800/80">
              <span className="text-amber-300 font-bold">👑 모든 스킬 레벨 보너스:</span>
              <span className="text-amber-400 font-black text-sm">+{totalStats.allSkills || 0} Lv</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-iron-800/80">
              <span className="text-teal-300 font-bold">✨ 매직 아이템 발견율 (MF):</span>
              <span className="text-teal-200 font-black text-sm">+{totalStats.fortune}%</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-yellow-300 font-bold">💰 괴물 골드 획득량 (GF):</span>
              <span className="text-yellow-200 font-black text-sm">+{totalStats.goldFind || 0}%</span>
            </div>
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
