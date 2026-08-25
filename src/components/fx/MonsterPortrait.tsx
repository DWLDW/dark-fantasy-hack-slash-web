import React from 'react';
import { MonsterRank, ElementType } from '../../types/game';
import { ARCHETYPE_VISUALS, getMonsterArchetype, MonsterArchetype } from '../../utils/monsterVisuals';

interface MonsterPortraitProps {
  icon?: string;
  name?: string;
  rank?: MonsterRank;
  element?: ElementType;
  size?: number;
  isEnraged?: boolean;
  isFrozen?: boolean;
  isDying?: boolean;
}

const Eyes: React.FC<{ cx: number; cy: number; gap: number; color: string; r?: number }> = ({
  cx, cy, gap, color, r = 2.1
}) => (
  <>
    <circle cx={cx - gap} cy={cy} r={r} fill={color}>
      <animate attributeName="opacity" values="1;0.45;1" dur="1.6s" repeatCount="indefinite" />
    </circle>
    <circle cx={cx + gap} cy={cy} r={r} fill={color}>
      <animate attributeName="opacity" values="1;0.45;1" dur="1.6s" repeatCount="indefinite" />
    </circle>
    <circle cx={cx - gap} cy={cy} r={r * 0.35} fill="#fff" />
    <circle cx={cx + gap} cy={cy} r={r * 0.35} fill="#fff" />
  </>
);

