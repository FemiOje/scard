import React from "react";

interface SplashScreenProps {
  onStartNewGame: () => void;
  onCreateGame: () => Promise<void>;
  isCreatingGame?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartNewGame,
  onCreateGame,
  isCreatingGame = false,
}) => {
  const handleStartNewGame = async () => {
    await onCreateGame();
    onStartNewGame();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute w-full h-full pointer-events-none">
        <PumpkinSVG className="absolute w-[150px] h-[150px] opacity-25 drop-shadow-[0_0_25px_rgba(255,107,53,0.6)] animate-float-pumpkin top-[10%] left-[5%]" style={{ animationDelay: '0s' }} />
        <PumpkinSVG className="absolute w-[150px] h-[150px] opacity-25 drop-shadow-[0_0_25px_rgba(255,107,53,0.6)] animate-float-pumpkin top-[15%] right-[5%]" style={{ animationDelay: '2s' }} />
        <PumpkinSVG className="absolute w-[150px] h-[150px] opacity-25 drop-shadow-[0_0_25px_rgba(255,107,53,0.6)] animate-float-pumpkin bottom-[15%] left-[8%]" style={{ animationDelay: '4s' }} />
        <PumpkinSVG className="absolute w-[150px] h-[150px] opacity-25 drop-shadow-[0_0_25px_rgba(255,107,53,0.6)] animate-float-pumpkin bottom-[10%] right-[8%]" style={{ animationDelay: '6s' }} />
      </div>

      {/* Game Title */}
      <div className="text-center z-10 mb-16 animate-fade-in-down">
        <h1 className="text-6xl font-black text-[#ff6b35] mb-4 tracking-[8px] uppercase font-['Arial_Black'] animate-title-glow" style={{ textShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.4), 0 0 80px rgba(255, 107, 53, 0.2), 4px 4px 8px rgba(0, 0, 0, 0.9)' }}>SCARD</h1>
        <p className="text-xl text-[#ffa500] tracking-[4px] font-light" style={{ textShadow: '0 0 15px rgba(255, 165, 0, 0.7)' }}>Spooky Season Game Jam</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-6 z-10 animate-fade-in-up">
        <button
          onClick={handleStartNewGame}
          disabled={isCreatingGame}
          className="px-5 py-5 text-xl font-bold rounded-xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center gap-3 min-w-[250px] border-3 border-solid relative overflow-hidden bg-gradient-to-br from-[rgba(255,107,53,0.9)] to-[rgba(255,140,0,0.9)] text-white border-[#ff6b35] shadow-[0_8px_16px_rgba(0,0,0,0.4),0_0_30px_rgba(255,107,53,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5),0_0_40px_rgba(255,107,53,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-gradient-to-br hover:from-[rgba(255,140,0,0.95)] hover:to-[rgba(255,165,0,0.95)] active:scale-[1.02] active:-translate-y-1 before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-500 before:ease-in hover:before:left-full"
        >
          <span className="text-2xl animate-icon-float">🎮</span>
          <span>{isCreatingGame ? "Creating Game..." : "Start New Game"}</span>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute w-full h-full pointer-events-none">
        <GhostSVG className="absolute w-24 h-24 opacity-20 drop-shadow-[0_0_20px_rgba(240,240,240,0.5)] animate-float-ghost top-[30%] left-[15%]" style={{ animationDelay: '1s' }} />
        <GhostSVG className="absolute w-24 h-24 opacity-20 drop-shadow-[0_0_20px_rgba(240,240,240,0.5)] animate-float-ghost top-[50%] right-[15%]" style={{ animationDelay: '5s' }} />
      </div>
    </div>
  );
};

const PumpkinSVG: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <svg
    className={className}
    style={style}
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

const GhostSVG: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => (
  <svg
    className={className}
    style={style}
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
