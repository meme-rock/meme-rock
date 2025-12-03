/**
 * Global number formatter with thousand separators (commas)
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "125,322.45" or "125,322" if .00)
 * @example
 * formatNumber(125322.45) => "125,322.45"
 * formatNumber(125322.00) => "125,322"
 * formatNumber(1000000, 0) => "1,000,000"
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  // Check if the number has meaningful decimal places
  const hasDecimals = num % 1 !== 0;

  // If no decimals or decimals is 0, format as integer
  if (!hasDecimals || decimals === 0) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  // Otherwise format with decimals
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format numbers with thousand separators (commas)
 * @deprecated Use formatNumber instead
 */
export const formatLargeNumber = formatNumber;

/**
 * Format number without decimals
 * @param num - Number to format
 * @returns Formatted string (e.g., "125,322")
 */
export const formatInteger = (num: number): string => {
  return formatNumber(num, 0);
};

/**
 * Get responsive font size class based on number length
 * @param num - Number to check
 * @returns Tailwind class string
 */
export const getResponsiveFontSize = (num: number): string => {
  const formatted = formatNumber(num, 2);
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
