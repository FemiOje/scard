/**
 * StarkNet API module for querying blockchain state
 * Provides functions to fetch game state from smart contracts
 * 
 * Following death-mountain pattern for consistency
 */

import { getContractByName } from "@dojoengine/core";
import { hash, num } from "starknet";
import { dojoConfig } from "../../dojoConfig";

// Entry point selectors - calculated using starknet_keccak
// These match the contract's get_game_state and game_exists functions
// Calculated using: hash.getSelectorFromName(function_name)
const GET_GAME_STATE_SELECTOR = hash.getSelectorFromName("get_game_state");
const GAME_EXISTS_SELECTOR = hash.getSelectorFromName("game_exists");

/**
 * Complete game state returned from get_game_state view function
 * Matches CompleteGameState struct from contracts
 */
export interface CompleteGameState {
  player: {
    game_id: string;
    health: number;
    damage_points: number;
    attack_points: number;
    has_free_flee: boolean;
    has_free_attack: boolean;
  };
  position: {
    game_id: string;
    x: number;
    y: number;
  };
  gameStatus: number; // 0=InProgress, 1=Won, 2=Lost
  currentEncounter: {
    game_id: string;
    encounter_type: number;
  };
  beastEncounter: {
    game_id: string;
    beast_type: number;
    attack_points: number;
    damage_points: number;
  } | null;
  has_beast: boolean;
}

/**
 * Get RPC URL from dojoConfig
 */
function getRpcUrl(): string {
  return dojoConfig.rpcUrl || "https://api.cartridge.gg/x/starknet/sepolia";
}

/**
 * Get Torii URL from dojoConfig or environment
 * Default to local Torii for development
 */
function getToriiUrl(): string {
  return "https://api.cartridge.gg/x/scard/torii";
}

/**
 * Get game_systems contract address from manifest
 */
function getGameSystemsAddress(): string | undefined {
  try {
    return getContractByName(
      dojoConfig.manifest as any,
      "scard",
      "game_systems"
    )?.address;
  } catch {
    return undefined;
  }
}

/**
 * Fetch complete game state from blockchain
 * Single RPC call retrieves all game data (player, position, encounter, etc.)
 * 
 * @param gameId - Game ID to query
 * @returns Complete game state or null if game doesn't exist or error occurred
 * 
 * @example
 * ```typescript
 * const { getGameState } = useStarknetApi();
 * const state = await getGameState("123");
 * if (state) {
 *   console.log("Player health:", state.player.health);
 *   console.log("Position:", state.position.x, state.position.y);
 * }
 * ```
 */
