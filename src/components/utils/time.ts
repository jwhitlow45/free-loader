const MS_PER_MINUTE = 60000;
const MS_PER_HOUR = 3600000;
const MS_PER_DAY = 86400000;

// "Ends today" / "Ends tomorrow" / "Ends in 12 days", or null when there is
// no usable end date (e.g. the N/A dates on GOG giveaways)
export const describeEndDate = (endDate: string): string | null => {
  // deals end at the end of their listed day, local time
  const end = new Date(`${endDate}T23:59:59`);
  if (isNaN(end.getTime())) {
    return null;
  }
  const msLeft = end.getTime() - Date.now();
  if (msLeft < 0) {
    return 'Ended';
  }
  const daysLeft = Math.floor(msLeft / MS_PER_DAY);
  if (daysLeft === 0) {
    return 'Ends today';
  }
  if (daysLeft === 1) {
    return 'Ends tomorrow';
  }
  return `Ends in ${daysLeft} days`;
};

// "just now" / "5m ago" / "3h ago" / "2d ago", or null for missing or
// ancient timestamps (e.g. the epoch default before the first update)
export const describeTimeSince = (isoTimestamp: string): string | null => {
  const then = new Date(isoTimestamp).getTime();
  if (isNaN(then)) {
    return null;
  }
  const msAgo = Date.now() - then;
  if (msAgo < 0) {
    return null;
  }
  const days = Math.floor(msAgo / MS_PER_DAY);
  if (days > 30) {
    return null;
  }
  if (days >= 1) {
    return `${days}d ago`;
  }
  const hours = Math.floor(msAgo / MS_PER_HOUR);
  if (hours >= 1) {
    return `${hours}h ago`;
  }
  const minutes = Math.floor(msAgo / MS_PER_MINUTE);
  if (minutes >= 1) {
    return `${minutes}m ago`;
  }
  return 'just now';
};
