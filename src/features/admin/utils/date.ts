export const parseAdminApiDate = (value?: string | number | Date | null): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const directDate = new Date(trimmedValue);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const sqlLikeDateMatch = trimmedValue.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d+)?)(?:\s*(Z|[+-]\d{2}:?\d{2}))?$/i
  );

  if (!sqlLikeDateMatch) {
    return null;
  }

  const [, datePart, timePart, timeZonePart] = sqlLikeDateMatch;
  const normalizedTimeZone = timeZonePart && timeZonePart !== 'Z'
    ? `${timeZonePart.slice(0, 3)}:${timeZonePart.slice(-2)}`
    : timeZonePart ?? '';
  const normalizedDate = new Date(`${datePart}T${timePart}${normalizedTimeZone}`);

  return Number.isNaN(normalizedDate.getTime()) ? null : normalizedDate;
};
