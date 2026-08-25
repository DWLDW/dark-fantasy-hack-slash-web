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
 * 🌙 1. Vertical Crescent Sword Aura (종베기 초승달 검기 - 적 박스 맞춤형)
 */
const VerticalSwordAura: React.FC<{ color: string; uid: string; isMassive?: boolean; variant?: number }> = ({ color, uid, isMassive, variant = 0 }) => {
  const animClass = isMassive ? 'fx-crescent-massive' : variant % 2 === 0 ? 'fx-crescent-compact' : 'fx-crescent-vertical';
  return (
    <div className={`relative w-full h-full ${animClass}`}>
      <svg
        className="fx-sword-aura-crescent w-full h-full"
        viewBox={isMassive ? "0 0 120 340" : "0 0 100 160"}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`v-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Curved Razor Blade Arc */}
        <path
          d={
            isMassive
              ? "M 60 10 Q 20 170, 65 330 Q 40 180, 60 10 Z"
              : variant === 1
              ? "M 55 10 Q 15 80, 55 150 Q 30 85, 55 10 Z"
              : "M 50 8 Q 20 80, 55 152 Q 35 85, 50 8 Z"
          }
          fill={`url(#v-grad-${uid})`}
          filter="drop-shadow(0 0 8px currentColor)"
        />
        {/* Sharp White Core Edge */}
        <path
          d={
            isMassive
              ? "M 60 18 Q 28 170, 65 320 Q 48 180, 60 18 Z"
              : variant === 1
              ? "M 55 16 Q 22 80, 55 142 Q 38 85, 55 16 Z"
              : "M 50 14 Q 28 80, 55 144 Q 42 85, 50 14 Z"
          }
          fill="#ffffff"
          opacity="0.95"
        />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
    </div>
  );
};

/**
 * ⚡ 1.5 Diagonal Anime Slashes (만화/액션게임풍 사선 검기 - 적 박스 맞춤형)
 */
const DiagonalSwordSlash: React.FC<{ color: string; uid: string; dir: 1 | 2 }> = ({ color, uid, dir }) => {
  const animClass = dir === 1 ? 'fx-slash-diag-1' : 'fx-slash-diag-2';
  return (
    <div className={`relative w-full h-full ${animClass}`}>
      <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 160 160">
        <defs>
          <linearGradient id={`diag-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={dir === 1 ? "M 15 25 Q 90 75, 145 135 Q 95 95, 15 25 Z" : "M 145 25 Q 70 75, 15 135 Q 65 95, 145 25 Z"}
          fill={`url(#diag-grad-${uid})`}
          filter="drop-shadow(0 0 8px currentColor)"
        />
        <path
          d={dir === 1 ? "M 22 32 Q 90 78, 138 128 Q 92 92, 22 32 Z" : "M 138 32 Q 70 78, 22 128 Q 68 92, 138 32 Z"}
          fill="#ffffff"
        />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
    </div>
  );
};

/**
 * 🌊 2. Horizontal Wide Crescent Sword Aura (3종 샤프 레이저 아크)
 */
const HorizontalSwordAura: React.FC<{ color: string; uid: string; variant?: number }> = ({ color, uid, variant = 0 }) => {
  return (
    <div className="relative w-full h-full fx-crescent-horizontal">
      <svg
        className="fx-sword-aura-crescent w-full h-full"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`h-grad-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="20%" stopColor={color} stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {variant === 1 ? (
          // Var 1: 이중 면도날 엇갈림 검기 (Dual Razor Arcs)
          <>
            <path
              d="M 10 25 Q 200 5, 390 25 Q 200 15, 10 25 Z"
              fill={`url(#h-grad-${uid})`}
              filter="drop-shadow(0 0 6px currentColor)"
            />
            <path
              d="M 20 40 Q 200 20, 380 40 Q 200 30, 20 40 Z"
              fill={`url(#h-grad-${uid})`}
              filter="drop-shadow(0 0 6px currentColor)"
            />
            <path d="M 30 24 Q 200 9, 370 24 Q 200 16, 30 24 Z" fill="#ffffff" />
            <path d="M 40 39 Q 200 24, 360 39 Q 200 31, 40 39 Z" fill="#ffffff" />
          </>
        ) : variant === 2 ? (
          // Var 2: 톱니 파동 횡참 (Sonic Razor Wave)
          <>
            <path
              d="M 10 32 Q 100 12, 200 28 Q 300 12, 390 32 Q 300 20, 200 36 Q 100 20, 10 32 Z"
              fill={`url(#h-grad-${uid})`}
              filter="drop-shadow(0 0 8px currentColor)"
            />
            <path
              d="M 30 31 Q 100 16, 200 29 Q 300 16, 370 31 Q 300 22, 200 34 Q 100 22, 30 31 Z"
              fill="#ffffff"
            />
          </>
        ) : (
          // Var 0: 일도양단 초승달 (Pure Katana Crescent)
          <>
            <path
              d="M 10 36 Q 200 8, 390 36 Q 200 22, 10 36 Z"
              fill={`url(#h-grad-${uid})`}
              filter="drop-shadow(0 0 8px currentColor)"
            />
            <path
              d="M 30 35 Q 200 13, 370 35 Q 200 23, 30 35 Z"
              fill="#ffffff"
            />
          </>
        )}
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
    </div>
  );
};

/**
 * ⚔️ 3. Cross Guillotine Slash (처형 십자 검기 - 적 박스 맞춤형)
 */
const CrossExecutionSlash: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 fx-cross-slash-1">
        <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 160 160">
          <path d="M 20 20 Q 80 70, 140 140 Q 90 85, 20 20 Z" fill={color} filter="drop-shadow(0 0 10px currentColor)" />
          <path d="M 28 28 Q 80 73, 132 132 Q 88 82, 28 28 Z" fill="#ffffff" />
        </svg>
      </div>
      <div className="absolute inset-0 fx-cross-slash-2">
        <svg className="fx-sword-aura-crescent w-full h-full" viewBox="0 0 160 160">
          <path d="M 140 20 Q 80 70, 20 140 Q 70 85, 140 20 Z" fill={color} filter="drop-shadow(0 0 10px currentColor)" />
          <path d="M 132 28 Q 80 73, 28 132 Q 72 82, 132 28 Z" fill="#ffffff" />
        </svg>
      </div>
      <div className="fx-blade-sparks" style={{ color }} />
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
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M 150 20 Q 280 60, 260 180 Q 210 140, 150 20 Z" fill={`url(#cyclone-grad-${uid})`} />
        <path d="M 260 180 Q 200 280, 70 240 Q 120 190, 260 180 Z" fill={`url(#cyclone-grad-${uid})`} />
        <path d="M 70 240 Q 20 120, 150 20 Q 90 100, 70 240 Z" fill={`url(#cyclone-grad-${uid})`} />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
    </div>
  );
};

