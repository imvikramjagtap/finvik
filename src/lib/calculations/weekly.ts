import type { Expense, WeekSummary } from '@/types';

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeeksInMonth(year: number, month: number): { start: Date; end: Date }[] {
  const weeks: { start: Date; end: Date }[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  let current = new Date(firstDay);
  while (current <= lastDay) {
    const weekStart = new Date(current);
    // end of week (Saturday or end of month)
    const daysUntilEndOfWeek = 6 - current.getDay();
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + daysUntilEndOfWeek);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

    weeks.push({ start: weekStart, end: weekEnd });
    current.setDate(weekEnd.getDate() + 1);
  }
  return weeks;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateLabel(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const e = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${s} – ${e}`;
}

export function calcWeeklySummaries(
  expenses: Expense[],
  month: string, // 'YYYY-MM'
  weeklyLimit: number
): WeekSummary[] {
  const [year, m] = month.split('-').map(Number);
  const weeks = getWeeksInMonth(year, m);

  return weeks.map((w, idx) => {
    const startStr = toDateStr(w.start);
    const endStr = toDateStr(w.end);
    const weekExpenses = expenses.filter(e => e.date >= startStr && e.date <= endStr);
    const spent = weekExpenses.reduce((acc, e) => acc + e.amount, 0);
    const percentage = weeklyLimit > 0 ? (spent / weeklyLimit) * 100 : 0;
    return {
      week: idx + 1,
      label: dateLabel(w.start, w.end),
      startDate: startStr,
      endDate: endStr,
      spent,
      limit: weeklyLimit,
      percentage,
      isOverspent: spent > weeklyLimit,
    };
  });
}

export function calcWeeklyTrendForYear(
  expenses: Expense[],
  year: number,
  weeklyLimit: number
): { week: number; spent: number; limit: number }[] {
  const byWeek = new Map<number, number>();
  for (const exp of expenses) {
    if (!exp.date.startsWith(String(year))) continue;
    const d = new Date(exp.date);
    const wn = getWeekNumber(d);
    byWeek.set(wn, (byWeek.get(wn) ?? 0) + exp.amount);
  }
  return Array.from(byWeek.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, spent]) => ({ week, spent, limit: weeklyLimit }));
}
