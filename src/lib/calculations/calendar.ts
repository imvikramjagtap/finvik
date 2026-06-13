import type { Expense } from '@/types';

export interface CalendarDay {
  date: string;
  amount: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 4=highest
}

export function calcCalendarHeatmap(expenses: Expense[], year: number): CalendarDay[] {
  const byDay = new Map<string, number>();
  for (const exp of expenses) {
    if (!exp.date.startsWith(String(year))) continue;
    byDay.set(exp.date, (byDay.get(exp.date) ?? 0) + exp.amount);
  }

  const amounts = Array.from(byDay.values());
  if (amounts.length === 0) {
    // Return all days with amount=0, level=0
    return generateAllDays(year).map(date => ({ date, amount: 0, level: 0 }));
  }

  const max = Math.max(...amounts);
  const q1 = max * 0.25;
  const q2 = max * 0.5;
  const q3 = max * 0.75;

  function getLevel(amount: number): 0 | 1 | 2 | 3 | 4 {
    if (amount === 0) return 0;
    if (amount <= q1) return 1;
    if (amount <= q2) return 2;
    if (amount <= q3) return 3;
    return 4;
  }

  return generateAllDays(year).map(date => {
    const amount = byDay.get(date) ?? 0;
    return { date, amount, level: getLevel(amount) };
  });
}

function generateAllDays(year: number): string[] {
  const days: string[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const current = new Date(start);
  while (current <= end) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return days;
}
