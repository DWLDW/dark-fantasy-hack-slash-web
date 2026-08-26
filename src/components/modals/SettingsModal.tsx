import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { Settings, Volume2, VolumeX, Download, Upload, RotateCcw, X, Check, Copy, AlertTriangle, GraduationCap, User, Cloud } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    closeModal,
    openModal,
    currentUser,
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
          <h2 className="font-cinzel font-black text-base sm:text-lg text-white">게임 설정 & 데이터 관리</h2>
        </div>
        <button
          onClick={closeModal}
          className="p-1 text-gray-400 hover:text-white hover:bg-iron-800 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Cloud Account & Sync */}
      <div className="space-y-2.5 bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750">
        <h3 className="text-xs font-bold text-gray-300 flex items-center justify-between uppercase font-mono">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" />
            <span>클라우드 계정 & 동기화</span>
          </div>
          {currentUser && (
            <span className="text-[10px] text-emerald-400 font-bold">
              ● {currentUser.displayName} 연동 중
            </span>
          )}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            {currentUser
              ? '진행 상황이 클라우드 서버에 실시간으로 자동 동기화되고 있습니다.'
              : '계정으로 로그인하면 다른 PC나 모바일에서도 내 세이브를 그대로 불러올 수 있습니다.'}
          </p>
          <button
            onClick={() => {
              closeModal();
              openModal('auth');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-iron-950 text-xs font-black rounded-lg transition flex items-center gap-1 flex-shrink-0 shadow cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? '계정 관리' : '로그인 / 회원가입'}</span>
          </button>
        </div>
      </div>

      {/* 2. Audio Settings */}
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

      {/* 3. Save Data Export & Import */}
      <div className="space-y-3 bg-iron-900/90 p-3 sm:p-4 rounded-lg border border-iron-750">
        <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase font-mono">
          <Download className="w-4 h-4 text-purple-400" />
          <span>로컬 세이브 코드 내보내기 / 가져오기</span>
        </h3>

        {/* Export Button */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            현재 진행 상황을 백업 코드로 복사하여 텍스트로 보관합니다.
          </p>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-600 text-purple-200 text-xs font-bold rounded-lg transition flex items-center gap-1 flex-shrink-0 shadow"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? '복사 완료!' : '코드 복사'}</span>
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
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="복사해둔 세이브 코드를 여기에 붙여넣으세요..."
              className="flex-1 px-3 py-1.5 bg-iron-950 border border-iron-700 rounded-lg text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 disabled:opacity-40 border border-blue-600 text-blue-200 text-xs font-bold rounded-lg transition shadow"
            >
              불러오기
            </button>
          </div>
          {importStatus === 'success' && (
            <p className="text-[11px] text-emerald-400 font-mono">✓ 세이브 데이터를 성공적으로 복원했습니다!</p>
          )}
          {importStatus === 'error' && (
            <p className="text-[11px] text-blood-400 font-mono">✗ 유효하지 않은 세이브 데이터 코드입니다.</p>
          )}
        </div>
      </div>

      {/* 4. Tutorial & Reset */}
      <div className="pt-2 border-t border-iron-800 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={startTutorial}
          className="px-3 py-1.5 bg-iron-800 hover:bg-iron-750 text-gray-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow border border-iron-700"
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>튜토리얼 다시보기</span>
        </button>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 bg-blood-950/60 hover:bg-blood-900/80 border border-blood-800/80 text-blood-400 hover:text-blood-300 rounded-lg text-xs font-bold flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>데이터 초기화</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-blood-950 p-2 rounded-lg border border-blood-600 animate-shake">
            <AlertTriangle className="w-4 h-4 text-blood-400 flex-shrink-0" />
            <span className="text-[11px] text-blood-200">정말 모든 데이터를 초기화할까요?</span>
            <button
              onClick={() => {
                resetGameSave();
                setShowResetConfirm(false);
                closeModal();
              }}
              className="px-2 py-1 bg-blood-600 hover:bg-blood-500 text-white rounded text-[10px] font-black"
            >
              초기화
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 bg-iron-800 hover:bg-iron-700 text-gray-300 rounded text-[10px]"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
