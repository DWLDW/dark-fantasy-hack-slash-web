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

/**
 * 🌙 1. Vertical Crescent Sword Aura (종베기 관통 초승달 검기)
 */
const VerticalSwordAura: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full fx-crescent-vertical">
      <svg
        className="fx-sword-aura-crescent w-full h-full"
        viewBox="0 0 160 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`v-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`v-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer Aura Flare */}
        <path
          d="M 80 10 Q 30 180, 80 390 Q 60 200, 80 10 Z"
          fill={`url(#v-grad-${uid})`}
          filter={`url(#v-glow-${uid})`}
        />
        {/* Sharp Inner Blade Curve */}
        <path
          d="M 80 20 Q 45 190, 80 380 Q 70 200, 80 20 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
      <div className="fx-blade-swing-trail" />
    </div>
  );
};

/**
 * 🌊 2. Horizontal Wide Crescent Sword Aura (부채꼴 횡베기 파동 검기)
 */
const HorizontalSwordAura: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full fx-crescent-horizontal">
      <svg
        className="fx-sword-aura-crescent w-full h-full"
        viewBox="0 0 450 180"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`h-grad-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="25%" stopColor={color} stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`h-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Massive Sweeping Crescent Blade */}
        <path
          d="M 10 130 Q 225 15, 440 130 Q 225 60, 10 130 Z"
          fill={`url(#h-grad-${uid})`}
          filter={`url(#h-glow-${uid})`}
        />
        {/* Blazing White-Hot Cutting Edge */}
        <path
          d="M 40 120 Q 225 35, 410 120 Q 225 55, 40 120 Z"
          fill="#ffffff"
          opacity="0.92"
        />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
      <div className="fx-blade-swing-trail" />
    </div>
  );
};

/**
 * ⚔️ 3. Cross Guillotine Slash (십자 교차 단두대 참격)
 */
const CrossExecutionSlash: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Blade Slash 1: Left-to-Right Diagonal */}
      <div className="absolute inset-0 fx-cross-slash-1">
        <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 200 200">
          <path
            d="M 15 15 Q 100 80, 185 185 Q 115 100, 15 15 Z"
            fill={color}
            filter="drop-shadow(0 0 15px currentColor)"
          />
          <path
            d="M 25 25 Q 100 85, 175 175 Q 110 95, 25 25 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
      {/* Blade Slash 2: Right-to-Left Diagonal */}
      <div className="absolute inset-0 fx-cross-slash-2">
        <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 200 200">
          <path
            d="M 185 15 Q 100 80, 15 185 Q 85 100, 185 15 Z"
            fill={color}
            filter="drop-shadow(0 0 15px currentColor)"
          />
          <path
            d="M 175 25 Q 100 85, 25 175 Q 90 95, 175 25 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
      <div className="fx-blade-sparks" style={{ color }} />
      <div className="fx-blade-swing-trail" />
    </div>
  );
};

/**
 * 🌪️ 4. Cyclone Whirlwind Sword Aura (360도 회전 폭풍 검기)
 */
const CycloneWhirlAura: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full fx-crescent-whirl">
      <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 300 300">
        <defs>
          <radialGradient id={`cyclone-grad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="70%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Triple Spinning Crescent Arc Blades */}
        <path
          d="M 150 20 Q 280 60, 260 180 Q 210 140, 150 20 Z"
          fill={`url(#cyclone-grad-${uid})`}
        />
        <path
          d="M 260 180 Q 200 280, 70 240 Q 120 190, 260 180 Z"
          fill={`url(#cyclone-grad-${uid})`}
        />
        <path
          d="M 70 240 Q 20 120, 150 20 Q 90 100, 70 240 Z"
          fill={`url(#cyclone-grad-${uid})`}
        />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
      <div className="fx-blade-swing-trail" />
    </div>
  );
};

function getSlashKind(route: SkillRoute, skillId?: string): 'vertical' | 'horizontal-wide' | 'cross' | 'whirl' {
  if (route === 'radius') return 'whirl';
  if (skillId === 'execute') return 'cross';
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
  const kind = getSlashKind(selectedSkill.route, selectedSkill.id);

  useEffect(() => {
    if (isAttacking && !prevAttack.current) {
      setStrikeKey(k => k + 1);
      setShowStrike(true);
    }
    if (!isAttacking) {
      const hold = kind === 'whirl' ? 450 : 350;
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

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none" aria-hidden>
      {/* 1. Element Atmosphere Flash */}
      {showStrike && (
        <div key={`flash-${strikeKey}`} className={`absolute inset-0 ${ELEMENT_FLASH[element] || ELEMENT_FLASH.physical}`} />
      )}

      {/* 2. Vertical Cleave Sword Aura (가르기 / 관통 종베기 검기) */}
      {showStrike && kind === 'vertical' && (
        <div
          key={`v-${strikeKey}`}
          className="absolute"
          style={{
            left: `${verticalLane * 20 - 5}%`,
            width: '30%',
            top: '0%',
            height: '100%',
            color: glow
          }}
        >
          <VerticalSwordAura color={glow} uid={`${strikeKey}-v`} />
        </div>
      )}

      {/* 3. Cross Guillotine Slash (처형 십자 검기) */}
      {showStrike && kind === 'cross' && (
        <div
          key={`c-${strikeKey}`}
          className="absolute"
          style={{
            left: `${verticalLane * 20 - 8}%`,
            width: '36%',
            top: '15%',
            height: '70%',
            color: glow
          }}
        >
          <CrossExecutionSlash color={glow} uid={`${strikeKey}-cross`} />
        </div>
      )}

      {/* 4. Horizontal Sweep Crescent Aura (휩쓸기 3레인 부채꼴 횡베기 검기) */}
      {showStrike && kind === 'horizontal-wide' && (
        <div
          key={`h-${strikeKey}`}
          className="absolute"
          style={{
            left: `${branchSpan.start * 20 - 2}%`,
            width: `${branchSpan.count * 20 + 4}%`,
            top: '30%',
            height: '55%',
            color: glow
          }}
        >
          <HorizontalSwordAura color={glow} uid={`${strikeKey}-h`} />
        </div>
      )}

      {/* 5. Cyclone Whirlwind Arc (광전사의 분노 / 회전 폭풍 검기) */}
      {showStrike && kind === 'whirl' && (
        <div
          key={`w-${strikeKey}`}
          className="absolute"
          style={{
            left: '5%',
            width: '90%',
            top: '10%',
            height: '80%',
            color: glow
          }}
        >
          <CycloneWhirlAura color={glow} uid={`${strikeKey}-w`} />
        </div>
      )}

      {/* 6. Critical Hit Impact Burst */}
      {hasCrit && showStrike && <div className="absolute inset-0 fx-crit-burst" />}

      {/* 7. Chain Combo Popup Banner */}
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
