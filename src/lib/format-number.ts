/**
 * Format large numbers with K/M suffixes for better readability
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "1.5M")
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num < 1000) {
    return num.toString()
  }
  
  if (num < 1000000) {
    const thousands = num / 1000
    return `${thousands.toFixed(decimals).replace(/\.0+$/, '')}K`
  }
  
  if (num < 1000000000) {
    const millions = num / 1000000
    return `${millions.toFixed(decimals).replace(/\.0+$/, '')}M`
  }
  
  const billions = num / 1000000000
  return `${billions.toFixed(decimals).replace(/\.0+$/, '')}B`
}

/**
 * Format beach length with appropriate unit (m/km)
 * @param lengthInMeters - Length in meters
 * @returns Formatted string with unit
 */
export function formatBeachLength(lengthInMeters: number): string {
  if (lengthInMeters < 1000) {
    return `${lengthInMeters}m`
  }
  
  const kilometers = lengthInMeters / 1000
  return `${kilometers.toFixed(1).replace(/\.0+$/, '')}km`
}