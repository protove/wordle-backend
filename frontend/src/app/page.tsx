'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { useWordle } from '@/hooks/useWordle';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';

// Dynamically import heavy components
const StarBackground = dynamic(
  () => import('@/components/StarBackground'),
  { ssr: false }
);
const StatsModal = dynamic(() => import('@/components/StatsModal'));
const HelpModal = dynamic(() => import('@/components/HelpModal'));
const AuthModal = dynamic(() => import('@/components/AuthModal'));

const STATS_SHOW_DELAY = 2000; // ms after game ends

export default function GamePage() {
  const { token, user, logout } = useAuth();
  const { state, stats, handleKey, newGame } = useWordle(token);

  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Auto-show stats modal after game ends (with animation delay)
  useEffect(() => {
    if (state.gameStatus === 'won' || state.gameStatus === 'lost') {
      const t = setTimeout(() => {
        startTransition(() => setShowStats(true));
      }, STATS_SHOW_DELAY);
      return () => clearTimeout(t);
    }
  }, [state.gameStatus]);

  const handleStatsOpen = useCallback(() => setShowStats(true), []);
  const handleStatsClose = useCallback(() => setShowStats(false), []);
  const handleHelpOpen = useCallback(() => setShowHelp(true), []);
  const handleHelpClose = useCallback(() => setShowHelp(false), []);
  const handleAuthOpen = useCallback(() => setShowAuth(true), []);
  const handleAuthClose = useCallback(() => setShowAuth(false), []);

  const handleNewGame = useCallback(() => {
    setShowStats(false);
    newGame();
  }, [newGame]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-cosmic-dark">
      {/* Cosmic star background */}
      <StarBackground />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          onStatsClick={handleStatsOpen}
          onHelpClick={handleHelpOpen}
          onAuthClick={handleAuthOpen}
          user={user}
          onLogout={logout}
        />

        {/* Toast notification */}
        <Toast message={state.message} />

        {/* Main game area */}
        <main
          className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 py-4 px-2"
          aria-label="Wordle game"
        >
          {/* Game board */}
          <GameBoard state={state} />

          {/* Spacer */}
          <div className="h-2" aria-hidden="true" />

          {/* On-screen keyboard */}
          <Keyboard
            letterStates={state.letterStates}
            onKey={handleKey}
          />
        </main>

        {/* Footer */}
        <footer className="text-center py-3 text-cosmic-gray text-[10px] tracking-widest uppercase opacity-40 select-none">
          Cosmic Wordle &copy; {new Date().getFullYear()}
        </footer>
      </div>

      {/* Modals */}
      <StatsModal
        stats={stats}
        isOpen={showStats}
        onClose={handleStatsClose}
        onNewGame={handleNewGame}
        targetWord={state.targetWord}
        gameStatus={state.gameStatus}
      />
      <HelpModal isOpen={showHelp} onClose={handleHelpClose} />
      <AuthModal isOpen={showAuth} onClose={handleAuthClose} />
    </div>
  );
}
