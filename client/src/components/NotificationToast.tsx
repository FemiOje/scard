import React, { useEffect } from "react";
import "../styles/components/NotificationToast.css";
import type { Notification } from "../types/notifications";

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

/**
 * Individual notification toast component
 */
const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  const getTypeIcon = (type: Notification["type"]): string => {
    if (notification.icon) return notification.icon;
    switch (type) {
      case "success":
        return "✓";
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "error":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div
      className={`notification-toast notification-toast-${notification.type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-toast-content">
        <span className="notification-toast-icon">{getTypeIcon(notification.type)}</span>
        <span className="notification-toast-message">{notification.message}</span>
      </div>
      <button
        className="notification-toast-close"
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Notification container component
 * Displays all notifications from the queue
 */
interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

