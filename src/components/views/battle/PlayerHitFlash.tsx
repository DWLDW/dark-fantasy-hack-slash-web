import React from 'react';
import { useGame } from '../../../state/gameStore';

/**
 * 🐾 1. Monster 3-Line Claw Slash (일반 몬스터 발톱 할퀴기)
 */
const MonsterClawSlash: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none fx-monster-claw">
      <svg className="w-64 h-64 sm:w-96 sm:h-96" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="claw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#ef4444" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Claw Line 1 */}
        <path d="M 50 30 Q 150 140, 240 230 Q 160 150, 50 30 Z" fill="url(#claw-grad)" filter="drop-shadow(0 0 8px #ef4444)" />
        {/* Claw Line 2 */}
        <path d="M 80 20 Q 180 130, 270 220 Q 190 140, 80 20 Z" fill="url(#claw-grad)" filter="drop-shadow(0 0 10px #dc2626)" />
        {/* Claw Line 3 */}
        <path d="M 110 10 Q 210 120, 290 200 Q 220 130, 110 10 Z" fill="url(#claw-grad)" filter="drop-shadow(0 0 8px #ef4444)" />
      </svg>
      {/* Blood Splatter Drops */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_45%_50%,rgba(239,68,68,0.4)_0,transparent_40%),radial-gradient(circle_at_60%_45%,rgba(220,38,38,0.5)_0,transparent_35%)]" />
    </div>
  );
};

/**
 * 🔥 2. Boss Hellfire Pillar (화염 보스 지옥불 기둥 폭발)
 */
const BossHellfirePillar: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none fx-boss-hellfire">
      <svg className="w-full h-full max-h-[85vh]" viewBox="0 0 400 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fire-pillar" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="40%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#991b1b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M 50 500 Q 120 200, 180 20 Q 220 20, 280 200 Q 350 500, 50 500 Z" fill="url(#fire-pillar)" filter="drop-shadow(0 0 25px #ea580c)" />
        <path d="M 120 500 Q 160 220, 200 40 Q 240 220, 280 500 Z" fill="#ffffff" opacity="0.8" />
      </svg>
      <div className="absolute inset-0 bg-red-600/20 mix-blend-color-dodge animate-pulse" />
    </div>
  );
};

/**
 * ❄️ 3. Boss Glacial Frost Spike (냉기 보스 얼음 고드름 분쇄)
 */
const BossFrostSpike: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none fx-boss-frost">
      <svg className="w-80 h-80 sm:w-[480px] sm:h-[480px]" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="ice-spike" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Cross Ice Spikes */}
        <polygon points="150,10 170,130 290,150 170,170 150,290 130,170 10,150 130,130" fill="url(#ice-spike)" filter="drop-shadow(0 0 16px #38bdf8)" />
        <polygon points="150,50 160,140 250,150 160,160 150,250 140,160 50,150 140,140" fill="#ffffff" opacity="0.9" />
      </svg>
      <div className="absolute inset-0 bg-sky-500/15 mix-blend-screen" />
    </div>
  );
};

/**
 * ⚡ 4. Boss Thunderbolt Strike (번개 보스 벼락 강타)
 */
const BossThunderbolt: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none fx-boss-lightning">
      <svg className="w-72 sm:w-96 h-full" viewBox="0 0 200 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bolt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <path d="M 100 0 L 130 180 L 80 220 L 140 380 L 70 410 L 110 500 L 90 500 L 50 420 L 110 390 L 60 230 L 110 190 Z" fill="url(#bolt-grad)" filter="drop-shadow(0 0 20px #fbbf24)" />
        <path d="M 98 0 L 120 180 L 85 220 L 130 380 L 78 410 L 105 500 L 98 500 L 65 420 L 105 390 L 70 230 L 105 190 Z" fill="#ffffff" />
      </svg>
      <div className="absolute inset-0 bg-amber-400/20 mix-blend-color-dodge animate-pulse" />
    </div>
  );
};

