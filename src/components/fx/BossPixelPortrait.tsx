import React from 'react';
import { ElementType } from '../../types/game';

interface BossPixelPortraitProps {
  name: string;
  element?: ElementType;
  signatureKey?: string;
  isEnraged?: boolean;
  isGroggy?: boolean;
  isCharging?: boolean;
  size?: number;
}

/**
 * 👾 BossPixelPortrait
 * Renders high-detail AI-generated retro dark fantasy pixel-art portraits for all Act bosses.
 * Features atmospheric breathing hover animations, glowing elemental auras, and enrage pulses.
 */
export const BossPixelPortrait: React.FC<BossPixelPortraitProps> = ({
  name,
  element = 'fire',
  signatureKey = '',
  isEnraged = false,
  isGroggy = false,
  isCharging = false,
  size = 96
}) => {
  const normName = name.toLowerCase();

  // Identify boss image path
  let imageSrc = '/images/bosses/general.jpg';
  let bossTitle = '대악마 군주';

  if (normName.includes('디아블로') || normName.includes('diablo') || signatureKey === 'red_lightning_hose') {
    imageSrc = '/images/bosses/diablo.jpg';
    bossTitle = '공포의 군주 디아블로';
  } else if (normName.includes('바알') || normName.includes('baal') || signatureKey === 'vile_clone_burn') {
    imageSrc = '/images/bosses/baal.jpg';
    bossTitle = '파멸의 군주 바알';
  } else if (normName.includes('메피스토') || normName.includes('mephisto')) {
    imageSrc = '/images/bosses/mephisto.jpg';
    bossTitle = '증오의 군주 메피스토';
  } else if (normName.includes('두리엘') || normName.includes('duriel') || signatureKey === 'holy_freeze_charge') {
    imageSrc = '/images/bosses/duriel.jpg';
    bossTitle = '고통의 대공 두리엘';
  } else if (normName.includes('안다리엘') || normName.includes('andariel') || signatureKey === 'poison_nova') {
    imageSrc = '/images/bosses/andariel.jpg';
    bossTitle = '고뇌의 여왕 안다리엘';
  } else if (normName.includes('이주얼') || normName.includes('izual') || normName.includes('천사')) {
    imageSrc = '/images/bosses/general.jpg';
    bossTitle = '타락천사 이주얼';
  }

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-300 ${
        isGroggy
          ? 'animate-bounce opacity-70 grayscale-[40%]'
          : isCharging
          ? 'animate-pulse scale-105'
          : isEnraged
          ? 'animate-shake-light scale-105'
          : 'animate-float'
      }`}
      style={{ width: size, height: size }}
    >
      {/* 🌟 Background Elemental Aura & Glow Ring */}
      <div
        className={`absolute inset-0 rounded-xl filter blur-md opacity-60 transition-colors ${
          isEnraged
            ? 'bg-red-600 scale-110 opacity-90 animate-pulse'
            : isCharging
            ? 'bg-amber-400 scale-105 opacity-80 animate-pulse'
            : element === 'fire'
            ? 'bg-orange-600'
            : element === 'cold'
            ? 'bg-cyan-500'
            : element === 'lightning'
            ? 'bg-amber-400'
            : element === 'poison'
            ? 'bg-emerald-500'
            : 'bg-purple-600'
        }`}
      />

      {/* 🖼️ Framed Pixel Art Portrait */}
      <div className={`relative w-full h-full rounded-xl overflow-hidden border-2 shadow-2xl z-10 ${
        isEnraged
          ? 'border-red-500 ring-2 ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
          : isCharging
          ? 'border-amber-400 ring-2 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.7)]'
          : 'border-iron-700 bg-iron-950 shadow-black'
      }`}>
        <img
          src={imageSrc}
          alt={bossTitle}
          className={`w-full h-full object-cover filter transition-all duration-300 ${
            isEnraged ? 'brightness-110 contrast-125' : 'brightness-95 contrast-110'
          }`}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Inner Vignette / Dark Gothic Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* State Badges over Portrait */}
        {isCharging && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-mono font-black text-[8px] uppercase tracking-wider border border-red-300 shadow animate-pulse whitespace-nowrap z-20">
            ⚡ CASTING
          </div>
        )}
        {isGroggy && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-yellow-500/90 text-iron-950 font-mono font-black text-[8px] uppercase tracking-wider border border-yellow-200 shadow whitespace-nowrap z-20">
            💫 GROGGY
          </div>
        )}
        {isEnraged && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-blood-600 text-white font-mono font-black text-[8px] uppercase tracking-wider border border-blood-300 shadow animate-pulse whitespace-nowrap z-20">
            🔥 ENRAGED
          </div>
        )}
      </div>

      {/* Runic Corners / Decorative Edge Accents */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

      {/* ⚡ Enraged / Charging Lightning Sparks */}
      {(isEnraged || isCharging) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          <span className="text-sm sm:text-base animate-ping absolute -top-1 -right-1">⚡</span>
          <span className="text-sm sm:text-base animate-ping absolute -bottom-1 -left-1">🔥</span>
        </div>
      )}
    </div>
  );
};
