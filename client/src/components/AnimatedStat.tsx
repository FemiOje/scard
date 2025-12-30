import React, { useEffect, useState, useRef } from "react";

interface AnimatedStatProps {
  value: number;
  label: string;
  icon?: string;
  className?: string;
  showChange?: boolean; // Show +X/-X indicator when value changes
}

/**
 * Animated Stat Component
 * Displays a stat value with animations when it changes
 * - Count-up/count-down animation
 * - Flash effect on change
 * - Color change based on increase/decrease
 */
export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  value,
  label,
  icon,
  className = "",
  showChange = true,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [changeIndicator, setChangeIndicator] = useState<{
    value: number;
    type: "increase" | "decrease";
  } | null>(null);
  const [flashType, setFlashType] = useState<"increase" | "decrease" | null>(null);
  const prevValue = useRef<number>(value);
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const changed = value - prevValue.current;
    if (changed !== 0 && statRef.current) {
      // Show change indicator
      if (showChange) {
        setChangeIndicator({
          value: Math.abs(changed),
          type: changed > 0 ? "increase" : "decrease",
        });
        setTimeout(() => setChangeIndicator(null), 1500);
      }

      // Flash effect
      setFlashType(changed > 0 ? "increase" : "decrease");
      setTimeout(() => setFlashType(null), 500);

      // Animate count-up/count-down
      const startValue = prevValue.current;
      const endValue = value;
      const duration = 500; // ms
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (endValue - startValue) * easeOut);

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
      prevValue.current = value;
    } else {
      setDisplayValue(value);
    }
  }, [value, showChange]);

  return (
    <div className={`relative flex flex-col gap-1 ${className}`} ref={statRef}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-gray-300 flex-1">{label}</span>
        <span
          className={`text-sm font-semibold text-white ml-auto transition-colors duration-300 ${changeIndicator
              ? changeIndicator.type === "increase"
                ? "text-green-400 animate-value-increase"
                : "text-red-400 animate-value-decrease"
              : ""
            }`}
        >
          {displayValue}
        </span>
      </div>
      {changeIndicator && (
        <div
          className={`absolute -top-6 right-0 text-xs font-bold px-2 py-1 rounded animate-change-indicator-float pointer-events-none z-10 ${changeIndicator.type === "increase"
              ? "bg-green-500/90 text-white shadow-lg shadow-green-500/50"
              : "bg-red-500/90 text-white shadow-lg shadow-red-500/50"
            }`}
        >
          {changeIndicator.type === "increase" ? "+" : "-"}
          {changeIndicator.value}
        </div>
      )}
      {flashType && (
        <div className={`absolute inset-0 animate-stat-flash rounded ${flashType === "increase"
            ? "shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            : "shadow-[0_0_15px_rgba(239,68,68,0.6)]"
          }`} />
      )}
    </div>
  );
};

