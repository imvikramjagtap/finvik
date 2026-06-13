import React, { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BudgetCard } from '@/components/BudgetCard';
import { QuickAddExpense } from '@/components/QuickAddExpense';
import { calcBudgetSummaries, getCurrentMonth, getMonthLabel } from '@/lib/calculations/budget';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Wallet, TrendingDown, ArrowUpRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const PIE_COLORS = {
  Need: '#38bdf8',
  Want: '#fbbf24',
  Saving: '#4ade80',
};

export default function Dashboard() {
  const { expenses, categories, paymentModes, settings } = useAppStore();
  const currentMonth = getCurrentMonth();
  const monthLabel = getMonthLabel(currentMonth);
  const salary = settings.salary.monthlySalary;

  const budgetSummaries = useMemo(() =>
    calcBudgetSummaries(expenses, categories, salary, settings.budgetRule, currentMonth),
    [expenses, categories, salary, settings.budgetRule, currentMonth]
  );

  const totalSpent = useMemo(() =>
    budgetSummaries.reduce((acc, b) => acc + b.spent, 0),
    [budgetSummaries]
  );

  const recentExpenses = useMemo(() =>
    [...expenses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
    [expenses]
  );

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const pmMap = useMemo(() => new Map(paymentModes.map(p => [p.id, p])), [paymentModes]);

  const pieData = budgetSummaries
    .filter(b => b.spent > 0)
    .map(b => ({ name: b.type, value: b.spent }));

  const typeColors = { Need: 'text-sky-400', Want: 'text-amber-400', Saving: 'text-emerald-400' };
  const typeBgs = { Need: 'bg-sky-400/10 border-sky-400/20', Want: 'bg-amber-400/10 border-amber-400/20', Saving: 'bg-emerald-400/10 border-emerald-400/20' };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">{monthLabel}</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Personal Finance Dashboard</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Wallet className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-[hsl(215,20%,45%)]">Monthly Salary</span>
          </div>
          <p className="text-xl font-bold gradient-text">{formatCurrency(salary)}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="col-span-2 md:col-span-1 rounded-2xl p-4 border border-violet-500/20 bg-violet-500/10">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-violet-300">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-[hsl(215,20%,45%)] mt-1">{Math.round((totalSpent / salary) * 100)}% of salary</p>
        </div>
        <div className="rounded-2xl p-4 border border-[hsl(217,33%,20%)] bg-[hsl(222,47%,8%)]">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Remaining</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(Math.max(0, salary - totalSpent))}</p>
        </div>
        <div className="rounded-2xl p-4 border border-[hsl(217,33%,20%)] bg-[hsl(222,47%,8%)]">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Transactions</p>
          <p className="text-xl font-bold text-white">
            {expenses.filter(e => e.date.startsWith(currentMonth)).length}
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-[hsl(217,33%,20%)] bg-[hsl(222,47%,8%)]">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Avg/day</p>
          <p className="text-xl font-bold text-white">
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

      {/* Quick Add + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <QuickAddExpense />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-[hsl(217,33%,17%)] bg-[hsl(222,47%,8%)] p-6 animate-fade-in">
          <h2 className="font-semibold text-white text-base mb-4">Spending Breakdown</h2>
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
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,20%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(213,31%,91%)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: 'hsl(215,20%,65%)', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="rounded-2xl border border-[hsl(217,33%,17%)] bg-[hsl(222,47%,8%)] animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(217,33%,14%)]">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[hsl(215,20%,45%)]" />
            <h2 className="font-semibold text-white text-base">Recent Expenses</h2>
          </div>
          <a href="/expenses" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="divide-y divide-[hsl(217,33%,12%)]">
          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-[hsl(215,20%,35%)] text-sm">
              No expenses yet. Add your first one above!
            </div>
          ) : (
            recentExpenses.map(exp => {
              const cat = catMap.get(exp.categoryId);
              const pm = pmMap.get(exp.paymentModeId);
              return (
                <div key={exp.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[hsl(217,33%,11%)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm border', typeBgs[cat?.budgetType ?? 'Want'])}>
                      {cat?.budgetType === 'Need' ? '🏠' : cat?.budgetType === 'Saving' ? '💰' : '✨'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{exp.description}</p>
                      <p className="text-xs text-[hsl(215,20%,40%)] mt-0.5">
                        {cat?.name} · {pm?.name} · {formatDate(exp.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', typeColors[cat?.budgetType ?? 'Want'])}>
                      {formatCurrency(exp.amount)}
                    </p>
                    <p className="text-xs text-[hsl(215,20%,35%)] mt-0.5 capitalize">{cat?.budgetType}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
