import React from 'react';
import { Skull, ShieldAlert, Home, ArrowRight } from 'lucide-react';

interface DeathModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-gradient-to-b from-blood-950 via-iron-950 to-iron-950 border-2 border-blood-600 rounded-xl p-5 md:p-7 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center space-y-4 relative">
        
        {/* Skull Pulse Icon */}
        <div className="w-16 h-16 mx-auto bg-blood-900/60 border-2 border-blood-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-bounce">
          <Skull className="w-9 h-9 text-blood-300" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-cinzel font-black text-blood-400 tracking-wider">
            사망했습니다
          </h2>
          <div className="text-xs font-mono text-blood-200 uppercase tracking-widest mt-1">
            YOU DIED
          </div>
        </div>

        <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium">
          몬스터 군단의 맹렬한 공격에 쓰러졌습니다.<br />
          던전 탐험에 실패하여 <strong className="text-blood-400 font-bold">이번 원정에서 획득한 모든 전리품(장비, 룬, 골드)을 잃었습니다.</strong>
        </p>

        <div className="p-3 bg-iron-900/80 rounded-lg border border-iron-750 text-xs font-mono text-gray-300 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>부활 치료 혜택:</span>
          </div>
          <div className="text-emerald-300">• 마을 복귀 시 <strong className="text-white font-black">생명력 100% (완전 회복)</strong> 상태로 소생</div>
          <div className="text-purple-300">• 생명력 물약 5개 무료 자동 리필 지급</div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-3.5 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 hover:from-blood-600 hover:to-blood-400 text-white font-black rounded-lg text-sm md:text-base flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 animate-pulse"
        >
          <Home className="w-4 h-4" />
          <span>마을로 귀환하기 (체력 100% 회복)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
