import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

/**
 * Format a Date or ISO timestamp into Ethiopian business-facing time (Africa/Addis_Ababa)
 */
export const formatEthiopianDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ETHIOPIA_CONSTANTS.timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
};

export const getEthiopianDateNow = (): string => {
  return formatEthiopianDateTime(new Date());
};
