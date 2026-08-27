import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, ACT_DUNGEON_GROUPS, isDungeonUnlocked, isActUnlocked, generateEndlessRiftDungeon } from '../../data/dungeons';
import {
  Compass,
  ArrowRight,
  Lock,
  ArrowLeft,
  Swords,
  Sparkles,
  Crown
} from 'lucide-react';

const ACT_NAMES: Record<number, { title: string; subtitle: string }> = {
  1: { title: '1막: 칸두라스 황야', subtitle: '보이지 않는 눈의 자매단' },
  2: { title: '2막: 루트 골레인', subtitle: '아라녹 사막과 일곱 무덤' },
  3: { title: '3막: 쿠라스트 밀림', subtitle: '케지스탄 정글과 증오의 사원' },
  4: { title: '4막: 판데모니움', subtitle: '불타는 지옥과 혼돈의 성역' },
  5: { title: '5막: 아리앗 산', subtitle: '하로가스 성채와 세계석' }
};

export const DungeonSelectView: React.FC = React.memo(() => {
  const {
    enterDungeon,
    setViewMode,
    currentDifficulty,
    maxUnlockedDifficulty,
    setCurrentDifficulty,
    achievementStats,
    endlessRiftTier,
    activeModal,
    confirmDialogState
  } = useGame();

  const [selectedAct, setSelectedAct] = useState<number | 'rift'>(1);
  const [selectedRiftTier, setSelectedRiftTier] = useState<number>(endlessRiftTier || 1);
  const dungeonClears = achievementStats.dungeonClears || {};

  const isRiftUnlocked = Boolean(isActUnlocked(5, dungeonClears) && (dungeonClears['act5_4_throne'] || 0) >= 1);

  const currentActDungeons = useMemo(() => {
    if (selectedAct === 'rift') return [];
    const ids = ACT_DUNGEON_GROUPS[selectedAct as number] || ACT_DUNGEON_GROUPS[1];
    return ids.map(id => DUNGEONS_DATA.find(d => d.id === id)!).filter(Boolean);
  }, [selectedAct]);

  const [selectedDungeonId, setSelectedDungeonId] = useState<string>(currentActDungeons[0]?.id || DUNGEONS_DATA[0].id);

  const selectedDungeon = useMemo(() => {
    if (selectedAct === 'rift') {
      return generateEndlessRiftDungeon(selectedRiftTier);
    }
    return DUNGEONS_DATA.find(d => d.id === selectedDungeonId) || currentActDungeons[0] || DUNGEONS_DATA[0];
  }, [selectedAct, selectedRiftTier, selectedDungeonId, currentActDungeons]);

  const maxDiff = Math.max(1, maxUnlockedDifficulty || 1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(currentDifficulty || 1);

  const isCurrentDungeonUnlocked = selectedAct === 'rift' ? isRiftUnlocked : isDungeonUnlocked(selectedDungeon.id, dungeonClears);

  const setDiffDirect = (target: number) => {
    const next = Math.max(1, Math.min(maxDiff, target));
    setSelectedDifficulty(next);
    setCurrentDifficulty(next);
  };

  const handleDeploy = () => {
    if (!isCurrentDungeonUnlocked) return;
    if (selectedAct === 'rift') {
      enterDungeon(`endless_rift_t${selectedRiftTier}`, selectedDifficulty);
    } else {
      enterDungeon(selectedDungeon.id, selectedDifficulty);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal || confirmDialogState?.isOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setViewMode('town');
        return;
      }

      const actKey = Number(e.key);
      if (actKey >= 1 && actKey <= 5) {
        if (isActUnlocked(actKey, dungeonClears)) {
          e.preventDefault();
          setSelectedAct(actKey);
          const firstDId = ACT_DUNGEON_GROUPS[actKey]?.[0];
          if (firstDId) setSelectedDungeonId(firstDId);
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleDeploy();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedDungeon,
    selectedDifficulty,
    isCurrentDungeonUnlocked,
    activeModal,
    confirmDialogState,
    selectedAct,
    selectedRiftTier,
    dungeonClears
  ]);

  const hpMult = (1 + (selectedDifficulty - 1) * 0.35).toFixed(2);
  const dmgMult = (1 + (selectedDifficulty - 1) * 0.25).toFixed(2);
  const mfBonus = (selectedDifficulty - 1) * 3;

  return (
    <div className="h-[100dvh] flex-1 w-full max-w-5xl mx-auto p-1.5 sm:p-2.5 flex flex-col justify-between overflow-hidden select-none font-sans relative text-gray-200">
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-xl">
        <picture>
          <source srcSet="/images/ui/sanctuary_world_map.webp" type="image/webp" />
          <img
            src="/images/ui/sanctuary_world_map.jpg"
            alt="Sanctuary World Map"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125"
            draggable={false}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/80 to-iron-950/90" />
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-iron-750 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-red-400 animate-spin-slow" />
          <h1 className="text-sm font-cinzel font-black text-white tracking-wider">성역 월드맵</h1>
        </div>
        <button
          onClick={() => setViewMode('town')}
          className="px-2.5 py-1 rounded bg-iron-900/90 hover:bg-iron-800 border border-iron-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>마을 귀환 [Esc]</span>
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-6 gap-1 my-1 p-0.5 bg-iron-900/90 rounded-lg border border-iron-800 font-cinzel font-bold text-xs flex-shrink-0">
        {[1, 2, 3, 4, 5].map(act => {
          const unlocked = isActUnlocked(act, dungeonClears);
          const isSelected = selectedAct === act;

          return (
            <button
              key={act}
              onClick={() => {
                if (!unlocked) return;
                setSelectedAct(act);
                const firstDId = ACT_DUNGEON_GROUPS[act]?.[0];
                if (firstDId) setSelectedDungeonId(firstDId);
              }}
              disabled={!unlocked}
              className={`py-1 px-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blood-700 to-amber-600 text-white font-black shadow ring-1 ring-amber-400'
                  : unlocked
                  ? 'text-gray-300 hover:text-white hover:bg-iron-800'
                  : 'text-gray-600 bg-iron-950/60 cursor-not-allowed opacity-40'
              }`}
            >
              <span>{act}막</span>
              {!unlocked && <Lock className="w-2.5 h-2.5" />}
            </button>
          );
        })}

        <button
          onClick={() => {
            if (!isRiftUnlocked) return;
            setSelectedAct('rift');
          }}
          disabled={!isRiftUnlocked}
          className={`py-1 px-1 rounded transition text-center flex items-center justify-center gap-1 cursor-pointer ${
            selectedAct === 'rift'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-black shadow ring-1 ring-purple-400 animate-pulse'
              : isRiftUnlocked
              ? 'text-purple-300 hover:text-white hover:bg-iron-800'
              : 'text-gray-600 bg-iron-950/60 cursor-not-allowed opacity-40'
          }`}
        >
          <Sparkles className="w-3 h-3 text-purple-300" />
          <span>대균열</span>
          {!isRiftUnlocked && <Lock className="w-2.5 h-2.5" />}
        </button>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="md:col-span-5 flex flex-col justify-between h-full min-h-0 space-y-1 overflow-y-auto pr-0.5">
          {selectedAct === 'rift' ? (
            <div className="p-3 bg-purple-950/60 border border-purple-500/60 rounded-lg space-y-2 text-center h-full flex flex-col justify-center">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
              <h3 className="font-cinzel font-black text-sm text-purple-200">무한 대균열 (Endless Rift)</h3>
              <p className="text-[11px] text-gray-300 font-mono leading-relaxed">
                클리어할 때마다 난이도와 몬스터 군세가 끊임없이 강화되는 엔드게임 무한 등반 모드입니다.
              </p>
              <div className="p-2 bg-iron-950 rounded border border-purple-800/80 font-mono text-xs text-amber-300 font-bold">
                현재 최고 등반 기록: {endlessRiftTier}단계
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {currentActDungeons.map((dungeon, idx) => {
                const unlocked = isDungeonUnlocked(dungeon.id, dungeonClears);
                const isSelected = selectedDungeonId === dungeon.id;
                const clears = dungeonClears[dungeon.id] || 0;
                const isBossDungeon = idx === currentActDungeons.length - 1;

                return (
                  <button
                    key={dungeon.id}
                    onClick={() => {
                      if (!unlocked) return;
                      setSelectedDungeonId(dungeon.id);
                    }}
                    disabled={!unlocked}
                    className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/90 border-amber-400 ring-1 ring-amber-400 text-white shadow-lg'
                        : unlocked
                        ? 'bg-iron-900/90 border-iron-750 hover:bg-iron-850 hover:border-iron-600 text-gray-300'
                        : 'bg-iron-950/60 border-iron-800 text-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 leading-tight">
                        <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                          isBossDungeon ? 'bg-red-950 text-red-300 border border-red-500' : 'bg-iron-800 text-gray-300'
                        }`}>
                          {selectedAct}-{idx + 1}
                        </span>
                        <span className="font-bold text-xs truncate text-white">
                          {dungeon.name.split(':')[0]}
                        </span>
                        {isBossDungeon && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                        {unlocked ? `권장 Lv.${dungeon.recommendedLevel} · ${dungeon.rooms.length}구역` : '이전 던전 클리어 필요'}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right font-mono text-[10px]">
                      {clears > 0 ? (
                        <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-600/60">
                          ✓ {clears}회
                        </span>
                      ) : unlocked ? (
                        <span className="text-amber-400 font-bold">도전</span>
                      ) : (
                        <Lock className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-7 flex flex-col justify-between h-full min-h-0 space-y-1.5 overflow-hidden">
          <div className="p-2.5 rounded-lg bg-iron-950/90 border border-brass-600/60 space-y-1.5 shadow">
            <div className="flex items-center justify-between border-b border-iron-800 pb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <h3 className="font-cinzel font-black text-xs sm:text-sm text-amber-200 truncate">
                  {selectedDungeon.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-iron-900 px-1.5 py-0.2 rounded border border-iron-750">
                권장 Lv.{selectedDungeon.recommendedLevel}
              </span>
            </div>

            <p className="text-[10px] text-gray-300 font-mono leading-tight bg-iron-900/60 p-1.5 rounded border border-iron-800">
              {selectedDungeon.theme}
            </p>

            <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-300 flex-wrap">
              <span className="bg-iron-900 px-1.5 py-0.2 rounded border border-iron-750 text-amber-300 font-bold">
                방 {selectedDungeon.rooms.length}개
              </span>
              <span className="bg-iron-900 px-1.5 py-0.2 rounded border border-iron-750 text-purple-300 font-bold">
                출현: {selectedDungeon.monsterSummary}
              </span>
              <span className="bg-iron-900 px-1.5 py-0.2 rounded border border-iron-750 text-emerald-300 font-bold">
                {selectedDungeon.elementalInfo}
              </span>
            </div>
          </div>


          <div className="p-2 rounded-lg bg-iron-950/90 border border-iron-750 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-300">
              <span className="font-bold text-amber-300">⚔️ 원정 난이도 (Difficulty):</span>
              <span className="text-white font-black bg-amber-950 px-2 py-0.2 rounded border border-amber-500">
                Lv.{selectedDifficulty} / 최대 Lv.{maxDiff}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 font-mono text-[10px]">
              {Array.from({ length: maxDiff }, (_, i) => i + 1).map(lv => (
                <button
                  key={lv}
                  onClick={() => setDiffDirect(lv)}
                  className={`py-1 rounded font-bold transition cursor-pointer ${
                    selectedDifficulty === lv
                      ? 'bg-amber-500 text-iron-950 font-black shadow ring-1 ring-amber-300'
                      : 'bg-iron-900 text-gray-400 hover:text-white border border-iron-800'
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-0.5">
              <span>적 HP x{hpMult} · 공격력 x{dmgMult}</span>
              <span className="text-teal-300 font-bold">✨ MF 발견율 +{mfBonus}%</span>
            </div>
          </div>

          <button
            onClick={handleDeploy}
            disabled={!isCurrentDungeonUnlocked}
            className={`w-full py-2.5 rounded-lg text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 shadow-xl cursor-pointer active:scale-95 ${
              isCurrentDungeonUnlocked
                ? 'bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white border border-amber-300 ring-2 ring-amber-400 animate-pulse'
                : 'bg-iron-900 text-gray-600 border border-iron-800 cursor-not-allowed opacity-50'
            }`}
          >
            <Swords className="w-4 h-4 fill-white" />
            <span>[⚔️ {selectedDungeon.name.split(':')[0]} 즉시 출격 (Space)]</span>
          </button>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-iron-900/90 border border-iron-750 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400 flex-wrap gap-1 shadow">
        <span>⌨️ 단축키: <strong className="text-brass-300">[1~5]</strong> 액트 전환 | <strong className="text-brass-300">[↑/↓]</strong> 던전 선택 | <strong className="text-amber-300">[←/→ 또는 +/-]</strong> 난이도 조절 | <strong className="text-amber-300">[Space/Enter]</strong> 출격 | <strong className="text-gray-300">[Esc]</strong> 마을 귀환</span>
        <span className="text-gray-500 hidden sm:inline">[클릭/Space] 던전 입장</span>
      </div>
    </div>
  );
});

DungeonSelectView.displayName = 'DungeonSelectView';
