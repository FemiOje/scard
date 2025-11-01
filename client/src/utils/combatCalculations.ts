// Combat calculation utilities
// Used to predict combat outcomes before player takes action

import { MAX_PLAYER_HEALTH } from "../constants/game";
import type { Player, BeastEncounter } from "../generated/typescript/models.gen";

/**
 * Combat prediction result interface
 */
export interface CombatPrediction {
  fightOutcome: {
    playerDamageTaken: number;
    beastDefeated: boolean;
    playerHealthAfter: number;
    playerDied: boolean;
    usesFreeAttack: boolean;
  };
  fleeOutcome: {
    playerDamageTaken: number;
    playerHealthAfter: number;
    playerDied: boolean;
    usesFreeFlee: boolean;
  };
}

/**
 * Calculate combat outcomes for fight and flee actions
 * 
 * Special abilities (Free Attack, Free Flee) are automatically used when available.
 * 
 * @param playerStats - Player model with health, attack, damage, abilities
 * @param beastStats - BeastEncounter model with attack and damage
 * @returns CombatPrediction with fight and flee outcomes
 */
export function calculateCombatOutcome(
  playerStats: Player,
  beastStats: BeastEncounter
): CombatPrediction {
  const playerHealth = Number(playerStats.health);
  const beastDamage = Number(beastStats.damage_points);
  const hasFreeAttack = playerStats.has_free_attack ?? false;
  const hasFreeFlee = playerStats.has_free_flee ?? false;

  // Calculate fight outcome
  // Free Attack is automatically used if available (no damage taken)
  const usesFreeAttack = hasFreeAttack;
  const playerDamageTakenFight = usesFreeAttack ? 0 : beastDamage;
  const playerHealthAfterFight = Math.max(0, playerHealth - playerDamageTakenFight);
  const playerDiedFight = playerHealthAfterFight === 0;
  const beastDefeated = true; // Beast is always defeated (one-hit kill)

  // Calculate flee outcome
  // Free Flee is automatically used if available (no damage taken)
  const usesFreeFlee = hasFreeFlee;
  const playerDamageTakenFlee = usesFreeFlee ? 0 : beastDamage;
  const playerHealthAfterFlee = Math.max(0, playerHealth - playerDamageTakenFlee);
  const playerDiedFlee = playerHealthAfterFlee === 0;

  return {
    fightOutcome: {
      playerDamageTaken: playerDamageTakenFight,
      beastDefeated,
      playerHealthAfter: playerHealthAfterFight,
      playerDied: playerDiedFight,
      usesFreeAttack,
    },
    fleeOutcome: {
      playerDamageTaken: playerDamageTakenFlee,
      playerHealthAfter: playerHealthAfterFlee,
      playerDied: playerDiedFlee,
      usesFreeFlee,
    },
  };
}

/**
 * Check if action will result in critical health (< 25%)
 * 
 * @param currentHealth - Current player health
 * @param healthAfter - Health after action
 * @param maxHealth - Maximum health (default: MAX_PLAYER_HEALTH)
 * @returns true if health after action is below 25% threshold
 */
export function isCriticalHealth(
  healthAfter: number,
  maxHealth: number = MAX_PLAYER_HEALTH
): boolean {
  const percentage = maxHealth > 0 ? (healthAfter / maxHealth) * 100 : 0;
  return percentage < 25 && percentage > 0; // Critical if < 25% but not dead
}

/**
 * Check if action will result in player death
 * 
 * @param healthAfter - Health after action
 * @returns true if health after action is 0
 */
export function willPlayerDie(healthAfter: number): boolean {
  return healthAfter === 0;
}

