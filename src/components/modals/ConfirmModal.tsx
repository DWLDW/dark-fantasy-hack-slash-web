import React, { useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { AlertTriangle, Skull, Check, X } from 'lucide-react';

export const ConfirmModal: React.FC = React.memo(() => {
  const { confirmDialogState, closeConfirmModal } = useGame();

  useEffect(() => {
    if (!confirmDialogState?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeConfirmModal();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        confirmDialogState.onConfirm();
        closeConfirmModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialogState, closeConfirmModal]);

  if (!confirmDialogState?.isOpen) return null;

  const isDanger = confirmDialogState.type === 'danger';

  return (
    <div
      onClick={closeConfirmModal}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-iron-950 border-2 rounded-xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-4 animate-scale-in text-gray-200 relative z-[10000] ${
          isDanger
            ? 'border-blood-500 ring-2 ring-blood-500/50 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
            : 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-iron-750 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 ${
              isDanger
                ? 'bg-blood-950/80 border border-blood-600 text-blood-400'
                : 'bg-amber-950/80 border border-amber-500 text-amber-400'
            }`}>
              {isDanger ? <Skull className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5 animate-bounce" />}
            </div>
            <h3 className="font-cinzel font-black text-sm sm:text-base text-white tracking-wide">
              {confirmDialogState.title}
            </h3>
          </div>

          <button
            onClick={closeConfirmModal}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line bg-iron-900/80 p-3.5 rounded-lg border border-iron-800">
          {confirmDialogState.message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            onClick={closeConfirmModal}
            className="px-4 py-2 bg-iron-900 hover:bg-iron-800 border border-iron-700 hover:border-iron-500 text-gray-300 hover:text-white rounded-lg text-xs sm:text-sm font-bold transition shadow cursor-pointer font-mono"
          >
            {confirmDialogState.cancelText || '취소 [Esc]'}
          </button>

          <button
            onClick={() => {
              confirmDialogState.onConfirm();
              closeConfirmModal();
            }}
            className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-black transition shadow-xl transform active:scale-95 cursor-pointer font-mono flex items-center gap-1.5 ${
              isDanger
                ? 'bg-gradient-to-r from-blood-700 via-blood-600 to-red-600 hover:from-blood-600 hover:to-red-500 text-white ring-1 ring-blood-400 animate-pulse'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-iron-950 ring-1 ring-amber-300 animate-pulse'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmDialogState.confirmText || '확인 [Space]'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmModal.displayName = 'ConfirmModal';
