'use client';

import {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
} from 'react';
import { GameState, GameStats, LetterState } from '@/types';
import {
  createEmptyBoard,
  evaluateGuess,
  getBestLetterState,
  getWinMessage,
} from '@/lib/gameLogic';
import { getTodaysWord, isValidWord, getRandomWord } from '@/lib/words';
import { apiPostGameResult } from '@/lib/api';

// ==================== ACTION TYPES ====================

type Action =
  | { type: 'INIT_GAME'; payload: { targetWord: string } }
  | { type: 'ADD_LETTER'; payload: { letter: string } }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'SET_SHAKING'; payload: { row: number } }
  | { type: 'CLEAR_SHAKING' }
  | { type: 'SET_MESSAGE'; payload: { message: string } }
  | { type: 'CLEAR_MESSAGE' }
  | { type: 'REVEAL_ROW'; payload: { row: number; states: LetterState[] } }
  | { type: 'REVEAL_TILE'; payload: { row: number; col: number; state: LetterState } };

// ==================== CONSTANTS ====================

const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

// ==================== STATE FACTORIES ====================

function createInitialState(targetWord: string): GameState {
  return {
    board: createEmptyBoard(),
    currentRow: 0,
    currentCol: 0,
    gameStatus: 'playing',
    targetWord,
    letterStates: {},
    shakingRow: null,
    revealingRow: null,
    message: null,
  };
}

// ==================== GAME REDUCER ====================

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      return createInitialState(action.payload.targetWord);
    }

    case 'ADD_LETTER': {
      if (
        state.gameStatus !== 'playing' ||
        state.currentCol >= 5 ||
        state.revealingRow !== null
      ) {
        return state;
      }
      const newBoard = state.board.map((row, rIdx) =>
        row.map((tile, cIdx) => {
          if (rIdx === state.currentRow && cIdx === state.currentCol) {
            return { char: action.payload.letter, state: 'filled' as LetterState };
          }
          return tile;
        })
      );
      return { ...state, board: newBoard, currentCol: state.currentCol + 1 };
    }

    case 'REMOVE_LETTER': {
      if (
        state.gameStatus !== 'playing' ||
        state.currentCol <= 0 ||
        state.revealingRow !== null
      ) {
        return state;
      }
      const newCol = state.currentCol - 1;
      const newBoard = state.board.map((row, rIdx) =>
        row.map((tile, cIdx) => {
          if (rIdx === state.currentRow && cIdx === newCol) {
            return { char: '', state: 'empty' as LetterState };
          }
          return tile;
        })
      );
      return { ...state, board: newBoard, currentCol: newCol };
    }

    case 'SET_SHAKING': {
      return { ...state, shakingRow: action.payload.row };
    }

    case 'CLEAR_SHAKING': {
      return { ...state, shakingRow: null };
    }

    case 'SET_MESSAGE': {
      return { ...state, message: action.payload.message };
    }

    case 'CLEAR_MESSAGE': {
      return { ...state, message: null };
    }

    case 'SUBMIT_GUESS': {
      if (
        state.gameStatus !== 'playing' ||
        state.currentCol !== 5 ||
        state.revealingRow !== null
      ) {
        return state;
      }
      return { ...state, revealingRow: state.currentRow };
    }

    case 'REVEAL_ROW': {
      const { row, states } = action.payload;
      const newBoard = state.board.map((boardRow, rIdx) => {
        if (rIdx !== row) return boardRow;
        return boardRow.map((tile, cIdx) => ({
          ...tile,
          state: states[cIdx],
        }));
      });

      const newLetterStates = { ...state.letterStates };
      const rowGuess = state.board[row];
      states.forEach((s, i) => {
        const letter = rowGuess[i].char;
        newLetterStates[letter] = getBestLetterState(newLetterStates[letter], s);
      });

      const isWon = states.every((s) => s === 'correct');
      const isLost = !isWon && row === 5;

      return {
        ...state,
        board: newBoard,
        letterStates: newLetterStates,
        revealingRow: null,
        currentRow: isWon || isLost ? state.currentRow : state.currentRow + 1,
        currentCol: 0,
        gameStatus: isWon ? 'won' : isLost ? 'lost' : 'playing',
      };
    }

    case 'REVEAL_TILE': {
      const { row, col, state: tileState } = action.payload;
      const newBoard = state.board.map((boardRow, rIdx) => {
        if (rIdx !== row) return boardRow;
        return boardRow.map((tile, cIdx) => {
          if (cIdx !== col) return tile;
          return { ...tile, state: tileState };
        });
      });

      const letter = state.board[row][col].char;
      const newLetterStates = { ...state.letterStates };
      newLetterStates[letter] = getBestLetterState(newLetterStates[letter], tileState);

      // After the last tile in the row, determine win/loss and advance state
      const isLastTile = col === 4;
      if (!isLastTile) {
        return { ...state, board: newBoard, letterStates: newLetterStates };
      }

      // Collect all states for win/loss check (cols 0-3 are already updated on board)
      const rowStates = newBoard[row].map((t) => t.state);
      const isWon = rowStates.every((s) => s === 'correct');
      const isLost = !isWon && row === 5;

      return {
        ...state,
        board: newBoard,
        letterStates: newLetterStates,
        revealingRow: null,
        currentRow: isWon || isLost ? state.currentRow : state.currentRow + 1,
        currentCol: 0,
        gameStatus: isWon ? 'won' : isLost ? 'lost' : 'playing',
      };
    }

    default:
      return state;
  }
}

// ==================== PERSISTENCE HELPERS ====================

