import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Expense, Category, PaymentMode, AppSettings } from '@/types';
import { storageService } from '@/lib/storage';

// install uuid
interface AppStore {
  expenses: Expense[];
  categories: Category[];
  paymentModes: PaymentMode[];
  settings: AppSettings;

  // Actions
  loadAll: () => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  deleteExpenses: (ids: string[]) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  addPaymentMode: (mode: Omit<PaymentMode, 'id'>) => void;
  updatePaymentMode: (id: string, mode: Omit<PaymentMode, 'id'>) => void;
  deletePaymentMode: (id: string) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  privateMode: boolean;
  togglePrivateMode: () => void;

  onboarded: boolean;
  completeOnboarding: () => void;

  saveSettings: (settings: AppSettings) => void;

  importData: (json: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  expenses: [],
  categories: [],
  paymentModes: [],
  settings: storageService.getSettings(),
  theme: (localStorage.getItem('myfintech_theme') as 'light' | 'dark') || 'dark',
  privateMode: localStorage.getItem('myfintech_private_mode') === 'true',
  onboarded: localStorage.getItem('myfintech_onboarded') === 'true',

  loadAll: () => {
    const currentTheme = (localStorage.getItem('myfintech_theme') as 'light' | 'dark') || 'dark';
    if (currentTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({
      theme: currentTheme,
      privateMode: localStorage.getItem('myfintech_private_mode') === 'true',
      onboarded: localStorage.getItem('myfintech_onboarded') === 'true',
      expenses: storageService.getExpenses(),
      categories: storageService.getCategories(),
      paymentModes: storageService.getPaymentModes(),
      settings: storageService.getSettings(),
    });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('myfintech_theme', nextTheme);
    set({ theme: nextTheme });
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  },

  togglePrivateMode: () => {
    const next = !get().privateMode;
    localStorage.setItem('myfintech_private_mode', String(next));
    set({ privateMode: next });
  },

  completeOnboarding: () => {
    localStorage.setItem('myfintech_onboarded', 'true');
    set({ onboarded: true });
  },

  addExpense: (expenseData) => {
    const expense: Expense = {
      ...expenseData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    const expenses = [expense, ...get().expenses];
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  updateExpense: (id, expenseData) => {
    const expenses = get().expenses.map(e =>
      e.id === id ? { ...e, ...expenseData } : e
    );
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  deleteExpense: (id) => {
    const expenses = get().expenses.filter(e => e.id !== id);
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  deleteExpenses: (ids) => {
    const idSet = new Set(ids);
    const expenses = get().expenses.filter(e => !idSet.has(e.id));
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  addCategory: (catData) => {
    const category: Category = { ...catData, id: uuidv4() };
    const categories = [...get().categories, category];
    storageService.saveCategories(categories);
    set({ categories });
  },

  updateCategory: (id, catData) => {
    const categories = get().categories.map(c => c.id === id ? { ...c, ...catData } : c);
    storageService.saveCategories(categories);
    set({ categories });
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter(c => c.id !== id);
    storageService.saveCategories(categories);
    set({ categories });
  },

  addPaymentMode: (modeData) => {
    const mode: PaymentMode = { ...modeData, id: uuidv4() };
    const paymentModes = [...get().paymentModes, mode];
    storageService.savePaymentModes(paymentModes);
    set({ paymentModes });
  },

  updatePaymentMode: (id, modeData) => {
    const paymentModes = get().paymentModes.map(p => p.id === id ? { ...p, ...modeData } : p);
    storageService.savePaymentModes(paymentModes);
    set({ paymentModes });
  },

  deletePaymentMode: (id) => {
    const paymentModes = get().paymentModes.filter(p => p.id !== id);
    storageService.savePaymentModes(paymentModes);
    set({ paymentModes });
  },

  saveSettings: (settings) => {
    storageService.saveSettings(settings);
    set({ settings });
  },

  importData: (json) => {
    storageService.importJSON(json);
    get().loadAll();
  },
}));
