import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, BigNumberish } from 'starknet';

// Type definition for `scard::models::DirectionsAvailable` struct
export interface DirectionsAvailable {
	player: string;
	directions: Array<DirectionEnum>;
}

// Type definition for `scard::models::Moves` struct
export interface Moves {
	player: string;
	remaining: BigNumberish;
	last_direction: CairoOption<DirectionEnum>;
	can_move: boolean;
}

// Type definition for `scard::models::Position` struct
export interface Position {
	player: string;
	vec: Vec2;
}

// Type definition for `scard::models::PositionCount` struct
export interface PositionCount {
	identity: string;
	position: Array<[BigNumberish, BigNumberish]>;
}

// Type definition for `scard::models::Vec2` struct
export interface Vec2 {
	x: BigNumberish;
	y: BigNumberish;
}

// Type definition for `scard::systems::actions::actions::Moved` struct
export interface Moved {
	player: string;
	direction: DirectionEnum;
}

// Type definition for `scard::models::Direction` enum
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
		DirectionsAvailable: DirectionsAvailable,
		Moves: Moves,
		Position: Position,
		PositionCount: PositionCount,
		Vec2: Vec2,
		Moved: Moved,
	},
}
export const schema: SchemaType = {
	scard: {
		DirectionsAvailable: {
			player: "",
			directions: [new CairoCustomEnum({ 
					Left: "",
				Right: undefined,
				Up: undefined,
				Down: undefined, })],
		},
		Moves: {
			player: "",
			remaining: 0,
			last_direction: new CairoOption(CairoOptionVariant.None),
			can_move: false,
		},
		Position: {
			player: "",
		vec: { x: 0, y: 0, },
		},
		PositionCount: {
			identity: "",
			position: [[0, 0]],
		},
		Vec2: {
			x: 0,
			y: 0,
		},
		Moved: {
			player: "",
		direction: new CairoCustomEnum({ 
					Left: "",
				Right: undefined,
				Up: undefined,
				Down: undefined, }),
		},
	},
};
export enum ModelsMapping {
	Direction = 'scard-Direction',
	DirectionsAvailable = 'scard-DirectionsAvailable',
	Moves = 'scard-Moves',
	Position = 'scard-Position',
	PositionCount = 'scard-PositionCount',
	Vec2 = 'scard-Vec2',
	Moved = 'scard-Moved',
}