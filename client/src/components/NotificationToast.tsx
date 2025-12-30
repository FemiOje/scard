import React, { useEffect } from "react";
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

  const getTypeClasses = (type: Notification["type"]) => {
    const base = "flex items-center justify-between gap-4 p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] border-2 animate-slide-in-right pointer-events-auto min-w-[280px] max-w-full";
    switch (type) {
      case "success":
        return `${base} bg-[rgba(34,197,94,0.95)] border-[rgba(34,197,94,0.6)] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.4)]`;
      case "info":
        return `${base} bg-[rgba(59,130,246,0.95)] border-[rgba(59,130,246,0.6)] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.4)]`;
      case "warning":
        return `${base} bg-[rgba(251,191,36,0.95)] border-[rgba(251,191,36,0.6)] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.4)] text-black`;
      case "error":
        return `${base} bg-[rgba(220,38,38,0.95)] border-[rgba(220,38,38,0.6)] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(220,38,38,0.4)]`;
      default:
        return base;
    }
  };

  return (
    <div
      className={getTypeClasses(notification.type)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xl font-bold flex-shrink-0">{getTypeIcon(notification.type)}</span>
        <span className="text-sm font-medium text-white leading-6 break-words">{notification.message}</span>
      </div>
      <button
        className="bg-transparent border-none text-white/70 text-xl font-bold cursor-pointer p-0 w-6 h-6 flex items-center justify-center flex-shrink-0 rounded transition-all duration-200 hover:text-white hover:bg-white/10 active:scale-90"
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
    <div className="fixed top-4 right-4 z-[3000] flex flex-col gap-3 max-w-[400px] w-[calc(100%-2rem)] pointer-events-none" aria-live="polite" aria-atomic="true">
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

