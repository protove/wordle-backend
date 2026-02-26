'use client';
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SignupPayload } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [mode, setMode]     = useState<Mode>('login');
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef    = useRef<HTMLInputElement>(null);

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const username = usernameRef.current?.value.trim() ?? '';
    const password = passwordRef.current?.value ?? '';
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        const email = emailRef.current?.value.trim() ?? '';
        const payload: SignupPayload = { username, email, password };
        await signup(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [mode, login, signup, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-[rgba(10,14,23,0.8)]"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full max-w-sm mx-4 animate-slide-up">
        <div className="bg-[#1a2535] border border-[#2d4055] rounded-2xl p-6 shadow-2xl">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-cosmic-gray hover:text-cosmic-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-gold rounded-lg p-1"
            aria-label="닫기"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <h2 id="auth-title" className="text-center text-cosmic-white font-black text-lg tracking-widest uppercase mb-5">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[rgba(115,60,60,0.3)] border border-cosmic-red text-cosmic-white text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-cosmic-gray text-xs uppercase tracking-wider mb-1">사용자명</label>
              <input
                ref={usernameRef}
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                className="w-full px-3 py-2 rounded-lg bg-[#0d1520] border border-[#2d4055] text-cosmic-white placeholder-cosmic-gray focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="username"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-cosmic-gray text-xs uppercase tracking-wider mb-1">이메일</label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1520] border border-[#2d4055] text-cosmic-white placeholder-cosmic-gray focus:outline-none focus:border-cosmic-blue transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-cosmic-gray text-xs uppercase tracking-wider mb-1">비밀번호</label>
              <input
                ref={passwordRef}
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1520] border border-[#2d4055] text-cosmic-white placeholder-cosmic-gray focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder={mode === 'signup' ? '대·소문자·숫자·특수문자 포함 8자 이상' : '••••••••'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-cosmic-blue hover:bg-cosmic-light text-cosmic-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-gold"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-4 text-center text-cosmic-gray text-xs">
            {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            {' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="text-cosmic-gold hover:text-cosmic-light transition-colors font-bold"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
