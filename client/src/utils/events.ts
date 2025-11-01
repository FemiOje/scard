// Event parsing utilities

/**
 * Parsed events from transaction receipt
 */
export interface ParsedGameEvents {
  position: { x: number; y: number } | null;
  encounterType: number | null;
}

/**
 * Transaction receipt structure (minimal typing)
 */
interface TransactionReceipt {
  events?: Array<{
    from_address?: string;
    keys?: string[];
    data?: string[];
  }>;
  execution_status?: string;
}

/**
 * Parse position coordinates and encounter from transaction receipt events
 * In Dojo, events are emitted from the World contract, but encode the system in keys[2]
 * Event data structure:
 * - Moved: [version, game_id, ..., x, y]
 * - EncounterGenerated: [version, game_id, encounter_type]
 * 
 * @param receipt - Transaction receipt with events array
 * @param gameSystemsAddress - Address of game_systems contract (for filtering)
 * @param worldAddress - Address of World contract (for filtering)
 * @returns Parsed events with position and encounter type
 */
export function parseEventsFromReceipt(
  receipt: TransactionReceipt,
  gameSystemsAddress: string,
  worldAddress: string
): ParsedGameEvents {
  try {
    if (!receipt.events || !Array.isArray(receipt.events)) {
      console.warn("[Receipt] No events array in receipt");
      return { position: null, encounterType: null };
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

    let position: { x: number; y: number } | null = null;
    let encounterType: number | null = null;

    // Parse events - handle both position events and encounter events
    for (const evt of gameEvents) {
      // Debug: log event structure
      console.log(
        "[Receipt] Event keys:",
        evt.keys?.length,
        "data:",
        evt.data?.length
      );

      if (evt.data && evt.data.length >= 2) {
        // Try to parse position from Moved/GameCreated events
        // Moved: data structure is [version, ..., x, y]
        // Position is typically at data[4] (x) and data[5] (y) based on existing code
        if (evt.data.length >= 6) {
          const x = parseInt(evt.data[4], 16);
          const y = parseInt(evt.data[5], 16);
          if (!Number.isNaN(x) && !Number.isNaN(y)) {
            position = { x, y };
            console.log("[Receipt] ✅ Parsed position:", { x, y });
          }
        }

        // Try to parse EncounterGenerated event
        // EncounterGenerated: { #[key] game_id, encounter_type }
        // In Dojo, #[key] fields are in keys array, regular fields are in data
        // Dojo event serialization adds metadata fields at the start
        // For EncounterGenerated with 4 data fields: [version, game_id_low, game_id_high, encounter_type]
        // The actual encounter_type is at the LAST position (data[3])
        if (evt.data.length === 4) {
          // EncounterGenerated event has exactly 4 data fields
          // Read encounter_type from the last position
          const possibleType = parseInt(evt.data[3], 16);
          if (
            !Number.isNaN(possibleType) &&
            possibleType >= 1 &&
            possibleType <= 8
          ) {
            encounterType = possibleType;
            console.log(
              `[Receipt] ✅ Parsed encounter type from data[3]:`,
              possibleType
            );
          }
        }
      }
    }

    return { position, encounterType };
  } catch (error) {
    console.error("Error parsing events from receipt:", error);
    return { position: null, encounterType: null };
  }
}

