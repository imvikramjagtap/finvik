import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BudgetCard } from '@/components/BudgetCard';
import { QuickAddExpense } from '@/components/QuickAddExpense';
import { ExpenseDialog } from '@/components/ExpenseDialog';
import { calcBudgetSummaries, getCurrentMonth, getMonthLabel } from '@/lib/calculations/budget';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Wallet, TrendingDown, Search, Trash2, Edit2, Filter, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Expense } from '@/types';

const PIE_COLORS = {
  Need: '#38bdf8',
  Want: '#fbbf24',
  Saving: '#4ade80',
};

export default function Dashboard() {
  const { expenses, categories, paymentModes, settings, deleteExpense, privateMode } = useAppStore();
  const currentMonth = getCurrentMonth();
  const monthLabel = getMonthLabel(currentMonth);
  const salary = settings.salary.monthlySalary;

  // Filter states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMode, setFilterPaymentMode] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const budgetSummaries = useMemo(() =>
    calcBudgetSummaries(expenses, categories, salary, settings.budgetRule, currentMonth),
    [expenses, categories, salary, settings.budgetRule, currentMonth]
  );

  const totalSpent = useMemo(() =>
    budgetSummaries.reduce((acc, b) => acc + b.spent, 0),
    [budgetSummaries]
  );

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const pmMap = useMemo(() => new Map(paymentModes.map(p => [p.id, p])), [paymentModes]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory && e.categoryId !== filterCategory) return false;
        if (filterPaymentMode && e.paymentModeId !== filterPaymentMode) return false;
        if (filterType && catMap.get(e.categoryId)?.budgetType !== filterType) return false;
        if (filterStart && e.date < filterStart) return false;
        if (filterEnd && e.date > filterEnd) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, filterCategory, filterPaymentMode, filterType, filterStart, filterEnd, catMap]);

  const totalFiltered = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.amount, 0), [filteredExpenses]);

  const pieData = budgetSummaries
    .filter(b => b.spent > 0)
    .map(b => ({ name: b.type, value: b.spent }));

  const typeColors = { Need: 'text-sky-400', Want: 'text-amber-400', Saving: 'text-emerald-400' };
  const typeBadge = { Need: 'bg-sky-400/10 text-sky-400 border-sky-400/20', Want: 'bg-amber-400/10 text-amber-400 border-amber-400/20', Saving: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' };

  function handleEdit(exp: Expense) {
    setEditingExpense(exp);
    setDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteExpense(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  const inputCls = 'bg-app-muted border border-app-border rounded-lg px-3 py-2 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50';
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">{monthLabel}</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Personal Finance Dashboard</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Wallet className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-[hsl(215,20%,45%)]">Monthly Salary</span>
          </div>
          <p className="text-xl font-bold gradient-text">{privateMode ? '••••' : formatCurrency(salary)}</p>
        </div>
      </div>

      {/* Quick Add + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <QuickAddExpense />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
          <h2 className="font-semibold text-app-fg text-base mb-4">Spending Breakdown</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[hsl(215,20%,35%)] text-sm">
              No expenses this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-app-muted text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="col-span-2 md:col-span-1 rounded-2xl p-4 border border-violet-500/20 bg-violet-500/10">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-300">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-[hsl(215,20%,45%)] mt-1">
            {Math.round((totalSpent / salary) * 100)}% of salary
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Remaining</p>
          <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
            {privateMode ? '••••' : formatCurrency(Math.max(0, salary - totalSpent))}
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Transactions</p>
          <p className="text-xl font-bold text-app-fg">
            {expenses.filter(e => e.date.startsWith(currentMonth)).length}
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Avg/day</p>
          <p className="text-xl font-bold text-app-fg">
            {formatCurrency(Math.round(totalSpent / new Date().getDate()))}
          </p>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgetSummaries.map((b, i) => (
          <div key={b.type} style={{ animationDelay: `${0.1 * i}s` }}>
            <BudgetCard {...b} />
          </div>
        ))}
      </div>

      {/* Filterable Transaction Ledger */}
      <div className="rounded-2xl border border-app-border bg-app-card animate-fade-in space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-2 border-b border-app-border gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[hsl(215,20%,45%)]" />
            <h2 className="font-semibold text-app-fg text-base">Expense Ledger</h2>
          </div>
          <div className="text-xs text-[hsl(215,20%,45%)] font-medium">
            Showing {filteredExpenses.length} transactions · Total: <span className="text-violet-600 dark:text-violet-300 font-bold">{formatCurrency(totalFiltered)}</span>
          </div>
        </div>

        {/* Ledger Filters */}
        <div className="px-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(215,20%,35%)]" />
              <input type="text" placeholder="Search description..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-app-muted border border-app-border rounded-lg pl-8 pr-3 py-2 text-xs text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[hsl(215,20%,30%)]" />
            </div>
            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className={cn(inputCls, 'text-xs')} placeholder="From" />
            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className={cn(inputCls, 'text-xs')} placeholder="To" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={cn(selectCls, 'text-xs')}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id} className="bg-app-card text-app-fg">{c.name}</option>)}
            </select>
            <select value={filterPaymentMode} onChange={e => setFilterPaymentMode(e.target.value)} className={cn(selectCls, 'text-xs')}>
              <option value="">All Payments</option>
              {paymentModes.map(p => <option key={p.id} value={p.id} className="bg-app-card text-app-fg">{p.name}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className={cn(selectCls, 'text-xs')}>
              <option value="">All Types</option>
              <option value="Need" className="bg-app-card text-app-fg">Need</option>
              <option value="Want" className="bg-app-card text-app-fg">Want</option>
              <option value="Saving" className="bg-app-card text-app-fg">Saving</option>
            </select>
          </div>
          {(search || filterCategory || filterPaymentMode || filterType || filterStart || filterEnd) && (
            <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterPaymentMode(''); setFilterType(''); setFilterStart(''); setFilterEnd(''); }}
              className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Clear filters
            </button>
          )}
        </div>

        {/* Transaction Table / List */}
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border bg-app-muted/30">
                {['Date', 'Description', 'Category', 'Amount', 'Payment', 'Type', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[hsl(215,20%,40%)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[hsl(215,20%,35%)] text-sm">
                    No transactions found. {expenses.length === 0 ? 'Use the wizard above to add your first expense!' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => {
                  const cat = catMap.get(exp.categoryId);
                  const pm = pmMap.get(exp.paymentModeId);
                  const budgetType = cat?.budgetType ?? 'Want';
                  return (
                    <tr key={exp.id} className="border-b border-app-border hover:bg-app-muted transition-colors">
                      <td className="px-5 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{formatDate(exp.date)}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-app-fg font-medium">{exp.description}</p>
                        {exp.notes && <p className="text-xs text-[hsl(215,20%,35%)] mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{cat?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-sm font-semibold', typeColors[budgetType])}>{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{pm?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border', typeBadge[budgetType])}>
                          {budgetType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(exp)}
                            className="w-7 h-7 rounded-lg bg-app-muted border border-app-border flex items-center justify-center hover:bg-violet-500/20 hover:text-violet-400 text-app-fg transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(exp.id)}
                            className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all text-app-fg',
                              confirmDelete === exp.id
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                : 'bg-app-muted border border-app-border hover:bg-red-500/20 hover:text-red-400')}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-app-border px-5 pb-4">
          {filteredExpenses.length === 0 ? (
            <div className="py-8 text-center text-[hsl(215,20%,35%)] text-sm">
              No transactions found.
            </div>
          ) : (
            filteredExpenses.map(exp => {
              const cat = catMap.get(exp.categoryId);
              const pm = pmMap.get(exp.paymentModeId);
              const budgetType = cat?.budgetType ?? 'Want';
              return (
                <div key={exp.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0',
                      budgetType === 'Need' ? 'bg-sky-500/10 text-sky-400' : budgetType === 'Saving' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    )}>
                      {budgetType === 'Need' ? '🏠' : budgetType === 'Saving' ? '💰' : '✨'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-app-fg truncate">{exp.description}</p>
                      <p className="text-xs text-[hsl(215,20%,45%)] mt-0.5">
                        {formatDate(exp.date)} · {cat?.name} · {pm?.name}
                      </p>
                      {exp.notes && (
                        <p className="text-[10px] text-[hsl(215,20%,35%)] italic mt-1 bg-app-muted/50 px-2 py-0.5 rounded border border-app-border/10 inline-block truncate max-w-full">
                          {exp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={cn('text-sm font-bold', typeColors[budgetType])}>
                      {formatCurrency(exp.amount)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEdit(exp)}
                        className="w-7 h-7 rounded-lg bg-app-muted flex items-center justify-center text-app-fg border border-app-border hover:bg-violet-500/20 hover:text-violet-400 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)}
                        className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-all text-app-fg',
                          confirmDelete === exp.id
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                            : 'bg-app-muted border border-app-border hover:bg-red-500/20 hover:text-red-400')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog for Edit */}
      {dialogOpen && (
        <ExpenseDialog
          expense={editingExpense}
          onClose={() => { setDialogOpen(false); setEditingExpense(undefined); }}
        />
      )}
    </div>
  );
}
