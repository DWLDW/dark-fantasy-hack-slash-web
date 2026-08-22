import React from 'react';
import { useGame } from '../../state/gameStore';
import { InventoryModal } from './InventoryModal';
import { CharacterModal } from './CharacterModal';
import { SkillRuneModal } from './SkillRuneModal';

export const GlobalModalHost: React.FC = () => {
  const { activeModal, closeModal } = useGame();

  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {activeModal === 'inventory' && <InventoryModal />}
      {activeModal === 'character' && <CharacterModal />}
      {activeModal === 'skills' && <SkillRuneModal />}
    </div>
  );
};
