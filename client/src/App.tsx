import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useState, useMemo } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { HalloweenGrid } from "./components/HalloweenGrid";
import { SplashScreen } from "./components/SplashScreen";
import { WinScreen } from "./components/WinScreen";
import { useGameState } from "./hooks/useGameState";
import "./App.css";

function App() {
  const { address, status, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState<string | null>(null);
  const [isControllerReady, setIsControllerReady] = useState(false);
  const [showGame, setShowGame] = useState(false);

  // Game state management
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

  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors]
  );

  // Check if controller is ready
  useEffect(() => {
    const checkReady = () => {
      try {
        if (controllerConnector) {
          setIsControllerReady(controllerConnector.isReady());
        }
      } catch (e) {
        console.error("Error checking controller readiness:", e);
      }
    };

    checkReady();
    const interval = setInterval(checkReady, 1000);
    return () => clearInterval(interval);
  }, [controllerConnector]);

  // Fetch username when connected
  useEffect(() => {
    async function fetchUsername() {
      try {
        const name = await (connector as ControllerConnector)?.username();
        if (name) setUsername(name);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    }
    if (connector && status === "connected") {
      fetchUsername();
    }
  }, [connector, status]);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Header with Wallet Button */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          zIndex: 100,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 107, 53, 0.3)",
        }}
      >
        {status === "connected" && address ? (
          <button
            onClick={() =>
              (connector as ControllerConnector).controller.openProfile()
            }
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "rgba(255, 107, 53, 0.9)",
              color: "white",
              border: "2px solid #FF6B35",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 0 20px rgba(255, 107, 53, 0.4)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 140, 0, 0.9)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 30px rgba(255, 107, 53, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 107, 53, 0.9)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(255, 107, 53, 0.4)";
            }}
          >
            <span>👤</span>
            <span>
              {username || address.slice(0, 6) + "..." + address.slice(-4)}
            </span>
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: controllerConnector })}
            disabled={!isControllerReady}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isControllerReady
                ? "rgba(255, 107, 53, 0.9)"
                : "rgba(108, 117, 125, 0.9)",
              color: "white",
              border: isControllerReady
                ? "2px solid #FF6B35"
                : "2px solid #6c757d",
              borderRadius: "8px",
              cursor: isControllerReady ? "pointer" : "not-allowed",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: isControllerReady
                ? "0 0 20px rgba(255, 107, 53, 0.4)"
                : "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (isControllerReady) {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 140, 0, 0.9)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(255, 107, 53, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (isControllerReady) {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 107, 53, 0.9)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255, 107, 53, 0.4)";
              }
            }}
          >
            {isControllerReady ? "Connect Wallet" : "Loading..."}
          </button>
        )}
      </header>

      {/* Show Splash Screen, Game, or Win Screen */}
      {gameStatus === "Won" && showGame ? (
        <WinScreen
          onPlayAgain={() => {
            setShowGame(true); // Keep game view open, createGame will reset status
          }}
          onCreateGame={createGame}
          isCreatingGame={isGameLoading}
        />
      ) : showGame ? (
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
      ) : (
        <SplashScreen
          onStartNewGame={() => setShowGame(true)}
          onCreateGame={createGame}
          isCreatingGame={isGameLoading}
        />
      )}

      {/* Error display */}
      {gameError && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(220, 53, 69, 0.9)",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "8px",
            zIndex: 1001,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          ⚠️ Error: {gameError}
        </div>
      )}
    </div>
  );
}

export default App;
