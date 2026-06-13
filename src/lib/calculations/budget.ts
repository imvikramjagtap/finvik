import type { Expense, Category, BudgetSummary, BudgetRule } from '@/types';

export function calcBudgetSummaries(
  expenses: Expense[],
  categories: Category[],
  salary: number,
  rule: BudgetRule,
  month: string // format: 'YYYY-MM'
): BudgetSummary[] {
  const catMap = new Map(categories.map(c => [c.id, c]));

  const monthExpenses = expenses.filter(e => e.date.startsWith(month));

  const spent = { Need: 0, Want: 0, Saving: 0 };
  for (const exp of monthExpenses) {
    const cat = catMap.get(exp.categoryId);
    if (cat) spent[cat.budgetType] += exp.amount;
  }

  const budgets = {
    Need: (salary * rule.needPercent) / 100,
    Want: (salary * rule.wantPercent) / 100,
    Saving: (salary * rule.savingPercent) / 100,
  };

  return (['Need', 'Want', 'Saving'] as const).map(type => ({
    type,
    budget: budgets[type],
    spent: spent[type],
    remaining: Math.max(0, budgets[type] - spent[type]),
    percent: budgets[type] > 0 ? Math.min(100, (spent[type] / budgets[type]) * 100) : 0,
  }));
}

export function calcTotalSpent(expenses: Expense[], month: string): number {
  return expenses
    .filter(e => e.date.startsWith(month))
    .reduce((acc, e) => acc + e.amount, 0);
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
