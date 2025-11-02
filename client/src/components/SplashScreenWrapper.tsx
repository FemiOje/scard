import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { SplashScreen } from "./SplashScreen";
import { useGameStore } from "../stores/gameStore";
import { useSystemCalls } from "../dojo/useSystemCalls";

/**
 * SplashScreenWrapper - Wrapper component for routing
 * Handles navigation and game creation for the splash screen
 */
export const SplashScreenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { mintGame } = useSystemCalls();
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
      // Mint new game token and navigate immediately (matching death-mountain pattern)
      const tokenId = await mintGame("", 0);
      navigate(`/play?id=${tokenId}`, { replace: true });
    } catch (error) {
      console.error("Failed to mint game:", error);
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

