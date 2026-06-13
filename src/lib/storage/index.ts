import type { Expense, Category, PaymentMode, AppSettings } from '@/types';

const KEYS = {
  EXPENSES: 'myfintech_expenses',
  CATEGORIES: 'myfintech_categories',
  PAYMENT_MODES: 'myfintech_payment_modes',
  SETTINGS: 'myfintech_settings',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Housing & Utilities', budgetType: 'Need' },
  { id: 'cat_2', name: 'Groceries', budgetType: 'Need' },
  { id: 'cat_3', name: 'Transport', budgetType: 'Need' },
  { id: 'cat_4', name: 'Healthcare', budgetType: 'Need' },
  { id: 'cat_5', name: 'Insurance', budgetType: 'Need' },
  { id: 'cat_6', name: 'Dining Out', budgetType: 'Want' },
  { id: 'cat_7', name: 'Entertainment', budgetType: 'Want' },
  { id: 'cat_8', name: 'Shopping', budgetType: 'Want' },
  { id: 'cat_9', name: 'Travel', budgetType: 'Want' },
  { id: 'cat_10', name: 'Subscriptions', budgetType: 'Want' },
  { id: 'cat_11', name: 'Investments', budgetType: 'Saving' },
  { id: 'cat_12', name: 'Emergency Fund', budgetType: 'Saving' },
  { id: 'cat_13', name: 'Retirement', budgetType: 'Saving' },
];

const DEFAULT_PAYMENT_MODES: PaymentMode[] = [
  { id: 'pm_1', name: 'UPI' },
  { id: 'pm_2', name: 'Cash' },
  { id: 'pm_3', name: 'Credit Card' },
  { id: 'pm_4', name: 'Debit Card' },
  { id: 'pm_5', name: 'Bank Transfer' },
];

const DEFAULT_SETTINGS: AppSettings = {
  salary: { monthlySalary: 100000 },
  budgetRule: { needPercent: 50, wantPercent: 30, savingPercent: 20 },
  weeklyLimit: { amount: 10000 },
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Expenses
export const storageService = {
  getExpenses: (): Expense[] => getItem<Expense[]>(KEYS.EXPENSES, []),
  saveExpenses: (expenses: Expense[]): void => setItem(KEYS.EXPENSES, expenses),

  getCategories: (): Category[] => {
    const stored = getItem<Category[]>(KEYS.CATEGORIES, []);
    return stored.length > 0 ? stored : DEFAULT_CATEGORIES;
  },
  saveCategories: (categories: Category[]): void => setItem(KEYS.CATEGORIES, categories),

  getPaymentModes: (): PaymentMode[] => {
    const stored = getItem<PaymentMode[]>(KEYS.PAYMENT_MODES, []);
    return stored.length > 0 ? stored : DEFAULT_PAYMENT_MODES;
  },
  savePaymentModes: (modes: PaymentMode[]): void => setItem(KEYS.PAYMENT_MODES, modes),

  getSettings: (): AppSettings => getItem<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings): void => setItem(KEYS.SETTINGS, settings),

  exportJSON: (): string => {
    return JSON.stringify({
      expenses: storageService.getExpenses(),
      categories: storageService.getCategories(),
      paymentModes: storageService.getPaymentModes(),
      settings: storageService.getSettings(),
    }, null, 2);
  },

  exportCSV: (): string => {
    const expenses = storageService.getExpenses();
    const categories = storageService.getCategories();
    const paymentModes = storageService.getPaymentModes();
    
    const catMap = new Map(categories.map(c => [c.id, c]));
    const pmMap = new Map(paymentModes.map(p => [p.id, p]));
    
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Budget Type', 'Payment Mode', 'Notes'];
    const rows = expenses.map(e => [
      e.date,
      `"${e.description}"`,
      e.amount,
      catMap.get(e.categoryId)?.name ?? e.categoryId,
      catMap.get(e.categoryId)?.budgetType ?? '',
      pmMap.get(e.paymentModeId)?.name ?? e.paymentModeId,
      `"${e.notes ?? ''}"`,
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  importJSON: (jsonStr: string): void => {
    const data = JSON.parse(jsonStr);
    if (data.expenses) setItem(KEYS.EXPENSES, data.expenses);
    if (data.categories) setItem(KEYS.CATEGORIES, data.categories);
    if (data.paymentModes) setItem(KEYS.PAYMENT_MODES, data.paymentModes);
    if (data.settings) setItem(KEYS.SETTINGS, data.settings);
  },
};
