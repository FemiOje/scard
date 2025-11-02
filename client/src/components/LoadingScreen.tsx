/**
 * Loading Screen Component
 * Displays a loading state during game initialization or restoration
 * 
 * Following death-mountain pattern for consistency
 */

import React from "react";
import "../styles/components/LoadingScreen.css";

interface LoadingScreenProps {
  message?: string;
}

/**
 * Loading screen component for game initialization
 * Shows a spinner and loading message
 * 
 * @param message - Optional custom loading message
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

