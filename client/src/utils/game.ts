// Pure game logic utilities

import { WIN_X, WIN_Y, ENCOUNTER_TYPE_MAP } from "../constants/game";
import type { Position, EncounterType } from "../types/game";

/**
 * Derives game ID from wallet address
 * 
 * @param address - Wallet address (hex string with 0x prefix)
 * @returns Game ID as string
 */
export function getGameId(address: string): string {
  if (!address) return "0";
  const hexPart = address.slice(2, 18);
  return BigInt(`0x${hexPart}`).toString();
}

/**
 * Checks if position indicates win condition
 * Win condition: position === (WIN_X, WIN_Y)
 * 
 * @param position - Position object with x and y coordinates
 * @returns true if position is the winning position
 */
export function checkWinCondition(position: Position | { x: number; y: number }): boolean {
  return position.x === WIN_X && position.y === WIN_Y;
}

/**
 * Maps encounter type number to EncounterType enum
 * Uses ENCOUNTER_TYPE_MAP from constants
 * 
 * @param encounterType - Encounter type number (1-8)
 * @returns EncounterType enum value or null if invalid
 */
export function parseEncounterType(encounterType: number): EncounterType {
  return ENCOUNTER_TYPE_MAP[encounterType] || null;
}

