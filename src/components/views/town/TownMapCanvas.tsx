import React from 'react';
import { BookOpen, Dices, Sparkles, Box, Compass } from 'lucide-react';

interface TownMapCanvasProps {
  onOpenFacility: (facility: 'cain' | 'gamble' | 'runewords' | 'cube') => void;
  unidentifiedCount: number;
  onDeploy: () => void;
  onWorldMap: () => void;
  lastDungeonName: string;
  autoDeployDiff: number;
  playerLevel: number;
}

export const TownMapCanvas: React.FC<TownMapCanvasProps> = React.memo(({
  onOpenFacility,
  unidentifiedCount,
  onDeploy,
  onWorldMap,
  lastDungeonName,
  autoDeployDiff,
  playerLevel
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-brass-600/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-iron-950 aspect-[4/3] sm:aspect-[16/10] max-h-[64vh] w-full select-none font-sans">
      {/* 1. Town Map Artwork Layer */}
      <picture>
        <source srcSet="/images/town_map.webp" type="image/webp" />
        <img
          src="/images/town_map.png"
          alt="로그 캠프 타운맵"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center contrast-110 brightness-95 transform scale-[1.01] pointer-events-none"
          draggable={false}
        />
      </picture>

      {/* 2. Atmospheric Vignette & Embers Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none town-embers" />

      {/* 3. Top-Left Camp Header Badge (Clean & High Contrast) */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 pointer-events-none space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-iron-950/95 border border-brass-500 shadow-2xl text-brass-200 text-xs sm:text-base font-cinzel font-black tracking-wide">
          <span>❖ 로그 캠프 (Rogue Encampment)</span>
          <span className="px-2 py-0.5 rounded bg-blood-950 border border-blood-600 text-blood-200 text-[10px] sm:text-xs font-mono font-black">1막 성역</span>
        </div>
        <div className="text-[11px] sm:text-xs font-mono text-gray-200 drop-shadow hidden sm:block bg-black/80 px-3 py-1 rounded-lg border border-iron-800 font-bold">
          캠프의 NPC와 비전 제단을 터치하여 상점과 공방을 이용하세요.
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5 INTERACTIVE HOTSPOT PINS (3 NPCs + Horadric Cube + Expedition Gate) */}
      {/* ============================================================== */}

      {/* Pin 1: DECKARD CAIN (Top-Left Tent) */}
      <button
        onClick={() => onOpenFacility('cain')}
        className="absolute top-[34%] left-[22%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="relative">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-950/95 border-2 border-blue-400 group-hover:border-amber-300 group-hover:scale-115 transition flex items-center justify-center text-blue-200 group-hover:text-amber-200 shadow-[0_0_20px_rgba(59,130,246,0.8)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
            <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          {unidentifiedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-blood-600 border border-white text-white rounded-full text-[10px] sm:text-xs font-mono font-black animate-bounce shadow">
              {unidentifiedCount}
            </span>
          )}
        </div>
        <div className="mt-1 px-2.5 py-1 rounded-lg bg-iron-950/95 border border-blue-400/90 group-hover:border-amber-400 text-white font-cinzel font-black text-[11px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          📜 데커드 케인
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-blue-200 font-bold hidden sm:block whitespace-nowrap drop-shadow bg-black/80 px-2 py-0.5 rounded mt-0.5 border border-blue-800">
          미확인 장비 감정
        </span>
      </button>

      {/* Pin 2: GHEED'S BAZAAR (Top-Right Wagon) */}
      <button
        onClick={() => onOpenFacility('gamble')}
        className="absolute top-[36%] left-[78%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-950/95 border-2 border-amber-400 group-hover:border-yellow-300 group-hover:scale-115 transition flex items-center justify-center text-yellow-200 group-hover:text-yellow-100 shadow-[0_0_20px_rgba(245,158,11,0.8)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
          <Dices className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="mt-1 px-2.5 py-1 rounded-lg bg-iron-950/95 border border-amber-400/90 group-hover:border-yellow-300 text-white font-cinzel font-black text-[11px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🎲 기드의 암시장
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-amber-200 font-bold hidden sm:block whitespace-nowrap drop-shadow bg-black/80 px-2 py-0.5 rounded mt-0.5 border border-amber-800">
          8대 부위 도박
        </span>
      </button>

      {/* Pin 3: RUNEWORD FORGE (Bottom-Left Forge) */}
      <button
        onClick={() => onOpenFacility('runewords')}
        className="absolute top-[74%] left-[24%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-purple-950/95 border-2 border-purple-400 group-hover:border-purple-300 group-hover:scale-115 transition flex items-center justify-center text-purple-200 group-hover:text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] group-hover:shadow-[0_0_30px_rgba(192,132,252,0.9)]">
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="mt-1 px-2.5 py-1 rounded-lg bg-iron-950/95 border border-purple-400/90 group-hover:border-purple-300 text-white font-cinzel font-black text-[11px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🔮 룬워드 공방
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-purple-200 font-bold hidden sm:block whitespace-nowrap drop-shadow bg-black/80 px-2 py-0.5 rounded mt-0.5 border border-purple-800">
          소켓 장비 & 룬 제련
        </span>
      </button>

      {/* Pin 4: HORADRIC CUBE ALTAR (Bottom-Right Pedestal) */}
      <button
        onClick={() => onOpenFacility('cube')}
        className="absolute top-[75%] left-[76%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-emerald-950/95 border-2 border-emerald-400 group-hover:border-emerald-300 group-hover:scale-115 transition flex items-center justify-center text-emerald-200 group-hover:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.8)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.9)]">
          <Box className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="mt-1 px-2.5 py-1 rounded-lg bg-iron-950/95 border border-emerald-400/90 group-hover:border-emerald-300 text-white font-cinzel font-black text-[11px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🧪 호라드릭 큐브
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-emerald-200 font-bold hidden sm:block whitespace-nowrap drop-shadow bg-black/80 px-2 py-0.5 rounded mt-0.5 border border-emerald-800">
          30레벨 연구 & 비전 합성
        </span>
      </button>

      {/* Pin 5: EXPEDITION GATE (Top-Center Iron Gateway) */}
      <button
        onClick={onWorldMap}
        className="absolute top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blood-950/95 border-2 border-blood-500 group-hover:border-amber-300 group-hover:scale-115 transition flex items-center justify-center text-blood-300 group-hover:text-amber-200 shadow-[0_0_20px_rgba(239,68,68,0.8)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
          <Compass className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="mt-1 px-2.5 py-1 rounded-lg bg-iron-950/95 border border-blood-500 group-hover:border-amber-400 text-white font-cinzel font-black text-[11px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          ⚔️ 성역 원정 관문
        </div>
      </button>
    </div>
  );
});

TownMapCanvas.displayName = 'TownMapCanvas';

