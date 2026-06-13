// Core data types for FinVik app

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  paymentModeId: string;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  budgetType: 'Need' | 'Want' | 'Saving';
  icon?: string;
}

export interface PaymentMode {
  id: string;
  name: string;
}

export interface SalaryConfig {
  monthlySalary: number;
}

export interface BudgetRule {
  needPercent: number;
  wantPercent: number;
  savingPercent: number;
}

export interface WeeklyLimit {
  amount: number;
}

export interface AppSettings {
  salary: SalaryConfig;
  budgetRule: BudgetRule;
  weeklyLimit: WeeklyLimit;
}

export interface BudgetSummary {
  type: 'Need' | 'Want' | 'Saving';
  budget: number;
  spent: number;
  remaining: number;
  percent: number;
}

export interface WeekSummary {
  week: number;
  label: string;
  startDate: string;
  endDate: string;
  spent: number;
  limit: number;
  percentage: number;
  isOverspent: boolean;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  budgetType: 'Need' | 'Want' | 'Saving';
  amount: number;
  percentage: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}

export interface MonthlyBudgetScore {
  budgetUsedScore: number;
  savingsScore: number;
  weeklyAdherenceScore: number;
  total: number;
}
