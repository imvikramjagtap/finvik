import type { Expense, Category, DailySpend, CategoryBreakdown, MonthlyBudgetScore } from '@/types';
import { calcWeeklySummaries } from './weekly';
import { BudgetRule } from '@/types';

export function calcDailySpend(expenses: Expense[], month: string): DailySpend[] {
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();

  const byDay = new Map<string, number>();
  for (const exp of expenses.filter(e => e.date.startsWith(month))) {
    byDay.set(exp.date, (byDay.get(exp.date) ?? 0) + exp.amount);
  }

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const date = `${month}-${day}`;
    return { date, amount: byDay.get(date) ?? 0 };
  });
}

export function calcCategoryBreakdown(
  expenses: Expense[],
  categories: Category[],
  month: string
): CategoryBreakdown[] {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const monthExp = expenses.filter(e => e.date.startsWith(month));
  const total = monthExp.reduce((acc, e) => acc + e.amount, 0);

  const byCategory = new Map<string, number>();
  for (const exp of monthExp) {
    byCategory.set(exp.categoryId, (byCategory.get(exp.categoryId) ?? 0) + exp.amount);
  }

  return Array.from(byCategory.entries())
    .map(([catId, amount]) => {
      const cat = catMap.get(catId);
      return {
        categoryId: catId,
        categoryName: cat?.name ?? 'Unknown',
        budgetType: cat?.budgetType ?? 'Want',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function calcBudgetScore(
  expenses: Expense[],
  categories: Category[],
  salary: number,
  rule: BudgetRule,
  weeklyLimit: number,
  month: string
): MonthlyBudgetScore {
  const monthExp = expenses.filter(e => e.date.startsWith(month));
  const totalSpent = monthExp.reduce((acc, e) => acc + e.amount, 0);
  const totalBudget = salary;

  // Budget used score: better score if spent less than budget
  const budgetUsedPct = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const budgetUsedScore = Math.max(0, Math.min(40, Math.round((1 - budgetUsedPct) * 40)));

  // Savings score: how close to savings goal
  const catMap = new Map(categories.map(c => [c.id, c]));
  const savingSpent = monthExp
    .filter(e => catMap.get(e.categoryId)?.budgetType === 'Saving')
    .reduce((acc, e) => acc + e.amount, 0);
  const savingGoal = (salary * rule.savingPercent) / 100;
  const savingAchieved = savingGoal > 0 ? Math.min(1, savingSpent / savingGoal) : 0;
  const savingsScore = Math.round(savingAchieved * 40);

  // Weekly adherence
  const weeklySummaries = calcWeeklySummaries(expenses, month, weeklyLimit);
  const adherentWeeks = weeklySummaries.filter(w => !w.isOverspent).length;
  const weeklyAdherenceScore = weeklySummaries.length > 0
    ? Math.round((adherentWeeks / weeklySummaries.length) * 20)
    : 20;

  return {
    budgetUsedScore,
    savingsScore,
    weeklyAdherenceScore,
    total: budgetUsedScore + savingsScore + weeklyAdherenceScore,
  };
}
