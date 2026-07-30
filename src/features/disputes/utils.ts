
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

/**
 * Calculates the total duration in days of all milestones for a project.
 * Uses dueDays (Project view) or calculates from startDate and max dueDate (Admin view).
 */
export const calculateTotalMilestoneDays = (
  milestones?: { dueDays?: number | null; dueDate?: string | null }[] | null,
  projectStartDate?: string | null
): number => {
  if (!milestones || milestones.length === 0) return 0;

  // 1. If we have explicit dueDays from the API, use them
  if (milestones.some(m => typeof m.dueDays === 'number')) {
    return milestones.reduce((total, m) => total + (m.dueDays || 0), 0);
  }

  // 2. Fallback for Admin view which only has dueDate
  if (projectStartDate) {
    const start = new Date(projectStartDate).getTime();
    if (Number.isNaN(start)) return 0;

    let maxDue = start;
    for (const m of milestones) {
      if (m.dueDate) {
        const time = new Date(m.dueDate).getTime();
        if (!Number.isNaN(time) && time > maxDue) {
          maxDue = time;
        }
      }
    }
    return Math.max(0, Math.ceil((maxDue - start) / 86400000));
  }

  return 0;
};

/**
 * Calculates the auto-close date for a dispute based on the total milestone days.
 */
export const calculateDisputeAutoCloseDate = (createdAt: string, totalDays: number): Date => {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + totalDays);
  return date;
};
