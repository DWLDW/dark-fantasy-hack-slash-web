import React, { useEffect, useState } from 'react';
import { ElementType } from '../../types/game';

export interface BossUltimateFxEvent {
  id: string;
  sigKey: string;
  element: ElementType;
  bossName: string;
}

interface BossUltimateFxLayerProps {
  event: BossUltimateFxEvent | null;
}

export const BossUltimateFxLayer: React.FC<BossUltimateFxLayerProps> = React.memo(({ event }) => {
  const [active, setActive] = useState<BossUltimateFxEvent | null>(null);

  useEffect(() => {
    if (!event) return;
    setActive(event);
    const t = setTimeout(() => setActive(null), 950);
    return () => clearTimeout(t);
  }, [event]);

  if (!active) return null;

  const { sigKey, element } = active;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none" aria-hidden>
      {/* 👹 1. Diablo Red Lightning Hose Laser Beam */}
      {(sigKey === 'red_lightning_hose' || element === 'fire') && (
        <div className="absolute inset-0 flex items-center justify-center animate-boss-laser-beam">
          {/* Main Giant Pillar of Hellfire Laser */}
          <div className="w-28 sm:w-44 h-full bg-gradient-to-r from-red-600 via-yellow-200 to-red-600 opacity-90 shadow-[0_0_80px_rgba(239,68,68,1)]" />
          <div className="absolute w-12 sm:w-20 h-full bg-white opacity-95 filter blur-xs" />
          {/* Searing Electric Arcs */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
            <path d="M 200 0 Q 150 150, 220 300 T 180 600" fill="none" stroke="#fef08a" strokeWidth="8" filter="drop-shadow(0 0 15px #ef4444)" />
            <path d="M 200 0 Q 250 200, 170 400 T 230 600" fill="none" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
      )}

      {/* 🦂 2. Andariel Poison Nova Expanding Waves */}
      {sigKey === 'poison_nova' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full border-8 border-emerald-400 animate-poison-nova-ring shadow-[0_0_60px_rgba(16,185,129,1)]" />
          <div className="w-64 h-64 sm:w-96 sm:h-96 rounded-full border-4 border-teal-300 animate-poison-nova-ring [animation-delay:150ms] opacity-80" />
          <div className="w-80 h-80 sm:w-[32rem] sm:h-[32rem] rounded-full border-2 border-emerald-200 animate-poison-nova-ring [animation-delay:300ms] opacity-60" />
        </div>
      )}

      {/* 🪲 3. Duriel / Izual Freeze Shatter Crystals */}
      {(sigKey === 'holy_freeze_charge' || sigKey === 'frozen_blade' || element === 'cold') && (
        <div className="absolute inset-0 flex items-center justify-center animate-freeze-shatter">
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {/* Giant Ice Spikes Crashing Across the Lanes */}
            <polygon points="200,40 230,180 200,320 170,180" fill="url(#iceGrad)" filter="drop-shadow(0 0 25px #06b6d4)" />
            <polygon points="100,100 130,220 90,340 70,220" fill="url(#iceGrad)" filter="drop-shadow(0 0 20px #0891b2)" />
            <polygon points="300,90 330,230 310,350 270,210" fill="url(#iceGrad)" filter="drop-shadow(0 0 20px #0891b2)" />
          </svg>
        </div>
      )}

      {/* 🐙 4. Baal Void Abyss Rift */}
      {(sigKey === 'vile_clone_burn' || element === 'void') && (
        <div className="absolute inset-0 flex items-center justify-center animate-void-rift">
          <div className="w-64 sm:w-96 h-40 sm:h-56 rounded-full bg-gradient-to-r from-purple-950 via-fuchsia-600 to-purple-950 border-4 border-purple-300 shadow-[0_0_80px_rgba(168,85,247,0.95)] opacity-85" />
          <div className="absolute w-24 sm:w-36 h-24 sm:h-36 rounded-full bg-black border-2 border-fuchsia-400 animate-pulse shadow-[inset_0_0_30px_rgba(217,70,239,1)]" />
        </div>
      )}
    </div>
  );
});

BossUltimateFxLayer.displayName = 'BossUltimateFxLayer';
