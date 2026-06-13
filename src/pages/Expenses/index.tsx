import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ExpenseDialog } from '@/components/ExpenseDialog';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Plus, Search, Trash2, Edit2, Filter, ChevronDown } from 'lucide-react';
import type { Expense } from '@/types';

export default function Expenses() {
  const { expenses, categories, paymentModes, deleteExpense } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMode, setFilterPaymentMode] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const pmMap = useMemo(() => new Map(paymentModes.map(p => [p.id, p])), [paymentModes]);

  const filtered = useMemo(() => {
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

  const totalFiltered = useMemo(() => filtered.reduce((acc, e) => acc + e.amount, 0), [filtered]);

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

  function handleAdd() {
    setEditingExpense(undefined);
    setDialogOpen(true);
  }

  const inputCls = 'bg-app-muted border border-app-border rounded-lg px-3 py-2 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50';
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">Expenses</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">{filtered.length} transactions · {formatCurrency(totalFiltered)}</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-app-border bg-app-card p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[hsl(215,20%,45%)]" />
          <span className="text-sm font-medium text-[hsl(215,20%,55%)]">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(215,20%,35%)]" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-app-muted border border-app-border rounded-lg pl-8 pr-3 py-2 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[hsl(215,20%,30%)]" />
          </div>
          <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className={inputCls} placeholder="From" />
          <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className={inputCls} placeholder="To" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id} className="bg-app-card text-app-fg">{c.name}</option>)}
          </select>
          <select value={filterPaymentMode} onChange={e => setFilterPaymentMode(e.target.value)} className={selectCls}>
            <option value="">All Payments</option>
            {paymentModes.map(p => <option key={p.id} value={p.id} className="bg-app-card text-app-fg">{p.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
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

      {/* Table */}
      <div className="rounded-2xl border border-app-border bg-app-card overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border">
                {['Date', 'Description', 'Category', 'Amount', 'Payment', 'Type', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[hsl(215,20%,40%)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[hsl(215,20%,35%)] text-sm">
                    No expenses found. {expenses.length === 0 ? 'Add your first expense!' : 'Try adjusting the filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map(exp => {
                  const cat = catMap.get(exp.categoryId);
                  const pm = pmMap.get(exp.paymentModeId);
                  const budgetType = cat?.budgetType ?? 'Want';
                  return (
                    <tr key={exp.id} className="border-b border-app-border hover:bg-app-muted transition-colors">
                      <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{formatDate(exp.date)}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-app-fg font-medium">{exp.description}</p>
                        {exp.notes && <p className="text-xs text-[hsl(215,20%,35%)] mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{cat?.name ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn('text-sm font-semibold', typeColors[budgetType])}>{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,55%)] whitespace-nowrap">{pm?.name ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium border', typeBadge[budgetType])}>
                          {budgetType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
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
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <ExpenseDialog
          expense={editingExpense}
          onClose={() => { setDialogOpen(false); setEditingExpense(undefined); }}
        />
      )}
    </div>
  );
}
