'use client';

import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Returns a relative date string in German based on the provided date string.
 *
 * @param dateString - The date string to be converted to a relative date.
 * @returns A string representing the relative date in German.
 *          - "heute" if the date is today.
 *          - "gestern" if the date is yesterday.
 *          - A relative time string (e.g., "vor 3 Tagen") if the date is neither today nor yesterday.
 */
export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'heute';
  if (isYesterday(date)) return 'gestern';
  return formatDistanceToNow(date, { addSuffix: true, locale: de });
};