const BodyByArchetype: React.FC<{ type: MonsterArchetype; v: typeof ARCHETYPE_VISUALS[MonsterArchetype] }> = ({ type, v }) => {
  switch (type) {
    case 'goblin':
      return (
        <>
          <ellipse cx="16" cy="22" rx="8.5" ry="7" fill={v.skin} />
          <circle cx="16" cy="13" r="8" fill={v.skin} />
          <path d="M7 10 L4 4 L10 8 Z" fill={v.skin} />
          <path d="M25 10 L28 4 L22 8 Z" fill={v.skin} />
          <path d="M10 16 Q16 20 22 16" stroke={v.accent} strokeWidth="1.2" fill="none" />
          <path d="M12 18 L11 20 M20 18 L21 20" stroke="#f8fafc" strokeWidth="1.1" />
          <Eyes cx={16} cy={12.5} gap={3.4} color={v.eye} />
        </>
      );
    case 'skeleton':
      return (
        <>
          <ellipse cx="16" cy="24" rx="7" ry="5.5" fill={v.skin} />
          <rect x="13.2" y="18" width="5.6" height="6" rx="1" fill={v.skin} />
          <circle cx="16" cy="12" r="8" fill={v.skin} />
          <ellipse cx="13" cy="12" rx="2.6" ry="3.2" fill="#0b1220" />
          <ellipse cx="19" cy="12" rx="2.6" ry="3.2" fill="#0b1220" />
          <circle cx="13" cy="12.4" r="1.1" fill={v.eye} />
          <circle cx="19" cy="12.4" r="1.1" fill={v.eye} />
          <path d="M12 17.5 Q16 20 20 17.5" stroke={v.accent} strokeWidth="1.2" fill="none" />
          <path d="M11 22 H21 M11 24.5 H21" stroke={v.accent} strokeWidth="0.8" />
        </>
      );
    case 'zombie':
      return (
        <>
          <ellipse cx="16" cy="23" rx="8.5" ry="7" fill={v.skin} />
          <circle cx="16" cy="13" r="8.2" fill={v.skin} />
          <path d="M8 10 Q6 6 10 8" fill="#4b3a28" />
          <path d="M10 16 Q16 14 22 18" stroke="#3f2a1c" strokeWidth="1.4" fill="none" />
          <Eyes cx={16} cy={12} gap={3.6} color={v.eye} r={2.3} />
          <path d="M13 18 L19 19" stroke="#7f1d1d" strokeWidth="1.4" />
        </>
      );
    case 'orc':
      return (
        <>
          <ellipse cx="16" cy="23" rx="9" ry="7.2" fill={v.skin} />
          <circle cx="16" cy="13.5" r="8.6" fill={v.skin} />
          <path d="M6 12 L3 7 L11 10 Z" fill={v.accent} />
          <path d="M26 12 L29 7 L21 10 Z" fill={v.accent} />
          <path d="M11 19 L9 22 L12 20 M21 19 L23 22 L20 20" fill="#f8fafc" />
          <rect x="10" y="8.5" width="12" height="3" rx="1" fill={v.accent} />
          <Eyes cx={16} cy={13} gap={3.8} color={v.eye} r={2.4} />
        </>
      );
    case 'archer':
      return (
        <>
          <ellipse cx="16" cy="23.5" rx="8" ry="6.5" fill={v.skin} />
          <circle cx="16" cy="13" r="7.4" fill="#3f2a22" />
          <path d="M8 12 Q16 4 24 12 L22 14 Q16 8 10 14 Z" fill="#1c1917" />
          <path d="M25 8 Q30 16 25 24" stroke="#b45309" strokeWidth="1.6" fill="none" />
          <line x1="25" y1="8" x2="25" y2="24" stroke="#e7e5e4" strokeWidth="0.8" />
          <Eyes cx={16} cy={13.5} gap={3} color={v.eye} />
        </>
      );
    case 'mage':
      return (
        <>
          <ellipse cx="16" cy="24" rx="8" ry="6" fill={v.skin} />
          <circle cx="16" cy="15" r="7" fill="#2e1065" />
          <path d="M8 14 L16 3 L24 14 Z" fill="#4c1d95" />
          <circle cx="16" cy="8.5" r="1.6" fill={v.glow} />
          <circle cx="25.5" cy="20" r="3.2" fill={v.glow} opacity="0.95">
            <animate attributeName="r" values="2.6;3.6;2.6" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <Eyes cx={16} cy={15} gap={3} color={v.eye} />
        </>
      );
    case 'spider':
      return (
        <>
          <ellipse cx="16" cy="17" rx="7.5" ry="6" fill={v.skin} />
          <circle cx="16" cy="12" r="4.5" fill={v.accent} />
          {[-1, 1].map(side => (
            <g key={side}>
              <path d={`M${16 + side * 6} 14 L${16 + side * 13} 8`} stroke={v.skin} strokeWidth="1.5" />
              <path d={`M${16 + side * 7} 17 L${16 + side * 14} 16`} stroke={v.skin} strokeWidth="1.5" />
              <path d={`M${16 + side * 6} 20 L${16 + side * 13} 26`} stroke={v.skin} strokeWidth="1.5" />
            </g>
          ))}
          <Eyes cx={16} cy={11.5} gap={2.2} color={v.eye} r={1.6} />
        </>
      );
    case 'scorpion':
      return (
        <>
          <ellipse cx="16" cy="20" rx="8" ry="5" fill={v.skin} />
          <path d="M8 18 L3 14 L8 16" stroke={v.accent} strokeWidth="2" fill="none" />
          <path d="M24 18 L29 14 L24 16" stroke={v.accent} strokeWidth="2" fill="none" />
          <path d="M20 16 Q26 6 22 4" stroke={v.skin} strokeWidth="2.4" fill="none" />
          <circle cx="22" cy="4" r="2" fill={v.eye} />
          <Eyes cx={16} cy={18.5} gap={3} color={v.eye} r={1.7} />
        </>
      );
    case 'ghost':
      return (
        <>
          <path d="M8 14 Q8 5 16 5 Q24 5 24 14 L24 26 L20 23 L16 26 L12 23 L8 26 Z" fill={v.skin} opacity="0.82" />
          <Eyes cx={16} cy={13} gap={3.2} color="#0f172a" r={2.2} />
          <ellipse cx="16" cy="19" rx="3" ry="1.4" fill="#155e75" />
        </>
      );
    case 'demon':
      return (
        <>
          <ellipse cx="16" cy="23" rx="8.5" ry="7" fill={v.skin} />
          <circle cx="16" cy="14" r="8" fill={v.skin} />
          <path d="M7 10 L5 2 L12 8 Z" fill={v.accent} />
          <path d="M25 10 L27 2 L20 8 Z" fill={v.accent} />
          <path d="M6 18 Q2 14 7 12" fill="#7f1d1d" />
          <path d="M26 18 Q30 14 25 12" fill="#7f1d1d" />
          <Eyes cx={16} cy={13} gap={3.6} color={v.eye} r={2.3} />
          <path d="M12 18 Q16 22 20 18" fill="#111" />
        </>
      );
    case 'goat':
      return (
        <>
          <ellipse cx="16" cy="23" rx="8" ry="6.5" fill={v.skin} />
          <circle cx="16" cy="14" r="7.6" fill={v.skin} />
          <path d="M9 8 Q6 1 12 7" stroke="#e7e5e4" strokeWidth="2.2" fill="none" />
          <path d="M23 8 Q26 1 20 7" stroke="#e7e5e4" strokeWidth="2.2" fill="none" />
          <Eyes cx={16} cy={13.5} gap={3.2} color={v.eye} />
          <ellipse cx="16" cy="18" rx="1.4" ry="2.2" fill="#1c1917" />
        </>
      );
    case 'beetle':
      return (
        <>
          <ellipse cx="16" cy="18" rx="8.5" ry="9" fill={v.skin} />
          <path d="M16 9 V27" stroke={v.glow} strokeWidth="1.2" />
          <circle cx="16" cy="10" r="3.4" fill={v.accent} />
          <path d="M10 8 L7 4 M22 8 L25 4" stroke={v.accent} strokeWidth="1.4" />
          <Eyes cx={16} cy={10} gap={1.8} color={v.eye} r={1.4} />
        </>
      );
    case 'mummy':
      return (
        <>
          <ellipse cx="16" cy="23" rx="8" ry="7" fill={v.skin} />
          <circle cx="16" cy="13" r="8" fill={v.skin} />
          <path d="M8 10 H24 M8 14 H24 M8 18 H24 M9 22 H23" stroke="#fef3c7" strokeWidth="1.5" opacity="0.85" />
          <Eyes cx={16} cy={13} gap={3.3} color={v.eye} />
        </>
      );
    case 'knight':
      return (
        <>
          <ellipse cx="16" cy="24" rx="8.2" ry="6" fill={v.skin} />
          <path d="M8 14 L16 5 L24 14 L24 22 Q16 26 8 22 Z" fill={v.skin} stroke={v.accent} strokeWidth="1" />
          <rect x="11" y="13" width="10" height="3.2" rx="1" fill="#0f172a" />
          <Eyes cx={16} cy={14.6} gap={2.6} color={v.eye} r={1.5} />
          <path d="M16 5 V2" stroke="#fbbf24" strokeWidth="1.6" />
        </>
      );
    case 'worm':
      return (
        <>
          <ellipse cx="10" cy="22" rx="5" ry="4.2" fill={v.skin} />
          <ellipse cx="16" cy="18" rx="5.2" ry="4.4" fill="#c2410c" />
          <ellipse cx="21" cy="13" rx="5.4" ry="4.6" fill={v.skin} />
          <Eyes cx={21} cy={12} gap={2} color={v.eye} r={1.6} />
        </>
      );
    case 'mosquito':
      return (
        <>
          <ellipse cx="16" cy="18" rx="6" ry="5" fill={v.skin} />
          <ellipse cx="12" cy="12" rx="6" ry="3.5" fill="#86efac" opacity="0.45" />
          <ellipse cx="20" cy="12" rx="6" ry="3.5" fill="#86efac" opacity="0.45" />
          <path d="M16 20 L16 28" stroke={v.accent} strokeWidth="1.6" />
          <Eyes cx={16} cy={17} gap={2.4} color={v.eye} r={1.5} />
        </>
      );
    case 'vampire':
      return (
        <>
          <ellipse cx="16" cy="23" rx="8" ry="7" fill="#1c1917" />
          <circle cx="16" cy="13" r="7.8" fill={v.skin} />
          <path d="M6 10 Q16 2 26 10 L24 14 Q16 8 8 14 Z" fill="#111" />
          <path d="M13 18 L12 21 M19 18 L20 21" stroke="#f8fafc" strokeWidth="1.3" />
          <Eyes cx={16} cy={13} gap={3.2} color={v.eye} />
        </>
      );
    case 'beast':
      return (
        <>
          <ellipse cx="16" cy="22" rx="9" ry="7" fill={v.skin} />
          <circle cx="16" cy="14" r="8" fill={v.skin} />
          <path d="M7 9 L4 4 L11 8 Z" fill={v.accent} />
          <path d="M25 9 L28 4 L21 8 Z" fill={v.accent} />
          <Eyes cx={16} cy={13} gap={3.5} color={v.eye} />
          <ellipse cx="16" cy="18.5" rx="2" ry="1.4" fill="#1c1917" />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="16" cy="23" rx="8.5" ry="7" fill={v.skin} />
          <circle cx="16" cy="13.5" r="8" fill={v.skin} />
          <path d="M8 9 L6 3 L12 8 M24 9 L26 3 L20 8" fill={v.accent} />
          <Eyes cx={16} cy={13} gap={3.4} color={v.eye} />
        </>
      );
  }
};

