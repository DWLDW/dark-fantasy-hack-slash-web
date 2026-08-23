import React, { useEffect } from 'react';
import { GameProvider, useGame } from './state/gameStore';
import { TopHUD } from './components/layout/TopHUD';
import { BottomDock } from './components/layout/BottomDock';
import { GlobalModalHost } from './components/modals/GlobalModalHost';
import { TownView } from './components/views/TownView';
import { DungeonSelectView } from './components/views/DungeonSelectView';
import { BattleView } from './components/views/BattleView';
import { WARRIOR_SKILLS } from './data/gameData';
import { startBGM, initAudio } from './utils/audio';

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

  // BGM Auto-Sync based on ViewMode & Room Type
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    if (viewMode === 'town' || viewMode === 'dungeon_select') {
      startBGM('town');
    } else if (viewMode === 'battle') {
      const currentRoom = currentDungeon?.rooms?.find(r => r.id === currentRoomId);
      if (currentRoom?.type === 'boss') {
        startBGM('boss');
      } else {
        startBGM('dungeon');
      }
    }
  }, [viewMode, currentDungeon, currentRoomId]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space / Enter: Execute attack, claim event, or advance to next room
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (viewMode === 'battle') {
          if (monsters.length === 0) {
            const currentRoom = currentDungeon.rooms.find(r => r.id === currentRoomId);
            const isEventRoom = currentRoom && (currentRoom.type === 'treasure' || currentRoom.type === 'rune' || currentRoom.type === 'shrine');

            // 1. If in an interactive room and not yet claimed -> claim reward first!
            if (isEventRoom && !roomEventClaimed) {
              if (currentRoom.type === 'treasure') claimTreasure();
              else if (currentRoom.type === 'rune') claimRuneAltar();
              else if (currentRoom.type === 'shrine') claimShrine('fortune');
              return;
            }

            // 2. Otherwise advance to connected room
            if (currentRoom && currentRoom.connections && currentRoom.connections.length > 0) {
              selectNextRoom(currentRoom.connections[0]);
            }
          } else {
            executeAttack();
          }
        } else if (viewMode === 'town') {
          enterDungeon(currentDungeon.id, currentDifficulty);
        }
        return;
      }

      // Arrow Left / Arrow Right: Lane Shift
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (viewMode === 'battle') {
          setPlayerLane(Math.max(0, playerLane - 1));
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (viewMode === 'battle') {
          setPlayerLane(Math.min(4, playerLane + 1));
        }
        return;
      }

      // 1, 2, 3, 4: Quick Consumables
      if (['1', '2', '3', '4'].includes(e.key)) {
        useConsumable(e.key);
        return;
      }

      // Q, W, E, R: Skill Selection & Double-tap Instant Cast
      if (viewMode === 'battle' && !activeModal) {
        const key = e.key.toLowerCase();
        if (key === 'q') selectSkillOrExecute(WARRIOR_SKILLS[0]);
        if (key === 'w') selectSkillOrExecute(WARRIOR_SKILLS[1]);
        if (key === 'e') selectSkillOrExecute(WARRIOR_SKILLS[2]);
        if (key === 'r') selectSkillOrExecute(WARRIOR_SKILLS[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeModal, executeAttack, selectSkillOrExecute, setPlayerLane, playerLane, enterDungeon, currentDungeon, currentRoomId, currentDifficulty, selectNextRoom, monsters, useConsumable, roomEventClaimed, claimTreasure, claimRuneAltar, claimShrine]);

  return (
    <div className="min-h-screen bg-void flex flex-col justify-between relative overflow-x-hidden text-gray-200">
      {/* Top Fixed HUD */}
      <TopHUD />

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col justify-center">
        {viewMode === 'town' && <TownView />}
        {viewMode === 'dungeon_select' && <DungeonSelectView />}
        {viewMode === 'battle' && <BattleView />}
      </main>

      {/* Bottom Global Dock & Hotkey Bar */}
      <BottomDock />

      {/* Modal / Popup Overlays */}
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
