import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { HalloweenGrid } from "./HalloweenGrid";
import { WinScreen } from "./WinScreen";
import { LoadingScreen } from "./LoadingScreen";
import { useGameState } from "../hooks/useGameState";
import { useGameDirector } from "../contexts/GameDirector";
import { useGameStore } from "../stores/gameStore";
import { useSystemCalls } from "../dojo/useSystemCalls";

/**
 * GameScreen - Main game page component
 * Handles routing via /play?id={game_id}
 * Loads or creates games based on URL parameters
 */
export const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [searchParams] = useSearchParams();
  const game_id = searchParams.get("id");
  
  const { isInitializing, initializationError } = useGameDirector();
  const { gameId: currentGameId, setGameId } = useGameStore();
  const [isMinting, setIsMinting] = useState(false);
  const addressRef = useRef(address);
  
  const {
    playerPosition,
    gameStatus,
    encounter,
    isLoading: isGameLoading,
    error: gameError,
    movePlayer,
    fight,
    flee,
    clearEncounter,
  } = useGameState();
  
  const { mintGame, gameTokenAddress } = useSystemCalls();

  // Keep address ref in sync
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // Mint game token and navigate immediately (matching death-mountain's mint function)
  const mint = useCallback(async () => {
    if (isMinting) {
      console.log("[GameScreen] Already minting, skipping duplicate call");
      return;
    }

    if (!address || !gameTokenAddress) {
      console.log("[GameScreen] Account or gameTokenAddress not ready, skipping mint");
      return;
    }

    if (game_id || currentGameId) {
      return;
    }

    setIsMinting(true);
    try {
      const tokenId = await mintGame("", 0);
      console.log("[GameScreen] ✅ Minted token, navigating to /play?id=" + tokenId);
      navigate(`/play?id=${tokenId}`, { replace: true });
    } catch (error) {
      console.error("Failed to mint game:", error);
      setIsMinting(false);
    }
  }, [isMinting, address, gameTokenAddress, game_id, currentGameId, mintGame, navigate]);

  // Redirect to home if not connected (with 10s timeout)
  // Only redirect if there's no gameId to restore
  useEffect(() => {
    // If we have a gameId, don't redirect - wait for address to restore game
    if (game_id || currentGameId) {
      return;
    }

    // No gameId - redirect if address not available after 10 seconds
    if (!address) {
      const timeoutId = setTimeout(() => {
        // Use ref to get current address value (avoid closure issue)
        if (!addressRef.current) {
          console.log("[GameScreen] No address after 10s timeout, redirecting to home");
          navigate("/");
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [address, game_id, currentGameId, navigate]);

  // Handle game ID from URL and minting - matching death-mountain pattern
  // Sets gameId from URL immediately (even if address not ready), or mints if no gameId
  useEffect(() => {
    // If we have a gameId from URL, set it immediately (matches death-mountain line 114)
    if (game_id) {
      if (game_id !== currentGameId) {
        console.log("[GameScreen] Setting gameId from URL:", game_id);
        setGameId(game_id);
      }
      setIsMinting(false);
      // GameDirector will initialize once address is available
      return;
    }

    // No gameId - need to mint, but wait for address to be ready
    if (!address || isInitializing || isMinting) {
      // Wait for address to be available (matches death-mountain line 109: `if (!account) return;`)
      return;
    }

    // Address is ready but no gameId - mint new game (matches death-mountain line 116)
    mint();
  }, [address, isInitializing, game_id, currentGameId, isMinting, setGameId, mint]);

  // Handle exit to home
  const handleExitGame = () => {
    navigate("/");
  };

  // Loading state while creating or loading game
  if (isInitializing) {
    return <LoadingScreen message="Initializing game..." />;
  }

  // Error state during initialization
  if (initializationError) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(220, 53, 69, 0.95)",
          color: "white",
          padding: "2rem 3rem",
          borderRadius: "12px",
          zIndex: 10000,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>⚠️ Initialization Error</h2>
        <p style={{ marginBottom: "2rem" }}>{initializationError}</p>
        <button
          onClick={handleExitGame}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Loading state while creating or loading game
  if ((isGameLoading && !game_id) || (!address)) {
    return <LoadingScreen message="Loading game..." />;
  }

  // Error state
  if (gameError) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(220, 53, 69, 0.95)",
          color: "white",
          padding: "2rem 3rem",
          borderRadius: "12px",
          zIndex: 10000,
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>⚠️ Error</h2>
        <p style={{ marginBottom: "2rem" }}>{gameError}</p>
        <button
          onClick={handleExitGame}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Win/Lose screen
  if (gameStatus === "Won" || gameStatus === "Lost") {
    return (
      <WinScreen
        onGoHome={() => navigate("/")}
      />
    );
  }

  // Active gameplay
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Game header with exit button */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 107, 53, 0.3)",
        }}
      >
        <button
          onClick={handleExitGame}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(255, 107, 53, 0.9)",
            color: "white",
            border: "2px solid #FF6B35",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          ← Exit to Home
        </button>
        {game_id && (
          <span style={{ color: "#FF6B35", fontSize: "0.9rem" }}>
            Game #{game_id}
          </span>
        )}
      </header>

      {/* Main game grid */}
      <HalloweenGrid
        playerPosition={playerPosition}
        gameStatus={gameStatus}
        encounter={encounter}
        onMove={movePlayer}
        onFight={fight}
        onFlee={flee}
        onClearEncounter={clearEncounter}
        isLoading={isGameLoading}
      />
    </div>
  );
};

export default GameScreen;

