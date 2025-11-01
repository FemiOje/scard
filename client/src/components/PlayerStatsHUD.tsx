import React from "react";
import "../styles/components/PlayerStatsHUD.css";
import { HealthBar } from "./HealthBar";
import { AnimatedStat } from "./AnimatedStat";
import { MAX_PLAYER_HEALTH } from "../constants/game";
import type { Player, Position } from "../generated/typescript/models.gen";

interface PlayerStatsHUDProps {
  playerStats: Player | null;
  position: Position | null;
  isLoading?: boolean;
}

/**
 * Player Stats HUD Component
 * Displays persistent player stats overlay (health, attack, damage, abilities, position)
 * Positioned in top-right corner of game screen
 */
export const PlayerStatsHUD: React.FC<PlayerStatsHUDProps> = ({
  playerStats,
  position,
  isLoading = false,
}) => {
  const health = playerStats ? Number(playerStats.health) : 0;
  const attackPoints = playerStats ? Number(playerStats.attack_points) : 0;
  const damagePoints = playerStats ? Number(playerStats.damage_points) : 0;
  const hasFreeAttack = playerStats?.has_free_attack ?? false;
  const hasFreeFlee = playerStats?.has_free_flee ?? false;

  const playerX = position ? Number(position.x) : 0;
  const playerY = position ? Number(position.y) : 0;

  // Calculate distance to goal (4, 4)
  const goalX = 4;
  const goalY = 4;
  const distanceToGoal = Math.abs(playerX - goalX) + Math.abs(playerY - goalY);

  return (
    <div className="player-stats-hud" aria-label="Player Stats">
      <div className="player-stats-hud-header">
        <span className="player-stats-hud-icon">👻</span>
        <h3 className="player-stats-hud-title">Player Stats</h3>
      </div>

      {isLoading && !playerStats ? (
        <div className="player-stats-hud-loading">Loading stats...</div>
      ) : !playerStats ? (
        <div className="player-stats-hud-empty">No player data</div>
      ) : (
        <>
          {/* Health Bar */}
          <div className="player-stats-hud-section">
            <div className="player-stats-hud-stat-group">
              <div className="player-stats-hud-stat-label">
                <span className="stat-icon">❤️</span>
                <span className="stat-text">Health</span>
              </div>
              <HealthBar
                current={health}
                max={MAX_PLAYER_HEALTH}
                size="medium"
                showNumbers={true}
                animated={true}
              />
            </div>
          </div>

          {/* Combat Stats - With animations */}
          <div className="player-stats-hud-section">
            <div className="player-stats-hud-stat-row">
              <AnimatedStat
                value={attackPoints}
                label="Attack"
                icon="⚔️"
                showChange={true}
              />
              <AnimatedStat
                value={damagePoints}
                label="Damage"
                icon="🛡️"
                showChange={true}
              />
            </div>
          </div>

          {/* Special Abilities - Always visible */}
          <div className="player-stats-hud-section">
            <div className="player-stats-hud-section-title">Special Abilities</div>
            <div className="player-stats-hud-abilities">
              <div
                className={`player-stats-hud-ability ${
                  hasFreeAttack ? "ability-active" : "ability-inactive"
                }`}
              >
                <span className="ability-icon">🎯</span>
                <span className="ability-name">Free Attack</span>
                {hasFreeAttack ? (
                  <span className="ability-status">✓</span>
                ) : (
                  <span className="ability-status-inactive">—</span>
                )}
              </div>
              <div
                className={`player-stats-hud-ability ${
                  hasFreeFlee ? "ability-active" : "ability-inactive"
                }`}
              >
                <span className="ability-icon">🏃</span>
                <span className="ability-name">Free Flee</span>
                {hasFreeFlee ? (
                  <span className="ability-status">✓</span>
                ) : (
                  <span className="ability-status-inactive">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Position & Progress */}
          <div className="player-stats-hud-section">
            <div className="player-stats-hud-stat-row">
              <div className="player-stats-hud-stat-item">
                <span className="stat-icon">📍</span>
                <span className="stat-label">Position</span>
                <span className="stat-value">
                  ({playerX}, {playerY})
                </span>
              </div>
            </div>
            <div className="player-stats-hud-stat-row">
              <div className="player-stats-hud-stat-item">
                <span className="stat-icon">🎯</span>
                <span className="stat-label">Goal</span>
                <span className="stat-value">
                  ({goalX}, {goalY})
                </span>
              </div>
            </div>
            {distanceToGoal > 0 && (
              <div className="player-stats-hud-stat-row">
                <div className="player-stats-hud-stat-item">
                  <span className="stat-icon">📏</span>
                  <span className="stat-label">Distance</span>
                  <span className="stat-value">{distanceToGoal}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

