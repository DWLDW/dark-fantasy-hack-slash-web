import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { getElementGlow } from '../../utils/monsterVisuals';
import { SKILL_RUNES_DATA } from '../../data/skills';
import { SkillRoute } from '../../types/game';

const ELEMENT_FLASH: Record<string, string> = {
  fire: 'fx-flash-fire',
  cold: 'fx-flash-cold',
  lightning: 'fx-flash-lightning',
  poison: 'fx-flash-poison',
  void: 'fx-flash-void',
  physical: 'fx-flash-physical'
};

const VERTICAL_PATH = 'M 54 6 C 30 130, 70 255, 44 394';
const HORIZONTAL_PATH = 'M 8 62 C 70 18, 210 86, 392 38';

const WHIRL_CUTS = [
  { top: '16%', angle: -11, delay: '0ms' },
  { top: '34%', angle: 9, delay: '90ms' },
  { top: '52%', angle: -7, delay: '180ms' },
  { top: '70%', angle: 12, delay: '270ms' }
];

interface BladeSlashProps {
  dir: 'vertical' | 'horizontal';
  color: string;
  uid: string;
  delay?: string;
  thick?: boolean;
}

const BladeSlash: React.FC<BladeSlashProps> = ({ dir, color, uid, delay = '0ms', thick }) => {
  const viewBox = dir === 'vertical' ? '0 0 100 400' : '0 0 400 100';
  const d = dir === 'vertical' ? VERTICAL_PATH : HORIZONTAL_PATH;
  const glowW = thick ? 28 : 20;
  const midW = thick ? 12 : 8;
  const coreW = thick ? 4.5 : 3.2;
  const filterId = `blade-glow-${uid}`;

  return (
    <svg
      className="fx-blade-slash"
      viewBox={viewBox}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        className="fx-blade-draw fx-blade-glow"
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={glowW}
        strokeLinecap="round"
        pathLength={1}
        filter={`url(#${filterId})`}
        style={{ animationDelay: delay }}
      />
      <path
        className="fx-blade-draw"
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={midW}
        strokeLinecap="round"
        pathLength={1}
        style={{ animationDelay: delay }}
      />
      <path
        className="fx-blade-draw fx-blade-core"
        d={d}
        fill="none"
        stroke="#fff"
        strokeWidth={coreW}
        strokeLinecap="round"
        pathLength={1}
        style={{ animationDelay: delay }}
      />
    </svg>
  );
};

function slashKind(route: SkillRoute): 'vertical' | 'horizontal-wide' | 'whirl' {
  if (route === 'radius') return 'whirl';
  if (route === 'branch') return 'horizontal-wide';
  return 'vertical';
}

export const CombatFxLayer: React.FC = React.memo(() => {
  const { isAttacking, selectedSkill, skillRunes, playerLane, chainCount, floatingDamages } = useGame();
  const [strikeKey, setStrikeKey] = useState(0);
  const [showStrike, setShowStrike] = useState(false);
  const [banner, setBanner] = useState<{ n: number; id: number } | null>(null);
  const prevAttack = useRef(false);
  const prevChain = useRef(0);

  const runeId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const rune = SKILL_RUNES_DATA.find(r => r.id === runeId);
  const element = selectedSkill.element || rune?.element || 'physical';
  const glow = getElementGlow(element);
  const kind = slashKind(selectedSkill.route);

  useEffect(() => {
    if (isAttacking && !prevAttack.current) {
      setStrikeKey(k => k + 1);
      setShowStrike(true);
    }
    if (!isAttacking) {
      const hold = kind === 'whirl' ? 420 : 220;
      const t = setTimeout(() => setShowStrike(false), hold);
      prevAttack.current = isAttacking;
      return () => clearTimeout(t);
    }
    prevAttack.current = isAttacking;
  }, [isAttacking, kind]);

  useEffect(() => {
    if (chainCount >= 3 && chainCount !== prevChain.current) {
      setBanner({ n: chainCount, id: Date.now() });
    }
    prevChain.current = chainCount;
  }, [chainCount]);

  const hasCrit = floatingDamages.some(d => d.isCrit);

  const branchSpan = useMemo(() => {
    const lanes = [playerLane - 1, playerLane, playerLane + 1].filter(l => l >= 0 && l <= 4);
    return { start: Math.min(...lanes), count: lanes.length };
  }, [playerLane]);

  const verticalLane = playerLane;
  const isPierce = selectedSkill.route === 'line';

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden>
      {showStrike && (
        <div key={`flash-${strikeKey}`} className={`absolute inset-0 ${ELEMENT_FLASH[element] || ELEMENT_FLASH.physical}`} />
      )}

      {showStrike && kind === 'vertical' && (
        <div
          key={`v-${strikeKey}`}
          className="absolute fx-cut-vertical"
          style={{
            left: `${verticalLane * 20}%`,
            width: '20%',
            top: isPierce ? '2%' : '28%',
            height: isPierce ? '96%' : '68%',
            color: glow
          }}
        >
          <BladeSlash dir="vertical" color={glow} uid={`${strikeKey}-v`} thick={selectedSkill.route === 'single'} />
          {isPierce && (
            <div className="absolute inset-0 opacity-50" style={{ transform: 'translateX(10%)' }}>
              <BladeSlash dir="vertical" color={glow} uid={`${strikeKey}-v2`} delay="40ms" />
            </div>
          )}
          <span className="fx-cut-sparks" style={{ color: glow }} />
        </div>
      )}

      {showStrike && kind === 'horizontal-wide' && (
        <div
          key={`h-${strikeKey}`}
          className="absolute fx-cut-horizontal"
          style={{
            left: `${branchSpan.start * 20 + 1}%`,
            width: `${branchSpan.count * 20 - 2}%`,
            top: '48%',
            height: '38%',
            transform: 'rotate(-6deg)',
            color: glow
          }}
        >
          <BladeSlash dir="horizontal" color={glow} uid={`${strikeKey}-h`} thick />
          <span className="fx-cut-sparks fx-cut-sparks-wide" style={{ color: glow }} />
        </div>
      )}

      {showStrike && kind === 'whirl' && (
        <div key={`w-${strikeKey}`} className="absolute inset-0">
          {WHIRL_CUTS.map((cut, i) => (
            <div
              key={i}
              className="absolute fx-cut-horizontal fx-cut-whirl"
              style={{
                left: '3%',
                width: '94%',
                top: cut.top,
                height: '26%',
                transform: `rotate(${cut.angle}deg)`,
                color: glow
              }}
            >
              <BladeSlash
                dir="horizontal"
                color={glow}
                uid={`${strikeKey}-w${i}`}
                delay={cut.delay}
                thick={i === 1 || i === 2}
              />
            </div>
          ))}
          <span className="fx-cut-sparks fx-cut-sparks-wide" style={{ color: glow }} />
        </div>
      )}

      {hasCrit && showStrike && <div className="absolute inset-0 fx-crit-burst" />}

      {banner && (
        <div
          key={banner.id}
          className="absolute left-1/2 top-6 z-40 animate-chain-banner px-4 py-1.5 rounded-md border-2 border-amber-300 bg-gradient-to-r from-red-950 via-amber-900 to-red-950 shadow-[0_0_28px_rgba(251,191,36,0.75)]"
          onAnimationEnd={() => setBanner(null)}
        >
          <div className="font-cinzel font-black text-amber-200 text-lg sm:text-2xl tracking-[0.2em] drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
            CHAIN x{banner.n}
          </div>
        </div>
      )}
    </div>
  );
});

CombatFxLayer.displayName = 'CombatFxLayer';
