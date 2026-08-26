import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { DUNGEONS_DATA, ACT_DUNGEON_GROUPS, isDungeonUnlocked, isActUnlocked, generateEndlessRiftDungeon } from '../../data/dungeons';
import { ACT_THEMES } from '../../utils/actThemes';
import {
  Compass,
  Flame,
  ArrowRight,
  Skull,
  Plus,
  Minus,
  Lock,
  CheckCircle2,
  ArrowLeft,
  X,
  Swords,
  Sparkles,
  Zap,
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
    const ids = ACT_DUNGEON_GROUPS[selectedAct] || ACT_DUNGEON_GROUPS[1];
    return ids.map(id => DUNGEONS_DATA.find(d => d.id === id)!).filter(Boolean);
  }, [selectedAct]);

  const [selectedDungeonId, setSelectedDungeonId] = useState<string>(currentActDungeons[0]?.id || DUNGEONS_DATA[0].id);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  const selectedDungeon = useMemo(() => {
    if (selectedAct === 'rift') {
      return generateEndlessRiftDungeon(selectedRiftTier);
    }
    return DUNGEONS_DATA.find(d => d.id === selectedDungeonId) || currentActDungeons[0] || DUNGEONS_DATA[0];
  }, [selectedAct, selectedRiftTier, selectedDungeonId, currentActDungeons]);

  const maxDiff = Math.max(1, maxUnlockedDifficulty || 1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(currentDifficulty || 1);

  const isCurrentDungeonUnlocked = selectedAct === 'rift' ? isRiftUnlocked : isDungeonUnlocked(selectedDungeon.id, dungeonClears);

  const changeDifficulty = (delta: number) => {
    const next = Math.max(1, Math.min(maxDiff, selectedDifficulty + delta));
    setSelectedDifficulty(next);
    setCurrentDifficulty(next);
  };

  const setDiffDirect = (target: number) => {
    const next = Math.max(1, Math.min(maxDiff, target));
    setSelectedDifficulty(next);
    setCurrentDifficulty(next);
  };

  const openDungeonDeploy = (dungeonId: string) => {
    if (!isDungeonUnlocked(dungeonId, dungeonClears)) return;
    setSelectedDungeonId(dungeonId);
    setIsDeployModalOpen(true);
  };

  const handleDeploy = () => {
    if (!isCurrentDungeonUnlocked) return;
    setIsDeployModalOpen(false);
    enterDungeon(selectedDungeon.id, selectedDifficulty);
  };

  // Comprehensive keyboard shortcut listener:
  // - Difficulty cycling (ArrowLeft/Right or +/- keys)
  // - Act switching (1~5)
  // - Dungeon selection (Up/Down)
  // - Deploy / Open modal (Space/Enter)
  // - Close / Return to Town (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (activeModal || confirmDialogState?.isOpen) return;

      // When Deploy Modal is Open:
      if (isDeployModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setIsDeployModalOpen(false);
          return;
        }

        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          handleDeploy();
          return;
        }

        if (
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowDown' ||
          e.key === '-' ||
          e.key === '_' ||
          e.code === 'NumpadSubtract'
        ) {
          e.preventDefault();
          e.stopPropagation();
          changeDifficulty(-1);
          return;
        }

        if (
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === '+' ||
          e.key === '=' ||
          e.code === 'NumpadAdd'
        ) {
          e.preventDefault();
          e.stopPropagation();
          changeDifficulty(1);
          return;
        }
        return;
      }

      // When Main Map View is Active:
      if (e.key === 'Escape') {
        e.preventDefault();
        setViewMode('town');
        return;
      }

      // Act 1~5 Switching via Number keys
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

      // Dungeon Selection via ArrowUp / ArrowDown
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const curIdx = currentActDungeons.findIndex(d => d.id === selectedDungeonId);
        let nextIdx = 0;
        if (e.key === 'ArrowDown') {
          nextIdx = curIdx < currentActDungeons.length - 1 ? curIdx + 1 : 0;
        } else {
          nextIdx = curIdx > 0 ? curIdx - 1 : currentActDungeons.length - 1;
        }
        setSelectedDungeonId(currentActDungeons[nextIdx].id);
        return;
      }

      // Difficulty cycling on map
      if (e.key === 'ArrowLeft' || e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        changeDifficulty(-1);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
        e.preventDefault();
        changeDifficulty(1);
        return;
      }

      // Open Deploy Modal / Launch via Space / Enter
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (selectedAct === 'rift') {
          if (isRiftUnlocked) {
            enterDungeon(`endless_rift_t${selectedRiftTier}`, maxDiff);
          }
        } else if (isCurrentDungeonUnlocked) {
          openDungeonDeploy(selectedDungeon.id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isDeployModalOpen,
    selectedDungeon.id,
    selectedDifficulty,
    isCurrentDungeonUnlocked,
    activeModal,
    confirmDialogState?.isOpen,
    currentActDungeons,
    selectedDungeonId,
    dungeonClears,
    maxDiff
  ]);

  // Multipliers preview
  const hpMult = (1 + (selectedDifficulty - 1) * 0.35).toFixed(2);
  const dmgMult = (1 + (selectedDifficulty - 1) * 0.25).toFixed(2);
  const mfBonus = (selectedDifficulty - 1) * 3;

  return (
    <div className={`w-full max-w-5xl mx-auto p-2 sm:p-4 pb-28 sm:pb-32 text-gray-200 select-none font-sans space-y-3 rounded-xl ${selectedAct === 'rift' ? 'bg-gradient-to-b from-purple-950/60 via-iron-950 to-purple-950/70' : (ACT_THEMES[selectedAct]?.bgGradient || '')}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-iron-750 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blood-950/80 border border-blood-600 flex items-center justify-center text-blood-400 shadow flex-shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg md:text-xl font-cinzel font-black text-white tracking-wider flex items-center gap-2">
              <span>성역 월드맵 & 원정 게이트</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono hidden sm:block">
              각 액트의 4개 던전을 순차적으로 공략하거나 대균열(Endless Rift)에서 무한 파밍에 도전하세요.
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewMode('town')}
          className="px-3 py-1.5 rounded-lg bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer flex-shrink-0"
          title="마을로 돌아갑니다 [Esc]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>마을 귀환</span>
          <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-gray-400 border border-iron-750">Esc</kbd>
        </button>
      </div>

      {/* 6 Tabs Switcher (Acts 1..5 + Endless Rift) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
        {([1, 2, 3, 4, 5] as const).map(actNum => {
          const isActOpen = isActUnlocked(actNum, dungeonClears);
          const actDungeons = ACT_DUNGEON_GROUPS[actNum] || [];
          const clearedInAct = actDungeons.filter(dId => (dungeonClears[dId] || 0) >= 1).length;
          const isActCompleted = clearedInAct === actDungeons.length;
          const isSelected = selectedAct === actNum;

          return (
            <button
              key={actNum}
              onClick={() => {
                if (!isActOpen) return;
                setSelectedAct(actNum);
                const firstDId = ACT_DUNGEON_GROUPS[actNum][0];
                setSelectedDungeonId(firstDId);
              }}
              disabled={!isActOpen}
              className={`p-1.5 sm:p-2.5 rounded-lg border-2 text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? `${ACT_THEMES[actNum].accentBadge} border-brass-400 ring-2 ring-brass-400/60 shadow-[0_0_18px_rgba(251,191,36,0.4)]`
                  : isActOpen
                  ? 'bg-iron-900/90 border-iron-750 hover:border-iron-600 hover:bg-iron-850 cursor-pointer'
                  : 'bg-iron-950/60 border-iron-850 opacity-50 cursor-not-allowed text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono font-black text-xs flex items-center gap-1 ${isSelected ? 'text-brass-300' : isActOpen ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>ACT {actNum}</span>
                  <span className="text-[9px] opacity-70">[{actNum}]</span>
                </span>
                {isActCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : !isActOpen ? (
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <span className="text-[10px] font-mono font-bold text-amber-300">[{clearedInAct}/4]</span>
                )}
              </div>
              <div className="font-bold text-[10px] sm:text-[11px] truncate mt-0.5 text-gray-200 hidden sm:block">
                {ACT_NAMES[actNum].title.split(':')[1]}
              </div>
            </button>
          );
        })}

        {/* 🌌 6th Tab: Endless Rift */}
        <button
          key="rift"
          onClick={() => {
            if (!isRiftUnlocked) return;
            setSelectedAct('rift');
          }}
          disabled={!isRiftUnlocked}
          className={`p-1.5 sm:p-2.5 rounded-lg border-2 text-left transition relative flex flex-col justify-between ${
            selectedAct === 'rift'
              ? 'bg-gradient-to-b from-purple-950/90 via-iron-950 to-purple-950/90 border-purple-400 ring-2 ring-purple-400/60 shadow-[0_0_20px_rgba(192,132,252,0.5)]'
              : isRiftUnlocked
              ? 'bg-purple-950/40 border-purple-800/60 hover:border-purple-500 hover:bg-purple-900/50 cursor-pointer'
              : 'bg-iron-950/60 border-iron-850 opacity-50 cursor-not-allowed text-gray-600'
          }`}
          title={isRiftUnlocked ? "무한 파밍 대균열 모드" : "5막 최종 보스 정복 후 해금"}
        >
          <div className="flex items-center justify-between">
            <span className={`font-mono font-black text-xs flex items-center gap-1 ${selectedAct === 'rift' ? 'text-purple-300' : isRiftUnlocked ? 'text-purple-300' : 'text-gray-600'}`}>
              <span>🌌 대균열</span>
            </span>
            {isRiftUnlocked ? (
              <span className="text-[10px] font-mono font-black text-purple-300">T{endlessRiftTier}</span>
            ) : (
              <Lock className="w-3.5 h-3.5 text-gray-500" />
            )}
          </div>
          <div className="font-bold text-[10px] sm:text-[11px] truncate mt-0.5 text-purple-200 hidden sm:block">
            Endless Rift
          </div>
        </button>
      </div>

      {selectedAct === 'rift' ? (
        /* 🌌 Dedicated Endless Rift Command Center */
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-iron-950 via-purple-950/40 to-iron-950 border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.3)] space-y-4 animate-fade-in">
          {/* Header & Tier Control Row */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-purple-800/50 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-cinzel font-black text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span>{selectedDungeon.name}</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900 border border-purple-400 text-purple-200 font-mono font-black text-xs">
                  Lv.{selectedDungeon.recommendedLevel} 권장
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 font-mono font-black text-xs flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  최고 난이도 (Lv.{maxDiff}) 자동 적용
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-1">
                {selectedDungeon.theme} · 몬스터 수량: {selectedDungeon.riftTier ? 16 + Math.min(8, Math.floor(selectedDungeon.riftTier / 4)) : 16}마리 군세
              </p>
            </div>

            {/* Tier Controls */}
            <div className="flex items-center gap-2 bg-iron-950 p-1.5 rounded-xl border border-purple-500 shadow">
              <button
                onClick={() => setSelectedRiftTier(t => Math.max(1, t - 1))}
                disabled={selectedRiftTier <= 1}
                className="w-8 h-8 rounded-lg bg-iron-900 hover:bg-iron-800 disabled:opacity-40 text-purple-300 font-black text-sm flex items-center justify-center border border-iron-750 transition cursor-pointer"
                title="티어 낮추기"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 font-mono font-black text-sm sm:text-base text-purple-200 text-center min-w-[90px]">
                Tier {selectedRiftTier}
              </div>
              <button
                onClick={() => setSelectedRiftTier(t => Math.min(endlessRiftTier + 5, t + 1))}
                className="w-8 h-8 rounded-lg bg-iron-900 hover:bg-iron-800 text-purple-300 font-black text-sm flex items-center justify-center border border-iron-750 transition cursor-pointer"
                title="티어 올리기"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-iron-950/80 border border-purple-800/60 space-y-1">
              <div className="text-purple-300 font-bold flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-purple-400" />
                <span>전술 군세 스폰 ({selectedDungeon.riftSpawnPattern})</span>
              </div>
              <div className="text-gray-400 text-[11px]">
                16~24마리의 대규모 몬스터가 전술 패턴(세로 돌파 / 가로 횡대 / 대군세)으로 출현하여 관통 및 휩쓸기 쾌감을 선사합니다.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-iron-950/80 border border-purple-800/60 space-y-1">
              <div className="text-yellow-300 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>동적 등반 & 하향 안착</span>
              </div>
              <div className="text-gray-400 text-[11px]">
                퍼펙트 클리어 시 +3단계씩 고속 급상승하고, 실패 시 -1단계 하향되어 유저 스펙에 맞는 최적 파밍을 지원합니다.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-iron-950/80 border border-purple-800/60 space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>신화적 보물 잭팟 드랍</span>
              </div>
              <div className="text-gray-400 text-[11px]">
                할배검, 바람살, 샤코 및 Ber, Jah, Zod 등 최고위 룬 드랍 시 화면 전체 골든 라이트 빔 잭팟 연출이 발동합니다.
              </div>
            </div>
          </div>

          {/* Launch Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-400 font-mono">
              [Space] 키를 누르면 대균열 {selectedRiftTier}단계로 즉시 출격합니다.
            </div>
            <button
              onClick={() => {
                enterDungeon(`endless_rift_t${selectedRiftTier}`, maxDiff);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-cinzel font-black text-sm shadow-[0_0_20px_rgba(168,85,247,0.5)] transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>대균열 출격 [Space]</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Act Title Banner */}
          <div className="text-xs font-cinzel font-bold text-gray-300 px-1 flex items-center justify-between border-b border-iron-800 pb-1">
            <span>{ACT_NAMES[selectedAct as number]?.title} — 4대 원정 던전</span>
            <span className="text-[10px] text-gray-400 font-mono">{ACT_NAMES[selectedAct as number]?.subtitle}</span>
          </div>

          {/* 4 Dungeons List (Clean & Compact with Zero Scrolling Needed) */}
          <div className="space-y-2">
            {currentActDungeons.map((dungeon, idx) => {
              const unlocked = isDungeonUnlocked(dungeon.id, dungeonClears);
              const isSelected = dungeon.id === selectedDungeon.id;
              const clearCount = dungeonClears[dungeon.id] || 0;

              return (
                <div
                  key={dungeon.id}
                  onClick={() => {
                    if (unlocked) openDungeonDeploy(dungeon.id);
                  }}
                  className={`p-2.5 sm:p-3.5 rounded-lg border-2 transition relative flex items-center justify-between gap-3 ${
                    !unlocked
                      ? 'bg-iron-950/70 border-iron-850 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-blood-950/90 via-iron-900 to-iron-900 border-brass-400 ring-2 ring-brass-400/60 shadow-[0_0_20px_rgba(251,191,36,0.28)] cursor-pointer'
                      : 'bg-iron-900/80 border-iron-750 hover:border-iron-600 hover:bg-iron-850 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono font-black text-sm flex-shrink-0 ${
                      isSelected
                        ? 'bg-brass-500 text-iron-950 shadow font-black'
                        : unlocked
                        ? 'bg-iron-950 text-amber-300 border border-iron-700 font-bold'
                        : 'bg-iron-950 text-gray-600 border border-iron-850'
                    }`}>
                      {unlocked ? idx + 1 : <Lock className="w-4 h-4 text-gray-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {dungeon.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-iron-950 border border-iron-750 text-amber-300 font-bold">
                          Lv.{dungeon.recommendedLevel} 권장
                        </span>
                        {clearCount > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold">
                            클리어: {clearCount}회
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5 font-mono">
                        {dungeon.theme} · 출현: {dungeon.monsterSummary}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center flex-shrink-0">
                    {unlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDungeonDeploy(dungeon.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black text-xs shadow transition transform active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>출격 설정</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono font-bold">
                        이전 장 클리어 필요
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* POPUP MODAL: Focused Difficulty Selection & Dungeon Launch (z-[60], sits above HUD and below global modals) */}
      {isDeployModalOpen && (
        <div
          onClick={() => setIsDeployModalOpen(false)}
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-iron-950 border-2 border-brass-500 rounded-xl p-4 sm:p-5 max-w-lg w-full max-h-[85dvh] sm:max-h-[90dvh] overflow-y-auto shadow-2xl space-y-3 relative animate-scale-in text-gray-200 select-none font-sans pb-6 sm:pb-5"
          >
            {/* Modal Header (Sticky top) */}
            <div className="sticky -top-4 -mx-4 px-4 pt-1 pb-2.5 bg-iron-950/95 backdrop-blur border-b border-iron-750 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-blood-400" />
                <div>
                  <h2 className="font-cinzel font-black text-sm sm:text-base text-brass-200">
                    {selectedDungeon.name}
                  </h2>
                  <span className="text-[10px] font-mono text-gray-400">
                    권장 레벨: Lv.{selectedDungeon.recommendedLevel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dungeon Theme & Description */}
            <div className="space-y-1.5 text-xs text-gray-300 font-mono">
              <div className="p-2 rounded bg-iron-900/90 border border-iron-800 leading-relaxed">
                {selectedDungeon.theme}
              </div>
              <div className="p-2 rounded bg-iron-900/90 border border-iron-800 text-[11px] leading-relaxed">
                <span className="text-amber-300 font-bold">⚡ 전술 특성: </span>{selectedDungeon.elementalInfo}
              </div>
            </div>

            {/* Difficulty Tuner */}
            <div className="p-3 bg-iron-900/90 rounded-lg border border-iron-750 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1 font-mono">
                  <Flame className="w-4 h-4 text-amber-400" />
                  난이도 선택
                </span>
                <span className="text-xs font-mono font-black text-amber-300 bg-iron-950 px-2 py-0.5 rounded border border-iron-800">
                  Lv.{selectedDifficulty} / 최대 Lv.{maxDiff}
                </span>
              </div>

              {/* Minus / Value / Plus Buttons */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  onClick={() => changeDifficulty(-1)}
                  disabled={selectedDifficulty <= 1}
                  className="w-14 h-9 rounded bg-iron-950 hover:bg-iron-800 disabled:opacity-40 border border-iron-700 font-black text-xs flex items-center justify-center gap-1 text-gray-300 cursor-pointer"
                  title="난이도 1단계 감소 [← 또는 -]"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <kbd className="text-[9px] font-mono text-gray-400">←/-</kbd>
                </button>

                <div className="flex-1 text-center font-mono font-black text-xl text-amber-300 tracking-wider">
                  Lv.{selectedDifficulty}
                </div>

                <button
                  onClick={() => changeDifficulty(1)}
                  disabled={selectedDifficulty >= maxDiff}
                  className="w-14 h-9 rounded bg-iron-950 hover:bg-iron-800 disabled:opacity-40 border border-iron-700 font-black text-xs flex items-center justify-center gap-1 text-gray-300 cursor-pointer"
                  title="난이도 1단계 증가 [→ 또는 +]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <kbd className="text-[9px] font-mono text-gray-400">→/+</kbd>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1 pt-1 font-mono text-[10px]">
                {[1, 5, 10, 20, maxDiff].filter((v, i, a) => v <= maxDiff && a.indexOf(v) === i).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDiffDirect(lvl)}
                    className={`flex-1 py-1 rounded border transition cursor-pointer ${
                      selectedDifficulty === lvl
                        ? 'bg-amber-500 text-iron-950 font-black border-amber-400 shadow'
                        : 'bg-iron-950 text-gray-400 border-iron-800 hover:text-white'
                    }`}
                  >
                    Lv.{lvl}
                  </button>
                ))}
              </div>

              {/* Multipliers Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-iron-800 text-[10px] font-mono text-center">
                <div className="bg-iron-950 p-1.5 rounded border border-iron-800">
                  <div className="text-gray-500">몬스터 HP</div>
                  <div className="text-rose-300 font-bold">x{hpMult}</div>
                </div>
                <div className="bg-iron-950 p-1.5 rounded border border-iron-800">
                  <div className="text-gray-500">몬스터 공격력</div>
                  <div className="text-amber-300 font-bold">x{dmgMult}</div>
                </div>
                <div className="bg-iron-950 p-1.5 rounded border border-iron-800">
                  <div className="text-gray-500">골드/드랍</div>
                  <div className="text-emerald-300 font-bold">+{mfBonus}% MF</div>
                </div>
              </div>
            </div>

            {/* Launch Action Button (Clearly visible above bottom nav) */}
            <div className="pt-2 border-t border-iron-750">
              <button
                onClick={handleDeploy}
                className="w-full py-3.5 bg-gradient-to-r from-blood-700 via-blood-600 to-amber-600 hover:from-blood-600 hover:to-amber-500 text-white font-black text-sm rounded-lg transition shadow-xl ring-2 ring-amber-400/60 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 animate-pulse"
              >
                <span>⚔️ [{selectedDungeon.name.split(':')[0]}] Lv.{selectedDifficulty} 원정 출격</span>
                <kbd className="text-[10px] font-mono font-bold bg-black/40 px-1.5 py-0.5 rounded border border-amber-300/50">Space / Enter</kbd>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Keyboard Shortcut Guide Bar */}
      <div className="p-2.5 rounded-lg bg-iron-900/90 border border-iron-750 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400 flex-wrap gap-1 shadow">
        <span>⌨️ 단축키: <strong className="text-brass-300">[1~5]</strong> 액트 전환 | <strong className="text-brass-300">[↑/↓]</strong> 던전 선택 | <strong className="text-amber-300">[←/→ 또는 +/-]</strong> 난이도 조절 | <strong className="text-amber-300">[Space/Enter]</strong> 출격 | <strong className="text-gray-300">[Esc]</strong> 마을 귀환</span>
        <span className="text-gray-500 hidden sm:inline">[클릭/Space] 던전 입장</span>
      </div>
    </div>
  );
});

DungeonSelectView.displayName = 'DungeonSelectView';
