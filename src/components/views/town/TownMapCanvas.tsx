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
      <img
        src="/images/town_map.png"
        alt="로그 캠프 타운맵"
        className="w-full h-full object-cover object-center contrast-110 brightness-95 transform scale-[1.01] pointer-events-none"
        draggable={false}
      />

      {/* 2. Atmospheric Vignette & Embers Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none town-embers" />

      {/* 3. Top-Left Camp Header Badge (Clean & Compact) */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 pointer-events-none space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-iron-950/90 border border-brass-500/80 shadow-2xl text-brass-200 text-[11px] sm:text-sm font-cinzel font-black tracking-wide">
          <span>❖ 로그 캠프 (Rogue Encampment)</span>
          <span className="px-1.5 py-0.2 rounded bg-blood-950 border border-blood-600 text-blood-300 text-[9px] sm:text-[10px] font-mono font-bold">1막 성역</span>
        </div>
        <div className="text-[10px] sm:text-xs font-mono text-gray-300 drop-shadow hidden sm:block bg-black/60 px-2.5 py-0.5 rounded border border-iron-800">
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
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-blue-950/90 border-2 border-blue-400 group-hover:border-amber-300 group-hover:scale-115 transition flex items-center justify-center text-blue-300 group-hover:text-amber-200 shadow-[0_0_20px_rgba(59,130,246,0.7)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {unidentifiedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-blood-600 border border-white text-white rounded-full text-[10px] font-mono font-black animate-bounce shadow">
              {unidentifiedCount}
            </span>
          )}
        </div>
        <div className="mt-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg bg-iron-950/95 border border-blue-500/70 group-hover:border-amber-400 text-white font-cinzel font-black text-[9px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          📜 데커드 케인
        </div>
        <span className="text-[9px] font-mono text-blue-300 hidden sm:block whitespace-nowrap drop-shadow bg-black/60 px-1.5 py-0.2 rounded mt-0.5 border border-blue-900">
          미확인 장비 감정
        </span>
      </button>

      {/* Pin 2: GHEED'S BAZAAR (Top-Right Wagon) */}
      <button
        onClick={() => onOpenFacility('gamble')}
        className="absolute top-[36%] left-[78%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-amber-950/90 border-2 border-amber-400 group-hover:border-yellow-300 group-hover:scale-115 transition flex items-center justify-center text-yellow-300 group-hover:text-yellow-100 shadow-[0_0_20px_rgba(245,158,11,0.7)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
          <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="mt-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg bg-iron-950/95 border border-amber-500/70 group-hover:border-yellow-300 text-white font-cinzel font-black text-[9px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🎲 기드의 암시장
        </div>
        <span className="text-[9px] font-mono text-amber-300 hidden sm:block whitespace-nowrap drop-shadow bg-black/60 px-1.5 py-0.2 rounded mt-0.5 border border-amber-900">
          8대 부위 도박
        </span>
      </button>

      {/* Pin 3: RUNEWORD FORGE (Bottom-Left Forge) */}
      <button
        onClick={() => onOpenFacility('runewords')}
        className="absolute top-[74%] left-[24%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-purple-950/90 border-2 border-purple-400 group-hover:border-purple-300 group-hover:scale-115 transition flex items-center justify-center text-purple-300 group-hover:text-white shadow-[0_0_20px_rgba(168,85,247,0.7)] group-hover:shadow-[0_0_30px_rgba(192,132,252,0.9)]">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="mt-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg bg-iron-950/95 border border-purple-500/70 group-hover:border-purple-300 text-white font-cinzel font-black text-[9px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🔮 룬워드 공방
        </div>
        <span className="text-[9px] font-mono text-purple-300 hidden sm:block whitespace-nowrap drop-shadow bg-black/60 px-1.5 py-0.2 rounded mt-0.5 border border-purple-900">
          소켓 장비 & 룬 제련
        </span>
      </button>

      {/* Pin 4: HORADRIC CUBE ALTAR (Bottom-Right Pedestal) */}
      <button
        onClick={() => onOpenFacility('cube')}
        className="absolute top-[75%] left-[76%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-emerald-950/90 border-2 border-emerald-400 group-hover:border-emerald-300 group-hover:scale-115 transition flex items-center justify-center text-emerald-300 group-hover:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.7)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.9)]">
          <Box className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="mt-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg bg-iron-950/95 border border-emerald-500/70 group-hover:border-emerald-300 text-white font-cinzel font-black text-[9px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          🧪 호라드릭 큐브
        </div>
        <span className="text-[9px] font-mono text-emerald-300 hidden sm:block whitespace-nowrap drop-shadow bg-black/60 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-900">
          30레벨 연구 & 비전 합성
        </span>
      </button>

      {/* Pin 5: EXPEDITION GATE (Top-Center Iron Gateway) */}
      <button
        onClick={onWorldMap}
        className="absolute top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer flex flex-col items-center"
      >
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-blood-950/90 border-2 border-blood-500 group-hover:border-amber-300 group-hover:scale-115 transition flex items-center justify-center text-blood-400 group-hover:text-amber-200 shadow-[0_0_20px_rgba(239,68,68,0.7)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.9)]">
          <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="mt-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg bg-iron-950/95 border border-blood-600 group-hover:border-amber-400 text-white font-cinzel font-black text-[9px] sm:text-xs whitespace-nowrap shadow-xl transition transform group-hover:scale-105">
          ⚔️ 성역 원정 관문
        </div>
      </button>
    </div>
  );
});

TownMapCanvas.displayName = 'TownMapCanvas';