export const MonsterPortrait: React.FC<MonsterPortraitProps> = React.memo(({
  icon,
  name,
  rank = 'normal',
  element,
  size = 32,
  isEnraged,
  isFrozen,
  isDying
}) => {
  const type = getMonsterArchetype(icon, name);
  const v = ARCHETYPE_VISUALS[type];
  const glowId = `mglow-${type}-${rank}-${(name || 'n').replace(/[^a-zA-Z0-9가-힣]/g, '').slice(0, 10)}`;
  const isBoss = rank === 'boss';
  const isElite = rank === 'elite' || rank === 'champion';
  const ring = isBoss
    ? 'rgba(251,191,36,0.95)'
    : isElite
    ? 'rgba(250,204,21,0.85)'
    : v.glow;

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden monster-portrait ${
        isDying ? 'monster-portrait-dying' : isEnraged ? 'monster-portrait-enraged' : ''
      } ${isFrozen ? 'monster-portrait-frozen' : ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        boxShadow: `0 0 ${isBoss ? 12 : 7}px ${ring}`,
        background: `radial-gradient(circle at 40% 30%, ${v.accent} 0%, #07090f 78%)`
      }}
      title={name}
    >
      <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
        <defs>
          <radialGradient id={glowId} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={v.glow} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill={`url(#${glowId})`} />
        <BodyByArchetype type={type} v={v} />
      </svg>
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          boxShadow: `inset 0 0 0 ${isBoss ? 2 : 1.5}px ${ring}`,
          mixBlendMode: 'screen'
        }}
      />
      {element && element !== 'physical' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black/60"
          style={{ background: element === 'fire' ? '#f97316' : element === 'cold' ? '#22d3ee' : element === 'lightning' ? '#facc15' : element === 'poison' ? '#4ade80' : '#c084fc' }}
        />
      )}
    </div>
  );
});

MonsterPortrait.displayName = 'MonsterPortrait';
