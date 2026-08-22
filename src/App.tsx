import React, { useEffect } from 'react';
import { GameProvider, useGame } from './state/gameStore';
import { TopHUD } from './components/layout/TopHUD';
import { BottomDock } from './components/layout/BottomDock';
import { GlobalModalHost } from './components/modals/GlobalModalHost';
import { TownView } from './components/views/TownView';
import { DungeonSelectView } from './components/views/DungeonSelectView';
import { BattleView } from './components/views/BattleView';
import { WARRIOR_SKILLS } from './data/gameData';

const MainLayout: React.FC = () => {
  const {
    viewMode,
    activeModal,
    executeAttack,
    setSelectedSkill,
    setPlayerLane,
    playerLane,
    enterDungeon,
    currentDungeon,
    useConsumable
  } = useGame();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space / Enter: Execute attack or fast farm
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (viewMode === 'battle') {
          executeAttack();
        } else if (viewMode === 'town') {
          enterDungeon(currentDungeon.id);
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

      // Q, W, E, R: Skill Selection in battle
      if (viewMode === 'battle' && !activeModal) {
        const key = e.key.toLowerCase();
        if (key === 'q') setSelectedSkill(WARRIOR_SKILLS[0]);
        if (key === 'w') setSelectedSkill(WARRIOR_SKILLS[1]);
        if (key === 'e') setSelectedSkill(WARRIOR_SKILLS[2]);
        if (key === 'r') setSelectedSkill(WARRIOR_SKILLS[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeModal, executeAttack, setSelectedSkill, setPlayerLane, playerLane, enterDungeon, currentDungeon, useConsumable]);

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
