// Dojo system calls and blockchain interactions

import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { setupWorld } from "../generated/typescript/contracts.gen";
import { getContractByName } from "@dojoengine/core";
import { dojoConfig } from "../../dojoConfig";
import {
  TX_MAX_RETRIES,
  TX_RETRY_INTERVAL,
  TX_RETRY_DELAY,
  QUERY_MAX_RETRIES,
  QUERY_BASE_DELAY,
  BEAST_TYPE_MAP,
  directionToEnum,
} from "../constants/game";
import { buildBeastQuery, buildCurrentEncounterQuery, buildPlayerQuery } from "../utils/queries";
import type { Direction, BeastEncounter } from "../types/game";
import type { Player } from "../generated/typescript/models.gen";

/**
 * Delay helper function
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook for Dojo system calls and blockchain interactions
 * Provides low-level functions that execute system calls and return receipts
 * State management is handled by the caller (useGameState)
 * 
 * Following death-mountain pattern: transaction utilities embedded in this hook
 * 
 * @returns {Object} System call functions and contract addresses
 * @returns {Function} returns.dojoCreateGame - Create game system call
 * @returns {Function} returns.dojoMove - Move player system call
 * @returns {Function} returns.dojoFight - Fight beast system call
 * @returns {Function} returns.dojoFlee - Flee from beast system call
 * @returns {Function} returns.fetchBeastEncounter - Fetch beast encounter data
 * @returns {string|undefined} returns.gameSystemsAddress - Contract address for event parsing
 * @returns {string|undefined} returns.worldAddress - World contract address for event parsing
 * 
 * @example
 * ```tsx
 * const { dojoMove, fetchBeastEncounter } = useSystemCalls();
 * const receipt = await dojoMove(gameId, "Up");
 * const beast = await fetchBeastEncounter(gameId, "Werewolf");
 * ```
 */
