/**
 * Format date to a standardized string format
 * @param dateString - The date string to format
 * @param format - Optional format object (defaults to { month: 'short', day: 'numeric' })
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDate = (
  dateString: string | null | undefined,
  format?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', format || { month: 'short', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

/**
 * Format date and time to a standardized string format
 * @param dateString - The date string to format
 * @returns Formatted datetime string or 'N/A' if invalid
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};