function loadStats(): GameStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem('cosmic-wordle-stats');
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return {
      gamesPlayed: parsed.gamesPlayed ?? 0,
      gamesWon: parsed.gamesWon ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      maxStreak: parsed.maxStreak ?? 0,
      guessDistribution: parsed.guessDistribution ?? [0, 0, 0, 0, 0, 0],
    };
  } catch {
    return INITIAL_STATS;
  }
}

function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem('cosmic-wordle-stats', JSON.stringify(stats));
  } catch {
    // storage unavailable
  }
}

function loadSavedGame(targetWord: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cosmic-wordle-state');
    if (!raw) return null;
    const saved = JSON.parse(raw) as GameState;
    if (saved.targetWord !== targetWord) return null;
    return {
      ...saved,
      shakingRow: null,
      revealingRow: null,
      message: null,
    };
  } catch {
    return null;
  }
}

function saveGame(state: GameState): void {
  try {
    localStorage.setItem('cosmic-wordle-state', JSON.stringify(state));
  } catch {
    // storage unavailable
  }
}

// ==================== MAIN HOOK ====================

export function useWordle(token?: string | null) {
  const targetWord = getTodaysWord();

  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => loadSavedGame(targetWord) ?? createInitialState(targetWord)
  );

  const [stats, setStats] = useState<GameStats>(() => loadStats());

  // Ref guards for in-flight animations
  const processingRef = useRef(false);

  // Persist game state
  useEffect(() => {
    saveGame(state);
  }, [state]);

  // ==================== REVEAL ANIMATION ====================

  const revealRow = useCallback(
    (row: number, states: LetterState[], onComplete: () => void) => {
      const REVEAL_DELAY = 300; // ms per tile
      states.forEach((tileState, i) => {
        setTimeout(() => {
          dispatch({ type: 'REVEAL_TILE', payload: { row, col: i, state: tileState } });
          if (i === states.length - 1) {
            setTimeout(onComplete, 100);
          }
        }, REVEAL_DELAY * (i + 1));
      });
    },
    []
  );

  // ==================== KEY HANDLER ====================

  const handleKey = useCallback(
    (key: string) => {
      if (processingRef.current) return;
      if (state.gameStatus !== 'playing') return;
      if (state.revealingRow !== null) return;

      const upper = key.toUpperCase();

      if (upper === 'ENTER') {
        if (state.currentCol < 5) {
          dispatch({ type: 'SET_MESSAGE', payload: { message: 'Not enough letters' } });
          dispatch({ type: 'SET_SHAKING', payload: { row: state.currentRow } });
          setTimeout(() => {
            startTransition(() => {
              dispatch({ type: 'CLEAR_SHAKING' });
              dispatch({ type: 'CLEAR_MESSAGE' });
            });
          }, 600);
          return;
        }

        const guess = state.board[state.currentRow].map((t) => t.char).join('');

        if (!isValidWord(guess)) {
          dispatch({ type: 'SET_MESSAGE', payload: { message: 'Not in word list' } });
          dispatch({ type: 'SET_SHAKING', payload: { row: state.currentRow } });
          setTimeout(() => {
            startTransition(() => {
              dispatch({ type: 'CLEAR_SHAKING' });
              dispatch({ type: 'CLEAR_MESSAGE' });
            });
          }, 600);
          return;
        }

        processingRef.current = true;
        const letterStates = evaluateGuess(guess, state.targetWord);
        const row = state.currentRow;

        dispatch({ type: 'SUBMIT_GUESS' });

        revealRow(row, letterStates, () => {
          const isWon = letterStates.every((s) => s === 'correct');
          const isLost = !isWon && row === 5;

          if (isWon) {
            startTransition(() => {
              dispatch({
                type: 'SET_MESSAGE',
                payload: { message: getWinMessage(row + 1) },
              });
            });
            setStats((prev) => {
              const next: GameStats = {
                gamesPlayed: prev.gamesPlayed + 1,
                gamesWon: prev.gamesWon + 1,
                currentStreak: prev.currentStreak + 1,
                maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
                guessDistribution: prev.guessDistribution.map((v, i) =>
                  i === row ? v + 1 : v
                ),
              };
              saveStats(next);
              return next;
            });
            // Sync to backend if logged in (fire-and-forget)
            if (token) {
              apiPostGameResult(token, row + 1, true).catch(() => {});
            }
          } else if (isLost) {
            startTransition(() => {
              dispatch({
                type: 'SET_MESSAGE',
                payload: { message: state.targetWord },
              });
            });
            setStats((prev) => {
              const next: GameStats = {
                ...prev,
                gamesPlayed: prev.gamesPlayed + 1,
                currentStreak: 0,
              };
              saveStats(next);
              return next;
            });
            // Sync to backend if logged in (fire-and-forget)
            if (token) {
              apiPostGameResult(token, row + 1, false).catch(() => {
                // Silently fail — localStorage is source of truth for guest play
              });
            }
          }

          processingRef.current = false;
        });

        return;
      }

      if (upper === 'BACKSPACE' || upper === 'DELETE') {
        dispatch({ type: 'REMOVE_LETTER' });
        return;
      }

      if (/^[A-Z]$/.test(upper) && state.currentCol < 5) {
        dispatch({ type: 'ADD_LETTER', payload: { letter: upper } });
      }
    },
    [state, revealRow, token]
  );

  // ==================== PHYSICAL KEYBOARD ====================

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', onKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  // ==================== NEW GAME ====================

  const newGame = useCallback(() => {
    const freshWord = getRandomWord();
    startTransition(() => {
      dispatch({ type: 'INIT_GAME', payload: { targetWord: freshWord } });
    });
  }, []);

  return { state, stats, handleKey, newGame };
}
