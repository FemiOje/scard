import React from "react";
import { Connector } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";

interface HeaderProps {
    status: string;
    address?: string;
    connector?: Connector;
    username: string | null;
    isControllerReady: boolean;
    connect: (args: { connector: ControllerConnector }) => void;
    controllerConnector: ControllerConnector;
}

export const Header: React.FC<HeaderProps> = ({
    status,
    address,
    connector,
    username,
    isControllerReady,
    connect,
    controllerConnector,
}) => {
    return (
        <header className="fixed top-0 left-0 right-0 p-8 flex justify-end items-center z-[100] bg-black/50 backdrop-blur-[10px] border-b border-[rgba(255,107,53,0.3)]">
            {status === "connected" && address ? (
                <button
                    onClick={() =>
                        (connector as ControllerConnector).controller.openProfile()
                    }
                    className="px-6 py-3 bg-[rgba(255,107,53,0.9)] text-white border-2 border-[#FF6B35] rounded-lg cursor-pointer text-lg font-bold shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all duration-300 ease-in-out flex items-center gap-2 hover:bg-[rgba(255,140,0,0.9)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,53,0.6)]"
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
                    className={`px-6 py-3 text-white border-2 rounded-lg text-lg font-bold transition-all duration-300 ease-in-out ${isControllerReady
                            ? "bg-[rgba(255,107,53,0.9)] border-[#FF6B35] cursor-pointer shadow-[0_0_20px_rgba(255,107,53,0.4)] hover:bg-[rgba(255,140,0,0.9)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,53,0.6)]"
                            : "bg-[rgba(108,117,125,0.9)] border-gray-500 cursor-not-allowed opacity-60"
                        }`}
                >
                    {isControllerReady ? "Connect Wallet" : "Loading..."}
                </button>
            )}
        </header>
    );
};

export default Header;