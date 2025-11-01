// Notification helpers for common game events
// Provides convenient functions to show notifications for various game actions

import { notificationHelpers } from "../types/notifications";
import type { EncounterType } from "../types/game";

/**
 * Show notification for gift encounter
 */
export function notifyGiftEncounter(
  type: EncounterType,
  addNotification: (notification: any) => void
) {
  switch (type) {
    case "FreeHealth":
      addNotification(
        notificationHelpers.success("💚 Health restored!", "💚")
      );
      break;
    case "AttackPoints":
      addNotification(
        notificationHelpers.success("⚔️ Attack power increased!", "⚔️")
      );
      break;
    case "ReducedDamage":
      addNotification(
        notificationHelpers.success("🛡️ Damage reduction gained!", "🛡️")
      );
      break;
    case "FreeAttack":
      addNotification(
        notificationHelpers.success("🎯 Free Attack ability gained!", "🎯")
      );
      break;
    case "FreeFlee":
      addNotification(
        notificationHelpers.success("🏃 Free Flee ability gained!", "🏃")
      );
      break;
    case "FreeRoam":
      addNotification(
        notificationHelpers.info("🌿 Peaceful path - no encounter!", "🌿")
      );
      break;
    default:
      // Generic gift encounter
      addNotification(
        notificationHelpers.info("🎁 Gift encounter!", "🎁")
      );
  }
}

/**
 * Show notification for combat results
 */
export function notifyCombatResult(
  result: "victory" | "fled" | "died",
  damageTaken: number,
  hasFreeAbility: boolean,
  addNotification: (notification: any) => void
) {
  if (result === "victory") {
    if (hasFreeAbility) {
      addNotification(
        notificationHelpers.success(
          "⚔️ Victory! Beast defeated! (Free Attack - no damage!)",
          "⚔️"
        )
      );
    } else if (damageTaken === 0) {
      addNotification(
        notificationHelpers.success("⚔️ Victory! Beast defeated!", "⚔️")
      );
    } else {
      addNotification(
        notificationHelpers.warning(
          `⚔️ Victory! Beast defeated! Took ${damageTaken} damage.`,
          "⚔️"
        )
      );
    }
  } else if (result === "fled") {
    if (hasFreeAbility) {
      addNotification(
        notificationHelpers.success(
          "🏃 Escaped! (Free Flee - no damage!)",
          "🏃"
        )
      );
    } else if (damageTaken === 0) {
      addNotification(
        notificationHelpers.success("🏃 Escaped successfully!", "🏃")
      );
    } else {
      addNotification(
        notificationHelpers.warning(
          `🏃 Escaped! Took ${damageTaken} damage.`,
          "🏃"
        )
      );
    }
  } else if (result === "died") {
    addNotification(
      notificationHelpers.error("💀 You died! Game over.", "💀")
    );
  }
}

/**
 * Show notification for stat changes
 */
export function notifyStatChange(
  stat: "health" | "attack" | "damage",
  change: number,
  addNotification: (notification: any) => void
) {
  const isPositive = change > 0;
  const absChange = Math.abs(change);

  if (stat === "health") {
    if (isPositive) {
      addNotification(
        notificationHelpers.success(`❤️ +${absChange} Health!`, "❤️")
      );
    } else {
      addNotification(
        notificationHelpers.warning(`❤️ -${absChange} Health`, "❤️")
      );
    }
  } else if (stat === "attack") {
    if (isPositive) {
      addNotification(
        notificationHelpers.success(`⚔️ +${absChange} Attack!`, "⚔️")
      );
    } else {
      addNotification(
        notificationHelpers.warning(`⚔️ -${absChange} Attack`, "⚔️")
      );
    }
  } else if (stat === "damage") {
    if (isPositive) {
      addNotification(
        notificationHelpers.success(`🛡️ +${absChange} Damage reduction!`, "🛡️")
      );
    } else {
      addNotification(
        notificationHelpers.warning(`🛡️ -${absChange} Damage reduction`, "🛡️")
      );
    }
  }
}

/**
 * Show notification for ability gained
 */
export function notifyAbilityGained(
  ability: "FreeAttack" | "FreeFlee",
  addNotification: (notification: any) => void
) {
  if (ability === "FreeAttack") {
    addNotification(
      notificationHelpers.success(
        "✨ Free Attack ability gained! Next fight will take no damage!",
        "✨"
      )
    );
  } else if (ability === "FreeFlee") {
    addNotification(
      notificationHelpers.success(
        "✨ Free Flee ability gained! Next flee will take no damage!",
        "✨"
      )
    );
  }
}

