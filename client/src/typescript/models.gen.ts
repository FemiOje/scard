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

// Type definition for `scard::systems::game::contracts::game_systems::EncounterGenerated` struct
export interface EncounterGenerated {
	game_id: BigNumberish;
	encounter_type: BigNumberish;
}

// Type definition for `scard::systems::game::contracts::game_systems::GameCreated` struct
export interface GameCreated {
	game_id: BigNumberish;
	player_health: BigNumberish;
	start_x: BigNumberish;
	start_y: BigNumberish;
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
		Player: Player,
		Position: Position,
		EncounterGenerated: EncounterGenerated,
		GameCreated: GameCreated,
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
		EncounterGenerated: {
			game_id: 0,
			encounter_type: 0,
		},
		GameCreated: {
			game_id: 0,
			player_health: 0,
			start_x: 0,
			start_y: 0,
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
	Player = 'scard-Player',
	Position = 'scard-Position',
	Direction = 'scard-Direction',
	EncounterGenerated = 'scard-EncounterGenerated',
	GameCreated = 'scard-GameCreated',
	Moved = 'scard-Moved',
}