import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { GameProvider, useGame } from './state/gameStore';
import { TopHUD } from './components/layout/TopHUD';
import { BottomDock } from './components/layout/BottomDock';
import { GlobalModalHost } from './components/modals/GlobalModalHost';
import { TownView } from './components/views/TownView';
import { WARRIOR_SKILLS } from './data/skills';
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
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine
  } = useGame();

  const keysRef = useRef({
    viewMode,
    activeModal,
    executeAttack,
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine
  });
  keysRef.current = {
    viewMode,
    activeModal,
    executeAttack,
    selectSkillOrExecute,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    currentRoomId,
    currentDifficulty,
    selectNextRoom,
    monsters,
    useConsumable,
    roomEventClaimed,
    claimTreasure,
    claimRuneAltar,
    claimShrine
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const g = keysRef.current;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (g.viewMode === 'battle') {
          if (g.monsters.length === 0) {
            const currentRoom = g.currentDungeon.rooms.find(r => r.id === g.currentRoomId);
            const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');

            if (isEventRoom && !g.roomEventClaimed) {
              if (currentRoom.type === 'treasure') g.claimTreasure();
              else if (currentRoom.type === 'rune') g.claimRuneAltar();
              else if (currentRoom.type === 'shrine') g.claimShrine('fortune');
              return;
            }

            if (currentRoom && currentRoom.connections && currentRoom.connections.length > 0) {
              g.selectNextRoom(currentRoom.connections[0]);
            }
          } else {
            g.executeAttack();
          }
        } else if (g.viewMode === 'town') {
          g.enterDungeon(g.currentDungeon.id, g.currentDifficulty);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (g.viewMode === 'battle') g.setPlayerLane(Math.max(0, g.playerLane - 1));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (g.viewMode === 'battle') g.setPlayerLane(Math.min(4, g.playerLane + 1));
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        g.useConsumable(e.key);
        return;
      }

      if (g.viewMode === 'battle' && !g.activeModal) {
        const key = e.key.toLowerCase();
        if (key === 'q') g.selectSkillOrExecute(WARRIOR_SKILLS[0]);
        if (key === 'w') g.selectSkillOrExecute(WARRIOR_SKILLS[1]);
        if (key === 'e') g.selectSkillOrExecute(WARRIOR_SKILLS[2]);
        if (key === 'r') g.selectSkillOrExecute(WARRIOR_SKILLS[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-void flex flex-col justify-between relative overflow-x-hidden text-gray-200">
      <TopHUD />

      <main className="flex-1 w-full flex flex-col justify-center">
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
