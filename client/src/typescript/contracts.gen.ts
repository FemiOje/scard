import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_game_systems_createGame_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "create_game",
			calldata: [gameId],
		};
	};

	const game_systems_createGame = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_systems_createGame_calldata(gameId),
				"scard",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_systems_fight_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "fight",
			calldata: [gameId],
		};
	};

	const game_systems_fight = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_systems_fight_calldata(gameId),
				"scard",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_systems_flee_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "flee",
			calldata: [gameId],
		};
	};

	const game_systems_flee = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_systems_flee_calldata(gameId),
				"scard",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_systems_move_calldata = (gameId: BigNumberish, direction: CairoCustomEnum): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "move",
			calldata: [gameId, direction],
		};
	};

	const game_systems_move = async (snAccount: Account | AccountInterface, gameId: BigNumberish, direction: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_systems_move_calldata(gameId, direction),
				"scard",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		game_systems: {
			createGame: game_systems_createGame,
			buildCreateGameCalldata: build_game_systems_createGame_calldata,
			fight: game_systems_fight,
			buildFightCalldata: build_game_systems_fight_calldata,
			flee: game_systems_flee,
			buildFleeCalldata: build_game_systems_flee_calldata,
			move: game_systems_move,
			buildMoveCalldata: build_game_systems_move_calldata,
		},
	};
}