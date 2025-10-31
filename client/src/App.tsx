import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useEffect, useState, useMemo } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { GameActions } from "./components/GameActions";
import "./App.css";

function App() {
    const { account, address, status, connector } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { client } = useDojoSDK();
    const [username, setUsername] = useState<string | null>(null);
    const [isControllerReady, setIsControllerReady] = useState(false);

    const controllerConnector = useMemo(
        () => ControllerConnector.fromConnectors(connectors),
        [connectors]
    );

    // Check if controller is ready
    useEffect(() => {
        const checkReady = () => {
            try {
                if (controllerConnector) {
                    setIsControllerReady(controllerConnector.isReady());
                }
            } catch (e) {
                console.error("Error checking controller readiness:", e);
            }
        };

        checkReady();
        const interval = setInterval(checkReady, 1000);
        return () => clearInterval(interval);
    }, [controllerConnector]);

    // Fetch username when connected
    useEffect(() => {
        async function fetchUsername() {
            try {
                const name = await (connector as ControllerConnector)?.username();
                if (name) setUsername(name);
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }
        if (connector && status === "connected") {
            fetchUsername();
        }
    }, [connector, status]);

    return (
        <div className="app">
            <h1>SCARD - Starknet Card Game</h1>

            {/* Dojo SDK Status */}
            <div style={{ marginBottom: "2rem" }}>
                {client ? (
                    <p style={{ color: "green" }}>✅ Dojo SDK initialized successfully!</p>
                ) : (
                    <p style={{ color: "red" }}>❌ Failed to initialize Dojo SDK</p>
                )}
            </div>

            {/* Wallet Connection Section */}
            <div style={{
                border: "2px solid #333",
                borderRadius: "8px",
                padding: "2rem",
                marginBottom: "2rem",
                maxWidth: "600px",
                margin: "0 auto 2rem"
            }}>
                <h2>Cartridge Wallet</h2>
                
                {status === "connected" && address ? (
                    <div>
                        <p><strong>Status:</strong> <span style={{ color: "green" }}>Connected</span></p>
                        {username && <p><strong>Username:</strong> {username}</p>}
                        <p><strong>Address:</strong></p>
                        <code style={{ 
                            display: "block", 
                            padding: "0.5rem", 
                            background: "#f5f5f5", 
                            borderRadius: "4px",
                            wordBreak: "break-all",
                            fontSize: "0.9rem"
                        }}>
                            {address}
                        </code>
                        
                        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                                onClick={() => disconnect()}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                Disconnect
                            </button>
                            <button
                                onClick={() => (connector as ControllerConnector).controller.openProfile()}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                Open Profile
                            </button>
                            <button
                                onClick={() => (connector as ControllerConnector).controller.openSettings()}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                Settings
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p><strong>Status:</strong> <span style={{ color: "orange" }}>Not Connected</span></p>
                        <p style={{ marginBottom: "1rem", color: "#666" }}>
                            Connect your Cartridge wallet to interact with the game on Sepolia testnet.
                        </p>
                        <button
                            onClick={() => connect({ connector: controllerConnector })}
                            disabled={!isControllerReady}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: isControllerReady ? "#28a745" : "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isControllerReady ? "pointer" : "not-allowed",
                                fontSize: "1rem",
                                fontWeight: "bold"
                            }}
                        >
                            {isControllerReady ? "Connect Cartridge Wallet" : "Loading..."}
                        </button>
                    </div>
                )}
            </div>

            {/* Game Actions Component */}
            <GameActions />

            {/* Game Info */}
            <div style={{ marginTop: "2rem", color: "#666" }}>
                <p>
                    <strong>Network:</strong> Sepolia Testnet
                </p>
                <p>
                    <strong>Game:</strong> SCARD on Dojo
                </p>
            </div>

            <div style={{ marginTop: "2rem" }}>
                <a
                    href="https://book.dojoengine.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                >
                    📖 Learn Dojo
                </a>
            </div>
        </div>
    );
}

export default App;
