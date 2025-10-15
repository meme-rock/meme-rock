/**
 * Format large numbers with K, M, B suffixes
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export const formatLargeNumber = (
  num: number,
  decimals: number = 2
): string => {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absNum >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  } else if (absNum >= 10_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  } else {
    // For numbers under 10K, show with comma separator
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
};

/**
 * Get responsive font size class based on number length
 * @param num - Number to check
 * @returns Tailwind class string
 */
export const getResponsiveFontSize = (num: number): string => {
  const formatted = formatLargeNumber(num, 2);
  const length = formatted.length;

  if (length <= 8) return "text-4xl";
  if (length <= 10) return "text-3xl";
  if (length <= 12) return "text-2xl";
  return "text-xl";
};
