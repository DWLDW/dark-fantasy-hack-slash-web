import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { GameProvider, useGame } from './state/gameStore';
import { TopHUD } from './components/layout/TopHUD';
import { BottomDock } from './components/layout/BottomDock';
import { GlobalModalHost } from './components/modals/GlobalModalHost';
import { TownView } from './components/views/TownView';

import { startBGM, initAudio } from './utils/audio';

const InteractiveTutorial = lazy(() =>
  import('./components/tutorial/InteractiveTutorial').then(m => ({ default: m.InteractiveTutorial }))
);
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
    isVictoryModalOpen,
    isDeathModalOpen,
    isTutorialOpen,
    confirmDialogState,
    executeAttack, triggerAttackOrSmartTarget, isManualLaneTargeted,
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
    setSelectedShrineType,
    cycleShrineSelection,
    playerStats,
    endlessRiftTier
  } = useGame();

  const keysRef = useRef({
    viewMode,
    activeModal,
    isVictoryModalOpen,
    isDeathModalOpen,
    isTutorialOpen,
    confirmDialogState,
    executeAttack, triggerAttackOrSmartTarget, isManualLaneTargeted,
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
    setSelectedShrineType,
    cycleShrineSelection,
    playerStats
  });
  keysRef.current = {
    viewMode,
    activeModal,
    isVictoryModalOpen,
    isDeathModalOpen,
    isTutorialOpen,
    confirmDialogState,
    executeAttack, triggerAttackOrSmartTarget, isManualLaneTargeted,
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
    setSelectedShrineType,
    cycleShrineSelection,
    playerStats
  };

  // Global Audio Unlock on first user gesture
  useEffect(() => {
    const onFirst = () => {
      initAudio();
      window.removeEventListener('click', onFirst);
      window.removeEventListener('keydown', onFirst);
      window.removeEventListener('touchstart', onFirst);
    };
    window.addEventListener('click', onFirst);
    window.addEventListener('keydown', onFirst);
    window.addEventListener('touchstart', onFirst, { passive: true });
    return () => {
      window.removeEventListener('click', onFirst);
      window.removeEventListener('keydown', onFirst);
      window.removeEventListener('touchstart', onFirst);
    };
  }, []);

  const isBossRoom = viewMode === 'battle' && currentDungeon?.rooms?.find(r => r.id === currentRoomId)?.type === 'boss';
  const isRift = Boolean(currentDungeon?.isEndlessRift || currentDungeon?.id?.startsWith('endless_rift_'));
  
  const currentAct = React.useMemo(() => {
    const id = (currentDungeon?.id || '').toLowerCase();
    if (id.startsWith('act5') || id.includes('worldstone') || id.includes('arreat')) return 5;
    if (id.startsWith('act4') || id.includes('chaos') || id.includes('diablo')) return 4;
    if (id.startsWith('act3') || id.includes('kurast') || id.includes('mephisto') || id.includes('jungle')) return 3;
    if (id.startsWith('act2') || id.includes('tomb') || id.includes('desert') || id.includes('duriel') || id.includes('gholein')) return 2;
    return 1;
  }, [currentDungeon?.id]);

  const bossName = React.useMemo(() => {
    if (!isBossRoom) return undefined;
    return monsters.find(m => m.rank === 'boss')?.name;
  }, [isBossRoom, monsters]);

  useEffect(() => {
    const mode = viewMode === 'battle' ? (isBossRoom ? 'boss' : 'dungeon') : 'town';
    startBGM({
      mode,
      act: currentAct,
      isRift,
      riftTier: currentDungeon?.riftTier || endlessRiftTier,
      bossName
    });
  }, [viewMode, isBossRoom, currentAct, isRift, currentDungeon?.riftTier, endlessRiftTier, bossName]);

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

      const isAnyOverlayActive = Boolean(
        g.activeModal ||
        g.isVictoryModalOpen ||
        g.isDeathModalOpen ||
        g.isTutorialOpen ||
        g.confirmDialogState?.isOpen
      );
      if (isAnyOverlayActive) return;

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
            if (!g.isAttacking && !g.isEnemyTurn) g.triggerAttackOrSmartTarget();
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

      const currentRoom = g.currentDungeon.rooms.find(r => r.id === g.currentRoomId);
      const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');
      const isShrineSelectActive = g.viewMode === 'battle' && g.monsters.length === 0 && isEventRoom && !g.roomEventClaimed && currentRoom?.type === 'shrine';

      if (isShrineSelectActive) {
        if (e.key === '1') {
          e.preventDefault();
          g.setSelectedShrineType('fortune');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          g.setSelectedShrineType('crit');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          g.setSelectedShrineType('defense');
          return;
        }
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || (isShrineSelectActive && (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd'))) {
        e.preventDefault();
        if (g.viewMode !== 'battle') return;
        const isLeft = e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a';
        if (isShrineSelectActive) {
          g.cycleShrineSelection(isLeft ? -1 : 1);
          return;
        }
        const canPickExit = g.monsters.length === 0 && (!isEventRoom || g.roomEventClaimed) && (currentRoom?.connections?.length || 0) > 1;
        if (canPickExit) {
          g.cyclePendingExit(isLeft ? -1 : 1);
          return;
        }
        g.setPlayerLane(isLeft ? Math.max(0, g.playerLane - 1) : Math.min(4, g.playerLane + 1), true);
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

      <main className="flex-1 w-full min-h-0 overflow-hidden flex flex-col relative">
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
      {isTutorialOpen && (
        <Suspense fallback={null}>
          <InteractiveTutorial />
        </Suspense>
      )}
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

