/**
 * Formats a number or string as currency with thousands separator
 * @param amount - Amount to format (string or number)
 * @param currency - Currency code (default: 'RWF')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: string | number,
  currency: string = 'RWF'
): string => {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      console.warn(`Invalid amount for formatting: ${amount}`);
      return `${currency} 0`;
    }

    const formatted = numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return `${currency} ${formatted}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} 0`;
  }
};

/**
 * Formats amount for compact display (e.g., 1.5K, 2.3M)
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Compact formatted string
 */
export const formatCompactCurrency = (
  amount: string | number,
  currency: string = 'RWF'
): string => {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return `${currency} 0`;
    }

    if (numericAmount >= 1_000_000) {
      return `${currency} ${(numericAmount / 1_000_000).toFixed(1)}M`;
    }

    if (numericAmount >= 1_000) {
      return `${currency} ${(numericAmount / 1_000).toFixed(1)}K`;
    }

    return formatCurrency(numericAmount, currency);
  } catch (error) {
    console.error('Error formatting compact currency:', error);
    return `${currency} 0`;
  }
};

/**
 * Parses a currency string back to a number
 * @param currencyString - Formatted currency string
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  try {
    const cleaned = currencyString.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};
