import React from 'react';
import { useGame } from '../../../state/gameStore';

/**
 * PlayerHitFlash — Full-screen damage vignette + floating damage number
 * Fires whenever the player takes damage (boss telegraph, hazard terrain, horde counter).
 * Creates visceral "I just got hit" feedback.
 */
export const PlayerHitFlash: React.FC = React.memo(() => {
  const { playerHitFlash } = useGame();

  if (!playerHitFlash) return null;

  const isHeavy = playerHitFlash.damage >= 30;

  return (
    <div key={playerHitFlash.id} className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Red edge vignette flash */}
      <div className={`absolute inset-0 animate-player-hit-flash ${
        isHeavy
          ? 'shadow-[inset_0_0_120px_60px_rgba(185,28,28,0.85)]'
          : 'shadow-[inset_0_0_90px_35px_rgba(185,28,28,0.55)]'
      }`} />

      {/* Center-screen damage number */}
      <div className="absolute inset-x-0 top-[38%] flex justify-center">
        <span className={`font-mono font-black drop-shadow-[0_3px_10px_rgba(0,0,0,1)] animate-player-hit-number ${
          isHeavy ? 'text-5xl sm:text-7xl text-red-400' : 'text-4xl sm:text-5xl text-red-300'
        }`}>
          -{playerHitFlash.damage}
        </span>
      </div>

      {/* Heavy hit: screen shake */}
      {isHeavy && (
        <div className="absolute inset-0 bg-red-900/20 animate-shake-heavy" />
      )}
    </div>
  );
});

PlayerHitFlash.displayName = 'PlayerHitFlash';

