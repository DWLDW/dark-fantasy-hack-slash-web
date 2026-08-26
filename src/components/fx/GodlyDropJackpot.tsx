import React, { useEffect, useState } from 'react';
import { Sparkles, Crown, Zap, Flame } from 'lucide-react';

export const HIGH_TIER_GODLY_ITEMS = [
  '할아버지 (The Grandfather)',
  '할배검',
  '바람살 (Windforce)',
  '할리퀸 관모 (Shako)',
  '폭풍막이 (Stormshield)',
  '조단의 반지 (Stone of Jordan)',
  '마라의 만화경 (Mara)',
  '불사조',
  '수수께끼',
  '무한',
  '슬픔 (Grief)'
];

export const HIGH_TIER_RUNES = ['Ber', 'Jah', 'Zod', 'Lo', 'Ohm', 'Sur', 'Cham'];

export function isGodlyDropItem(name?: string, runeName?: string): boolean {
  if (runeName && HIGH_TIER_RUNES.includes(runeName)) return true;
  if (!name) return false;
  return HIGH_TIER_GODLY_ITEMS.some(godly => name.includes(godly) || godly.includes(name));
}

interface GodlyDropJackpotProps {
  title?: string;
  name: string;
  type: 'item' | 'rune';
  onDismiss?: () => void;
}

export const GodlyDropJackpot: React.FC<GodlyDropJackpotProps> = ({
  title,
  name,
  type,
  onDismiss
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  const isRune = type === 'rune';

  return (
    <div className="fixed inset-0 z-55 pointer-events-none flex items-center justify-center select-none overflow-hidden" aria-hidden>
      {/* 🌟 1. Fullscreen Golden/Violet Godly Light Pillar & Radial Flare */}
      <div className={`absolute inset-0 ${isRune ? 'bg-purple-950/40' : 'bg-amber-950/40'} animate-pulse backdrop-blur-[1px]`} />
      <div className={`absolute inset-0 bg-gradient-to-t ${isRune ? 'from-purple-900/30 via-transparent to-purple-900/30' : 'from-amber-600/30 via-transparent to-amber-600/30'}`} />

      {/* 🌟 2. Rotating God Rays Backdrop */}
      <div className="absolute w-[180vw] h-[180vw] opacity-35 animate-spin-slow pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke={isRune ? '#c084fc' : '#fbbf24'} strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 🌟 3. Main Center Godly Jackpot Banner */}
      <div className={`relative z-60 max-w-lg w-[90%] p-4 sm:p-6 rounded-2xl border-4 ${
        isRune
          ? 'bg-gradient-to-b from-iron-950 via-purple-950 to-iron-950 border-purple-400 shadow-[0_0_60px_rgba(192,132,252,0.8)]'
          : 'bg-gradient-to-b from-iron-950 via-amber-950 to-iron-950 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.85)]'
      } flex flex-col items-center justify-center text-center space-y-2 animate-bounce-subtle`}>
        
        {/* Top Header Badge */}
        <div className="flex items-center gap-1.5 font-cinzel text-xs sm:text-sm font-black tracking-widest uppercase">
          <Crown className={`w-4 h-4 sm:w-5 sm:h-5 ${isRune ? 'text-purple-300' : 'text-yellow-300'} animate-bounce`} />
          <span className={isRune ? 'text-purple-200' : 'text-amber-200'}>
            {title || '🌟 신화적 전설의 보물 획득! 🌟'}
          </span>
          <Crown className={`w-4 h-4 sm:w-5 sm:h-5 ${isRune ? 'text-purple-300' : 'text-yellow-300'} animate-bounce`} />
        </div>

        {/* Item Name Headline with Glow */}
        <div className="py-1">
          <h1 className={`text-xl sm:text-3xl font-cinzel font-black tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,1)] ${
            isRune ? 'text-purple-300' : 'text-yellow-300'
          }`}>
            {isRune ? `🔮 ${name} 룬` : `⚔️ ${name}`}
          </h1>
        </div>

        {/* Subtitle Praise */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-gray-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>성역의 대악마들을 공포에 떨게 할 절대적인 전리품입니다!</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Bottom Particle Beam */}
        <div className="w-full flex items-center justify-center gap-1 pt-1 text-[10px] font-mono text-amber-300 opacity-90">
          <span>[전설 잭팟 연출]</span>
        </div>
      </div>
    </div>
  );
};
