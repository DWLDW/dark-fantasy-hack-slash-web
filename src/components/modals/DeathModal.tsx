import React, { useEffect } from 'react';
import { Skull, Swords, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGame } from '../../state/gameStore';

interface DeathModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ isOpen, onConfirm }) => {
  const { currentDungeon, currentDifficulty, enterDungeon } = useGame();

  const handleRetry = () => {
    onConfirm();
    enterDungeon(currentDungeon.id, currentDifficulty);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleRetry();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, currentDungeon, currentDifficulty]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-none animate-fade-in select-none font-sans">
      <div className="bg-iron-950 border-2 border-blood-600 rounded-xl p-3 sm:p-4 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col justify-between space-y-2.5 relative text-gray-200 overflow-hidden">
        
        {/* 💀 Top AI Death Artwork Banner (Compact 110px) */}
        <div className="relative rounded-lg overflow-hidden border border-blood-500 shadow-lg h-24 sm:h-28 flex items-end p-2.5 flex-shrink-0">
          <picture className="absolute inset-0 pointer-events-none z-0 select-none">
            <source srcSet="/images/ui/death_abyssal_defeat.webp" type="image/webp" />
            <img
              src="/images/ui/death_abyssal_defeat.jpg"
              alt="You Died"
              className="w-full h-full object-cover object-center filter brightness-85 contrast-110"
              draggable={false}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/40 to-transparent" />

          {/* Floating Skull Title */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blood-950/90 border border-blood-500 text-blood-400 shadow">
              <Skull className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-cinzel font-black text-blood-400 tracking-wider leading-tight drop-shadow">
                전사하였습니다 (YOU DIED)
              </h2>
              <div className="text-[10px] text-gray-300 font-mono">
                [{currentDungeon.name.split(':')[0]}] · Lv.{currentDifficulty}
              </div>
            </div>
          </div>
        </div>

        {/* 📜 Briefing Box */}
        <div className="p-2 bg-blood-950/40 rounded-lg border border-blood-800 text-[11px] font-mono leading-relaxed text-gray-300 text-center">
          심연의 맹렬한 공격에 쓰러졌습니다.<br />
          <span className="text-blood-300 font-bold">이번 방의 미확정 전리품은 소실되었으나, 기존 장비와 레벨은 안전합니다.</span>
        </div>

        {/* 💡 Survival Tip */}
        <div className="p-2 bg-iron-900/90 rounded-lg border border-iron-750 text-[10px] font-mono text-gray-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>팁: 마을에서 스탯([C])과 스킬([K])을 분배하고 원소 저항을 챙겨보세요.</span>
        </div>

        {/* 🎮 Bottom Action Bar: Retry (Space) vs Return Town (Esc) */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-iron-800 flex-shrink-0">
          <button
            onClick={handleRetry}
            className="w-full py-2.5 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black rounded-lg text-xs transition shadow-xl ring-1 ring-amber-300 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>즉시 재도전 [Space]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2.5 bg-iron-900 hover:bg-iron-800 border border-iron-700 text-gray-300 hover:text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>마을 귀환 [Esc]</span>
          </button>
        </div>

      </div>
    </div>
  );
};
