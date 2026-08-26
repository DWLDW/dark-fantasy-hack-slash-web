import React, { useState } from 'react';
import { useGame } from '../../state/gameStore';
import {
  User,
  Lock,
  LogOut,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { registerApi, loginApi, logoutApi, AuthUser } from '../../services/authApi';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    currentUser,
    setCurrentUser,
    addLog,
    applyCloudSaveData,
    exportSaveDataPayload
  } = useGame();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (activeModal !== 'auth') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg('아이디를 입력해주세요.');
      return;
    }
    if (!password) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'register') {
        const res = await registerApi(username.trim(), password);
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setSuccessMsg('회원가입이 완료되었습니다! 현재 데이터가 클라우드에 연동됩니다.');
          addLog(`👤 [계정 연동] ${res.user.displayName}님 회원가입 및 클라우드 연동 완료!`, 'system');

          // Immediately back up current game save to cloud
          const currentSave = exportSaveDataPayload();
          if (currentSave) {
            import('../../services/authApi').then(m => m.syncCloudSaveApi(currentSave));
          }

          setTimeout(() => {
            closeModal();
          }, 1200);
        } else {
          setErrorMsg(res.error || '회원가입에 실패했습니다.');
        }
      } else {
        const res = await loginApi(username.trim(), password);
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setSuccessMsg(`환영합니다, ${res.user.displayName}님!`);
          addLog(`👤 [계정 로그인] ${res.user.displayName} 계정으로 로그인되었습니다.`, 'system');

          // If user has cloud save data on server, restore it
          if (res.saveData) {
            applyCloudSaveData(res.saveData);
            addLog('☁️ [클라우드 복원] 서버에 백업된 최신 캐릭터 데이터를 복원했습니다.', 'loot');
          } else {
            // If server had no save, upload current local save
            const currentSave = exportSaveDataPayload();
            if (currentSave) {
              import('../../services/authApi').then(m => m.syncCloudSaveApi(currentSave));
              addLog('☁️ [클라우드 백업] 현재 캐릭터 데이터를 클라우드에 첫 백업했습니다.', 'loot');
            }
          }

          setTimeout(() => {
            closeModal();
          }, 1200);
        } else {
          setErrorMsg(res.error || '로그인에 실패했습니다.');
        }
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setCurrentUser(null);
    addLog('👤 로그아웃되었습니다. (게스트 모드로 전환)', 'system');
    closeModal();
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-iron-950 via-iron-900 to-iron-950 border-2 border-brass-400 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-[0_0_50px_rgba(251,191,36,0.3)] space-y-4 relative animate-scale-in text-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-iron-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 border-b border-iron-750 pb-3">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 shadow">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-cinzel font-black text-amber-200 tracking-wider">
            {currentUser ? '모험가 프로필 & 계정' : '성역 모험가 로그인'}
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            {currentUser
              ? '클라우드 자동 저장 및 기기 간 동기화가 활성화되어 있습니다.'
              : '어느 기기에서든 내 캐릭터를 이어서 플레이할 수 있습니다.'}
          </p>
        </div>

        {currentUser ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-iron-950/90 border border-brass-500/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-iron-950 font-black text-lg shadow">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{currentUser.displayName}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300">
                      연동 완료
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span>클라우드 동기화 상태: 정상</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-gray-300 p-2.5 rounded-lg bg-iron-900 border border-iron-750 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>던전 클리어, 아이템 획득 시 진행 상황이 클라우드에 자동 백업됩니다.</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2 rounded-xl bg-iron-800 hover:bg-iron-700 text-gray-200 font-bold text-xs transition cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-blood-950 hover:bg-blood-900 border border-blood-600 text-blood-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="space-y-3">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-iron-950 rounded-xl border border-iron-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tab === 'login'
                    ? 'bg-amber-500 text-iron-950 shadow font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tab === 'register'
                    ? 'bg-amber-500 text-iron-950 shadow font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-blood-950/80 border border-blood-500 text-blood-200 text-xs font-mono flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-blood-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-gray-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>아이디 (ID)</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요 (2자 이상)"
                  autoComplete="username"
                  className="w-full px-3 py-2 rounded-xl bg-iron-950 border border-iron-750 focus:border-amber-400 focus:outline-none text-white text-xs font-mono transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-gray-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>비밀번호 (Password)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (4자 이상)"
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-3 py-2 rounded-xl bg-iron-950 border border-iron-750 focus:border-amber-400 focus:outline-none text-white text-xs font-mono transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-iron-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(251,191,36,0.4)] transition transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>처리 중...</span>
                ) : tab === 'register' ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>회원가입 완료 및 클라우드 연동</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>로그인 및 세이브 동기화</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <span className="text-[10px] text-gray-500 font-mono">
                로그인하지 않아도 게스트 모드로 로컬에 안전하게 저장됩니다.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
