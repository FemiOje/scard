import { useAccount } from "@starknet-react/core";
import { useEffect, useCallback } from "react";
import type {
  Direction,
  EncounterState,
  UseGameStateReturn,
  Position,
} from "../types/game";
import { getGameId, checkWinCondition, parseEncounterType } from "../utils/game";
import { parseEventsFromReceipt } from "../utils/events";
import { useGameStore } from "../stores/gameStore";
import { useSystemCalls } from "../dojo/useSystemCalls";

/**
 * Main game state hook - thin orchestration layer
 * Coordinates between Zustand store, Dojo system calls, and business logic
 * 
 * @returns {UseGameStateReturn} Game state and actions for components
 * 
 * @example
 * ```tsx
 * function GameComponent() {
 *   const { 
 *     playerPosition, 
 *     gameStatus, 
 *     encounter,
 *     movePlayer, 
 *     fight, 
 *     flee 
 *   } = useGameState();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => movePlayer("Up")}>Move Up</button>
 *       {encounter && <EncounterPopup encounter={encounter} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameState(): UseGameStateReturn {
  const { address } = useAccount();

  // Get state and actions from Zustand store
  const {
    gameId,
    playerPosition,
    gameStatus,
    encounter,
    isLoading,
    error,
    setGameId,
    setPlayerPosition,
    setGameStatus,
    setEncounter,
    clearEncounter,
    setIsLoading,
    setError,
  } = useGameStore();

  // Get Dojo system calls
  const {
    dojoCreateGame,
    dojoMove,
    dojoFight,
    dojoFlee,
    fetchBeastEncounter,
    fetchCurrentEncounter,
    gameSystemsAddress,
    worldAddress,
  } = useSystemCalls();

  useEffect(() => {
    if (address) {
      const id = getGameId(address);
      setGameId(id);
    } else {
      setGameId(null);
      setPlayerPosition(null);
      setGameStatus("InProgress");
    }
  }, [address, setGameId, setPlayerPosition, setGameStatus]);

  // Create new game
  const createGame = useCallback(async () => {
    if (!gameId || !gameSystemsAddress || !worldAddress) {
      setError("Game ID or contract addresses not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call Dojo system
      const receipt = await dojoCreateGame(gameId);

      // Parse events from receipt
      const { position } = parseEventsFromReceipt(
        receipt,
        gameSystemsAddress,
        worldAddress
      );

      const finalPosition = position || { x: 0, y: 0 };
      if (!position) {
        // Fallback: assume initial position is (0, 0)
        console.warn("[Create Game] Could not parse position, using (0,0)");
      }

      setPlayerPosition({
        game_id: gameId,
        x: finalPosition.x,
        y: finalPosition.y,
      } as unknown as Position);

      // Reset game status to InProgress when creating new game
      setGameStatus("InProgress");
      // Clear any encounter state
      setEncounter(null);
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setIsLoading(false);
    }
  }, [
    gameId,
    gameSystemsAddress,
    worldAddress,
    dojoCreateGame,
    setPlayerPosition,
    setGameStatus,
    setEncounter,
    setIsLoading,
    setError,
  ]);

  // Move player
  const movePlayer = useCallback(
    async (direction: Direction) => {
      // Edge case: Prevent movement if game is already won
      if (gameStatus === "Won") {
        console.warn("[Move] Cannot move - game is already won");
        setError("Game is already won. Please start a new game.");
        return;
      }

      // Prevent movement if player is in a beast encounter
      // Player must fight or flee before moving again
      if (
        encounter &&
        (encounter.type === "Werewolf" || encounter.type === "Vampire")
      ) {
        console.warn("[Move] Cannot move - must resolve encounter first");
        setError("You must fight or flee before moving again.");
        return;
      }

      if (!gameId || !gameSystemsAddress || !worldAddress) {
        setError("Game ID or contract addresses not available");
        return;
      }

      // Clear encounter state at START of move (before parsing new events)
      // This ensures we don't show stale encounter data
      setEncounter(null);

      setIsLoading(true);
      setError(null);

      try {
        // Call Dojo system
        const receipt = await dojoMove(gameId, direction);

        // Parse events from receipt (position and encounter)
        const { position, encounterType } = parseEventsFromReceipt(
          receipt,
          gameSystemsAddress,
          worldAddress
        );

        if (position) {
          // Check win condition when position is updated
          // Invariant: Ensure gameStatus matches position state
          const isWin = checkWinCondition(position);

          setPlayerPosition({
            game_id: gameId,
            x: position.x,
            y: position.y,
          } as unknown as Position);

          if (isWin) {
            setGameStatus("Won");
            console.log("[Move] 🎉 Game won! Position reached (4, 4)");
            // Clear encounter on win
            setEncounter(null);
          } else if (encounterType !== null) {
            // Parse and set encounter
            const encounterTypeEnum = parseEncounterType(encounterType);
            console.log("[Move] 🎲 Encounter generated:", encounterTypeEnum);

            // Set encounter immediately to trigger UI update
            // For beast encounters, fetch stats in background (non-blocking)
            const encounterState: EncounterState = {
              type: encounterTypeEnum,
              beastStats: null,
            };

            console.log("[Move] 🎲 Setting encounter state:", encounterState);
            setEncounter(encounterState);

            // Fetch beast stats in background if it's a beast encounter
            if (
              encounterTypeEnum === "Werewolf" ||
              encounterTypeEnum === "Vampire"
            ) {
              // Fetch beast stats and update encounter (non-blocking)
              // Pass expected encounter type to validate we get the right beast
              fetchBeastEncounter(gameId, encounterTypeEnum)
                .then((beastStats) => {
                  if (beastStats) {
                    console.log(
                      "[Move] 🎲 Updating encounter with beast stats:",
                      beastStats
                    );
                    setEncounter({
                      type: encounterTypeEnum,
                      beastStats,
                    });
                  } else {
                    console.warn(
                      "[Move] ⚠️ Could not fetch beast stats after retries. Encounter will show without stats."
                    );
                    // Keep encounter state - UI can still display encounter type
                  }
                })
                .catch((error) => {
                  console.warn(
                    "[Encounter] Failed to fetch beast stats after all retries:",
                    error
                  );
                  // Keep encounter state even without stats - UI can still display encounter type
                });
            }
          } else {
            // No encounter generated - clear encounter state
            setEncounter(null);
          }
        } else {
          console.warn("[Move] Could not parse position from receipt");
          // Fallback: check current position state if available
          if (playerPosition) {
            const currentPos = {
              x: Number(playerPosition.x),
              y: Number(playerPosition.y),
            };
            const isWin = checkWinCondition(currentPos);
            if (isWin) {
              setGameStatus("Won");
              console.log("[Move] 🎉 Game won! (detected via position state)");
              setEncounter(null);
            }
          }
        }
      } catch (err) {
        console.error("Error moving player:", err);
        setError(err instanceof Error ? err.message : "Failed to move player");
      } finally {
        setIsLoading(false);
      }
    },
    [
      gameId,
      gameSystemsAddress,
      worldAddress,
      gameStatus,
      playerPosition,
      dojoMove,
      fetchBeastEncounter,
      checkWinCondition,
      setEncounter,
      setPlayerPosition,
      setGameStatus,
      setIsLoading,
      setError,
    ]
  );

  // Fight function
  const fight = useCallback(async () => {
    if (!gameId) {
      setError("Game ID not available");
      return;
    }

    if (
      !encounter ||
      (encounter.type !== "Werewolf" && encounter.type !== "Vampire")
    ) {
      setError("Not in a beast encounter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify encounter state with contract before fighting
      // This prevents "not in beast encounter" errors due to state mismatch
      const currentEncounter = await fetchCurrentEncounter(gameId);
      if (!currentEncounter) {
        setError("Could not verify encounter state. Please try again.");
        setIsLoading(false);
        return;
      }

      // Check if encounter type matches (1 = Werewolf, 2 = Vampire)
      const encounterTypeNum = Number(currentEncounter.encounter_type);
      const isBeastEncounter = encounterTypeNum === 1 || encounterTypeNum === 2;
      
      if (!isBeastEncounter) {
        setError(
          "Not in a beast encounter. The encounter may have been resolved or expired."
        );
        setEncounter(null); // Clear stale encounter state
        setIsLoading(false);
        return;
      }

      // Call Dojo system
      await dojoFight(gameId);

      // Clear encounter after fight
      setEncounter(null);

      // Check if player died (game status might be Lost now)
      // We can parse CombatEvent from receipt or check game state
      console.log("[Fight] ✅ Fight completed");
    } catch (err) {
      console.error("Error fighting:", err);
      setError(err instanceof Error ? err.message : "Failed to fight");
    } finally {
      setIsLoading(false);
    }
  }, [
    gameId,
    encounter,
    dojoFight,
    fetchCurrentEncounter,
    setEncounter,
    setIsLoading,
    setError,
  ]);

  // Flee function
  const flee = useCallback(async () => {
    if (!gameId) {
      setError("Game ID not available");
      return;
    }

    if (
      !encounter ||
      (encounter.type !== "Werewolf" && encounter.type !== "Vampire")
    ) {
      setError("Not in a beast encounter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify encounter state with contract before fleeing
      // This prevents "not in beast encounter" errors due to state mismatch
      const currentEncounter = await fetchCurrentEncounter(gameId);
      if (!currentEncounter) {
        setError("Could not verify encounter state. Please try again.");
        setIsLoading(false);
        return;
      }

      // Check if encounter type matches (1 = Werewolf, 2 = Vampire)
      const encounterTypeNum = Number(currentEncounter.encounter_type);
      const isBeastEncounter = encounterTypeNum === 1 || encounterTypeNum === 2;
      
      if (!isBeastEncounter) {
        setError(
          "Not in a beast encounter. The encounter may have been resolved or expired."
        );
        setEncounter(null); // Clear stale encounter state
        setIsLoading(false);
        return;
      }

      // Call Dojo system
      await dojoFlee(gameId);

      // Clear encounter after flee
      setEncounter(null);

      // Check if player died (game status might be Lost now)
      console.log("[Flee] ✅ Flee completed");
    } catch (err) {
      console.error("Error fleeing:", err);
      setError(err instanceof Error ? err.message : "Failed to flee");
    } finally {
      setIsLoading(false);
    }
  }, [
    gameId,
    encounter,
    dojoFlee,
    fetchCurrentEncounter,
    setEncounter,
    setIsLoading,
    setError,
  ]);

  // Sync check: Validate that gameStatus matches position state
  useEffect(() => {
    if (playerPosition && gameStatus === "InProgress") {
      const pos = {
        x: Number(playerPosition.x),
        y: Number(playerPosition.y),
      };
      if (checkWinCondition(pos)) {
        console.warn(
          "[State Sync] Position indicates win but status is InProgress. Updating..."
        );
        setGameStatus("Won");
      }
    }
  }, [playerPosition, gameStatus, checkWinCondition]);

  return {
    gameId,
    playerPosition,
    gameStatus,
    encounter,
    isLoading,
    error,
    createGame,
    movePlayer,
    fight,
    flee,
    clearEncounter,
  };
}
