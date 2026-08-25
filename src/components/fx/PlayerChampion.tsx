import React from 'react';

interface PlayerChampionProps {
  isAttacking?: boolean;
  compact?: boolean;
  showLabel?: boolean;
}

export const PlayerChampion: React.FC<PlayerChampionProps> = React.memo(({
  isAttacking,
  compact,
  showLabel = true
}) => {
  const src = isAttacking ? '/images/player/berserker_slash.png' : '/images/player/berserker_idle.png';
  const h = compact ? 52 : 72;

  return (
    <div className={`relative flex flex-col items-center justify-end ${isAttacking ? 'champion-slash' : 'champion-idle'}`}>
      <img
        src={src}
        alt="광전사"
        draggable={false}
        className="pixel-sprite pointer-events-none select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
        style={{ height: h, width: 'auto' }}
      />
      {showLabel && (
        <span className="absolute -bottom-0.5 text-[8px] font-black tracking-widest text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          YOU
        </span>
      )}
    </div>
  );
});

PlayerChampion.displayName = 'PlayerChampion';
