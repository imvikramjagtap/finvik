import type { Expense, Category, CategoryBreakdown } from '@/types';
import { calcCategoryBreakdown } from './monthly';

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  spent: number;
  need: number;
  want: number;
  saving: number;
}

export function calcMonthlyTrend(
  expenses: Expense[],
  categories: Category[],
  months: string[]
): MonthlyTrendPoint[] {
  const catMap = new Map(categories.map(c => [c.id, c]));

  return months.map(month => {
    const monthExp = expenses.filter(e => e.date.startsWith(month));
    let need = 0, want = 0, saving = 0;
    for (const exp of monthExp) {
      const type = catMap.get(exp.categoryId)?.budgetType;
      if (type === 'Need') need += exp.amount;
      else if (type === 'Want') want += exp.amount;
      else if (type === 'Saving') saving += exp.amount;
    }
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    return { month, label, spent: need + want + saving, need, want, saving };
  });
}

export function calcSpendingPercentages(
  expenses: Expense[],
  categories: Category[],
  month: string
): { need: number; want: number; saving: number } {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const monthExp = expenses.filter(e => e.date.startsWith(month));
  const total = monthExp.reduce((acc, e) => acc + e.amount, 0);
  if (total === 0) return { need: 0, want: 0, saving: 0 };

  let need = 0, want = 0, saving = 0;
  for (const exp of monthExp) {
    const type = catMap.get(exp.categoryId)?.budgetType;
    if (type === 'Need') need += exp.amount;
    else if (type === 'Want') want += exp.amount;
    else if (type === 'Saving') saving += exp.amount;
  }

  return {
    need: Math.round((need / total) * 100),
    want: Math.round((want / total) * 100),
    saving: Math.round((saving / total) * 100),
  };
}

export function calcTopCategories(
  expenses: Expense[],
  categories: Category[],
  month: string
): CategoryBreakdown[] {
  return calcCategoryBreakdown(expenses, categories, month).slice(0, 5);
}
