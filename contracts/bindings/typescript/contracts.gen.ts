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

	const build_game_systems_gameExists_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "game_exists",
			calldata: [gameId],
		};
	};

	const game_systems_gameExists = async (gameId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_systems_gameExists_calldata(gameId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_systems_getGameState_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "get_game_state",
			calldata: [gameId],
		};
	};

	const game_systems_getGameState = async (gameId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_systems_getGameState_calldata(gameId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_systems_getPosition_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "game_systems",
			entrypoint: "get_position",
			calldata: [gameId],
		};
	};

	const game_systems_getPosition = async (gameId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_systems_getPosition_calldata(gameId));
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

	const build_game_token_systems_gameOver_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "game_over",
			calldata: [tokenId],
		};
	};

	const game_token_systems_gameOver = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_token_systems_gameOver_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_mintGame_calldata = (playerName: CairoOption<BigNumberish>, settingsId: CairoOption<BigNumberish>, start: CairoOption<BigNumberish>, end: CairoOption<BigNumberish>, objectiveIds: CairoOption<Array<BigNumberish>>, context: CairoOption<GameContextDetails>, clientUrl: CairoOption<string>, rendererAddress: CairoOption<string>, to: string, soulbound: boolean): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "mint_game",
			calldata: [playerName, settingsId, start, end, objectiveIds, context, clientUrl, rendererAddress, to, soulbound],
		};
	};

	const game_token_systems_mintGame = async (playerName: CairoOption<BigNumberish>, settingsId: CairoOption<BigNumberish>, start: CairoOption<BigNumberish>, end: CairoOption<BigNumberish>, objectiveIds: CairoOption<Array<BigNumberish>>, context: CairoOption<GameContextDetails>, clientUrl: CairoOption<string>, rendererAddress: CairoOption<string>, to: string, soulbound: boolean) => {
		try {
			return await provider.call("scard", build_game_token_systems_mintGame_calldata(playerName, settingsId, start, end, objectiveIds, context, clientUrl, rendererAddress, to, soulbound));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_objectivesAddress_calldata = (): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "objectives_address",
			calldata: [],
		};
	};

	const game_token_systems_objectivesAddress = async () => {
		try {
			return await provider.call("scard", build_game_token_systems_objectivesAddress_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_score_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "score",
			calldata: [tokenId],
		};
	};

	const game_token_systems_score = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_token_systems_score_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_settingsAddress_calldata = (): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "settings_address",
			calldata: [],
		};
	};

	const game_token_systems_settingsAddress = async () => {
		try {
			return await provider.call("scard", build_game_token_systems_settingsAddress_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "supports_interface",
			calldata: [interfaceId],
		};
	};

	const game_token_systems_supportsInterface = async (interfaceId: BigNumberish) => {
		try {
			return await provider.call("scard", build_game_token_systems_supportsInterface_calldata(interfaceId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_token_systems_tokenAddress_calldata = (): DojoCall => {
		return {
			contractName: "game_token_systems",
			entrypoint: "token_address",
			calldata: [],
		};
	};

	const game_token_systems_tokenAddress = async () => {
		try {
			return await provider.call("scard", build_game_token_systems_tokenAddress_calldata());
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
			gameExists: game_systems_gameExists,
			buildGameExistsCalldata: build_game_systems_gameExists_calldata,
			getGameState: game_systems_getGameState,
			buildGetGameStateCalldata: build_game_systems_getGameState_calldata,
			getPosition: game_systems_getPosition,
			buildGetPositionCalldata: build_game_systems_getPosition_calldata,
			move: game_systems_move,
			buildMoveCalldata: build_game_systems_move_calldata,
		},
		game_token_systems: {
			gameOver: game_token_systems_gameOver,
			buildGameOverCalldata: build_game_token_systems_gameOver_calldata,
			mintGame: game_token_systems_mintGame,
			buildMintGameCalldata: build_game_token_systems_mintGame_calldata,
			objectivesAddress: game_token_systems_objectivesAddress,
			buildObjectivesAddressCalldata: build_game_token_systems_objectivesAddress_calldata,
			score: game_token_systems_score,
			buildScoreCalldata: build_game_token_systems_score_calldata,
			settingsAddress: game_token_systems_settingsAddress,
			buildSettingsAddressCalldata: build_game_token_systems_settingsAddress_calldata,
			supportsInterface: game_token_systems_supportsInterface,
			buildSupportsInterfaceCalldata: build_game_token_systems_supportsInterface_calldata,
			tokenAddress: game_token_systems_tokenAddress,
			buildTokenAddressCalldata: build_game_token_systems_tokenAddress_calldata,
		},
	};
}