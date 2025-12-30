import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { SplashScreen } from "./SplashScreen";
import { useSystemCalls } from "../dojo/useSystemCalls";

/**
 * SplashScreenWrapper - Wrapper component for routing
 * Handles navigation and game creation for the splash screen
 */
export const SplashScreenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { mintGame } = useSystemCalls();
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleStartNewGame = async () => {
    if (!address) {
      return;
    }

    navigate("/play");
  };

  const handleCreateGame = async () => {
    if (!address) {
      return;
    }

    setIsCreatingGame(true);

    try {
      // Mint new game token and navigate immediately
      const tokenId = await mintGame("", 0);
      navigate(`/play?id=${tokenId}`, { replace: true });
    } catch (error) {
      console.error("Failed to mint game:", error);
    } finally {
      setIsCreatingGame(false);
    }
  };

  // Check if game was restored (has existing position)
  // const hasExistingGame = !!(address && playerPosition);

  return (
    <SplashScreen
      onStartNewGame={handleStartNewGame}
      onCreateGame={handleCreateGame}
      isCreatingGame={isCreatingGame}
    />
  );
};

export default SplashScreenWrapper;

