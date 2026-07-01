/**
 * Sanitizes dispute-related error messages for display to users.
 * Prevents raw API/internal errors from leaking to the UI.
 */
export const sanitizeDisputeError = (error: unknown, defaultMessage = 'Unable to create dispute. Please check your information and try again.'): string => {
  if (!error) return defaultMessage;

  // Extract message from Axios error or Error object
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    || (error as Error).message;

  if (!message) return defaultMessage;

  /**
   * List of "safe" validation-style messages that are controlled and
   * suitable for end-user display.
   */
  const safePatterns = [
    /reason is required/i,
    /description is required/i,
    /milestone is required/i,
    /already has a dispute/i,
    /invalid milestone/i,
    /not authorized/i,
    /completed milestone/i,
    /milestone.*completed/i,
    /complete.*milestone/i,
    /cannot.*dispute/i,
    /can not.*dispute/i,
    /cannot.*open/i,
    /can not.*open/i,
  ];

  // If the message matches a known safe pattern, return it
  if (safePatterns.some(pattern => pattern.test(message))) {
    return message;
  }

  // Otherwise, return the safe generic default message
  return defaultMessage;
};
