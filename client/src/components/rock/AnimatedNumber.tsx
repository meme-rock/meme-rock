import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { formatLargeNumber } from "../../utils/formatNumber";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

/**
 * Animated number component with digit-by-digit slot machine effect
 * Each digit animates independently for a smooth, natural appearance
 * Displays numbers with thousand separators (e.g., 1,000,000.02)
 */
export const AnimatedNumber = ({
  value,
  decimals = 2,
  className = "",
}: AnimatedNumberProps) => {
  // Format number with thousand separators
  const formattedValue = useMemo(() => {
    return formatLargeNumber(value, decimals);
  }, [value, decimals]);

  const digits = useMemo(() => formattedValue.split(""), [formattedValue]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {digits.map((digit, index) => {
        // Check if it's a digit
        const isDigit = /\d/.test(digit);

        if (!isDigit) {
          // Render separators (. , etc) without animation
          return (
            <span
              key={`separator-${index}`}
              className="inline-block"
              style={{
                width: digit === "." ? "0.3em" : "0.4em",
                marginLeft: digit === "," ? "0.05em" : "0",
                marginRight: digit === "," ? "0.05em" : "0",
              }}
            >
              {digit}
            </span>
          );
        }

        // Animate each digit independently
        return (
          <div
            key={`digit-${index}`}
            className="relative inline-block overflow-hidden"
            style={{ width: "0.6em", height: "1.2em" }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${digit}-${index}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.5,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
