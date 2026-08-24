import React, { Suspense, lazy } from 'react';
import { useGame } from '../../state/gameStore';
import { ConfirmModal } from './ConfirmModal';

// Code-split modals so they load on demand asynchronously without blocking initial page load
const InventoryModal = lazy(() => import('./InventoryModal').then(m => ({ default: m.InventoryModal })));
const CharacterModal = lazy(() => import('./CharacterModal').then(m => ({ default: m.CharacterModal })));
const SkillRuneModal = lazy(() => import('./SkillRuneModal').then(m => ({ default: m.SkillRuneModal })));
const DungeonVictoryModal = lazy(() => import('./DungeonVictoryModal').then(m => ({ default: m.DungeonVictoryModal })));
const DeathModal = lazy(() => import('./DeathModal').then(m => ({ default: m.DeathModal })));
const SettingsModal = lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const AchievementModal = lazy(() => import('./AchievementModal').then(m => ({ default: m.AchievementModal })));

const ModalLoadingFallback: React.FC = () => (
  <div className="bg-iron-950/90 border border-brass-600/60 rounded-lg p-6 flex flex-col items-center justify-center gap-3 shadow-2xl text-center min-w-[280px]">
    <div className="w-8 h-8 border-2 border-brass-400 border-t-transparent rounded-full animate-spin"></div>
    <span className="font-cinzel text-xs font-bold text-brass-300 tracking-wider animate-pulse">
      모달 데이터를 불러오는 중...
    </span>
  </div>
);

export const GlobalModalHost: React.FC = React.memo(() => {
  const {
    activeModal,
    closeModal,
    isDeathModalOpen,
    isVictoryModalOpen,
    confirmDeathAndReturnToTown,
    confirmDialogState
  } = useGame();

  const isAnyModalOpen = Boolean(activeModal || isDeathModalOpen || isVictoryModalOpen || confirmDialogState?.isOpen);

  if (!isAnyModalOpen) return null;

  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"><ModalLoadingFallback /></div>}>
        {/* Victory Loot Modal (Triggered on Dungeon Completion) */}
        {isVictoryModalOpen && <DungeonVictoryModal />}

        {/* Death & Defeat Modal (Triggered on HP 0) */}
        {isDeathModalOpen && <DeathModal isOpen={isDeathModalOpen} onConfirm={confirmDeathAndReturnToTown} />}

        {/* Standard Active Modals */}
        {activeModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            {activeModal === 'inventory' && <InventoryModal />}
            {activeModal === 'character' && <CharacterModal />}
            {activeModal === 'skills' && <SkillRuneModal />}
            {activeModal === 'settings' && <SettingsModal />}
            {activeModal === 'achievement' && <AchievementModal />}
          </div>
        )}
      </Suspense>

      {/* Global In-Game Confirmation Dialog (Top-most Layer z-[999999]) */}
      <ConfirmModal />
    </>
  );
});

GlobalModalHost.displayName = 'GlobalModalHost';
