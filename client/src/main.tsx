import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import { init } from "@dojoengine/sdk";
import { DojoSdkProvider } from "@dojoengine/sdk/react";
import type { SchemaType } from "./generated/typescript/models.gen.ts";
import { setupWorld } from "./generated/typescript/contracts.gen.ts";

import "./styles/index.css";
import { dojoConfig } from "../dojoConfig.ts";
import StarknetProvider from "./contexts/starknet.tsx";

/**
 * Initializes and bootstraps the Dojo application.
 * Sets up the SDK, burner manager, and renders the root component.
 *
 * @throws {Error} If initialization fails
 */
async function main() {
    const sdk = await init<SchemaType>({
        client: {
            worldAddress: dojoConfig.manifest.world.address,
            toriiUrl: "https://api.cartridge.gg/x/scard/torii",
        },
        domain: {
            name: "SCARD",
            version: "1.0",
            chainId: "SEPOLIA",
            revision: "1",
        },
    });

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <DojoSdkProvider
                sdk={sdk}
                dojoConfig={dojoConfig}
                clientFn={setupWorld}
            >
                <StarknetProvider>
                    <App />
                </StarknetProvider>
            </DojoSdkProvider>
        </StrictMode>
    );
}

main().catch((error) => {
    console.error("Failed to initialize the application:", error);
});
