/**
 * Format numbers with thousand separators (commas)
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1,000,000.02")
 */
export const formatLargeNumber = (
  num: number,
  decimals: number = 2
): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Get responsive font size class based on number length
 * @param num - Number to check
 * @returns Tailwind class string
 */
export const getResponsiveFontSize = (num: number): string => {
  const formatted = formatLargeNumber(num, 2);
  // Remove separators to count actual digits
  const digitsOnly = formatted.replace(/[,.]/g, "");
  const length = digitsOnly.length;

  // Adjust based on actual digit count
  if (length <= 6) return "text-4xl"; // Up to 999,999.99
  if (length <= 8) return "text-3xl"; // Up to 99,999,999.99
  if (length <= 10) return "text-2xl"; // Up to 9,999,999,999.99
  if (length <= 12) return "text-xl"; // Up to 999,999,999,999.99
  return "text-lg"; // Larger numbers
};