/**
 * ☠️ 5. Boss Poison Nova Burst (독 보스 맹독 포자 노바)
 */
const BossPoisonNova: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none fx-boss-poison">
      <div className="w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full border-4 border-emerald-400 bg-emerald-950/40 shadow-[0_0_50px_#10b981,inset_0_0_40px_#059669] flex items-center justify-center">
        <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full border-2 border-emerald-300 bg-emerald-500/20 animate-ping" />
      </div>
      <div className="absolute inset-0 bg-emerald-500/15" />
    </div>
  );
};

/**
 * 🔮 6. Boss Dark Void Soul Wave (공허 보스 원혼 해골 소용돌이)
 */
const BossVoidSoulVortex: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none fx-boss-void">
      <div className="w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full border-4 border-purple-500 bg-purple-950/50 shadow-[0_0_60px_#a855f7,inset_0_0_45px_#7e22ce] flex items-center justify-center">
        <span className="text-6xl sm:text-8xl animate-spin">💀</span>
      </div>
      <div className="absolute inset-0 bg-purple-600/20 mix-blend-color-dodge" />
    </div>
  );
};

/**
 * 🩸 Main PlayerHitFlash Component
 */
export const PlayerHitFlash: React.FC = React.memo(() => {
  const { playerHitFlash } = useGame();

  if (!playerHitFlash) return null;

  const isHeavy = playerHitFlash.damage >= 30;
  const isBoss = Boolean(playerHitFlash.isBoss);
  const element = playerHitFlash.element || 'physical';

  return (
    <div key={playerHitFlash.id} className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* 1. Full-screen Edge Vignette Flash */}
      <div className={`absolute inset-0 animate-player-hit-flash ${
        isBoss
          ? 'shadow-[inset_0_0_180px_90px_rgba(220,38,38,0.95)] bg-red-950/35'
          : isHeavy
          ? 'shadow-[inset_0_0_140px_70px_rgba(185,28,28,0.9)] bg-red-950/25'
          : 'shadow-[inset_0_0_90px_35px_rgba(185,28,28,0.6)]'
      }`} />

      {/* 2. Monster Claw or Boss Signature VFX */}
      {isBoss ? (
        element === 'fire' ? (
          <BossHellfirePillar />
        ) : element === 'cold' ? (
          <BossFrostSpike />
        ) : element === 'lightning' ? (
          <BossThunderbolt />
        ) : element === 'poison' ? (
          <BossPoisonNova />
        ) : element === 'void' ? (
          <BossVoidSoulVortex />
        ) : (
          <BossHellfirePillar />
        )
      ) : (
        <MonsterClawSlash />
      )}

      {/* 3. Center Screen Damage Banner */}
      <div className="absolute inset-x-0 top-[35%] flex flex-col items-center justify-center z-50">
        {isBoss && (
          <div className="font-cinzel font-black text-sm sm:text-lg text-red-300 tracking-widest bg-black/90 px-3 py-1 rounded-full border-2 border-red-500 mb-1 shadow-2xl animate-bounce">
            ⚠️ {playerHitFlash.attackerName || 'BOSS STRIKE!'}
          </div>
        )}
        <span className={`font-mono font-black drop-shadow-[0_4px_12px_rgba(0,0,0,1)] animate-player-hit-number ${
          isBoss
            ? 'text-6xl sm:text-8xl text-red-400 font-extrabold'
            : isHeavy
            ? 'text-5xl sm:text-7xl text-red-400'
            : 'text-4xl sm:text-5xl text-red-300'
        }`}>
          -{playerHitFlash.damage}
        </span>
      </div>

      {/* 4. Screen Shake */}
      {(isHeavy || isBoss) && (
        <div className="absolute inset-0 bg-red-900/20 animate-shake-heavy" />
      )}
    </div>
  );
});

PlayerHitFlash.displayName = 'PlayerHitFlash';

