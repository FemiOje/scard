import React, { useEffect, useState, useRef } from "react";
import "../styles/components/AnimatedStat.css";

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
      statRef.current.classList.add("stat-flash");
      statRef.current.classList.add(
        changed > 0 ? "stat-flash-increase" : "stat-flash-decrease"
      );
      setTimeout(() => {
        if (statRef.current) {
          statRef.current.classList.remove("stat-flash");
          statRef.current.classList.remove("stat-flash-increase");
          statRef.current.classList.remove("stat-flash-decrease");
        }
      }, 500);

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
    <div className={`animated-stat ${className}`} ref={statRef}>
      <div className="animated-stat-content">
        {icon && <span className="animated-stat-icon">{icon}</span>}
        <span className="animated-stat-label">{label}</span>
        <span
          className={`animated-stat-value ${
            changeIndicator
              ? changeIndicator.type === "increase"
                ? "stat-increase"
                : "stat-decrease"
              : ""
          }`}
        >
          {displayValue}
        </span>
      </div>
      {changeIndicator && (
        <div
          className={`stat-change-indicator stat-change-${changeIndicator.type}`}
        >
          {changeIndicator.type === "increase" ? "+" : "-"}
          {changeIndicator.value}
        </div>
      )}
    </div>
  );
};

