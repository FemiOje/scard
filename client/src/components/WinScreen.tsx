import React from "react";

interface WinScreenProps {
  onGoHome: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({
  onGoHome,
}) => {

  return (
    <div className="win-screen">
      {/* Background decorations */}
      <div className="win-pumpkins">
        <PumpkinSVG className="pumpkin win-pumpkin-1" />
        <PumpkinSVG className="pumpkin win-pumpkin-2" />
        <PumpkinSVG className="pumpkin win-pumpkin-3" />
        <PumpkinSVG className="pumpkin win-pumpkin-4" />
      </div>

      {/* Win Message */}
      <div className="win-message-container">
        <h1 className="win-title">🎉 YOU WON! 🎉</h1>
        <p className="win-subtitle">You've conquered the spooky grid!</p>
        <p className="win-description">
          You successfully navigated to the bottom-right corner (4, 4)
        </p>
      </div>

      {/* Button */}
      <div className="win-buttons">
        <button
          onClick={onGoHome}
          className="win-button win-button-primary"
        >
          <span className="button-icon">🏠</span>
          <span>Play Again</span>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="win-ghosts">
        <GhostSVG className="ghost win-ghost-1" />
        <GhostSVG className="ghost win-ghost-2" />
      </div>

      {/* Confetti/celebration effects */}
      <div className="celebration-effects">
        <span className="celebration-star">⭐</span>
        <span className="celebration-star">✨</span>
        <span className="celebration-star">🎃</span>
        <span className="celebration-star">👻</span>
        <span className="celebration-star">⭐</span>
        <span className="celebration-star">✨</span>
      </div>
    </div>
  );
};

// Reuse SVG components from SplashScreen
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

    {/* Pumpkin segments */}
    <path
      d="M 38 30 L 38 80 M 45 28 L 45 82 M 50 27 L 50 83 M 55 28 L 55 82 M 62 30 L 62 80"
      stroke="#FF4500"
      strokeWidth="1.5"
      opacity="0.6"
    />

    {/* Eyes */}
    <ellipse cx="42" cy="48" rx="6" ry="8" fill="#1A1A1A" />
    <ellipse cx="58" cy="48" rx="6" ry="8" fill="#1A1A1A" />

    {/* Mouth */}
    <path
      d="M 42 62 Q 45 68 50 68 Q 55 68 58 62"
      fill="#1A1A1A"
      stroke="#1A1A1A"
      strokeWidth="2"
    />
    <rect x="48" y="62" width="4" height="3" fill="#FF8C00" />
  </svg>
);

const GhostSVG: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ghost body */}
    <ellipse cx="50" cy="45" rx="22" ry="25" fill="#E8E8E8" />
    <path
      d="M 28 45 Q 28 70 35 70 Q 40 70 40 65 Q 42 70 48 70 Q 52 70 52 65 Q 54 70 60 70 Q 65 70 65 65 Q 67 70 72 70 Q 75 70 72 45 Z"
      fill="#E8E8E8"
    />

    {/* Eyes */}
    <circle cx="42" cy="42" r="4" fill="#1A1A1A" />
    <circle cx="58" cy="42" r="4" fill="#1A1A1A" />

    {/* Mouth */}
    <path
      d="M 45 50 Q 50 55 55 50"
      stroke="#1A1A1A"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default WinScreen;
