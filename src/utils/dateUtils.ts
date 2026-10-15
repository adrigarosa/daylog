import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.locale('es');
dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const TODAY = () => dayjs().format('YYYY-MM-DD');

export function formatDayLabel(dateStr: string): string {
  const d = dayjs(dateStr);
  const todayStr = TODAY();
  const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

  if (dateStr === todayStr) return `Hoy · ${d.format('dddd D MMM')}`;
  if (dateStr === yesterdayStr) return `Ayer · ${d.format('dddd D MMM')}`;
  if (dateStr === tomorrowStr) return `Mañana · ${d.format('dddd D MMM')}`;
  return d.format('dddd D [de] MMMM');
}

export function formatMonthLabel(year: number, month: number): string {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY');
}

export function isToday(dateStr: string): boolean {
  return dateStr === TODAY();
}

export function isFuture(dateStr: string): boolean {
  return dateStr > TODAY();
}

export function addDays(dateStr: string, n: number): string {
  return dayjs(dateStr).add(n, 'day').format('YYYY-MM-DD');
}

export function startOfMonth(year: number, month: number): string {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM-DD');
}

export function endOfMonth(year: number, month: number): string {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
    .endOf('month')
    .format('YYYY-MM-DD');
}

export function daysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
}

export function firstWeekdayOfMonth(year: number, month: number): number {
  const day = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).day();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function toDateObj(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

export function fromDateObj(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}
