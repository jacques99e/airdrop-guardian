import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with commas and limit decimals to 2 places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatNumber(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format large numbers with K, M, B suffixes
 * @param value - Number to format
 * @returns Formatted string with suffix
 */
export function formatCompactNumber(value: number): string {
  if (isNaN(value)) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  }
  if (absValue >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  }
  if (absValue >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K';
  }
  
  return formatNumber(value);
}

/**
 * Format token balance with appropriate decimal places
 * @param balance - Token balance
 * @param decimals - Token decimals
 * @returns Formatted balance string
 */
export function formatTokenBalance(balance: number, decimals: number): string {
  if (balance === 0) return '0.00';
  
  // For very small balances, show more decimals
  if (balance < 0.01) {
    const significantDecimals = Math.min(decimals, 6);
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: significantDecimals
    });
  }
  
  // For normal balances, show 2 decimals
  return formatNumber(balance, 2);
}