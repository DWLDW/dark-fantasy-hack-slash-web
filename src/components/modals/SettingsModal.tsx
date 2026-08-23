import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { Settings, Volume2, VolumeX, Download, Upload, RotateCcw, X, Check, Copy, AlertTriangle, GraduationCap } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    closeModal,
    soundVolume,
    setSoundVolume,
    isMuted,
    setIsMuted,
    exportSaveData,
    importSaveData,
    startTutorial,
    resetGameSave
  } = useGame();

  const [importText, setImportText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const encoded = exportSaveData();
    if (encoded) {
      navigator.clipboard.writeText(encoded);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importSaveData(importText.trim());
    if (ok) {
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        closeModal();
      }, 1500);
    } else {
      setImportStatus('error');
    }
  };

  return (
    <div className="bg-iron-950 border-2 border-brass-500/80 rounded-xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in text-gray-200 select-none relative font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-iron-750 pb-3">
        <div className="flex items-center gap-2 text-brass-300">
          <Settings className="w-5 h-5 text-brass-400" />
          <h2 className="font-cinzel font-black text-base sm:text-lg text-white">게임 설정 & 데이터 백업</h2>
        </div>
        <button
          onClick={closeModal}
          className="p-1 text-gray-400 hover:text-white hover:bg-iron-800 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Audio Settings */}
      <div className="space-y-2.5 bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750">
        <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase font-mono">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>사운드 & 오디오 제어</span>
        </h3>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>마스터 볼륨</span>
              <span className="text-amber-300 font-bold">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className="w-full h-2 bg-iron-950 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
            />
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-3 py-2 rounded-lg border text-xs font-bold font-mono flex items-center gap-1.5 transition ${
              isMuted
                ? 'bg-blood-950/80 border-blood-600 text-blood-300 hover:bg-blood-900'
                : 'bg-iron-800 border-iron-700 text-gray-200 hover:bg-iron-750'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-blood-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? '음소거 됨' : '음소거'}</span>
          </button>
        </div>
      </div>

      {/* 2. Save Data Export & Import */}
      <div className="space-y-3 bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750">
        <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase font-mono">
          <Download className="w-4 h-4 text-purple-400" />
          <span>세이브 데이터 내보내기 / 가져오기</span>
        </h3>

        {/* Export Button */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            현재 진행 상황을 클립보드로 복사하여 안전하게 보관합니다.
          </p>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-600 text-purple-200 text-xs font-bold rounded-lg transition flex items-center gap-1 flex-shrink-0 shadow"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? '복사 완료!' : '세이브 복사'}</span>
          </button>
        </div>

        {/* Import Input */}
        <div className="space-y-1.5 pt-2 border-t border-iron-800">
          <label className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>백업 코드 붙여넣기 (Import):</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="여기에 복사한 세이브 코드를 붙여넣으세요..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="flex-1 bg-iron-950 border border-iron-750 rounded px-2.5 py-1.5 text-xs text-gray-200 font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 disabled:bg-iron-800 border border-blue-600 disabled:border-iron-700 text-blue-200 disabled:text-gray-500 text-xs font-bold rounded-lg transition flex-shrink-0 shadow"
            >
              불러오기
            </button>
          </div>

          {importStatus === 'success' && (
            <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> 세이브 데이터를 성공적으로 복원했습니다!
            </p>
          )}
          {importStatus === 'error' && (
            <p className="text-[11px] text-blood-400 font-bold flex items-center gap-1 animate-fade-in">
              <AlertTriangle className="w-3.5 h-3.5" /> 잘못된 세이브 코드입니다. 다시 확인해주세요.
            </p>
          )}
        </div>
      </div>

      {/* 2.5. Replay Tutorial */}
      <div className="bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750 flex items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs font-bold text-gray-200">초기 튜토리얼 다시 보기</div>
            <div className="text-[11px] text-gray-400 font-mono">주요 시설 및 단축키 인터랙티브 가이드를 다시 시작합니다.</div>
          </div>
        </div>
        <button
          onClick={startTutorial}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-iron-950 text-xs font-black rounded-lg transition shadow cursor-pointer flex items-center gap-1.5 flex-shrink-0 transform active:scale-95"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>가이드 시작</span>
        </button>
      </div>

      {/* 3. Reset Button */}
      <div className="flex items-center justify-between pt-2 border-t border-iron-750">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3 py-1.5 bg-blood-950/80 hover:bg-blood-900 border border-blood-700 text-blood-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>캐릭터 초기화 (Lv 1 리셋)</span>
        </button>

        <button
          onClick={closeModal}
          className="px-4 py-1.5 bg-iron-800 hover:bg-iron-750 text-gray-200 text-xs font-bold rounded-lg transition"
        >
          닫기
        </button>
      </div>

      {/* Reset Confirmation Overlay inside Settings */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/90 rounded-xl p-5 flex flex-col justify-center items-center text-center space-y-4 z-50 animate-fade-in">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
          <div>
            <h3 className="font-cinzel font-black text-base text-white">캐릭터 데이터 완전 초기화</h3>
            <p className="text-xs text-gray-300 mt-1">
              정말로 캐릭터를 레벨 1 및 초기 상태로 리셋하시겠습니까?<br />
              <span className="text-blood-400 font-bold">이 작업은 취소할 수 없습니다.</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetGameSave();
                setShowResetConfirm(false);
                closeModal();
              }}
              className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white font-bold text-xs rounded-lg transition shadow"
            >
              초기화 확인
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-2 bg-iron-800 hover:bg-iron-700 text-gray-300 font-bold text-xs rounded-lg transition"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