export async function getGameState(
  gameId: string
): Promise<CompleteGameState | null> {
  try {
    const contractAddress = getGameSystemsAddress();
    if (!contractAddress) {
      console.error("[API] Game systems contract address not found");
      return null;
    }

    const response = await fetch(getRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "starknet_call",
        params: [
          {
            contract_address: contractAddress,
            entry_point_selector: num.toHex(GET_GAME_STATE_SELECTOR),
            calldata: [num.toHex(gameId)],
          },
          "latest",
        ],
        id: 0,
      }),
    });

    const data = await response.json();

    // CompleteGameState has 18 fields total
    if (!data?.result || !Array.isArray(data.result) || data.result.length < 18) {
      console.log("[API] No game state found or invalid response");
      return null;
    }

    const result = data.result;
    let idx = 0;

    // Parse CompleteGameState from result array
    // Cairo structs are serialized with all fields in order (flat array)
    // Structure: player (6) + position (3) + game_state (2) + current_encounter (2) + beast_encounter (4) + has_beast (1) = 18 felts
    //
    // Field order (each struct includes its game_id field):
    // 0-5:   player (game_id, health, damage_points, attack_points, has_free_flee, has_free_attack)
    // 6-8:   position (game_id, x, y)
    // 9-10:  game_state (game_id, status)
    // 11-12: current_encounter (game_id, encounter_type)
    // 13-16: beast_encounter (game_id, beast_type, attack_points, damage_points)
    // 17:    has_beast (bool)
    //
    // NOTE: Field parsing order should match the actual contract response.
    // This may need adjustment based on testing with real RPC calls.

    // Parse player (6 fields)
    idx++; // Skip player.game_id (use provided gameId)
    const playerHealth = parseInt(result[idx++], 16);
    const playerDamagePoints = parseInt(result[idx++], 16);
    const playerAttackPoints = parseInt(result[idx++], 16);
    const hasFreeFlee = parseInt(result[idx++], 16) === 1;
    const hasFreeAttack = parseInt(result[idx++], 16) === 1;

    // Parse position (3 fields)
    idx++; // Skip position.game_id (use provided gameId)
    const positionX = parseInt(result[idx++], 16);
    const positionY = parseInt(result[idx++], 16);

    // Parse game_state (2 fields)
    idx++; // Skip game_state.game_id (use provided gameId)
    const gameStatus = parseInt(result[idx++], 16);

    // Parse current_encounter (2 fields)
    idx++; // Skip current_encounter.game_id (use provided gameId)
    const encounterType = parseInt(result[idx++], 16);

    // Parse beast_encounter (4 fields)
    idx++; // Skip beast_encounter.game_id (use provided gameId)
    const beastType = parseInt(result[idx++], 16);
    const beastAttack = parseInt(result[idx++], 16);
    const beastDamage = parseInt(result[idx++], 16);

    // Parse has_beast (1 field)
    const hasBeast = parseInt(result[idx++], 16) === 1;

    // Build game state object
    const gameState: CompleteGameState = {
      player: {
        game_id: gameId,
        health: playerHealth,
        damage_points: playerDamagePoints,
        attack_points: playerAttackPoints,
        has_free_flee: hasFreeFlee,
        has_free_attack: hasFreeAttack,
      },
      position: {
        game_id: gameId,
        x: positionX,
        y: positionY,
      },
      gameStatus,
      currentEncounter: {
        game_id: gameId,
        encounter_type: encounterType,
      },
      beastEncounter: null,
      has_beast: hasBeast,
    };

    // If has_beast is true, populate beastEncounter
    if (hasBeast && beastType > 0) {
      gameState.beastEncounter = {
        game_id: gameId,
        beast_type: beastType,
        attack_points: beastAttack,
        damage_points: beastDamage,
      };
    }

    console.log("[API] Fetched game state:", gameState);
    return gameState;
  } catch (error) {
    console.error("[API] Error fetching game state:", error);
    return null;
  }
}

/**
 * Check if game exists on blockchain
 * Returns true if player has been initialized (health > 0)
 * 
 * @param gameId - Game ID to check
 * @returns true if game exists, false otherwise
 * 
 * @example
 * ```typescript
 * const { checkGameExists } = useStarknetApi();
 * const exists = await checkGameExists("123");
 * if (exists) {
 *   console.log("Game exists, can restore state");
 * }
 * ```
 */
export async function checkGameExists(gameId: string): Promise<boolean> {
  try {
    const contractAddress = getGameSystemsAddress();
    if (!contractAddress) {
      console.error("[API] Game systems contract address not found");
      return false;
    }

    const response = await fetch(getRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "starknet_call",
        params: [
          {
            contract_address: contractAddress,
            entry_point_selector: num.toHex(GAME_EXISTS_SELECTOR),
            calldata: [num.toHex(gameId)],
          },
          "latest",
        ],
        id: 0,
      }),
    });

    const data = await response.json();
    const exists = data?.result?.[0] === "0x1";
    console.log(`[API] Game ${gameId} exists:`, exists);
    return exists;
  } catch (error) {
    console.error("[API] Error checking game exists:", error);
    return false;
  }
}

/**
 * Fetch historical game events from Torii indexer
 * Used to populate event log (move history, combat log, etc.)
 * 
 * @param gameId - Game ID to query
 * @returns Array of historical events
 * 
 * @example
 * ```typescript
 * const { getGameEvents } = useStarknetApi();
 * const events = await getGameEvents("123");
 * console.log(`Loaded ${events.length} historical events`);
 * ```
 */
export async function getGameEvents(gameId: string): Promise<any[]> {
  try {
    const url = `${getToriiUrl()}/sql?query=
      SELECT data
      FROM "event_messages_historical"
      WHERE keys = "${num.toHex(gameId)}/"
      ORDER BY executed_at DESC
      LIMIT 1000`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    const events = data.map((event: any) => JSON.parse(event.data));
    console.log(`[API] Fetched ${events.length} historical events`);
    return events;
  } catch (error) {
    console.warn("[API] Error fetching game events:", error);
    return [];
  }
}

/**
 * Hook wrapper for React components
 * Provides access to all API functions
 * 
 * @returns Object with all API functions
 */
export function useStarknetApi() {
  return {
    getGameState,
    checkGameExists,
    getGameEvents,
  };
}

