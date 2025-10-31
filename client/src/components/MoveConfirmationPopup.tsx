import React from "react";
import "./MoveConfirmationPopup.css";

interface MoveConfirmationPopupProps {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  direction: "Left" | "Right" | "Up" | "Down";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MoveConfirmationPopup: React.FC<MoveConfirmationPopupProps> = ({
  targetX,
  targetY,
  currentX,
  currentY,
  direction,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const getDirectionArrow = (dir: string) => {
    switch (dir) {
      case "Left":
        return "←";
      case "Right":
        return "→";
      case "Up":
        return "↑";
      case "Down":
        return "↓";
      default:
        return "→";
    }
  };

  return (
    <div className="move-popup-overlay" onClick={onCancel}>
      <div className="move-popup-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-title">🎃 Move Confirmation 🎃</h3>
        <div className="popup-info">
          <p className="popup-text">
            Move from{" "}
            <span className="highlight">
              ({currentX}, {currentY})
            </span>{" "}
            to{" "}
            <span className="highlight">
              ({targetX}, {targetY})
            </span>
          </p>
          <div className="direction-display">
            <span className="direction-arrow">
              {getDirectionArrow(direction)}
            </span>
            <span className="direction-name">{direction}</span>
          </div>
        </div>
        <div className="popup-buttons">
          <button
            className="popup-button popup-button-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="popup-button popup-button-confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Moving..." : "Confirm Move"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveConfirmationPopup;
