/**
 * Game Director Context
 * Orchestrates game initialization and state restoration on page load
 * 
 * Following death-mountain pattern for consistency
 * 
 * Responsibilities:
 * - Detect wallet connection/disconnection
 * - Check if existing game exists on-chain
 * - Restore complete game state from blockchain
 * - Manage initialization loading and error states
 * - Coordinate between API layer and Zustand store
 */

import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useGameStore } from "../stores/gameStore";
import { getGameState, checkGameExists, getGameEvents } from "../api/starknet";
import { getGameId, parseEncounterType, checkWinCondition } from "../utils/game";
import type { GameStatus, EncounterState } from "../types/game";

export interface GameDirectorContext {
  isInitializing: boolean;
  initializationError: string | null;
}

const GameDirectorContext = createContext<GameDirectorContext>(
  {} as GameDirectorContext
);

/**
 * Game Director Provider Component
 * Wraps the app and handles game state restoration on mount
 */
export function GameDirector({ children }: PropsWithChildren) {
  const { address } = useAccount();

  const {
    setGameId,
    setPlayerPosition,
    setPlayerStats,
    setGameStatus,
    setEncounter,
    clearEncounter,
  } = useGameStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );

  /**
   * Initialize or restore game state when wallet connects
   * This is the KEY function for persistence!
   */
  useEffect(() => {
    console.log("[GameDirector] useEffect triggered. Address:", address);
    
    if (!address) {
      console.log("[GameDirector] No address, clearing state");
      setGameId(null);
      setPlayerPosition(null);
      setPlayerStats(null);
      setGameStatus("InProgress");
      clearEncounter();
      setIsInitializing(false);
      setInitializationError(null);
      return;
    }

    const initialize = async () => {
      console.log("[GameDirector] Starting initialization...");
      setIsInitializing(true);
      setInitializationError(null);

      try {
        const id = getGameId(address);
        console.log("[GameDirector] ✅ Game ID calculated:", id);
        setGameId(id);

        // Check if game exists on-chain
        console.log("[GameDirector] Checking if game exists on blockchain...");
        const exists = await checkGameExists(id);
        console.log("[GameDirector] Game exists:", exists);

        if (exists) {
          console.log(
            "[GameDirector] ✅ Existing game detected! Restoring state..."
          );
          await restoreGameState(id);
          console.log("[GameDirector] ✅ State restoration complete");
        } else {
          console.log(
            "[GameDirector] ℹ️ No existing game found. Ready to create new game."
          );
          // Don't auto-create - let user click "Start Game"
        }
      } catch (error) {
        console.error("[GameDirector] ❌ Initialization error:", error);
        setInitializationError(
          error instanceof Error ? error.message : "Failed to initialize game"
        );
      } finally {
        setIsInitializing(false);
        console.log("[GameDirector] Initialization complete");
      }
    };

    initialize();
  }, [address]);

  /**
   * Restore complete game state from blockchain
   * Called when existing game is detected
   * 
   * @param gameId - Game ID to restore
   */
  const restoreGameState = async (gameId: string) => {
    try {
      console.log("[GameDirector] Fetching game state from blockchain...");

      // 1. Fetch complete game state
      const gameState = await getGameState(gameId);

      if (!gameState) {
        throw new Error("Failed to retrieve game state from blockchain");
      }

      console.log("[GameDirector] Restored state:", gameState);

      // 2. Map and populate Zustand store with blockchain data

      // Map player stats
      setPlayerStats({
        game_id: BigInt(gameId),
        health: gameState.player.health,
        damage_points: gameState.player.damage_points,
        attack_points: gameState.player.attack_points,
        has_free_flee: gameState.player.has_free_flee,
        has_free_attack: gameState.player.has_free_attack,
      } as any);

      // Map position
      setPlayerPosition({
        game_id: BigInt(gameId),
        x: gameState.position.x,
        y: gameState.position.y,
      } as any);

      // Map game status (0=InProgress, 1=Won, 2=Lost)
      const statusMap: Record<number, GameStatus> = {
        0: "InProgress",
        1: "Won",
        2: "Lost",
      };
      const gameStatus: GameStatus =
        statusMap[gameState.gameStatus] || "InProgress";
      setGameStatus(gameStatus);

      // Also check win condition from position (safety check)
      if (
        gameStatus === "InProgress" &&
        checkWinCondition({ x: gameState.position.x, y: gameState.position.y })
      ) {
        console.warn(
          "[GameDirector] Position indicates win but status is InProgress. Updating..."
        );
        setGameStatus("Won");
      }

      // 3. Restore encounter state if in encounter
      if (gameState.currentEncounter.encounter_type !== 0) {
        const encounterType = parseEncounterType(
          gameState.currentEncounter.encounter_type
        );

        console.log("[GameDirector] Restoring encounter:", encounterType);

        const encounterState: EncounterState = {
          type: encounterType,
          beastStats: null,
        };

        // If has beast, populate beast stats
        if (gameState.has_beast && gameState.beastEncounter) {
          encounterState.beastStats = {
            game_id: BigInt(gameId),
            beast_type: gameState.beastEncounter.beast_type,
            attack_points: gameState.beastEncounter.attack_points,
            damage_points: gameState.beastEncounter.damage_points,
          } as any;
        }

        setEncounter(encounterState);
      } else {
        clearEncounter();
      }

      // 4. Fetch historical events for event log (optional, non-blocking)
      getGameEvents(gameId)
        .then((events: any[]) => {
          console.log(
            `[GameDirector] Loaded ${events.length} historical events`
          );
          // TODO: Process events for combat log display if needed
        })
        .catch((error: any) => {
          console.warn(
            "[GameDirector] Failed to load historical events:",
            error
          );
          // Non-critical - continue without events
        });

      console.log("[GameDirector] ✅ Game state restored successfully");
    } catch (error) {
      console.error("[GameDirector] Error restoring game state:", error);
      throw error;
    }
  };

  return (
    <GameDirectorContext.Provider
      value={{
        isInitializing,
        initializationError,
      }}
    >
      {children}
    </GameDirectorContext.Provider>
  );
}

/**
 * Hook to access Game Director context
 * 
 * @returns {GameDirectorContext} Context values (isInitializing, initializationError)
 * 
 * @example
 * ```tsx
 * const { isInitializing, initializationError } = useGameDirector();
 * if (isInitializing) return <LoadingScreen />;
 * if (initializationError) return <ErrorScreen error={initializationError} />;
 * ```
 */
export function useGameDirector() {
  return useContext(GameDirectorContext);
}

