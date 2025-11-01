import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

// Type definition for `scard::models::beast::BeastEncounter` struct
export interface BeastEncounter {
	game_id: BigNumberish;
	beast_type: BigNumberish;
	attack_points: BigNumberish;
	damage_points: BigNumberish;
}

// Type definition for `scard::models::encounter::CurrentEncounter` struct
export interface CurrentEncounter {
	game_id: BigNumberish;
	encounter_type: BigNumberish;
}

// Type definition for `scard::models::game_state::GameState` struct
export interface GameState {
	game_id: BigNumberish;
	status: BigNumberish;
}

// Type definition for `scard::models::player::Player` struct
export interface Player {
	game_id: BigNumberish;
	health: BigNumberish;
	damage_points: BigNumberish;
	attack_points: BigNumberish;
	has_free_flee: boolean;
	has_free_attack: boolean;
}

// Type definition for `scard::models::position::Position` struct
export interface Position {
	game_id: BigNumberish;
	x: BigNumberish;
	y: BigNumberish;
}

// Type definition for `scard::systems::game::contracts::game_systems::CombatEvent` struct
export interface CombatEvent {
	game_id: BigNumberish;
	beast_type: BigNumberish;
	player_damage_dealt: BigNumberish;
	beast_damage_dealt: BigNumberish;
	player_health_after: BigNumberish;
	beast_defeated: boolean;
	player_died: boolean;
}

// Type definition for `scard::systems::game::contracts::game_systems::EncounterGenerated` struct
export interface EncounterGenerated {
	game_id: BigNumberish;
	encounter_type: BigNumberish;
}

// Type definition for `scard::systems::game::contracts::game_systems::FledEvent` struct
export interface FledEvent {
	game_id: BigNumberish;
	beast_type: BigNumberish;
	flee_successful: boolean;
	player_damage_taken: BigNumberish;
	player_health_after: BigNumberish;
	player_died: boolean;
}

// Type definition for `scard::systems::game::contracts::game_systems::GameCreated` struct
export interface GameCreated {
	game_id: BigNumberish;
	player_health: BigNumberish;
	start_x: BigNumberish;
	start_y: BigNumberish;
}

// Type definition for `scard::systems::game::contracts::game_systems::GameWon` struct
export interface GameWon {
	game_id: BigNumberish;
	final_x: BigNumberish;
	final_y: BigNumberish;
}

// Type definition for `scard::systems::game::contracts::game_systems::Moved` struct
export interface Moved {
	game_id: BigNumberish;
	direction: DirectionEnum;
	new_x: BigNumberish;
	new_y: BigNumberish;
}

// Type definition for `scard::models::position::Direction` enum
export const direction = [
	'Left',
	'Right',
	'Up',
	'Down',
] as const;
export type Direction = { [key in typeof direction[number]]: string };
export type DirectionEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	scard: {
		BeastEncounter: BeastEncounter,
		CurrentEncounter: CurrentEncounter,
		GameState: GameState,
		Player: Player,
		Position: Position,
		CombatEvent: CombatEvent,
		EncounterGenerated: EncounterGenerated,
		FledEvent: FledEvent,
		GameCreated: GameCreated,
		GameWon: GameWon,
		Moved: Moved,
	},
}
export const schema: SchemaType = {
	scard: {
		BeastEncounter: {
			game_id: 0,
			beast_type: 0,
			attack_points: 0,
			damage_points: 0,
		},
		CurrentEncounter: {
			game_id: 0,
			encounter_type: 0,
		},
		GameState: {
			game_id: 0,
			status: 0,
		},
		Player: {
			game_id: 0,
			health: 0,
			damage_points: 0,
			attack_points: 0,
			has_free_flee: false,
			has_free_attack: false,
		},
		Position: {
			game_id: 0,
			x: 0,
			y: 0,
		},
		CombatEvent: {
			game_id: 0,
			beast_type: 0,
			player_damage_dealt: 0,
			beast_damage_dealt: 0,
			player_health_after: 0,
			beast_defeated: false,
			player_died: false,
		},
		EncounterGenerated: {
			game_id: 0,
			encounter_type: 0,
		},
		FledEvent: {
			game_id: 0,
			beast_type: 0,
			flee_successful: false,
			player_damage_taken: 0,
			player_health_after: 0,
			player_died: false,
		},
		GameCreated: {
			game_id: 0,
			player_health: 0,
			start_x: 0,
			start_y: 0,
		},
		GameWon: {
			game_id: 0,
			final_x: 0,
			final_y: 0,
		},
		Moved: {
			game_id: 0,
		direction: new CairoCustomEnum({ 
					Left: "",
				Right: undefined,
				Up: undefined,
				Down: undefined, }),
			new_x: 0,
			new_y: 0,
		},
	},
};
export enum ModelsMapping {
	BeastEncounter = 'scard-BeastEncounter',
	CurrentEncounter = 'scard-CurrentEncounter',
	GameState = 'scard-GameState',
	Player = 'scard-Player',
	Position = 'scard-Position',
	Direction = 'scard-Direction',
	CombatEvent = 'scard-CombatEvent',
	EncounterGenerated = 'scard-EncounterGenerated',
	FledEvent = 'scard-FledEvent',
	GameCreated = 'scard-GameCreated',
	GameWon = 'scard-GameWon',
	Moved = 'scard-Moved',
}