/**
 * 🛡️ 4.5 Shield Bash / War Cry Shockwave Ring
 */
const ShieldImpactAura: React.FC<{ color: string; uid: string }> = ({ color, uid }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center animate-ping">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="8" filter="drop-shadow(0 0 12px currentColor)" opacity="0.9" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.95" />
      </svg>
      <div className="fx-blade-sparks" style={{ color }} />
    </div>
  );
};

/**
 * 💥 5. Overkill Shatter & Shockwave Ring (오버킬 전용 독립 파열 폭발 및 엠블럼)
 */
const OverkillShockwave: React.FC<{ lane: number; damage?: number }> = ({ lane, damage }) => {
  return (
    <div
      className="absolute pointer-events-none z-50 flex flex-col items-center justify-center"
      style={{
        left: `${lane * 20 - 4}%`,
        width: '28%',
        top: '30%',
        height: '50%'
      }}
    >
      {/* 💥 Overkill Floating Badge */}
      <div className="fx-overkill-badge font-mono font-black text-center z-50 drop-shadow-[0_0_16px_rgba(249,115,22,1)]">
        <div className="text-[10px] sm:text-xs text-amber-300 font-cinzel font-black tracking-widest bg-iron-950/95 px-2 py-0.5 rounded-full border-2 border-amber-400 shadow-lg animate-bounce">
          💥 OVERKILL!
        </div>
        {damage && (
          <div className="text-xs sm:text-sm text-orange-200 font-bold mt-0.5 font-mono">
            -{damage}
          </div>
        )}
      </div>

      {/* Dual Shockwave Blast Rings */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 fx-overkill-shockwave" />
      <div className="fx-overkill-sparkles" />
    </div>
  );
};

function getSlashKind(route: SkillRoute, skillId?: string): 'vertical' | 'horizontal-wide' | 'cross' | 'whirl' | 'shield' | 'berserk' {
  if (skillId === 'shield_bash' || skillId === 'war_cry') return 'shield';
  if (skillId === 'berserk') return 'berserk';
  if (route === 'radius') return 'whirl';
  if (skillId === 'execute') return 'cross';
  if (route === 'branch') return 'horizontal-wide';
  return 'vertical';
}

export const CombatFxLayer: React.FC = React.memo(() => {
  const { isAttacking, selectedSkill, skillRunes, playerLane, chainCount, floatingDamages } = useGame();
  const [strikeKey, setStrikeKey] = useState(0);
  const [showStrike, setShowStrike] = useState(false);
  const [slashVar, setSlashVar] = useState(0);
  const [banner, setBanner] = useState<{ n: number; id: number } | null>(null);
  const prevAttack = useRef(false);
  const prevChain = useRef(0);

  const runeId = skillRunes[selectedSkill.id] || selectedSkill.activeRuneId;
  const rune = SKILL_RUNES_DATA.find(r => r.id === runeId);
  const element = selectedSkill.element || rune?.element || 'physical';
  const glow = getElementGlow(element);
  const kind = getSlashKind(selectedSkill.route, selectedSkill.id);

  // Check if multiple depths were hit (Pierce)
  const hitCount = floatingDamages.length;
  const isPierceSkill = selectedSkill.route === 'line';
  const isMassivePierce = isPierceSkill && hitCount >= 2;
  const overkillDmg = floatingDamages.find(d => d.isOverkill);

  useEffect(() => {
    if (isAttacking && !prevAttack.current) {
      setStrikeKey(k => k + 1);
      setSlashVar(Math.floor(Math.random() * 4)); // 0, 1, 2, 3 random variation
      setShowStrike(true);
    }
    if (!isAttacking) {
      const hold = kind === 'whirl' || kind === 'shield' ? 450 : 300;
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
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden select-none" aria-hidden>
      {/* 1. Element Atmosphere Flash */}
      {showStrike && (
        <div key={`flash-${strikeKey}`} className={`absolute inset-0 ${ELEMENT_FLASH[element] || ELEMENT_FLASH.physical}`} />
      )}

      {/* 2. Vertical Cleave / Anime Diagonal Slashes (가르기 / 관통 종베기 검기) */}
      {showStrike && (kind === 'vertical' || kind === 'berserk') && (
        <div
          key={`v-${strikeKey}`}
          className="absolute"
          style={{
            left: `${verticalLane * 20 - (isMassivePierce ? 3 : 1)}%`,
            width: isMassivePierce ? '26%' : '22%',
            top: isMassivePierce ? '8%' : '44%',
            height: isMassivePierce ? '80%' : '30%',
            color: glow
          }}
        >
          {slashVar === 2 ? (
            <DiagonalSwordSlash color={glow} uid={`${strikeKey}-d1`} dir={1} />
          ) : slashVar === 3 ? (
            <DiagonalSwordSlash color={glow} uid={`${strikeKey}-d2`} dir={2} />
          ) : (
            <VerticalSwordAura color={glow} uid={`${strikeKey}-v`} isMassive={isMassivePierce} variant={slashVar} />
          )}
        </div>
      )}

      {/* 3. Cross Guillotine Slash (처형 십자 검기) */}
      {showStrike && kind === 'cross' && (
        <div
          key={`c-${strikeKey}`}
          className="absolute"
          style={{
            left: `${verticalLane * 20 - 2}%`,
            width: '24%',
            top: '44%',
            height: '30%',
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
            left: `${branchSpan.start * 20}%`,
            width: `${branchSpan.count * 20}%`,
            top: '48%',
            height: '18%',
            color: glow
          }}
        >
          <HorizontalSwordAura color={glow} uid={`${strikeKey}-h`} variant={slashVar} />
        </div>
      )}

      {/* 4.5 Shield Bash / War Cry Shockwave */}
      {showStrike && kind === 'shield' && (
        <div
          key={`s-${strikeKey}`}
          className="absolute"
          style={{
            left: selectedSkill.route === 'radius' ? '10%' : `${verticalLane * 20}%`,
            width: selectedSkill.route === 'radius' ? '80%' : '20%',
            top: '35%',
            height: '35%',
            color: glow
          }}
        >
          <ShieldImpactAura color={glow} uid={`${strikeKey}-shield`} />
        </div>
      )}

      {/* 5. Cyclone Whirlwind Arc (회전 폭풍 검기) */}
      {showStrike && kind === 'whirl' && (
        <div
          key={`w-${strikeKey}`}
          className="absolute"
          style={{
            left: '5%',
            width: '90%',
            top: '15%',
            height: '70%',
            color: glow
          }}
        >
          <CycloneWhirlAura color={glow} uid={`${strikeKey}-w`} />
        </div>
      )}

      {/* 💥 6. Overkill Dedicated Shatter & Shockwave Explosion (최상단 z-50) */}
      {showStrike && overkillDmg && (
        <OverkillShockwave key={`overkill-${strikeKey}`} lane={overkillDmg.lane ?? playerLane} damage={overkillDmg.damage} />
      )}

      {/* 7. Critical Hit Impact Burst */}
      {hasCrit && showStrike && <div className="absolute inset-0 fx-crit-burst" />}

      {/* 8. Chain Combo Popup Banner */}
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
