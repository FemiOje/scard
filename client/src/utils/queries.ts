// Query builders for Dojo SDK
// Extracted from useGameState.ts following Death Mountain architecture pattern

import { ToriiQueryBuilder, ClauseBuilder } from "@dojoengine/sdk";
import type { SchemaType } from "../generated/typescript/models.gen";

/**
 * Builds query for fetching beast encounter
 * Minimal query builder following death-mountain pattern
 * 
 * @param gameId - Game ID to query
 * @param namespace - Namespace for the contract (default: "scard")
 * @returns Query builder instance
 */
export function buildBeastQuery(gameId: string, namespace: string = "scard") {
  return new ToriiQueryBuilder<SchemaType>()
    .withClause(
      new ClauseBuilder()
        .keys([`${namespace}-BeastEncounter`], [gameId])
        .build()
    )
    .withEntityModels([`${namespace}-BeastEncounter`])
    .withLimit(1);
}

