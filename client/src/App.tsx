import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ControllerConnector from "@cartridge/connector/controller";
import { NotificationContainer } from "./components/NotificationToast";
import { Header } from "./components/Header";
import { useGameStore } from "./stores/gameStore";
import { scardRoutes } from "./utils/routes";

function AppContent() {
  const { address, status, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState<string | null>(null);
  const [isControllerReady, setIsControllerReady] = useState(false);

  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors]
  );

  // Get notifications from store
  const notifications = useGameStore((state) => state.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

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
    <div className="min-h-screen relative">
      <Header
        status={status}
        address={address}
        connector={connector}
        username={username}
        isControllerReady={isControllerReady}
        connect={connect}
        controllerConnector={controllerConnector}
      />

      {/* Route-based content */}
      <Routes>
        {scardRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.content}
          />
        ))}
      </Routes>

      {/* Notification Toast Container - Always visible */}
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
