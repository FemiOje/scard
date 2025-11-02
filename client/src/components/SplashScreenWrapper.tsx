import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { SplashScreen } from "./SplashScreen";
import { useGameState } from "../hooks/useGameState";
import { useGameStore } from "../stores/gameStore";

/**
 * SplashScreenWrapper - Wrapper component for routing
 * Handles navigation and game creation for the splash screen
 */
export const SplashScreenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { createGame } = useGameState();
  const { playerPosition, gameId } = useGameStore();
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleStartNewGame = async () => {
    if (!address) {
      // If not connected, navigation will be handled by wallet connection
      return;
    }
    
    // Navigate to /play, which will create the game
    navigate("/play");
  };

  const handleResumeGame = () => {
    // Game already restored by GameDirector, navigate with gameId
    if (gameId) {
      navigate(`/play?id=${gameId}`);
    } else {
      // Fallback: navigate without id, let GameScreen handle it
      navigate("/play");
    }
  };

  const handleCreateGame = async () => {
    if (!address) {
      return;
    }

    setIsCreatingGame(true);
    try {
      // createGame now returns game_id (matching death-mountain pattern)
      const newGameId = await createGame();
      // Navigate to /play?id={newGameId} matching death-mountain pattern
      navigate(`/play?id=${newGameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsCreatingGame(false);
    }
  };

  // Check if game was restored (has existing position)
  const hasExistingGame = !!(address && playerPosition);

  return (
    <SplashScreen
      onStartNewGame={handleStartNewGame}
      onResumeGame={handleResumeGame}
      onCreateGame={handleCreateGame}
      isCreatingGame={isCreatingGame}
      hasExistingGame={hasExistingGame}
    />
  );
};

export default SplashScreenWrapper;

