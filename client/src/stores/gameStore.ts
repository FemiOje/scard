// Zustand state management for game state

import { create } from "zustand";
import type {
  GameStatus,
  Position,
  EncounterState,
} from "../types/game";

/**
 * Game store state interface
 */
interface GameState {
  // Game session
  gameId: string | null;
  gameStatus: GameStatus;

  // Player state
  playerPosition: Position | null;

  // Encounter state
  encounter: EncounterState | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setGameId: (id: string | null) => void;
  setPlayerPosition: (position: Position | null) => void;
  setGameStatus: (status: GameStatus) => void;
  setEncounter: (encounter: EncounterState | null) => void;
  clearEncounter: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
}

/**
 * Zustand store for game state management
 * Provides global state access across components
 * 
 * Components can use selectors for optimized re-renders:
 * ```tsx
 * const gameId = useGameStore(selectGameId);
 * const isLoading = useGameStore(selectIsLoading);
 * ```
 * 
 * Or access the full store:
 * ```tsx
 * const { gameId, playerPosition, setPlayerPosition } = useGameStore();
 * ```
 */
export const useGameStore = create<GameState>((set) => ({
  // Initial state
  gameId: null,
  gameStatus: "InProgress",
  playerPosition: null,
  encounter: null,
  isLoading: false,
  error: null,

  // Actions
  setGameId: (id) => set({ gameId: id }),

  setPlayerPosition: (position) => set({ playerPosition: position }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setEncounter: (encounter) => set({ encounter }),

  clearEncounter: () => set({ encounter: null }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  resetGame: () =>
    set({
      gameStatus: "InProgress",
      playerPosition: null,
      encounter: null,
      isLoading: false,
      error: null,
    }),
}));

// Selectors for optimized re-renders
// Components can use these to subscribe to specific state slices
export const selectGameId = (state: GameState) => state.gameId;
export const selectPlayerPosition = (state: GameState) => state.playerPosition;
export const selectGameStatus = (state: GameState) => state.gameStatus;
export const selectEncounter = (state: GameState) => state.encounter;
export const selectIsLoading = (state: GameState) => state.isLoading;
export const selectError = (state: GameState) => state.error;

