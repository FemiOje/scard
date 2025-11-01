// Notification types and interfaces

/**
 * Notification type enum
 */
export type NotificationType = "success" | "info" | "warning" | "error";

/**
 * Notification interface
 */
export interface Notification {
  id: string; // Unique ID for React keys
  type: NotificationType;
  message: string;
  duration?: number; // Auto-dismiss duration in ms (default: 5000)
  icon?: string; // Optional emoji/icon
}

/**
 * Create a notification with auto-generated ID
 */
export function createNotification(
  type: NotificationType,
  message: string,
  options?: { duration?: number; icon?: string }
): Notification {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
    duration: options?.duration ?? 5000,
    icon: options?.icon,
  };
}

/**
 * Helper functions to create common notification types
 */
export const notificationHelpers = {
  success: (message: string, icon?: string) =>
    createNotification("success", message, { icon }),
  info: (message: string, icon?: string) =>
    createNotification("info", message, { icon }),
  warning: (message: string, icon?: string) =>
    createNotification("warning", message, { icon }),
  error: (message: string, icon?: string) =>
    createNotification("error", message, { icon }),
};

