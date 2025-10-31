import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useState, useEffect } from "react";
import { CairoCustomEnum } from "starknet";
import type { Position, Moves } from "../typescript/models.gen";

// Component for calling game actions and displaying player state
export function GameActions() {
    const { account, address, status } = useAccount();
    const { client } = useDojoSDK();
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [moves, setMoves] = useState<Moves | null>(null);

    // Fetch player state when account changes
    useEffect(() => {
        if (!account || !client || !address) {
            setPosition(null);
            setMoves(null);
            return;
        }

        fetchPlayerState();
    }, [account, client, address]);

    const fetchPlayerState = async () => {
        if (!client || !address) return;

        try {
            // Query the Position model for the player
            const positionData = await client.getEntity("scard", "Position", [address]);
            if (positionData) {
                setPosition(positionData as Position);
            }

            // Query the Moves model for the player
            const movesData = await client.getEntity("scard", "Moves", [address]);
            if (movesData) {
                setMoves(movesData as Moves);
            }
        } catch (error) {
            console.error("Error fetching player state:", error);
        }
    };

    const handleSpawn = async () => {
        if (!account || !client) return;
        
        setLoading(true);
        setLastAction(null);
        
        try {
            console.log("Calling spawn action for address:", address);
            
            // Call the spawn action using generated client
            const tx = await client.actions.spawn(account);
            console.log("Spawn transaction:", tx);
            
            // Wait a bit for transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Refresh player state
            await fetchPlayerState();
            
            setLastAction("✅ Spawn successful! Your player is initialized.");
        } catch (error) {
            console.error("Error calling spawn:", error);
            setLastAction(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMove = async (direction: "Left" | "Right" | "Up" | "Down") => {
        if (!account || !client) return;
        
        setLoading(true);
        setLastAction(null);
        
        try {
            console.log(`Calling move action with direction: ${direction}`);
            
            // Create the CairoCustomEnum for the direction
            const directionEnum = new CairoCustomEnum({ [direction]: {} });
            
            // Call the move action using generated client
            const tx = await client.actions.move(account, directionEnum);
            console.log("Move transaction:", tx);
            
            // Wait a bit for transaction to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Refresh player state
            await fetchPlayerState();
            
            setLastAction(`✅ Moved ${direction} successfully!`);
        } catch (error) {
            console.error("Error calling move:", error);
            setLastAction(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    if (status !== "connected" || !address) {
        return (
            <div style={{
                border: "2px solid #333",
                borderRadius: "8px",
                padding: "2rem",
                marginTop: "2rem",
                maxWidth: "600px",
                margin: "2rem auto",
                textAlign: "center",
                backgroundColor: "#f9f9f9"
            }}>
                <h2>Game Actions</h2>
                <p style={{ color: "#666" }}>Please connect your wallet to interact with the game.</p>
            </div>
        );
    }

    return (
        <div style={{
            border: "2px solid #333",
            borderRadius: "8px",
            padding: "2rem",
            marginTop: "2rem",
            maxWidth: "600px",
            margin: "2rem auto"
        }}>
            <h2>Game Actions</h2>

            {/* Player State Display */}
            {position || moves ? (
                <div style={{
                    backgroundColor: "#f0f8ff",
                    border: "1px solid #007bff",
                    borderRadius: "4px",
                    padding: "1rem",
                    marginBottom: "1.5rem"
                }}>
                    <h3 style={{ marginTop: 0, color: "#007bff" }}>Player State</h3>
                    {position && (
                        <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Position:</strong> ({position.vec.x.toString()}, {position.vec.y.toString()})
                        </div>
                    )}
                    {moves && (
                        <>
                            <div style={{ marginBottom: "0.5rem" }}>
                                <strong>Remaining Moves:</strong> {moves.remaining.toString()}
                            </div>
                            <div>
                                <strong>Can Move:</strong> {moves.can_move ? "✅ Yes" : "❌ No"}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "4px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    color: "#856404"
                }}>
                    ⚠️ No player data found. Click "Spawn Player" to initialize.
                </div>
            )}
            
            <div style={{ marginBottom: "1.5rem" }}>
                <h3>Spawn</h3>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    Initialize your player position and moves.
                </p>
                <button
                    onClick={handleSpawn}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: loading ? "#6c757d" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        fontWeight: "bold"
                    }}
                >
                    {loading ? "Processing..." : "Spawn Player"}
                </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <h3>Move</h3>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    Move your player in a direction.
                </p>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)", 
                    gap: "0.5rem",
                    maxWidth: "250px"
                }}>
                    <div></div>
                    <button
                        onClick={() => handleMove("Up")}
                        disabled={loading}
                        style={{
                            padding: "0.75rem",
                            backgroundColor: loading ? "#6c757d" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        ↑
                    </button>
                    <div></div>
                    <button
                        onClick={() => handleMove("Left")}
                        disabled={loading}
                        style={{
                            padding: "0.75rem",
                            backgroundColor: loading ? "#6c757d" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        ←
                    </button>
                    <button
                        onClick={() => handleMove("Down")}
                        disabled={loading}
                        style={{
                            padding: "0.75rem",
                            backgroundColor: loading ? "#6c757d" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        ↓
                    </button>
                    <button
                        onClick={() => handleMove("Right")}
                        disabled={loading}
                        style={{
                            padding: "0.75rem",
                            backgroundColor: loading ? "#6c757d" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "1rem"
                        }}
                    >
                        →
                    </button>
                </div>
            </div>

            {lastAction && (
                <div style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: lastAction.startsWith("Error") ? "#f8d7da" : "#d4edda",
                    border: `1px solid ${lastAction.startsWith("Error") ? "#f5c6cb" : "#c3e6cb"}`,
                    borderRadius: "4px",
                    color: lastAction.startsWith("Error") ? "#721c24" : "#155724"
                }}>
                    {lastAction}
                </div>
            )}
        </div>
    );
}

