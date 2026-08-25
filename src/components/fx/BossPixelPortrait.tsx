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
 * Renders retro dark fantasy pixel-art SVG busts/sprites for all Act bosses and dungeon leaders.
 * Features breathing hover animations, glowing eyes, and elemental rage particle auras.
 */
export const BossPixelPortrait: React.FC<BossPixelPortraitProps> = ({
  name,
  element = 'fire',
  signatureKey = '',
  isEnraged = false,
  isGroggy = false,
  isCharging = false,
  size = 100
}) => {
  const normName = name.toLowerCase();

  // Identify boss archetype
  const isDiablo = normName.includes('디아블로') || normName.includes('diablo') || signatureKey === 'red_lightning_hose';
  const isBaal = normName.includes('바알') || normName.includes('baal') || signatureKey === 'vile_clone_burn';
  const isMephisto = normName.includes('메피스토') || normName.includes('mephisto');
  const isDuriel = normName.includes('두리엘') || normName.includes('duriel') || signatureKey === 'holy_freeze_charge';
  const isAndariel = normName.includes('안다리엘') || normName.includes('andariel') || signatureKey === 'poison_nova';
  const isIzual = normName.includes('이주얼') || normName.includes('izual') || normName.includes('천사');

  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-300 ${
        isGroggy
          ? 'animate-bounce opacity-70 grayscale-[30%]'
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
        className={`absolute inset-1 rounded-full filter blur-md opacity-40 transition-colors ${
          isEnraged
            ? 'bg-red-600 scale-110 opacity-70'
            : isCharging
            ? 'bg-amber-400 scale-105 opacity-60'
            : element === 'fire'
            ? 'bg-orange-600'
            : element === 'cold'
            ? 'bg-cyan-500'
            : element === 'lightning'
            ? 'bg-yellow-400'
            : element === 'poison'
            ? 'bg-emerald-500'
            : element === 'void'
            ? 'bg-purple-600'
            : 'bg-stone-500'
        }`}
      />

      {/* 👑 DIABLO - Lord of Terror */}
      {isDiablo ? (
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]" shapeRendering="crispEdges">
          {/* Horns */}
          <path d="M 12 18 L 16 10 L 22 14 L 20 20 Z M 52 18 L 48 10 L 42 14 L 44 20 Z" fill="#450a0a" />
          <path d="M 14 16 L 18 10 L 22 14 Z M 50 16 L 46 10 L 42 14 Z" fill="#991b1b" />
          {/* Giant Crown Horns */}
          <path d="M 8 26 L 14 12 L 20 24 Z M 56 26 L 50 12 L 44 24 Z" fill="#262626" />
          <path d="M 10 24 L 14 14 L 18 22 Z M 54 24 L 50 14 L 46 22 Z" fill="#7f1d1d" />
          {/* Shoulders & Spikes */}
          <path d="M 6 42 L 14 34 L 20 44 L 12 56 Z M 58 42 L 50 34 L 44 44 L 52 56 Z" fill="#7f1d1d" />
          <path d="M 4 40 L 10 32 L 14 42 Z M 60 40 L 54 32 L 50 42 Z" fill="#1c1917" />
          {/* Torso & Fiery Chest Core */}
          <path d="M 18 36 L 46 36 L 42 60 L 22 60 Z" fill="#991b1b" />
          <path d="M 24 40 L 40 40 L 36 56 L 28 56 Z" fill="#dc2626" />
          <path d="M 28 44 L 36 44 L 34 52 L 30 52 Z" fill="#f59e0b" />
          <path d="M 30 46 L 34 46 L 33 50 L 31 50 Z" fill="#ffffff" />
          {/* Demon Head & Jaw */}
          <path d="M 20 20 L 44 20 L 40 38 L 24 38 Z" fill="#7f1d1d" />
          <path d="M 24 24 L 40 24 L 38 36 L 26 36 Z" fill="#991b1b" />
          <path d="M 26 34 L 38 34 L 36 40 L 28 40 Z" fill="#450a0a" />
          {/* Sharp Fangs */}
          <rect x="28" y="34" width="2" height="3" fill="#ffffff" />
          <rect x="34" y="34" width="2" height="3" fill="#ffffff" />
          <rect x="30" y="38" width="2" height="2" fill="#ffffff" />
          <rect x="32" y="38" width="2" height="2" fill="#ffffff" />
          {/* Glowing Eyes */}
          <rect x="25" y="26" width="4" height="3" fill={isEnraged ? '#ffffff' : '#fef08a'} />
          <rect x="35" y="26" width="4" height="3" fill={isEnraged ? '#ffffff' : '#fef08a'} />
          <rect x="26" y="27" width="2" height="2" fill="#ef4444" />
          <rect x="36" y="27" width="2" height="2" fill="#ef4444" />
        </svg>
      ) : isBaal ? (
        // 🐙 BAAL - Lord of Destruction
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]" shapeRendering="crispEdges">
          {/* 4 Destruction Tentacles */}
          <path d="M 6 12 Q 2 28, 14 38 L 10 32 Q 6 22, 10 14 Z" fill="#581c87" />
          <path d="M 58 12 Q 62 28, 50 38 L 54 32 Q 58 22, 54 14 Z" fill="#581c87" />
          <path d="M 2 34 Q 8 50, 18 56 L 14 50 Q 8 42, 6 34 Z" fill="#3b0764" />
          <path d="M 62 34 Q 56 50, 46 56 L 50 50 Q 56 42, 58 34 Z" fill="#3b0764" />
          {/* Golden Crown Horns */}
          <polygon points="20,12 24,4 28,12 32,2 36,12 40,4 44,12 32,16" fill="#d97706" />
          <polygon points="24,10 32,5 40,10 32,14" fill="#fde047" />
          {/* Twisted Face & Beard Tendrils */}
          <path d="M 18 16 L 46 16 L 42 42 L 22 42 Z" fill="#6b21a8" />
          <path d="M 22 20 L 42 20 L 38 38 L 26 38 Z" fill="#9333ea" />
          {/* Void Eyes (4 Eyes) */}
          <rect x="24" y="22" width="3" height="3" fill="#facc15" />
          <rect x="37" y="22" width="3" height="3" fill="#facc15" />
          <rect x="25" y="28" width="3" height="2" fill="#38bdf8" />
          <rect x="36" y="28" width="3" height="2" fill="#38bdf8" />
          {/* Demon Chest & Spikes */}
          <path d="M 16 42 L 48 42 L 44 62 L 20 62 Z" fill="#3b0764" />
          <path d="M 24 46 L 40 46 L 36 58 L 28 58 Z" fill="#581c87" />
        </svg>
      ) : isMephisto ? (
        // 💀 MEPHISTO - Lord of Hatred
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(56,189,248,0.9)]" shapeRendering="crispEdges">
          {/* Skeletal Wings */}
          <path d="M 4 20 L 18 14 L 14 30 L 6 42 Z" fill="#0369a1" />
          <path d="M 60 20 L 46 14 L 50 30 L 58 42 Z" fill="#0369a1" />
          <path d="M 8 22 L 16 16 L 12 32 Z" fill="#38bdf8" />
          <path d="M 56 22 L 48 16 L 52 32 Z" fill="#38bdf8" />
          {/* Floating Spine Ribs */}
          <path d="M 24 38 L 40 38 L 38 58 L 26 58 Z" fill="#0f172a" />
          <line x1="20" y1="42" x2="44" y2="42" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="22" y1="48" x2="42" y2="48" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="24" y1="54" x2="40" y2="54" stroke="#94a3b8" strokeWidth="2" />
          {/* Horned Skull */}
          <path d="M 16 10 L 22 6 L 24 16 Z" fill="#e2e8f0" />
          <path d="M 48 10 L 42 6 L 40 16 Z" fill="#e2e8f0" />
          <rect x="22" y="12" width="20" height="20" fill="#f8fafc" rx="2" />
          <rect x="24" y="26" width="16" height="8" fill="#e2e8f0" />
          {/* Cold Blue Burning Eye Sockets */}
          <rect x="25" y="18" width="5" height="5" fill="#0284c7" />
          <rect x="34" y="18" width="5" height="5" fill="#0284c7" />
          <rect x="26" y="19" width="3" height="3" fill="#ffffff" />
          <rect x="35" y="19" width="3" height="3" fill="#ffffff" />
        </svg>
      ) : isDuriel ? (
        // 🪲 DURIEL - Prince of Pain
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(6,182,212,0.9)]" shapeRendering="crispEdges">
          {/* Giant Ice Pincer Claws */}
          <path d="M 4 28 Q 2 8, 18 10 L 16 18 Q 8 16 10 32 Z" fill="#0284c7" />
          <path d="M 60 28 Q 62 8, 46 10 L 48 18 Q 56 16 54 32 Z" fill="#0284c7" />
          <path d="M 6 24 Q 6 12, 16 12 L 14 18 Z" fill="#38bdf8" />
          <path d="M 58 24 Q 58 12, 48 12 L 50 18 Z" fill="#38bdf8" />
          {/* Massive Grub Carapace */}
          <ellipse cx="32" cy="42" rx="20" ry="16" fill="#854d0e" />
          <ellipse cx="32" cy="42" rx="16" ry="12" fill="#ca8a04" />
          <ellipse cx="32" cy="42" rx="10" ry="8" fill="#eab308" />
          {/* Monster Head & Mandibles */}
          <circle cx="32" cy="24" r="12" fill="#713f12" />
          <rect x="24" y="26" width="4" height="8" fill="#fef08a" transform="rotate(-15 24 26)" />
          <rect x="36" y="26" width="4" height="8" fill="#fef08a" transform="rotate(15 36 26)" />
          {/* Multiple Insect Eyes */}
          <circle cx="26" cy="20" r="2" fill="#06b6d4" />
          <circle cx="38" cy="20" r="2" fill="#06b6d4" />
          <circle cx="29" cy="18" r="1.5" fill="#38bdf8" />
          <circle cx="35" cy="18" r="1.5" fill="#38bdf8" />
        </svg>
      ) : isAndariel ? (
        // 🕷️ ANDARIEL - Maiden of Anguish
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(16,185,129,0.9)]" shapeRendering="crispEdges">
          {/* 4 Poison Stinger Appendages */}
          <path d="M 8 16 Q 16 2, 22 14 L 18 16 Q 14 8 10 18 Z" fill="#064e3b" />
          <path d="M 56 16 Q 48 2, 42 14 L 46 16 Q 50 8 54 18 Z" fill="#064e3b" />
          <path d="M 4 36 Q 10 20, 18 30 L 14 32 Q 8 26 6 38 Z" fill="#047857" />
          <path d="M 60 36 Q 54 20, 46 30 L 50 32 Q 56 26 58 38 Z" fill="#047857" />
          {/* Flaming Red Hair */}
          <path d="M 20 12 Q 32 4, 44 12 L 46 28 L 18 28 Z" fill="#b91c1c" />
          <path d="M 22 14 Q 32 8, 42 14 L 44 26 L 20 26 Z" fill="#dc2626" />
          {/* Torso & Chitin Bodice */}
          <path d="M 22 32 L 42 32 L 38 58 L 26 58 Z" fill="#1c1917" />
          <path d="M 26 36 L 38 36 L 36 52 L 28 52 Z" fill="#065f46" />
          {/* Face & Piercing Eyes */}
          <rect x="25" y="20" width="14" height="14" fill="#fecdd3" rx="2" />
          <rect x="27" y="24" width="3" height="3" fill="#10b981" />
          <rect x="34" y="24" width="3" height="3" fill="#10b981" />
          <rect x="29" y="30" width="6" height="2" fill="#881337" />
        </svg>
      ) : isIzual ? (
        // 🪽 IZUAL - The Fallen Angel
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(56,189,248,0.9)]" shapeRendering="crispEdges">
          {/* Torn Angelic Wings */}
          <path d="M 6 14 Q 18 10, 20 32 L 14 36 Q 10 20, 4 22 Z" fill="#0284c7" />
          <path d="M 58 14 Q 46 10, 44 32 L 50 36 Q 54 20, 60 22 Z" fill="#0284c7" />
          <path d="M 8 16 Q 16 12, 18 30 Z" fill="#e0f2fe" />
          <path d="M 56 16 Q 48 12, 46 30 Z" fill="#e0f2fe" />
          {/* Corrupted Plate Armor */}
          <path d="M 20 26 L 44 26 L 40 58 L 24 58 Z" fill="#0f172a" />
          <path d="M 24 30 L 40 30 L 38 52 L 26 52 Z" fill="#1e293b" />
          {/* Helm & Cyan Visor */}
          <polygon points="32,8 42,20 38,28 26,28 22,20" fill="#334155" />
          <rect x="26" y="18" width="12" height="4" fill="#38bdf8" />
        </svg>
      ) : (
        // 🧟 GENERAL BOSS / DEMON ARCHETYPE
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_14px_rgba(245,158,11,0.9)]" shapeRendering="crispEdges">
          {/* Crown */}
          <polygon points="20,14 24,6 28,12 32,4 36,12 40,6 44,14 32,18" fill="#f59e0b" />
          {/* Shoulders */}
          <path d="M 12 36 L 22 28 L 42 28 L 52 36 L 46 60 L 18 60 Z" fill="#1e293b" />
          <path d="M 20 34 L 44 34 L 40 54 L 24 54 Z" fill="#334155" />
          {/* Boss Head */}
          <rect x="22" y="16" width="20" height="18" fill="#475569" rx="3" />
          {/* Glowing Eyes */}
          <rect x="25" y="22" width="4" height="4" fill={element === 'poison' ? '#10b981' : element === 'cold' ? '#38bdf8' : '#f59e0b'} />
          <rect x="35" y="22" width="4" height="4" fill={element === 'poison' ? '#10b981' : element === 'cold' ? '#38bdf8' : '#f59e0b'} />
          <rect x="26" y="23" width="2" height="2" fill="#ffffff" />
          <rect x="36" y="23" width="2" height="2" fill="#ffffff" />
        </svg>
      )}

      {/* ⚡ Enraged / Charging Lightning Sparks */}
      {(isEnraged || isCharging) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span className="text-sm sm:text-base animate-ping absolute -top-1 -right-1">⚡</span>
          <span className="text-sm sm:text-base animate-ping absolute -bottom-1 -left-1">🔥</span>
        </div>
      )}
    </div>
  );
};
