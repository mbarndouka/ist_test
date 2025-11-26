/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return 'Invalid Date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats date for display in cards (shorter format)
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatCardDate = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats date for timeline displays (with time)
 * @param dateString - ISO date string
 * @returns Formatted date string with time
 */
export const formatTimelineDate = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatCardDate(dateString);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return formatCardDate(dateString);
  }
};
