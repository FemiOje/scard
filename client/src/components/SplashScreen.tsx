import React from "react";
import "../styles/components/SplashScreen.css";

interface SplashScreenProps {
  onStartNewGame: () => void;
  onCreateGame: () => Promise<void>;
  isCreatingGame?: boolean;
  hasExistingGame?: boolean; // Indicates if game was restored from blockchain
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartNewGame,
  onCreateGame,
  isCreatingGame = false,
  hasExistingGame = false,
}) => {
  const handleStartNewGame = async () => {
    await onCreateGame();
    onStartNewGame();
  };

  const handleResumeGame = () => {
    // Game already restored by GameDirector, just show it
    onStartNewGame();
  };

  return (
    <div className="splash-screen">
      {/* Background decorations */}
      <div className="splash-pumpkins">
        <PumpkinSVG className="pumpkin splash-pumpkin-1" />
        <PumpkinSVG className="pumpkin splash-pumpkin-2" />
        <PumpkinSVG className="pumpkin splash-pumpkin-3" />
        <PumpkinSVG className="pumpkin splash-pumpkin-4" />
      </div>

      {/* Game Title */}
      <div className="game-title-container">
        <h1 className="game-title">SCARD</h1>
        <p className="game-subtitle">Spooky Season Game Jam</p>
      </div>

      {/* Buttons */}
      <div className="splash-buttons">
        {hasExistingGame ? (
          // Game restored - show Resume button as primary
          <>
            <button
              onClick={handleResumeGame}
              className="splash-button splash-button-primary"
            >
              <span className="button-icon">📜</span>
              <span>Resume Game</span>
            </button>
            <button
              onClick={handleStartNewGame}
              disabled={isCreatingGame}
              className="splash-button splash-button-secondary"
            >
              <span className="button-icon">🎮</span>
              <span>
                {isCreatingGame ? "Creating Game..." : "Start New Game"}
              </span>
            </button>
          </>
        ) : (
          // No existing game - show Start New Game button
          <>
            <button
              onClick={handleStartNewGame}
              disabled={isCreatingGame}
              className="splash-button splash-button-primary"
            >
              <span className="button-icon">🎮</span>
              <span>{isCreatingGame ? "Creating Game..." : "Start New Game"}</span>
            </button>
            <button
              disabled
              className="splash-button splash-button-secondary"
              title="No saved game found"
            >
              <span className="button-icon">📜</span>
              <span>Resume Game</span>
            </button>
          </>
        )}
      </div>

      {/* Decorative elements */}
      <div className="splash-ghosts">
        <GhostSVG className="ghost splash-ghost-1" />
        <GhostSVG className="ghost splash-ghost-2" />
      </div>
    </div>
  );
};

const PumpkinSVG: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Pumpkin stem */}
    <path
      d="M 48 15 Q 48 10 50 10 Q 52 10 52 15 L 52 20"
      fill="#2D5016"
      stroke="#1A3010"
      strokeWidth="1"
    />

    {/* Pumpkin body */}
    <ellipse cx="50" cy="55" rx="30" ry="28" fill="#FF6B35" />
    <ellipse cx="50" cy="55" rx="22" ry="28" fill="#FF8C00" opacity="0.8" />
    <ellipse cx="50" cy="55" rx="14" ry="28" fill="#FFA500" opacity="0.6" />

    {/* Pumpkin lines */}
    <path
      d="M 35 30 Q 35 55 35 78"
      stroke="#D55000"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M 42 28 Q 42 55 42 80"
      stroke="#D55000"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M 58 28 Q 58 55 58 80"
      stroke="#D55000"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M 65 30 Q 65 55 65 78"
      stroke="#D55000"
      strokeWidth="1.5"
      fill="none"
    />

    {/* Eyes */}
    <polygon points="35,45 40,45 38,50" fill="#000" />
    <polygon points="60,45 65,45 63,50" fill="#000" />

    {/* Nose */}
    <polygon points="48,55 52,55 50,60" fill="#000" />

    {/* Mouth */}
    <path
      d="M 35 65 Q 40 70 45 65 Q 50 70 55 65 Q 60 70 65 65"
      stroke="#000"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const GhostSVG: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ghost body */}
    <path
      d="M 30 40 Q 30 20 50 20 Q 70 20 70 40 L 70 80 Q 65 75 60 80 Q 55 75 50 80 Q 45 75 40 80 Q 35 75 30 80 Z"
      fill="#F0F0F0"
      opacity="0.9"
    />

    {/* Eyes */}
    <circle cx="42" cy="42" r="4" fill="#000" />
    <circle cx="58" cy="42" r="4" fill="#000" />

    {/* Mouth */}
    <circle cx="50" cy="55" r="3" fill="#000" />
  </svg>
);

export default SplashScreen;
