import React from 'react';
import { ActTheme } from '../../utils/actThemes';

interface AtmosphereLayerProps {
  act: number;
  theme: ActTheme;
  variant?: 'battle' | 'town' | 'map';
}

const PARTICLE_COUNT: Record<number, number> = {
  1: 18,
  2: 16,
  3: 20,
  4: 22,
  5: 20
};

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = React.memo(({ act, theme, variant = 'battle' }) => {
  const count = PARTICLE_COUNT[act] || 16;
  const kind = act === 4 ? 'ember' : act === 5 ? 'snow' : act === 3 ? 'spore' : act === 2 ? 'sand' : 'ash';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <div className={`absolute inset-0 opacity-70 ${theme.ambientGlow}`} />
      <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${
        act === 4
          ? 'from-orange-950/50 via-red-950/20 to-transparent'
          : act === 5
          ? 'from-cyan-950/40 via-slate-950/20 to-transparent'
          : act === 3
          ? 'from-emerald-950/40 via-transparent to-transparent'
          : act === 2
          ? 'from-amber-950/35 via-transparent to-transparent'
          : 'from-red-950/40 via-transparent to-transparent'
      }`} />
      {variant === 'battle' && (
        <div className="absolute inset-x-0 bottom-0 h-10 battlefield-floor" />
      )}
      <div className="absolute inset-0 battlefield-fog" />
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`fx-particle fx-particle-${kind}`}
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.35) % 5}s`,
            animationDuration: `${6 + (i % 5)}s`,
            opacity: 0.25 + (i % 4) * 0.12
          }}
        />
      ))}
    </div>
  );
});

AtmosphereLayer.displayName = 'AtmosphereLayer';