export function useSystemCalls() {
  const { account } = useAccount();
  const { provider, sdk } = useDojoSDK();
  const gameActions = provider ? setupWorld(provider as any) : null;

  // Resolve contract addresses from manifest
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

  const worldAddress: string | undefined = dojoConfig?.manifest?.world?.address;

  /**
   * Transaction utility - waits for transaction with retry logic
   * Embedded in useSystemCalls following death-mountain pattern
   */
  const waitForTransaction = async (
    txHash: string,
    retries: number = 0
  ): Promise<any> => {
    if (retries > TX_MAX_RETRIES) {
      throw new Error(`Transaction failed after ${TX_MAX_RETRIES} retries`);
    }

    try {
      const receipt: any = await account!.waitForTransaction(txHash, {
        retryInterval: TX_RETRY_INTERVAL,
        successStates: ["PRE_CONFIRMED", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
      });

      // Check for revert
      if (receipt.execution_status === "REVERTED") {
        throw new Error("Transaction reverted");
      }

      return receipt;
    } catch (error) {
      console.error(
        `Transaction retry ${retries + 1}/${TX_MAX_RETRIES}:`,
        error
      );
      await delay(TX_RETRY_DELAY);
      return waitForTransaction(txHash, retries + 1);
    }
  };

  /**
   * Create new game system call
   * @param gameId - Game ID to create
   * @returns Transaction receipt
   */
  const dojoCreateGame = async (gameId: string): Promise<any> => {
    if (!account || !gameActions) {
      throw new Error("Account or game actions not initialized");
    }

    const tx = await gameActions.game_systems.createGame(account, gameId);
    console.log("[System Call] CreateGame transaction hash:", tx.transaction_hash);

    return await waitForTransaction(tx.transaction_hash);
  };

  /**
   * Move player system call
   * @param gameId - Game ID
   * @param direction - Direction to move
   * @returns Transaction receipt
   */
  const dojoMove = async (
    gameId: string,
    direction: Direction
  ): Promise<any> => {
    if (!account || !gameActions) {
      throw new Error("Account or game actions not initialized");
    }

    const directionEnum = directionToEnum(direction);
    const tx = await gameActions.game_systems.move(
      account,
      gameId,
      directionEnum
    );
    console.log("[System Call] Move transaction hash:", tx.transaction_hash);

    return await waitForTransaction(tx.transaction_hash);
  };

  /**
   * Fight beast system call
   * @param gameId - Game ID
   * @returns Transaction receipt
   */
  const dojoFight = async (gameId: string): Promise<any> => {
    if (!account || !gameActions) {
      throw new Error("Account or game actions not initialized");
    }

    const tx = await gameActions.game_systems.fight(account, gameId);
    console.log("[System Call] Fight transaction hash:", tx.transaction_hash);

    return await waitForTransaction(tx.transaction_hash);
  };

  /**
   * Flee from beast system call
   * @param gameId - Game ID
   * @returns Transaction receipt
   */
  const dojoFlee = async (gameId: string): Promise<any> => {
    if (!account || !gameActions) {
      throw new Error("Account or game actions not initialized");
    }

    const tx = await gameActions.game_systems.flee(account, gameId);
    console.log("[System Call] Flee transaction hash:", tx.transaction_hash);

    return await waitForTransaction(tx.transaction_hash);
  };

  /**
   * Fetch beast encounter data from Dojo SDK
   * With retry logic to handle indexer lag
   * @param gameId - Game ID to query
   * @param expectedEncounterType - Optional expected encounter type for validation
   * @returns BeastEncounter model or null
   */
  const fetchBeastEncounter = async (
    gameId: string,
    expectedEncounterType?: "Werewolf" | "Vampire"
  ): Promise<BeastEncounter | null> => {
    if (!sdk || !gameId) {
      console.warn("[Encounter] SDK or gameId not available", {
        sdk: !!sdk,
        gameId,
      });
      return null;
    }

    // Retry logic: try up to QUERY_MAX_RETRIES times with increasing delays
    for (let attempt = 0; attempt < QUERY_MAX_RETRIES; attempt++) {
      try {
        // Wait for indexer to catch up (exponential backoff)
        const delay = QUERY_BASE_DELAY * (attempt + 1);
        if (attempt > 0) {
          console.log(
            `[Encounter] Retry attempt ${attempt + 1}/${QUERY_MAX_RETRIES}, waiting ${delay}ms...`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Build and execute query
        const query = buildBeastQuery(gameId);
        const response = await sdk.getEntities({ query });
        const items = response.getItems();

        if (items && items.length > 0) {
          const entity = items[0];
          // Extract model from entity structure
          const model =
            entity?.models?.scard?.BeastEncounter ||
            entity?.models?.["scard"]?.["BeastEncounter"];

          if (model) {
            const beastType = Number(model.beast_type);
            const attackPoints = Number(model.attack_points);
            const damagePoints = Number(model.damage_points);

            // If beast_type is 0 (None) or stats are 0, it's invalid - retry
            if (beastType === 0 || (attackPoints === 0 && damagePoints === 0)) {
              if (attempt < QUERY_MAX_RETRIES - 1) {
                console.log(
                  `[Encounter] Got invalid BeastEncounter (type: ${beastType}, stats: ${attackPoints}/${damagePoints}), retrying...`
                );
                continue; // Retry
              } else {
                console.log(
                  "[Encounter] BeastEncounter is None/empty after all retries, giving up:",
                  model
                );
                return null;
              }
            }

            // Validate that beast type matches expected encounter type (if provided)
            if (expectedEncounterType) {
              const expectedType = BEAST_TYPE_MAP[expectedEncounterType];
              if (beastType !== expectedType) {
                if (attempt < QUERY_MAX_RETRIES - 1) {
                  console.log(
                    `[Encounter] Beast type mismatch (got ${beastType}, expected ${expectedType}), retrying...`
                  );
                  continue; // Retry
                } else {
                  console.warn(
                    `[Encounter] Beast type mismatch after all retries (got ${beastType}, expected ${expectedType})`
                  );
                  // Still return it if it's valid (might be a different beast type)
                }
              }
            }

            console.log(
              "[Encounter] ✅ Fetched BeastEncounter via SDK:",
              model
            );
            return model as BeastEncounter;
          }
        }

        // If no model found, retry (might be indexer lag)
        if (attempt < QUERY_MAX_RETRIES - 1) {
          console.log(
            `[Encounter] No BeastEncounter found, retrying (attempt ${attempt + 1}/${QUERY_MAX_RETRIES})...`
          );
          continue;
        }

        console.warn(
          "[Encounter] No BeastEncounter model found for gameId after all retries:",
          gameId
        );
      } catch (error) {
        console.warn(
          `[Encounter] Error fetching BeastEncounter (attempt ${attempt + 1}):`,
          error
        );
        // If it's the last attempt, give up
        if (attempt === QUERY_MAX_RETRIES - 1) {
          return null;
        }
        // Otherwise continue to next retry
      }
    }

    return null;
  };

  /**
   * Fetch current encounter from Dojo SDK
   * Used to verify encounter state before fight/flee
   * @param gameId - Game ID to query
   * @returns CurrentEncounter model or null
   */
  const fetchCurrentEncounter = async (
    gameId: string
  ): Promise<{ encounter_type: number } | null> => {
    if (!sdk || !gameId) {
      console.warn("[Encounter] SDK or gameId not available");
      return null;
    }

    try {
      const query = buildCurrentEncounterQuery(gameId);
      const response = await sdk.getEntities({ query });
      const items = response.getItems();

      if (items && items.length > 0) {
        const entity = items[0];
        const model =
          entity?.models?.scard?.CurrentEncounter ||
          entity?.models?.["scard"]?.["CurrentEncounter"];

        if (model) {
          console.log("[Encounter] ✅ Fetched CurrentEncounter:", model);
          return model as { encounter_type: number };
        }
      }

      console.warn("[Encounter] No CurrentEncounter model found for gameId:", gameId);
      return null;
    } catch (error) {
      console.warn("[Encounter] Error fetching CurrentEncounter:", error);
      return null;
    }
  };

  /**
   * Fetch player stats from Dojo SDK
   * With retry logic to handle indexer lag
   * @param gameId - Game ID to query
   * @returns Player model or null
   */
  const fetchPlayerStats = async (
    gameId: string
  ): Promise<Player | null> => {
    if (!sdk || !gameId) {
      console.warn("[Player Stats] SDK or gameId not available", {
        sdk: !!sdk,
        gameId,
      });
      return null;
    }

    // Retry logic: try up to QUERY_MAX_RETRIES times with increasing delays
    for (let attempt = 0; attempt < QUERY_MAX_RETRIES; attempt++) {
      try {
        // Wait for indexer to catch up (exponential backoff)
        const delay = QUERY_BASE_DELAY * (attempt + 1);
        if (attempt > 0) {
          console.log(
            `[Player Stats] Retry attempt ${attempt + 1}/${QUERY_MAX_RETRIES}, waiting ${delay}ms...`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Build and execute query
        const query = buildPlayerQuery(gameId);
        const response = await sdk.getEntities({ query });
        const items = response.getItems();

        if (items && items.length > 0) {
          const entity = items[0];
          // Extract model from entity structure
          const model =
            entity?.models?.scard?.Player ||
            entity?.models?.["scard"]?.["Player"];

          if (model) {
            const health = Number(model.health);
            const attackPoints = Number(model.attack_points);
            const damagePoints = Number(model.damage_points);

            // Validate that stats are reasonable (not all zeros)
            if (health === 0 && attackPoints === 0 && damagePoints === 0) {
              if (attempt < QUERY_MAX_RETRIES - 1) {
                console.log(
                  `[Player Stats] Got invalid Player (all stats: 0), retrying...`
                );
                continue; // Retry
              } else {
                console.warn(
                  "[Player Stats] Player has all zero stats after all retries, giving up:",
                  model
                );
                return null;
              }
            }

            console.log(
              "[Player Stats] ✅ Fetched Player via SDK:",
              model
            );
            return model as Player;
          }
        }

        // If no model found, retry (might be indexer lag)
        if (attempt < QUERY_MAX_RETRIES - 1) {
          console.log(
            `[Player Stats] No Player found, retrying (attempt ${attempt + 1}/${QUERY_MAX_RETRIES})...`
          );
          continue;
        }

        console.warn(
          "[Player Stats] No Player model found for gameId after all retries:",
          gameId
        );
      } catch (error) {
        console.warn(
          `[Player Stats] Error fetching Player (attempt ${attempt + 1}):`,
          error
        );
        // If it's the last attempt, give up
        if (attempt === QUERY_MAX_RETRIES - 1) {
          return null;
        }
        // Otherwise continue to next retry
      }
    }

    return null;
  };

  return {
    // System calls
    dojoCreateGame,
    dojoMove,
    dojoFight,
    dojoFlee,
    // Data fetching
    fetchBeastEncounter,
    fetchCurrentEncounter,
    fetchPlayerStats,
    // Contract addresses (for event parsing)
    gameSystemsAddress,
    worldAddress,
  };
}

