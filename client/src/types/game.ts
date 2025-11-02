// Type definitions for SCARD game
// Extracted from useGameState.ts following Death Mountain architecture pattern

import type { Position, BeastEncounter, Player } from "../generated/typescript/models.gen";

/**
 * Game status enumeration
 */
export type GameStatus = "InProgress" | "Won" | "Lost";

/**
 * Direction enumeration for player movement
 */
export type Direction = "Left" | "Right" | "Up" | "Down";

/**
 * Encounter type enumeration
 * Maps to contract encounter types (1-8)
 */
export type EncounterType =
  | "Werewolf"
  | "Vampire"
  | "FreeHealth"
  | "AttackPoints"
  | "ReducedDamage"
  | "FreeAttack"
  | "FreeFlee"
  | "FreeRoam"
  | null;

/**
 * Encounter state interface
 * Contains encounter type and optional beast statistics
 */
export interface EncounterState {
  type: EncounterType;
  beastStats: BeastEncounter | null;
}

/**
 * Return type for useGameState hook
 * Defines the complete API surface of the game state hook
 */
export interface UseGameStateReturn {
  gameId: string | null;
  playerPosition: Position | null;
  playerStats: Player | null;
  gameStatus: GameStatus;
  encounter: EncounterState | null;
  isLoading: boolean;
  error: string | null;
  movePlayer: (direction: Direction) => Promise<void>;
  fight: () => Promise<void>;
  flee: () => Promise<void>;
  clearEncounter: () => void;
}

// Re-export generated types for convenience
export type { Position, BeastEncounter, Player };

