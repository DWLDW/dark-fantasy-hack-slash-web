import React from 'react';
import { useGame } from '../../state/gameStore';
import { useHoldAction } from '../../utils/useHoldAction';
import { calculateResetShardCost } from '../../state/helpers/skillManager';
import { X, Plus, Swords, Activity, Zap } from 'lucide-react';

export const CharacterModal: React.FC = React.memo(() => {
  const { playerStats, totalStats, upgradeStat, resetStatPoints, closeModal, openConfirmModal } = useGame();

  // Global Stat Investment Step: 1 | 5 | 10 | 'max'
  const [investStep, setInvestStep] = React.useState<1 | 5 | 10 | 'max'>(1);

  const attributes = [
    { key: 'str', label: '힘 (STR)', desc: '물리 공격력 및 장비 요구치', val: totalStats.str, base: playerStats.str, icon: '💪', color: 'text-red-400' },
    { key: 'dex', label: '민첩 (DEX)', desc: '치명타율, 공격속도, 회피율', val: totalStats.dex, base: playerStats.dex, icon: '⚡', color: 'text-emerald-400' },
    { key: 'con', label: '체력 (CON)', desc: '최대 생명력(HP), 물리 방어력', val: totalStats.con, base: playerStats.con, icon: '🛡️', color: 'text-yellow-400' },
    { key: 'int', label: '지능 (INT)', desc: '마법 주문력, 최대 마나', val: totalStats.int, base: playerStats.int, icon: '🔮', color: 'text-blue-400' },
    { key: 'wis', label: '지혜 (WIS)', desc: '원소 저항력, 룬 위력 증폭', val: totalStats.wis, base: playerStats.wis, icon: '✨', color: 'text-purple-400' },
    { key: 'cha', label: '매력 (CHA)', desc: '매직 드랍률(MF), 상점 할인', val: totalStats.cha, base: playerStats.cha, icon: '👑', color: 'text-amber-400' },
  ] as const;

  const handleUpgrade = (statKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
    if (playerStats.statPoints <= 0) return;
    const amount = investStep === 'max' ? playerStats.statPoints : Math.min(investStep, playerStats.statPoints);
    upgradeStat(statKey, amount);
  };

  const shardCost = calculateResetShardCost(playerStats.level);
  const hasEnoughShards = (playerStats.shards || 0) >= shardCost;

  const maxResist = 75;
  const currentResist = Math.min(maxResist, totalStats.allResist || 0);
  const resistPercent = Math.min(100, Math.round((currentResist / maxResist) * 100));

  return (
    <div className="bg-iron-950 border-2 border-brass-500 rounded-xl p-2.5 sm:p-3.5 w-full max-w-2xl max-h-[96dvh] overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.18)] text-xs md:text-sm select-none font-sans ui-ornate">
      
      {/* 1. Header: Avatar, Title, Stat Points & Reset */}
      <div className="flex items-center justify-between pb-1.5 border-b border-iron-750 mb-2 gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <img
            src="/images/player/berserker_idle.png"
            alt="광전사"
            className="pixel-sprite h-8 w-auto drop-shadow"
            draggable={false}
          />
          <div>
            <h2 className="text-sm sm:text-base font-cinzel font-black text-brass-200 tracking-wider">
              캐릭터 능력치 & 스탯
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-500/80 px-1.5 py-0.2 rounded text-[11px] font-mono font-black shadow">
            <span>보유 SP:</span>
            <span className="text-white font-black">{playerStats.statPoints}</span>
            <span>P</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openConfirmModal({
              title: "캐릭터 스탯 초기화",
              message: `투자한 모든 기본 6대 스탯 포인트를 전액 회수하여 다시 분배하시겠습니까?\n\n💎 필요 샤드: ${shardCost}개 (보유: ${playerStats.shards || 0}개)\n회수된 모든 포인트는 즉시 다시 자유롭게 분배할 수 있습니다.`,
              confirmText: `스탯 초기화 (💎 ${shardCost}개)`,
              type: "warning",
              onConfirm: resetStatPoints
            })}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer ${
              hasEnoughShards
                ? 'bg-iron-900 hover:bg-amber-950/40 border-iron-700 hover:border-amber-500/80 text-gray-300 hover:text-amber-200'
                : 'bg-iron-950 border-iron-800 text-gray-500 opacity-70'
            }`}
            title={`스탯 초기화 (필요: 샤드 ${shardCost}개)`}
          >
            <span>초기화 (💎{shardCost})</span>
          </button>

          <button
            onClick={closeModal}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-iron-800 transition cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Grid (0-Scroll) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        
        {/* Left 6 Cols: Core 6 Attributes */}
        <div className="md:col-span-6 bg-iron-900/90 p-2 rounded-lg border border-iron-750 space-y-1.5 shadow">
          
          {/* Top Step Selector Chips */}
          <div className="flex items-center justify-between border-b border-iron-750 pb-1">
            <h3 className="font-cinzel font-black text-xs text-brass-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blood-400" />
              <span>6대 기본 스탯</span>
            </h3>

            <div className="flex items-center gap-0.5 bg-iron-950 p-0.5 rounded border border-iron-800 font-mono text-[9px]">
              {([1, 5, 10, 'max'] as const).map(step => (
                <button
                  key={step}
                  onClick={() => setInvestStep(step)}
                  className={`px-1.5 py-0.2 rounded font-black transition cursor-pointer ${
                    investStep === step
                      ? 'bg-amber-500 text-iron-950 shadow'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {step === 'max' ? 'MAX' : `+${step}`}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Attributes Rows */}
          <div className="space-y-1">
            {attributes.map(attr => {
              const canUpgrade = playerStats.statPoints > 0;
              const bonusVal = attr.val - attr.base;
              const investAmount = investStep === 'max' ? playerStats.statPoints : Math.min(investStep, playerStats.statPoints);

              return (
                <div
                  key={attr.key}
                  className="flex items-center justify-between px-1.5 py-1 rounded bg-iron-950 border border-iron-800 hover:border-iron-700 transition gap-1.5 text-xs"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-1">
                    <span className="text-xs">{attr.icon}</span>
                    <span className="font-bold text-gray-200 text-[11px] truncate">{attr.label}</span>
                  </div>

                  <div className="text-right font-mono font-black text-xs text-brass-200 min-w-[45px]">
                    <span>{attr.val}</span>
                    {bonusVal > 0 && (
                      <span className="text-[9px] text-emerald-400 font-bold ml-1">(+{bonusVal})</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(attr.key)}
                    disabled={!canUpgrade}
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs transition cursor-pointer shadow ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-iron-950 border border-amber-300 ring-1 ring-amber-400 active:scale-95'
                        : 'bg-iron-900 text-gray-600 border border-iron-800 cursor-not-allowed opacity-40'
                    }`}
                    title={canUpgrade ? `+${investAmount}P 투자` : 'SP 부족'}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Combat Metrics & Resistance */}
        <div className="md:col-span-6 bg-iron-900/90 p-2 rounded-lg border border-iron-750 space-y-1.5 shadow">
          <h3 className="font-cinzel font-black text-xs text-brass-300 border-b border-iron-750 pb-1 flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>전투 상세 스탯 & 저항</span>
          </h3>

          {/* Group 1: Core Combat Stats */}
          <div className="space-y-0.5 bg-iron-950 p-1.5 rounded border border-iron-800 text-[11px] font-mono">
            <div className="flex justify-between items-center py-0.5 border-b border-iron-850">
              <span className="text-gray-400">⚔️ 물리 피해량:</span>
              <span className="text-amber-200 font-black">{totalStats.minDmg} ~ {totalStats.maxDmg}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-iron-850">
              <span className="text-gray-400">⚡ 공속 / 치명타율:</span>
              <span className="text-cyan-300 font-bold">+{totalStats.attackSpeed || 0}% / {totalStats.critChance}%</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-iron-850">
              <span className="text-gray-400">🛡️ 물리 방어 / 피해 감소:</span>
              <span className="text-blue-300 font-bold">{totalStats.defense} / {totalStats.damageReduction}%</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-gray-400">🩸 생명력 흡수 / 회피율:</span>
              <span className="text-rose-300 font-bold">+{totalStats.lifeSteal || 0}% / {totalStats.evasion}%</span>
            </div>
          </div>

          {/* Group 2: Elemental Resistance Bar */}
          <div className="bg-iron-950 p-1.5 rounded border border-iron-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-cinzel font-black text-purple-300">
              <span>🔮 모든 원소 저항 (최대 75%)</span>
              <span className="font-mono text-amber-300 font-bold">+{currentResist}% / 75%</span>
            </div>

            <div className="w-full bg-iron-900 h-1.5 rounded-full overflow-hidden border border-iron-750">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${resistPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
              <div className="py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 font-bold">🔥 화염 +{currentResist}%</div>
              <div className="py-0.5 rounded bg-sky-950/60 border border-sky-800/80 text-sky-300 font-bold">❄️ 서리 +{currentResist}%</div>
              <div className="py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 font-bold">⚡ 전격 +{currentResist}%</div>
              <div className="py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold">🧪 맹독 +{currentResist}%</div>
            </div>
          </div>

          {/* Group 3: Utility / Skills / Drops */}
          <div className="bg-iron-950 p-1.5 rounded border border-iron-800 space-y-0.5 text-[11px] font-mono">
            <div className="flex justify-between items-center py-0.5 border-b border-iron-850">
              <span className="text-amber-300 font-bold">👑 모든 스킬 레벨:</span>
              <span className="text-amber-400 font-black">+{totalStats.allSkills || 0} Lv</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-iron-850">
              <span className="text-teal-300 font-bold">✨ MF 발견 확률:</span>
              <span className="text-teal-200 font-black">+{totalStats.fortune}%</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-yellow-300 font-bold">💰 골드 획득량:</span>
              <span className="text-yellow-200 font-black">+{totalStats.goldFind || 0}%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

CharacterModal.displayName = 'CharacterModal';


