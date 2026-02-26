'use client';

interface HeaderProps {
  onStatsClick: () => void;
  onHelpClick: () => void;
  onAuthClick: () => void;
  user: { username: string } | null;
  onLogout: () => void;
}

function StarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-cosmic-gold animate-twinkle"
      aria-hidden="true"
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function Header({ onStatsClick, onHelpClick, onAuthClick, user, onLogout }: HeaderProps) {
  return (
    <header className="relative w-full bg-cosmic-header">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Star + Title */}
        <div className="flex items-center gap-2">
          <StarIcon />
          <h1
            className="gradient-text-cosmic text-xl sm:text-2xl font-black tracking-[0.2em] uppercase cosmic-glow-text"
            aria-label="Cosmic Wordle"
          >
            COSMIC WORDLE
          </h1>
          <StarIcon />
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1">
          {/* Auth button */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-cosmic-gray text-xs hidden sm:block max-w-[80px] truncate">{user.username}</span>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-cosmic-gray hover:text-cosmic-red hover:bg-[rgba(115,60,60,0.15)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cosmic-gold focus-visible:outline-none"
                aria-label="로그아웃"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="p-2 rounded-lg text-cosmic-gray hover:text-cosmic-gold hover:bg-[rgba(242,191,145,0.1)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cosmic-gold focus-visible:outline-none"
              aria-label="로그인"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          )}
          <button
            onClick={onHelpClick}
            className="p-2 rounded-lg text-cosmic-gray hover:text-cosmic-light hover:bg-[rgba(66,112,140,0.15)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cosmic-gold focus-visible:outline-none"
            aria-label="How to play"
            type="button"
          >
            <QuestionIcon />
          </button>
          <button
            onClick={onStatsClick}
            className="p-2 rounded-lg text-cosmic-gray hover:text-cosmic-light hover:bg-[rgba(66,112,140,0.15)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cosmic-gold focus-visible:outline-none"
            aria-label="View statistics"
            type="button"
          >
            <BarChartIcon />
          </button>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="header-border w-full" />
    </header>
  );
}
