import type { PropsWithChildren } from "react";
import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  cartridge,
  jsonRpcProvider,
} from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";

// ETH contract address on Starknet
export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// Scard actions contract address from manifest_sepolia.json
const SCARD_ACTIONS_CONTRACT =
  "0x404679ea759d1df51e978512971f4d5dc8df79dc6bc3b9906f43230195480ba";

// Define session policies for the scard game
const policies: SessionPolicies = {
  contracts: {
    // Allow ETH transfers for gas and transactions
    [ETH_CONTRACT_ADDRESS]: {
      methods: [
        { name: "approve", entrypoint: "approve" },
        { name: "transfer", entrypoint: "transfer" },
      ],
    },
    // Allow scard game actions
    [SCARD_ACTIONS_CONTRACT]: {
      methods: [
        { name: "spawn", entrypoint: "spawn" },
        { name: "move", entrypoint: "move" },
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