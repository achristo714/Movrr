import {
  addDays,
  differenceInDays,
  parseISO,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';

export {
  addDays,
  differenceInDays,
  parseISO,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
};

export function getTimelineRange(moveOutDate: string, moveInDate: string) {
  const moveOut = parseISO(moveOutDate);
  const moveIn = parseISO(moveInDate);

  // Show 4 weeks before move-out to 2 weeks after move-in
  const start = startOfWeek(addDays(moveOut, -28), { weekStartsOn: 0 });
  const end = endOfWeek(addDays(moveIn, 14), { weekStartsOn: 0 });

  return { start, end, days: eachDayOfInterval({ start, end }) };
}

export function dateToCol(date: Date, timelineStart: Date): number {
  return differenceInDays(date, timelineStart);
}

export function clampDate(dateStr: string, minStr: string, maxStr: string): string {
  const d = parseISO(dateStr);
  const min = parseISO(minStr);
  const max = parseISO(maxStr);
  if (isBefore(d, min)) return minStr;
  if (isBefore(max, d)) return maxStr;
  return dateStr;
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}
