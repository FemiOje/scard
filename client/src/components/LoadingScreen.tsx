/**
 * Loading Screen Component
 * Displays a loading state during game initialization or restoration
 * 
 * Following death-mountain pattern for consistency
 */

import React from "react";

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
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gradient-to-br from-black/95 via-[rgba(20,10,0,0.95)] to-black/95 backdrop-blur-[10px] z-[9999]">
      <div className="flex flex-col items-center gap-8 p-12 bg-black/70 rounded-2xl border-2 border-[rgba(255,107,53,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="relative w-20 h-20">
          <div className="absolute w-full h-full border-4 border-[rgba(255,107,53,0.2)] border-t-[#ff6b35] rounded-full animate-spin"></div>
        </div>
        <p className="text-xl font-medium text-white text-center m-0 text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

