import React, { useEffect, useState, useMemo } from 'react';
import { Skull, ShieldAlert, Home, ArrowRight, Lightbulb, Sparkles, Swords, Shield, HeartPulse, RefreshCw } from 'lucide-react';

interface DeathModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const SURVIVAL_TIPS = [
  {
    icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    title: '스킬 & 스탯 강화',
    desc: '던전 난이도가 버겁다면 레벨업으로 얻은 스킬 포인트([K])와 스탯([C])을 적극 투자하고 더 강력한 장비를 착용해보세요.'
  },
  {
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    title: '강력한 룬워드 제작',
    desc: '소켓(홈)이 있는 베이스 장비에 룬을 순서대로 조합하면 전설급 능력치를 가진 강력한 [룬워드]를 제작할 수 있습니다.'
  },
  {
    icon: <Swords className="w-4 h-4 text-rose-400" />,
    title: '진형별 전술 스킬 활용',
    desc: '몬스터가 세로로 집중 돌파해올 땐 [가르기/처형] 같은 직선 관통기를, 가로 횡대로 포진할 땐 [휩쓸기/휠윈드]를 사용하세요.'
  },
  {
    icon: <HeartPulse className="w-4 h-4 text-emerald-400" />,
    title: '호라드릭 영구 강화',
    desc: '마을 호라드릭 시설에서 [물약 가방 용량]과 [물약 회복량]을 영구 강화하면 던전 생존율이 획기적으로 상승합니다.'
  },
  {
    icon: <Shield className="w-4 h-4 text-blue-400" />,
    title: '방어력 & 원소 저항력 세팅',
    desc: '상위 액트와 고티어 대균열에서는 방어력뿐만 아니라 [모든 원소 저항력]과 [피해 감소율] 옵션을 꼭 챙겨야 합니다.'
  }
];

export const DeathModal: React.FC<DeathModalProps> = ({ isOpen, onConfirm }) => {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * SURVIVAL_TIPS.length));

  useEffect(() => {
    if (isOpen) {
      setTipIndex(Math.floor(Math.random() * SURVIVAL_TIPS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  const currentTip = SURVIVAL_TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none font-sans">
      <div className="bg-gradient-to-b from-blood-950 via-iron-950 to-iron-950 border-2 border-blood-600 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center space-y-3 sm:space-y-4 relative text-gray-200">
        
        {/* Skull Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-blood-900/60 border-2 border-blood-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          <Skull className="w-8 h-8 sm:w-9 sm:h-9 text-blood-300 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-cinzel font-black text-blood-400 tracking-wider">
            사망했습니다
          </h2>
          <div className="text-xs font-mono text-blood-200 uppercase tracking-widest mt-0.5">
            YOU DIED
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
          몬스터 군단의 맹렬한 공격에 쓰러졌습니다.<br />
          <strong className="text-blood-400 font-bold">이번 원정에서 획득한 미확정 전리품(장비, 룬, 골드)을 잃었습니다.</strong>
        </p>

        {/* Loss vs Preserved Infobox */}
        <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-blood-950/70 border border-blood-800/80 text-blood-300">
            <div className="font-bold text-blood-400 mb-0.5">❌ 손실된 항목:</div>
            <div>이번 원정 미확정 전리품</div>
          </div>
          <div className="p-2 rounded-lg bg-iron-950/80 border border-emerald-800/60 text-emerald-300">
            <div className="font-bold text-emerald-400 mb-0.5">🛡️ 안전 보존:</div>
            <div>기존 장비, 레벨, 골드, EXP</div>
          </div>
        </div>

        {/* 💡 Survival Tip Guide Box */}
        <div className="p-3 bg-iron-900/90 rounded-xl border border-brass-600/60 text-left space-y-1.5 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-cinzel font-black text-xs text-amber-300">
              {currentTip.icon}
              <span>성역 생존 가이드: {currentTip.title}</span>
            </div>
            <button
              onClick={() => setTipIndex((prev) => (prev + 1) % SURVIVAL_TIPS.length)}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer"
              title="다른 팁 보기"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] font-mono text-gray-300 leading-relaxed">
            {currentTip.desc}
          </p>
        </div>

        {/* Action Buttons: Return to Town vs Instant Retry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="w-full py-2.5 bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-200 font-cinzel font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition transform active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-brass-400" />
            <span>마을로 귀환</span>
            <kbd className="px-1.5 py-0.2 rounded bg-iron-950 text-gray-400 text-[10px] font-mono border border-iron-800">
              Esc
            </kbd>
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2.5 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-cinzel font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition transform active:scale-95 cursor-pointer ring-1 ring-blood-400"
          >
            <span>확인 후 부활</span>
            <kbd className="px-1.5 py-0.2 rounded bg-blood-950 text-blood-200 text-[10px] font-mono border border-blood-400">
              Space
            </kbd>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};
