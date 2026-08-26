import React from 'react';
import { ActTheme } from '../../utils/actThemes';

interface AtmosphereLayerProps {
  act: number;
  theme: ActTheme;
  variant?: 'battle' | 'town' | 'map';
}

const PARTICLE_COUNT: Record<number, number> = {
  1: 6,
  2: 5,
  3: 6,
  4: 6,
  5: 5
};

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = React.memo(({ act, theme, variant = 'battle' }) => {
  const count = PARTICLE_COUNT[act] || 5;
  const kind = act === 4 ? 'ember' : act === 5 ? 'snow' : act === 3 ? 'spore' : act === 2 ? 'sand' : 'ash';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Soft Ambient Tint (Restful to eyes) */}
      <div className={`absolute inset-0 opacity-20 ${theme.ambientGlow}`} />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      {variant === 'battle' && (
        <div className="absolute inset-x-0 bottom-0 h-8 battlefield-floor opacity-40" />
      )}
      <div className="absolute inset-0 battlefield-fog opacity-30" />
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`fx-particle fx-particle-${kind}`}
          style={{
            left: `${(i * 37 + 10) % 100}%`,
            animationDelay: `${(i * 0.8) % 6}s`,
            animationDuration: `${7 + (i % 3)}s`,
            opacity: 0.20 + (i % 3) * 0.10
          }}
        />
      ))}
    </div>
  );
});

AtmosphereLayer.displayName = 'AtmosphereLayer';
