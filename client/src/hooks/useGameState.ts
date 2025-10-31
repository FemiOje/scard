import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useState, useEffect, useCallback } from "react";
import { CairoCustomEnum } from "starknet";
import type { Position } from "../typescript/models.gen";
import { setupWorld } from "../typescript/contracts.gen";
import { dojoConfig } from "../../dojoConfig";
import { getContractByName } from "@dojoengine/core";

export type GameStatus = "InProgress" | "Won" | "Lost";

interface UseGameStateReturn {
  gameId: string | null;
  playerPosition: Position | null;
  gameStatus: GameStatus;
  isLoading: boolean;
  error: string | null;
  createGame: () => Promise<void>;
  movePlayer: (direction: "Left" | "Right" | "Up" | "Down") => Promise<void>;
}

/**
 * Custom hook to manage game state and interact with Dojo game systems
 * Mirrors death-mountain's approach: parses position from transaction receipts
 */
export function useGameState(): UseGameStateReturn {
  const { account, address } = useAccount();
  const dojoSDK = useDojoSDK();
  const { provider } = dojoSDK as any;
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerPosition, setPlayerPosition] = useState<Position | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("InProgress");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grid size constant - win condition is at bottom-right corner
  const GRID_SIZE = 5;
  const WIN_X = GRID_SIZE - 1; // 4
  const WIN_Y = GRID_SIZE - 1; // 4

  const getGameId = useCallback((addr: string): string => {
    if (!addr) return "0";
    const hexPart = addr.slice(2, 18);
    return BigInt(`0x${hexPart}`).toString();
  }, []);

  const gameActions = provider ? setupWorld(provider as any) : null;

  // Resolve game_systems contract address from manifest
  const gameSystemsAddress: string | undefined = (() => {
    try {
      return getContractByName(
        dojoConfig.manifest as any,
        "scard",
        "game_systems"
      )?.address;
    } catch {
      return undefined;
    }
  })();

  // Get World contract address from dojoConfig
  const worldAddress: string | undefined = dojoConfig?.manifest?.world?.address;

  useEffect(() => {
    if (address) {
      const id = getGameId(address);
      setGameId(id);
    } else {
      setGameId(null);
      setPlayerPosition(null);
      setGameStatus("InProgress");
    }
  }, [address, getGameId]);

  /**
   * Check if position indicates win condition
   * Invariant: gameStatus === "Won" IFF position === (4, 4)
   */
  const checkWinCondition = useCallback(
    (position: { x: number; y: number }): boolean => {
      return position.x === WIN_X && position.y === WIN_Y;
    },
    []
  );

  /**
   * Wait for transaction confirmation with retries
   * Based on death-mountain's waitForTransaction pattern
   */
  const waitForTransaction = async (
    txHash: string,
    retries: number = 0
  ): Promise<any> => {
    if (retries > 9) {
      throw new Error("Transaction confirmation timeout");
    }

    try {
      const receipt: any = await account!.waitForTransaction(txHash, {
        retryInterval: 350,
        successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
      });

      return receipt;
    } catch (error) {
      console.error("Error waiting for transaction, retrying:", error);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return waitForTransaction(txHash, retries + 1);
    }
  };

  /**
   * Parse position coordinates from transaction receipt events
   * In Dojo, events are emitted from the World contract, but encode the system in keys[2]
   * Event data structure: [version, game_id, ..., x, y]
   * Position is at data[4] (x) and data[5] (y)
   */
  const parsePositionFromReceipt = (
    receipt: any,
    gameSystemsAddress: string,
    worldAddress: string
  ): { x: number; y: number } | null => {
    try {
      if (!receipt.events || !Array.isArray(receipt.events)) {
        console.warn("[Receipt] No events array in receipt");
        return null;
      }

      // Filter events from World contract where keys[2] matches game_systems address
      const gameEvents = receipt.events.filter((evt: any) => {
        const fromWorld =
          evt.from_address?.toLowerCase() === worldAddress?.toLowerCase();
        const hasGameSystemsKey =
          evt.keys &&
          evt.keys.length >= 3 &&
          evt.keys[2]?.toLowerCase() === gameSystemsAddress?.toLowerCase();
        return fromWorld && hasGameSystemsKey;
      });

      console.log("[Receipt] Game events found:", gameEvents.length);

      // Try to find GameCreated or Moved event with position data
      // Position is at data[4] (x) and data[5] (y)
      for (const evt of gameEvents) {
        if (evt.data && evt.data.length >= 6) {
          // data[4] = x coordinate, data[5] = y coordinate
          const x = parseInt(evt.data[4], 16);
          const y = parseInt(evt.data[5], 16);

          if (!Number.isNaN(x) && !Number.isNaN(y)) {
            console.log("[Receipt] ✅ Successfully parsed position:", { x, y });
            return { x, y };
          }
        }
      }

      console.warn("[Receipt] No valid position found in events");
      return null;
    } catch (error) {
      console.error("Error parsing position from receipt:", error);
      return null;
    }
  };

  // Create new game
  const createGame = useCallback(async () => {
    if (
      !account ||
      !gameActions ||
      !gameId ||
      !gameSystemsAddress ||
      !worldAddress
    ) {
      setError("Account or game actions not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await gameActions.game_systems.createGame(account, gameId);
      console.log("[Create Game] Transaction hash:", tx.transaction_hash);

      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx.transaction_hash);

      if (receipt.execution_status === "REVERTED") {
        throw new Error("Transaction reverted");
      }

      // Parse position from receipt
      const position = parsePositionFromReceipt(
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
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setIsLoading(false);
    }
  }, [account, gameActions, gameId, gameSystemsAddress, worldAddress]);

  // Move player
  const movePlayer = useCallback(
    async (direction: "Left" | "Right" | "Up" | "Down") => {
      // Edge case: Prevent movement if game is already won
      if (gameStatus === "Won") {
        console.warn("[Move] Cannot move - game is already won");
        setError("Game is already won. Please start a new game.");
        return;
      }

      if (
        !account ||
        !gameActions ||
        !gameId ||
        !gameSystemsAddress ||
        !worldAddress
      ) {
        setError("Account or game actions not available");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const directionEnum = new CairoCustomEnum({ [direction]: {} });
        const tx = await gameActions.game_systems.move(
          account,
          gameId,
          directionEnum
        );
        console.log("[Move] Transaction hash:", tx.transaction_hash);

        // Wait for transaction confirmation
        const receipt = await waitForTransaction(tx.transaction_hash);

        if (receipt.execution_status === "REVERTED") {
          throw new Error("Transaction reverted");
        }

        // Parse new position from receipt
        const position = parsePositionFromReceipt(
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
      account,
      gameActions,
      gameId,
      gameSystemsAddress,
      worldAddress,
      gameStatus,
      playerPosition,
      checkWinCondition,
    ]
  );

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
    isLoading,
    error,
    createGame,
    movePlayer,
  };
}
