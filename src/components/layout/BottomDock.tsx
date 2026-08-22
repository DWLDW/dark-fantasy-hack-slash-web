import React, { useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { Shield, Backpack, Zap, Compass, Home } from 'lucide-react';

export const BottomDock: React.FC = () => {
  const { activeModal, openModal, closeModal, viewMode, setViewMode, playerStats } = useGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'c') {
        activeModal === 'character' ? closeModal() : openModal('character');
      } else if (key === 'i') {
        activeModal === 'inventory' ? closeModal() : openModal('inventory');
      } else if (key === 'k') {
        activeModal === 'skills' ? closeModal() : openModal('skills');
      } else if (key === 'escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, openModal, closeModal]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-iron-950/98 backdrop-blur-md border-t border-iron-700 z-40 py-1.5 px-3 md:py-2 select-none shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-around md:justify-between">
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-1.5 md:space-x-2.5">
          <button
            onClick={() => setViewMode('town')}
            className={`flex flex-col md:flex-row items-center gap-1.5 px-3 py-1.5 rounded transition text-xs font-bold ${
              viewMode === 'town'
                ? 'bg-brass-500/25 text-brass-200 border border-brass-400 shadow'
                : 'text-gray-300 hover:text-white hover:bg-iron-850 border border-transparent'
            }`}
          >
            <Home className="w-4 h-4 text-brass-400" />
            <span>마을</span>
          </button>

          <button
            onClick={() => setViewMode('dungeon_select')}
            className={`flex flex-col md:flex-row items-center gap-1.5 px-3 py-1.5 rounded transition text-xs font-bold ${
              viewMode === 'dungeon_select' || viewMode === 'battle'
                ? 'bg-blood-950/60 text-blood-200 border border-blood-500 shadow'
                : 'text-gray-300 hover:text-white hover:bg-iron-850 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4 text-red-400" />
            <span>던전</span>
          </button>
        </div>

        {/* Global Popup Triggers (Character, Inventory, Skills) */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Character [C] */}
          <button
            onClick={() => activeModal === 'character' ? closeModal() : openModal('character')}
            className={`relative flex flex-col md:flex-row items-center gap-2 px-3.5 py-1.5 rounded transition text-xs font-bold ${
              activeModal === 'character'
                ? 'bg-brass-500/30 text-brass-100 border-2 border-brass-400 shadow-lg'
                : 'bg-iron-900 text-gray-100 hover:bg-iron-800 hover:text-white border border-iron-700'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">캐릭터·스탯</span>
            <span className="md:hidden">스탯</span>
            <kbd className="hidden md:inline-block text-xs bg-iron-950 px-2 py-0.5 rounded border border-iron-600 text-amber-300 font-mono font-bold">
              C
            </kbd>
            {playerStats.statPoints > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            )}
          </button>

          {/* Inventory [I] */}
          <button
            onClick={() => activeModal === 'inventory' ? closeModal() : openModal('inventory')}
            className={`flex flex-col md:flex-row items-center gap-2 px-3.5 py-1.5 rounded transition text-xs font-bold ${
              activeModal === 'inventory'
                ? 'bg-brass-500/30 text-brass-100 border-2 border-brass-400 shadow-lg'
                : 'bg-iron-900 text-gray-100 hover:bg-iron-800 hover:text-white border border-iron-700'
            }`}
          >
            <Backpack className="w-4 h-4 text-emerald-300" />
            <span className="hidden md:inline">장비·인벤토리</span>
            <span className="md:hidden">가방</span>
            <kbd className="hidden md:inline-block text-xs bg-iron-950 px-2 py-0.5 rounded border border-iron-600 text-emerald-300 font-mono font-bold">
              I
            </kbd>
          </button>

          {/* Skill & Rune [K] */}
          <button
            onClick={() => activeModal === 'skills' ? closeModal() : openModal('skills')}
            className={`relative flex flex-col md:flex-row items-center gap-2 px-3.5 py-1.5 rounded transition text-xs font-bold ${
              activeModal === 'skills'
                ? 'bg-brass-500/30 text-brass-100 border-2 border-brass-400 shadow-lg'
                : 'bg-iron-900 text-gray-100 hover:bg-iron-800 hover:text-white border border-iron-700'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-300" />
            <span className="hidden md:inline">스킬·룬</span>
            <span className="md:hidden">스킬</span>
            <kbd className="hidden md:inline-block text-xs bg-iron-950 px-2 py-0.5 rounded border border-iron-600 text-purple-300 font-mono font-bold">
              K
            </kbd>
            {playerStats.skillPoints > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-iron-950 font-mono font-black text-[10px] rounded-full shadow border border-amber-200 animate-pulse">
                +{playerStats.skillPoints}SP
              </span>
            )}
          </button>
        </div>

        {/* Desktop Help / Shortcut Hints */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono font-bold">
          <span className="text-amber-300 bg-iron-900 px-2 py-0.5 rounded border border-iron-750">[←/→] 레인이동</span>
          <span className="text-amber-300 bg-iron-900 px-2 py-0.5 rounded border border-iron-750">[Q/W/E/R] 스킬</span>
          <span className="text-purple-300 bg-iron-900 px-2 py-0.5 rounded border border-iron-750">[1~4] 포션</span>
          <span className="text-brass-300 bg-iron-900 px-2 py-0.5 rounded border border-iron-750">[Space] 공격</span>
          <span className="text-gray-400">[Esc] 닫기</span>
        </div>
      </div>
    </footer>
  );
};
