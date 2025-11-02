import React, { useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { HalloweenGrid } from "./HalloweenGrid";
import { WinScreen } from "./WinScreen";
import { LoadingScreen } from "./LoadingScreen";
import { useGameState } from "../hooks/useGameState";
import { useGameDirector } from "../contexts/GameDirector";
import { useGameStore } from "../stores/gameStore";

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
  const hasSetGameIdRef = useRef(false);
  const lastGameIdRef = useRef<string | null>(null);
  const lastUrlGameIdRef = useRef<string | null>(null);
  
  const {
    playerPosition,
    gameStatus,
    encounter,
    isLoading: isGameLoading,
    error: gameError,
    createGame,
    movePlayer,
    fight,
    flee,
    clearEncounter,
  } = useGameState();

  // Redirect to home if not connected
  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address, navigate]);

  // Create game and navigate (matching death-mountain's mint function)
  const mint = useCallback(async () => {
    try {
      const newGameId = await createGame();
      // Navigate to /play?id={newGameId} matching death-mountain pattern
      navigate(`/play?id=${newGameId}`, { replace: true });
    } catch (error) {
      console.error("Failed to create game:", error);
      // Stay on /play, show error
    }
  }, [createGame, navigate]);

  // Handle game ID from URL - matching death-mountain pattern
  // Only set gameId if it's different from current value to prevent infinite loops
  useEffect(() => {
    if (!address || isInitializing) return;
    
    const parsedGameId = game_id ? Number(game_id) : 0;
    const gameIdString = parsedGameId && !isNaN(parsedGameId) && parsedGameId > 0 
      ? String(parsedGameId) 
      : null;
    
    // Reset refs when URL param changes
    if (game_id !== lastUrlGameIdRef.current) {
      lastUrlGameIdRef.current = game_id;
      hasSetGameIdRef.current = false;
    }
    
    // Prevent infinite loops: only set if gameId is different from current
    if (gameIdString) {
      // Only update if it's actually different from current store value
      if (gameIdString !== currentGameId && !hasSetGameIdRef.current) {
        lastGameIdRef.current = gameIdString;
        setGameId(gameIdString);
        hasSetGameIdRef.current = true;
      } else {
        // Already set correctly, do nothing
        if (gameIdString === currentGameId) {
          hasSetGameIdRef.current = true;
        }
      }
    } else if (!gameIdString && (parsedGameId === 0 || !game_id)) {
      // No ID provided, create new game (matching death-mountain's mint flow)
      // Only call mint once per URL change
      if (!hasSetGameIdRef.current) {
        hasSetGameIdRef.current = true;
        mint();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Note: currentGameId is intentionally NOT in deps - we only want to respond to URL changes
  }, [address, game_id, isInitializing]);

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
        onPlayAgain={() => navigate("/play")}
        onCreateGame={async () => {
          // Wrap createGame to match WinScreen's expected signature
          const newGameId = await createGame();
          navigate(`/play?id=${newGameId}`);
        }}
        isCreatingGame={isGameLoading}
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

