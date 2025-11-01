import React from "react";
import "./EncounterPopup.css";
import type { EncounterType, EncounterState } from "../types/game";

interface EncounterPopupProps {
  encounter: EncounterState;
  onFight: () => Promise<void>;
  onFlee: () => Promise<void>;
  onOK: () => void;
  isLoading?: boolean;
}

export const EncounterPopup: React.FC<EncounterPopupProps> = ({
  encounter,
  onFight,
  onFlee,
  onOK,
  isLoading = false,
}) => {
  const isBeastEncounter =
    encounter.type === "Werewolf" || encounter.type === "Vampire";

  const getEncounterTitle = (type: EncounterType): string => {
    switch (type) {
      case "Werewolf":
        return "🐺 Werewolf Encounter 🐺";
      case "Vampire":
        return "🧛 Vampire Encounter 🧛";
      case "FreeHealth":
        return "💚 Health Gift 💚";
      case "AttackPoints":
        return "⚔️ Attack Boost ⚔️";
      case "ReducedDamage":
        return "🛡️ Damage Reduction 🛡️";
      case "FreeAttack":
        return "🎯 Free Attack Gift 🎯";
      case "FreeFlee":
        return "🏃 Free Flee Gift 🏃";
      case "FreeRoam":
        return "🌿 Free Roam 🌿";
      default:
        return "🎲 Encounter 🎲";
    }
  };

  const getEncounterDescription = (type: EncounterType): string => {
    switch (type) {
      case "Werewolf":
        return "A ferocious werewolf blocks your path!";
      case "Vampire":
        return "A bloodthirsty vampire emerges from the shadows!";
      case "FreeHealth":
        return "You found a healing potion! Restore your health.";
      case "AttackPoints":
        return "You found a power-up! Your attack increases.";
      case "ReducedDamage":
        return "You found armor! Your damage taken is reduced.";
      case "FreeAttack":
        return "You found a combat charm! You can attack without taking damage.";
      case "FreeFlee":
        return "You found an escape charm! You can flee without taking damage.";
      case "FreeRoam":
        return "A peaceful path. Nothing to worry about.";
      default:
        return "Something interesting appears...";
    }
  };

  const getGiftEffect = (type: EncounterType): string => {
    switch (type) {
      case "FreeHealth":
        return "You gain health!";
      case "AttackPoints":
        return "Your attack power increases!";
      case "ReducedDamage":
        return "You take less damage!";
      case "FreeAttack":
        return "You gain a free attack ability!";
      case "FreeFlee":
        return "You gain a free flee ability!";
      case "FreeRoam":
        return "You can continue freely.";
      default:
        return "";
    }
  };

  return (
    <div
      className="encounter-popup-overlay"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="encounter-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="encounter-popup-title">
          {getEncounterTitle(encounter.type)}
        </h3>

        <div className="encounter-popup-info">
          <p className="encounter-popup-description">
            {getEncounterDescription(encounter.type)}
          </p>

          {/* Beast encounter - show stats */}
          {isBeastEncounter &&
            encounter.beastStats &&
            // Validate that beastStats is valid (not Beast::None with 0 stats)
            Number(encounter.beastStats.beast_type) !== 0 &&
            (Number(encounter.beastStats.attack_points) > 0 ||
              Number(encounter.beastStats.damage_points) > 0) && (
              <div className="beast-stats">
                <h4 className="beast-stats-title">Beast Stats:</h4>
                <div className="beast-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Attack:</span>
                    <span className="stat-value">
                      {Number(encounter.beastStats.attack_points)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Damage:</span>
                    <span className="stat-value damage-stat">
                      {Number(encounter.beastStats.damage_points)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Gift encounter - show effect */}
          {!isBeastEncounter && encounter.type !== "FreeRoam" && (
            <div className="gift-effect">
              <p className="gift-effect-text">
                {getGiftEffect(encounter.type)}
              </p>
            </div>
          )}

          {/* FreeRoam encounter - show simple message */}
          {encounter.type === "FreeRoam" && (
            <div className="freeroam-message">
              <p className="freeroam-text">Free Roam</p>
            </div>
          )}
        </div>

        <div className="encounter-popup-buttons">
          {isBeastEncounter ? (
            <>
              <button
                className="encounter-button encounter-button-flee"
                onClick={onFlee}
                disabled={isLoading}
              >
                {isLoading ? "Fleeing..." : "🏃 Flee"}
              </button>
              <button
                className="encounter-button encounter-button-fight"
                onClick={onFight}
                disabled={isLoading}
              >
                {isLoading ? "Fighting..." : "⚔️ Fight"}
              </button>
            </>
          ) : (
            <button
              className="encounter-button encounter-button-ok"
              onClick={onOK}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : encounter.type === "FreeRoam"
                  ? "Continue"
                  : "OK"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterPopup;
