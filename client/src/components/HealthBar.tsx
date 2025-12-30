import React, { useEffect, useRef } from "react";

interface HealthBarProps {
  current: number;
  max: number;
  size?: "small" | "medium" | "large";
  showNumbers?: boolean;
  animated?: boolean;
  className?: string;
  highlightChange?: "increase" | "decrease" | null; // For flash effects
}

/**
 * Reusable HealthBar component
 * Displays health with dynamic color coding and smooth animations
 * 
 * @param current - Current health value
 * @param max - Maximum health value
 * @param size - Size variant (small, medium, large)
 * @param showNumbers - Whether to show current/max numbers
 * @param animated - Whether to animate fill changes
 * @param className - Additional CSS classes
 */
export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  size = "medium",
  showNumbers = true,
  animated = true,
  className = "",
  highlightChange = null,
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevCurrent = useRef<number>(current);

  // Calculate percentage for health bar fill
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  
  // Determine health state for color coding
  const getHealthState = (): "high" | "medium" | "low" | "critical" => {
    if (percentage >= 80) return "high";
    if (percentage >= 40) return "medium";
    if (percentage >= 20) return "low";
    return "critical";
  };

  const healthState = getHealthState();
  const isCritical = healthState === "critical";

  // Flash effect when health changes
  useEffect(() => {
    if (prevCurrent.current !== current && fillRef.current) {
      const changed = current - prevCurrent.current;
      if (changed !== 0) {
        fillRef.current.classList.add("health-bar-flash");
        fillRef.current.classList.add(
          changed > 0 ? "health-bar-flash-heal" : "health-bar-flash-damage"
        );
        setTimeout(() => {
          if (fillRef.current) {
            fillRef.current.classList.remove("health-bar-flash");
            fillRef.current.classList.remove("health-bar-flash-heal");
            fillRef.current.classList.remove("health-bar-flash-damage");
          }
        }, 500);
      }
      prevCurrent.current = current;
    }
  }, [current]);

  return (
    <div className={`health-bar health-bar-${size} ${className}`}>
      {showNumbers && (
        <div className="health-bar-label">
          <span className="health-bar-current">{current}</span>
          <span className="health-bar-separator">/</span>
          <span className="health-bar-max">{max}</span>
        </div>
      )}
      <div className="health-bar-container">
        <div
          ref={fillRef}
          className={`health-bar-fill health-bar-${healthState} ${
            animated ? "health-bar-animated" : ""
          } ${isCritical ? "health-bar-pulse" : ""} ${
            highlightChange === "increase" ? "health-bar-highlight-heal" : ""
          } ${highlightChange === "decrease" ? "health-bar-highlight-damage" : ""}`}
          style={{
            width: `${percentage}%`,
            transition: animated ? "width 0.5s linear, background-color 0.3s ease" : "none",
          }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Health: ${current} out of ${max}`}
        />
      </div>
    </div>
  );
};

