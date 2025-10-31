import React, { useState, useMemo } from "react";
import "./HalloweenGrid.css";
import { MoveConfirmationPopup } from "./MoveConfirmationPopup";
import type { Position } from "../typescript/models.gen";

interface GridCellProps {
  index: number;
  x: number;
  y: number;
  isHovered: boolean;
  isPlayerPosition: boolean;
  isValidMove: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (index: number | null) => void;
}

const GridCell: React.FC<GridCellProps> = ({
  index,
  x,
  y,
  isHovered,
  isPlayerPosition,
  isValidMove,
  isSelected,
  onClick,
  onHover,
}) => {
  return (
    <div
      className={`halloween-cell ${isHovered ? "hovered" : ""} ${
        isPlayerPosition ? "player-position" : ""
      } ${isValidMove ? "valid-move" : ""} ${isSelected ? "selected" : ""}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={isValidMove ? onClick : undefined}
    >
      <div className="cell-inner">
        {isPlayerPosition ? (
          <span className="player-icon">👻</span>
        ) : (
          <span className="cell-number">{index + 1}</span>
        )}
      </div>
      {isValidMove && <div className="valid-move-indicator">✨</div>}
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

interface HalloweenGridProps {
  playerPosition: Position | null;
  onMove: (direction: "Left" | "Right" | "Up" | "Down") => Promise<void>;
  isLoading?: boolean;
}

export const HalloweenGrid: React.FC<HalloweenGridProps> = ({
  playerPosition,
  onMove,
  isLoading = false,
}) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showMovePopup, setShowMovePopup] = useState(false);
  const gridSize = 5;
  const totalCells = gridSize * gridSize;

  // Convert grid index to (x, y) coordinates
  const indexToCoords = (index: number): { x: number; y: number } => {
    return {
      x: index % gridSize,
      y: Math.floor(index / gridSize),
    };
  };

  // Convert (x, y) coordinates to grid index
  const coordsToIndex = (x: number, y: number): number => {
    return y * gridSize + x;
  };

  // Get player position in grid coordinates
  const playerGridPos = useMemo(() => {
    if (!playerPosition) return null;
    const x = Number(playerPosition.x);
    const y = Number(playerPosition.y);
    // Ensure coordinates are within bounds (0-4)
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
    return { x, y, index: coordsToIndex(x, y) };
  }, [playerPosition]);

  // Calculate valid moves (adjacent cells)
  const validMoves = useMemo(() => {
    if (!playerGridPos) return new Set<number>();
    const valid = new Set<number>();
    const { x, y } = playerGridPos;

    // Check all four directions
    if (x > 0) valid.add(coordsToIndex(x - 1, y)); // Left
    if (x < gridSize - 1) valid.add(coordsToIndex(x + 1, y)); // Right
    if (y > 0) valid.add(coordsToIndex(x, y - 1)); // Up
    if (y < gridSize - 1) valid.add(coordsToIndex(x, y + 1)); // Down

    return valid;
  }, [playerGridPos]);

  // Calculate direction from player position to target cell
  const getDirection = (
    playerX: number,
    playerY: number,
    targetX: number,
    targetY: number
  ): "Left" | "Right" | "Up" | "Down" => {
    const dx = targetX - playerX;
    const dy = targetY - playerY;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "Right" : "Left";
    } else {
      return dy > 0 ? "Down" : "Up";
    }
  };

  const handleCellClick = (index: number) => {
    if (!validMoves.has(index) || !playerGridPos) return;
    setSelectedCell(index);
    setShowMovePopup(true);
  };

  const handleMoveConfirm = async () => {
    if (!selectedCell || !playerGridPos) return;
    const target = indexToCoords(selectedCell);
    const direction = getDirection(
      playerGridPos.x,
      playerGridPos.y,
      target.x,
      target.y
    );

    await onMove(direction);
    setShowMovePopup(false);
    setSelectedCell(null);
  };

  const handleMoveCancel = () => {
    setShowMovePopup(false);
    setSelectedCell(null);
  };

  return (
    <div className="halloween-grid-container">
      {/* Decorative pumpkins */}
      <PumpkinSVG className="pumpkin-decoration pumpkin-top-left" />
      <PumpkinSVG className="pumpkin-decoration pumpkin-top-right" />
      <PumpkinSVG className="pumpkin-decoration pumpkin-bottom-left" />
      <PumpkinSVG className="pumpkin-decoration pumpkin-bottom-right" />

      {/* Decorative ghosts */}
      <GhostSVG className="ghost-decoration ghost-left" />
      <GhostSVG className="ghost-decoration ghost-right" />

      {/* Title */}
      <div className="grid-title">
        <h1 className="spooky-title">🎃 SCAR'D 🎃</h1>
        <p className="spooky-subtitle">
          {playerGridPos
            ? `Position: (${playerGridPos.x}, ${playerGridPos.y})`
            : "Hover over the cells if you dare..."}
        </p>
      </div>

      {/* Grid */}
      <div className="halloween-grid">
        {Array.from({ length: totalCells }).map((_, index) => {
          const coords = indexToCoords(index);
          const isPlayerPos = playerGridPos?.index === index;
          const isValidMove = validMoves.has(index);

          return (
            <GridCell
              key={index}
              index={index}
              x={coords.x}
              y={coords.y}
              isHovered={hoveredCell === index}
              isPlayerPosition={isPlayerPos}
              isValidMove={isValidMove}
              isSelected={selectedCell === index}
              onClick={() => handleCellClick(index)}
              onHover={setHoveredCell}
            />
          );
        })}
      </div>

      {/* Spooky message */}
      <div className="spooky-message">
        {hoveredCell !== null && !playerGridPos && (
          <p className="cell-message">
            You've awakened cell {hoveredCell + 1}! 👻
          </p>
        )}
        {playerGridPos && validMoves.size > 0 && (
          <p className="cell-message">
            Click on a highlighted cell to move! 👻
          </p>
        )}
        {isLoading && <p className="cell-message">Moving... 🎃</p>}
      </div>

      {/* Move Confirmation Popup */}
      {showMovePopup && selectedCell !== null && playerGridPos && (
        <MoveConfirmationPopup
          targetX={indexToCoords(selectedCell).x}
          targetY={indexToCoords(selectedCell).y}
          currentX={playerGridPos.x}
          currentY={playerGridPos.y}
          direction={getDirection(
            playerGridPos.x,
            playerGridPos.y,
            indexToCoords(selectedCell).x,
            indexToCoords(selectedCell).y
          )}
          onConfirm={handleMoveConfirm}
          onCancel={handleMoveCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default HalloweenGrid;
