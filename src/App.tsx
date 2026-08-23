import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { GameProvider, useGame } from './state/gameStore';
import { TopHUD } from './components/layout/TopHUD';
import { BottomDock } from './components/layout/BottomDock';
import { GlobalModalHost } from './components/modals/GlobalModalHost';
import { InteractiveTutorial } from './components/tutorial/InteractiveTutorial';
import { TownView } from './components/views/TownView';

import { startBGM, initAudio } from './utils/audio';

const DungeonSelectView = lazy(() =>
  import('./components/views/DungeonSelectView').then(m => ({ default: m.DungeonSelectView }))
);
const BattleView = lazy(() =>
  import('./components/views/BattleView').then(m => ({ default: m.BattleView }))
);

const ViewFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-2 border-brass-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MainLayout: React.FC = () => {
  const {
    viewMode,
    activeModal,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    pendingExitRoomId,
    cyclePendingExit,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    getSkillForSlot,
    selectedShrineType,
    cycleShrineSelection,
    playerStats
  } = useGame();

  const keysRef = useRef({
    viewMode,
    activeModal,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    pendingExitRoomId,
    cyclePendingExit,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    getSkillForSlot,
    selectedShrineType,
    cycleShrineSelection,
    playerStats
  });
  keysRef.current = {
    viewMode,
    activeModal,
    executeAttack,
    isAttacking,
    isEnemyTurn,
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    pendingExitRoomId,
    cyclePendingExit,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine,
    getSkillForSlot,
    selectedShrineType,
    cycleShrineSelection,
    playerStats
  };

  useEffect(() => {
    const onFirst = () => {
      initAudio();
      window.removeEventListener('click', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
    window.addEventListener('click', onFirst);
    window.addEventListener('keydown', onFirst);
    return () => {
      window.removeEventListener('click', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
  }, []);

  const bgmMode =
    viewMode === 'battle'
      ? currentDungeon?.rooms?.find(r => r.id === currentRoomId)?.type === 'boss'
        ? 'boss'
        : 'dungeon'
      : 'town';

  useEffect(() => {
    startBGM(bgmMode);
  }, [bgmMode]);

  useEffect(() => {
    let cancelled = false;
    const prefetch = () => {
      if (cancelled) return;
      void import('./components/views/BattleView');
      void import('./components/views/DungeonSelectView');
    };
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(prefetch);
    } else {
      timeoutId = window.setTimeout(prefetch, 500);
    }
    return () => {
      cancelled = true;
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  const prevHpRef = useRef(playerStats.hp);
  const dangerLockUntilRef = useRef<number>(0);

  useEffect(() => {
    const isLow = playerStats.hp > 0 && (playerStats.hp / Math.max(1, playerStats.maxHp)) <= 0.25;
    const wasLow = prevHpRef.current > 0 && (prevHpRef.current / Math.max(1, playerStats.maxHp)) <= 0.25;
    if (isLow && !wasLow) {
      dangerLockUntilRef.current = Date.now() + 1000;
    }
    prevHpRef.current = playerStats.hp;
  }, [playerStats.hp, playerStats.maxHp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const g = keysRef.current;

      if (g.activeModal) return;

      if (Date.now() < dangerLockUntilRef.current) {
        if (!['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          return;
        }
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (g.viewMode === 'battle') {
          if (g.monsters.length > 0) {
            if (!g.isAttacking && !g.isEnemyTurn) g.executeAttack();
            return;
          }
          if (e.repeat) return;
          if (g.monsters.length === 0) {
            const currentRoom = g.currentDungeon.rooms.find(r => r.id === g.currentRoomId);
            const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');

            if (isEventRoom && !g.roomEventClaimed) {
              if (currentRoom.type === 'treasure') g.claimTreasure();
              else if (currentRoom.type === 'rune') g.claimRuneAltar();
              else if (currentRoom.type === 'shrine') g.claimShrine(g.selectedShrineType);
              return;
            }

            const cons = currentRoom?.connections || [];
            if (cons.length > 0) {
              const nextId = (g.pendingExitRoomId && cons.includes(g.pendingExitRoomId))
                ? g.pendingExitRoomId
                : cons[0];
              g.selectNextRoom(nextId);
            }
          }
        } else if (g.viewMode === 'town') {
          g.enterDungeon(g.currentDungeon.id, g.currentDifficulty);
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (g.viewMode !== 'battle') return;
        const currentRoom = g.currentDungeon.rooms.find(r => r.id === g.currentRoomId);
        const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');
        if (isEventRoom && !g.roomEventClaimed && currentRoom?.type === 'shrine') {
          g.cycleShrineSelection(e.key === 'ArrowLeft' ? -1 : 1);
          return;
        }
        const canPickExit = g.monsters.length === 0 && (!isEventRoom || g.roomEventClaimed) && (currentRoom?.connections?.length || 0) > 1;
        if (canPickExit) {
          g.cyclePendingExit(e.key === 'ArrowLeft' ? -1 : 1);
          return;
        }
        g.setPlayerLane(e.key === 'ArrowLeft' ? Math.max(0, g.playerLane - 1) : Math.min(3, g.playerLane + 1));
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        g.useConsumable(e.key);
        return;
      }

      if (g.viewMode === 'battle' && !g.activeModal) {
        const key = e.key.toLowerCase();
        if (key === 'q') g.selectSkillOrExecute(g.getSkillForSlot('Q'));
        if (key === 'w') g.selectSkillOrExecute(g.getSkillForSlot('W'));
        if (key === 'e') g.selectSkillOrExecute(g.getSkillForSlot('E'));
        if (key === 'r') g.selectSkillOrExecute(g.getSkillForSlot('R'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-void flex flex-col justify-between relative overflow-hidden text-gray-200 overscroll-none select-none">
      <TopHUD />

      <main className="flex-1 w-full flex flex-col justify-start overflow-y-auto overflow-x-hidden overscroll-contain pb-16 sm:pb-0">
        {viewMode === 'town' && <TownView />}
        {viewMode === 'dungeon_select' && (
          <Suspense fallback={<ViewFallback />}>
            <DungeonSelectView />
          </Suspense>
        )}
        {viewMode === 'battle' && (
          <Suspense fallback={<ViewFallback />}>
            <BattleView />
          </Suspense>
        )}
      </main>

      <BottomDock />
      <GlobalModalHost />
      <InteractiveTutorial />
    </div>
  );
};

export function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}

export default App;
