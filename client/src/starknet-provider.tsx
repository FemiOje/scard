import type { PropsWithChildren } from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  cartridge,
  jsonRpcProvider,
} from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";
import manifest from "../../contracts/manifest_sepolia.json";

const scardGameContract = manifest.contracts.find(
  (contract) => contract.tag === "scard-game_systems"
);

if (!scardGameContract?.address) {
  throw new Error(
    "Scard game contract not found in manifest. Please ensure manifest_sepolia.json contains the scard-game_systems contract."
  );
}

const SCARD_GAME_CONTRACT = scardGameContract.address;

const policies: SessionPolicies = {
  contracts: {
    [SCARD_GAME_CONTRACT]: {
      methods: [
        { name: "create_game", entrypoint: "create_game" },
        { name: "move", entrypoint: "move" },
        { name: "fight", entrypoint: "fight" },
        { name: "flee", entrypoint: "flee" },
      ],
    },
  },
};

// Configure the JSON RPC provider
const provider = jsonRpcProvider({
  rpc: (chain) => {
    if (chain.id === sepolia.id) {
      return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
    }
    return null;
  },
});

// Create the controller connector with policies
const controller = new ControllerConnector({
  policies,
  namespace: "scard",
  chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" }],
  signupOptions: [
    "google",
    "webauthn",
    "discord",
    "walletconnect",
    "metamask",
    "password",
  ],
});

export default function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      defaultChainId={sepolia.id}
      chains={[sepolia]}
      connectors={[controller]}
      explorer={cartridge}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}
