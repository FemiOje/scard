// Game constants and configuration
// Extracted from useGameState.ts following Death Mountain architecture pattern

import { CairoCustomEnum } from "starknet";
import type { Direction, EncounterType } from "../types/game";

// ============================================================================
// Grid Configuration
// ============================================================================

/**
 * Grid size constant - game is played on a 5x5 grid
 */
export const GRID_SIZE = 5;

/**
 * Win condition X coordinate (bottom-right corner)
 */
export const WIN_X = GRID_SIZE - 1; // 4

/**
 * Win condition Y coordinate (bottom-right corner)
 */
export const WIN_Y = GRID_SIZE - 1; // 4

// ============================================================================
// Player Stats Configuration
// ============================================================================

/**
 * Maximum player health (default starting health)
 * Matches DEFAULT_PLAYER_HEALTH from contract
 */
export const MAX_PLAYER_HEALTH = 100;

// ============================================================================
// Transaction Retry Configuration
// ============================================================================

/**
 * Maximum number of retries for transaction confirmation
 */
export const TX_MAX_RETRIES = 9;

/**
 * Retry interval for transaction confirmation (ms)
 */
export const TX_RETRY_INTERVAL = 350;

/**
 * Delay between transaction retries (ms)
 */
export const TX_RETRY_DELAY = 500;

// ============================================================================
// Query Retry Configuration
// ============================================================================

/**
 * Maximum number of retries for query/beast encounter fetching
 */
export const QUERY_MAX_RETRIES = 5;

/**
 * Base delay for query retries (ms)
 * Used with exponential backoff: delay = BASE_DELAY * (attempt + 1)
 */
export const QUERY_BASE_DELAY = 300;

// ============================================================================
// Encounter Type Mappings
// ============================================================================

/**
 * Maps encounter type numbers (1-8) to EncounterType enum
 * Contract mapping:
 * 1 = Werewolf
 * 2 = Vampire
 * 3 = FreeHealth
 * 4 = AttackPoints
 * 5 = ReducedDamage
 * 6 = FreeAttack
 * 7 = FreeFlee
 * 8 = FreeRoam
 */
export const ENCOUNTER_TYPE_MAP: Record<number, EncounterType> = {
  1: "Werewolf",
  2: "Vampire",
  3: "FreeHealth",
  4: "AttackPoints",
  5: "ReducedDamage",
  6: "FreeAttack",
  7: "FreeFlee",
  8: "FreeRoam",
};

// ============================================================================
// Beast Type Mappings
// ============================================================================

/**
 * Maps beast encounter type to beast type number
 */
export const BEAST_TYPE_MAP = {
  Werewolf: 1,
  Vampire: 2,
} as const;

/**
 * Reverse mapping: beast type number to encounter type string
 */
export const BEAST_TYPE_TO_ENCOUNTER: Record<number, "Werewolf" | "Vampire"> = {
  1: "Werewolf",
  2: "Vampire",
};

// ============================================================================
// Direction Enum Helpers
// ============================================================================

/**
 * Direction enum values for Cairo (CairoCustomEnum)
 * Used when calling Dojo system calls that require Direction enum
 */
export const DIRECTIONS = {
  Up: new CairoCustomEnum({ Up: {} }),
  Down: new CairoCustomEnum({ Down: {} }),
  Left: new CairoCustomEnum({ Left: {} }),
  Right: new CairoCustomEnum({ Right: {} }),
} as const;

/**
 * Converts Direction string to CairoCustomEnum for Dojo system calls
 * @param direction - Direction string ("Left" | "Right" | "Up" | "Down")
 * @returns CairoCustomEnum instance for the given direction
 */
export function directionToEnum(direction: Direction): CairoCustomEnum {
  return DIRECTIONS[direction];
}

