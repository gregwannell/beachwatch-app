/**
 * Text formatting utilities for region stats
 */

/**
 * Get the ordinal suffix for a ranking number
 * @param rank - The ranking number (1, 2, 3, etc.)
 * @returns The suffix ("st", "nd", "rd", "th")
 */
export function getRankingSuffix(rank: number): string {
  if (rank === 1) return "st"
  if (rank === 2) return "nd"
  if (rank === 3) return "rd"
  return "th"
}

/**
 * Format a ranking text based on statistics
 * @param stats - Historical statistics object
 * @returns Formatted ranking text
 */
export function getRankingText(stats: {
  isBestEver: boolean
  isWorstEver: boolean
  ranking: number
  totalYears: number
}): string {
  if (stats.isBestEver) {
    return "Best year in the last 10 years"
  }
  if (stats.isWorstEver) {
    return "Highest levels in the last 10 years"
  }

  // For other rankings, show whichever is more meaningful
  // If in the better half, show "best", otherwise show "worst"
  const midpoint = Math.ceil(stats.totalYears / 2)

  if (stats.ranking <= midpoint) {
    // Show as "best"
    const suffix = getRankingSuffix(stats.ranking)
    return `${stats.ranking}${suffix} best year in the last 10 years`
  } else {
    // Show as "worst" (calculate from the other end)
    const worstRanking = stats.totalYears - stats.ranking + 1
    const suffix = getRankingSuffix(worstRanking)
    return `${worstRanking}${suffix} worst year in the last 10 years`
  }
}
