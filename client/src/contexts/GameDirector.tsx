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

import { createContext, PropsWithChildren, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useGameStore } from "../stores/gameStore";
import { useSystemCalls } from "../dojo/useSystemCalls";
import { getGameState, checkGameExists, getGameEvents } from "../api/starknet";
import { parseEncounterType, checkWinCondition } from "../utils/game";
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
  const isInitializingRef = useRef(false);

  const {
    gameId,
    setGameId,
    setPlayerPosition,
    setPlayerStats,
    setGameStatus,
    setEncounter,
    clearEncounter,
  } = useGameStore();

  const { dojoCreateGame } = useSystemCalls();

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const lastInitializedGameIdRef = useRef<string | null>(null);

  /**
   * Restore complete game state from blockchain
   * Called when existing game is detected
   * 
   * @param gameId - Game ID to restore
   */
  const restoreGameState = useCallback(
    async (gameId: string) => {
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
        const derivedStatus: GameStatus =
          statusMap[gameState.gameStatus] || "InProgress";
        setGameStatus(derivedStatus);

        // Also check win condition from position (safety check)
        if (
          derivedStatus === "InProgress" &&
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
    },
    [
      setPlayerStats,
      setPlayerPosition,
      setGameStatus,
      setEncounter,
      clearEncounter,
      getGameEvents,
      parseEncounterType,
      checkWinCondition,
    ]
  );

  /**
   * Initialize or restore game state when wallet connects
   * This is the KEY function for persistence!
   * 
   * IMPORTANT: Don't run initialization if:
   * - We're already initializing (prevent loops)
   * - We're on /play page (let GameScreen handle it - check via window.location since we're outside Router)
   */
  useEffect(() => {
    if (!address) {
      console.log("[GameDirector] No address, clearing state");
      setGameId(null);
      setPlayerPosition(null);
      setPlayerStats(null);
      setGameStatus("InProgress");
      clearEncounter();
      setInitializationError(null);
      setIsInitializing(false);
      lastInitializedGameIdRef.current = null;
      return;
    }
  }, [address, setGameId, setPlayerPosition, setPlayerStats, setGameStatus, clearEncounter]);

  const createNewGame = useCallback(
    async (gameId: string) => {
      try {
        const receipt = await dojoCreateGame(gameId);
        console.log("[GameDirector] ✅ Created new game", {
          gameId,
          transaction_hash: receipt?.transaction_hash,
        });
      } catch (error) {
        console.error("[GameDirector] Error creating new game:", error);
        throw error;
      }
    },
    [dojoCreateGame]
  );

  useEffect(() => {
    if (!address || !gameId) {
      return;
    }

    if (lastInitializedGameIdRef.current === gameId) {
      return;
    }

    const initializeGame = async () => {
      if (isInitializingRef.current) {
        console.log("[GameDirector] Already initializing game", gameId);
        return;
      }

      isInitializingRef.current = true;
      setIsInitializing(true);
      setInitializationError(null);
      console.log("[GameDirector] Initializing game", gameId);

      try {
        const exists = await checkGameExists(gameId);

        if (exists) {
          console.log("[GameDirector] Game exists, restoring state", gameId);
          await restoreGameState(gameId);
        } else {
          console.log("[GameDirector] Game does not exist, creating new game", gameId);
          await createNewGame(gameId);
          await restoreGameState(gameId);
        }

        lastInitializedGameIdRef.current = gameId;
      } catch (error) {
        console.error("[GameDirector] ❌ Initialization error:", error);
        setInitializationError(
          error instanceof Error ? error.message : "Failed to initialize game"
        );
      } finally {
        setIsInitializing(false);
        isInitializingRef.current = false;
      }
    };

    initializeGame();
  }, [address, gameId, createNewGame, restoreGameState, checkGameExists]);

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

