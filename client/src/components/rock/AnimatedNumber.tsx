import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { formatLargeNumber } from "../../utils/formatNumber";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  useShortFormat?: boolean;
}

/**
 * Animated number component with digit-by-digit slot machine effect
 * Each digit animates independently for a smooth, natural appearance
 */
export const AnimatedNumber = ({
  value,
  decimals = 2,
  className = "",
  useShortFormat = true,
}: AnimatedNumberProps) => {
  // Format number (with K, M, B for large numbers)
  const formattedValue = useMemo(() => {
    if (useShortFormat) {
      return formatLargeNumber(value, decimals);
    }
    return value.toFixed(decimals);
  }, [value, decimals, useShortFormat]);

  const digits = useMemo(() => formattedValue.split(""), [formattedValue]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {digits.map((digit, index) => {
        // Check if it's a digit
        const isDigit = /\d/.test(digit);
        // Check if it's a letter (K, M, B)
        const isLetter = /[A-Z]/i.test(digit);

        if (!isDigit && !isLetter) {
          // Render separators (. , etc) without animation
          return (
            <span
              key={`separator-${index}`}
              className="inline-block mx-0.5"
              style={{ width: "0.3em" }}
            >
              {digit}
            </span>
          );
        }

        if (isLetter) {
          // Render suffix letters (K, M, B) with fade animation
          return (
            <AnimatePresence mode="wait" key={`letter-${index}`}>
              <motion.span
                key={`${digit}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                }}
                className="inline-block ml-0.5 opacity-90"
                style={{ fontSize: "0.85em" }}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
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
