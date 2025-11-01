import React, { useMemo } from "react";
import "../styles/components/EncounterPopup.css";
import { HealthBar } from "./HealthBar";
import { calculateCombatOutcome, isCriticalHealth, willPlayerDie } from "../utils/combatCalculations";
import { MAX_PLAYER_HEALTH } from "../constants/game";
import type { EncounterType, EncounterState } from "../types/game";
import type { Player } from "../generated/typescript/models.gen";

interface EncounterPopupProps {
  encounter: EncounterState;
  playerStats?: Player | null;
  onFight: () => Promise<void>;
  onFlee: () => Promise<void>;
  onOK: () => void;
  isLoading?: boolean;
}

export const EncounterPopup: React.FC<EncounterPopupProps> = ({
  encounter,
  playerStats,
  onFight,
  onFlee,
  onOK,
  isLoading = false,
}) => {
  const isBeastEncounter =
    encounter.type === "Werewolf" || encounter.type === "Vampire";

  // Calculate combat predictions if we have player stats and beast stats
  const combatPrediction = useMemo(() => {
    if (
      isBeastEncounter &&
      playerStats &&
      encounter.beastStats &&
      Number(encounter.beastStats.beast_type) !== 0
    ) {
      return calculateCombatOutcome(playerStats, encounter.beastStats);
    }
    return null;
  }, [isBeastEncounter, playerStats, encounter.beastStats]);

  // Check if actions are dangerous
  const fightWarning = combatPrediction
    ? willPlayerDie(combatPrediction.fightOutcome.playerHealthAfter)
      ? "death"
      : isCriticalHealth(combatPrediction.fightOutcome.playerHealthAfter)
        ? "critical"
        : null
    : null;

  const fleeWarning = combatPrediction
    ? willPlayerDie(combatPrediction.fleeOutcome.playerHealthAfter)
      ? "death"
      : isCriticalHealth(combatPrediction.fleeOutcome.playerHealthAfter)
        ? "critical"
        : null
    : null;

  // Extract player stats
  const playerHealth = playerStats ? Number(playerStats.health) : 0;
  const playerAttack = playerStats ? Number(playerStats.attack_points) : 0;
  const playerDamage = playerStats ? Number(playerStats.damage_points) : 0;
  const hasFreeAttack = playerStats?.has_free_attack ?? false;
  const hasFreeFlee = playerStats?.has_free_flee ?? false;

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

          {/* Beast encounter - show side-by-side comparison and predictions */}
          {isBeastEncounter &&
            encounter.beastStats &&
            Number(encounter.beastStats.beast_type) !== 0 &&
            (Number(encounter.beastStats.attack_points) > 0 ||
              Number(encounter.beastStats.damage_points) > 0) && (
              <>
                {/* Side-by-side comparison */}
                {playerStats && (
                  <div className="combat-comparison">
                    <h4 className="combat-comparison-title">Combat Comparison</h4>
                    <div className="combat-comparison-grid">
                      <div className="combat-side combat-side-player">
                        <div className="combat-side-header">YOU</div>
                        <div className="combat-health">
                          <div className="combat-health-label">❤️ Health</div>
                          <HealthBar
                            current={playerHealth}
                            max={MAX_PLAYER_HEALTH}
                            size="small"
                            showNumbers={true}
                            animated={false}
                          />
                        </div>
                        <div className="combat-stat-row">
                          <div className="combat-stat-item">
                            <span className="combat-stat-label">⚔️ Attack:</span>
                            <span className="combat-stat-value">{playerAttack}</span>
                          </div>
                          <div className="combat-stat-item">
                            <span className="combat-stat-label">🛡️ Damage:</span>
                            <span className="combat-stat-value">{playerDamage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="combat-vs">VS</div>
                      <div className="combat-side combat-side-beast">
                        <div className="combat-side-header">BEAST</div>
                        <div className="combat-health">
                          <div className="combat-health-label">❤️ Health</div>
                          <div className="beast-health-bar">1-Hit Kill</div>
                        </div>
                        <div className="combat-stat-row">
                          <div className="combat-stat-item">
                            <span className="combat-stat-label">⚔️ Attack:</span>
                            <span className="combat-stat-value beast-stat">
                              {Number(encounter.beastStats.attack_points)}
                            </span>
                          </div>
                          <div className="combat-stat-item">
                            <span className="combat-stat-label">💥 Damage:</span>
                            <span className="combat-stat-value beast-stat damage-stat">
                              {Number(encounter.beastStats.damage_points)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Combat Predictions */}
                {combatPrediction && (
                  <div className="combat-predictions">
                    <h4 className="combat-predictions-title">Combat Predictions</h4>
                    <div className="combat-predictions-grid">
                      {/* Fight Prediction */}
                      <div
                        className={`combat-prediction combat-prediction-fight ${
                          fightWarning ? `warning-${fightWarning}` : ""
                        }`}
                      >
                        <div className="combat-prediction-header">
                          <span className="combat-prediction-icon">⚔️</span>
                          <span className="combat-prediction-title">FIGHT</span>
                        </div>
                        <div className="combat-prediction-details">
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• Beast will be defeated</span>
                          </div>
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• You take:</span>
                            <span
                              className={`combat-prediction-value ${
                                combatPrediction.fightOutcome.usesFreeAttack
                                  ? "free-ability"
                                  : "damage"
                              }`}
                            >
                              {combatPrediction.fightOutcome.playerDamageTaken}{" "}
                              {combatPrediction.fightOutcome.usesFreeAttack
                                ? "damage (Free Attack!)"
                                : "damage"}
                            </span>
                          </div>
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• Health after:</span>
                            <span className="combat-prediction-value">
                              {combatPrediction.fightOutcome.playerHealthAfter}/
                              {MAX_PLAYER_HEALTH}
                            </span>
                          </div>
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• Result:</span>
                            <span className="combat-prediction-value success">
                              ✓ VICTORY
                            </span>
                          </div>
                        </div>
                        {fightWarning === "death" && (
                          <div className="combat-prediction-warning death-warning">
                            ⚠️ WARNING: You will die!
                          </div>
                        )}
                        {fightWarning === "critical" && (
                          <div className="combat-prediction-warning critical-warning">
                            ⚠️ WARNING: Health will drop below 25%!
                          </div>
                        )}
                      </div>

                      {/* Flee Prediction */}
                      <div
                        className={`combat-prediction combat-prediction-flee ${
                          fleeWarning ? `warning-${fleeWarning}` : ""
                        }`}
                      >
                        <div className="combat-prediction-header">
                          <span className="combat-prediction-icon">🏃</span>
                          <span className="combat-prediction-title">FLEE</span>
                        </div>
                        <div className="combat-prediction-details">
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• You take:</span>
                            <span
                              className={`combat-prediction-value ${
                                combatPrediction.fleeOutcome.usesFreeFlee
                                  ? "free-ability"
                                  : "damage"
                              }`}
                            >
                              {combatPrediction.fleeOutcome.playerDamageTaken}{" "}
                              {combatPrediction.fleeOutcome.usesFreeFlee
                                ? "damage (Free Flee!)"
                                : "damage"}
                            </span>
                          </div>
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• Health after:</span>
                            <span className="combat-prediction-value">
                              {combatPrediction.fleeOutcome.playerHealthAfter}/
                              {MAX_PLAYER_HEALTH}
                            </span>
                          </div>
                          <div className="combat-prediction-item">
                            <span className="combat-prediction-label">• Result:</span>
                            <span className="combat-prediction-value success">
                              ✓ ESCAPE
                            </span>
                          </div>
                        </div>
                        {fleeWarning === "death" && (
                          <div className="combat-prediction-warning death-warning">
                            ⚠️ WARNING: You will die!
                          </div>
                        )}
                        {fleeWarning === "critical" && (
                          <div className="combat-prediction-warning critical-warning">
                            ⚠️ WARNING: Health will drop below 25%!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Ability Indicators */}
                {(hasFreeAttack || hasFreeFlee) && (
                  <div className="special-abilities-indicators">
                    {hasFreeAttack && (
                      <div className="ability-indicator ability-active">
                        <span className="ability-indicator-icon">✨</span>
                        <span className="ability-indicator-text">
                          Free Attack Active - No damage taken on fight!
                        </span>
                      </div>
                    )}
                    {hasFreeFlee && (
                      <div className="ability-indicator ability-active">
                        <span className="ability-indicator-icon">✨</span>
                        <span className="ability-indicator-text">
                          Free Flee Active - No damage on escape!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
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
