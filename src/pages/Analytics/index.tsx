import React, { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcBudgetSummaries, getCurrentMonth } from '@/lib/calculations/budget';
import { calcCategoryBreakdown } from '@/lib/calculations/monthly';
import { calcMonthlyTrend, calcSpendingPercentages, calcTopCategories } from '@/lib/calculations/analytics';
import { getLast12Months, formatCurrency, cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';

const typeColors = { Need: '#38bdf8', Want: '#fbbf24', Saving: '#4ade80' };
const typeBadge = {
  Need: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  Want: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Saving: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
};

const tooltipStyle = {
  contentStyle: { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
  labelStyle: { color: 'hsl(var(--foreground))' },
  itemStyle: { color: 'hsl(var(--muted-foreground))' },
};

export default function Analytics() {
  const { expenses, categories, settings, privateMode } = useAppStore();
  const currentMonth = getCurrentMonth();
  const last12 = getLast12Months();

  const budgetSummaries = useMemo(() =>
    calcBudgetSummaries(expenses, categories, settings.salary.monthlySalary, settings.budgetRule, currentMonth),
    [expenses, categories, settings, currentMonth]
  );

  const monthlyTrend = useMemo(() =>
    calcMonthlyTrend(expenses, categories, last12),
    [expenses, categories, last12]
  );

  const categoryBreakdown = useMemo(() =>
    calcCategoryBreakdown(expenses, categories, currentMonth),
    [expenses, categories, currentMonth]
  );

  const percentages = useMemo(() =>
    calcSpendingPercentages(expenses, categories, currentMonth),
    [expenses, categories, currentMonth]
  );

  const topCategories = useMemo(() =>
    calcTopCategories(expenses, categories, currentMonth),
    [expenses, categories, currentMonth]
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-app-fg">Analytics</h1>
        <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Budget vs Actual · Trends · Breakdown</p>
      </div>

      {/* Budget vs Actual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgetSummaries.map((b, i) => (
          <div key={b.type} className={cn('rounded-2xl p-5 border glass-card animate-fade-in', {
            Need: 'need-bg', Want: 'want-bg', Saving: 'saving-bg',
          }[b.type])} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium" style={{ color: typeColors[b.type] }}>{b.type}</span>
              <span className="text-xs text-[hsl(215,20%,45%)]">{privateMode ? '•••%' : `${Math.round(b.percent)}%`}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[hsl(215,20%,45%)]">
                <span>Budget</span><span className="text-app-fg font-medium">{privateMode ? '••••' : formatCurrency(b.budget)}</span>
              </div>
              <div className="flex justify-between text-xs text-[hsl(215,20%,45%)]">
                <span>Spent</span><span className="font-medium" style={{ color: typeColors[b.type] }}>{formatCurrency(b.spent)}</span>
              </div>
              <div className="flex justify-between text-xs text-[hsl(215,20%,45%)]">
                <span>Remaining</span><span className="text-app-fg font-medium">{privateMode ? '••••' : formatCurrency(b.remaining)}</span>
              </div>
            </div>
            <div className="mt-3 w-full bg-app-muted border border-app-border/10 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: privateMode ? '0%' : `${Math.min(b.percent, 100)}%`, backgroundColor: typeColors[b.type] }} />
            </div>
          </div>
        ))}
      </div>

      {/* Spending % */}
      <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
        <h2 className="font-semibold text-app-fg mb-4">Spending Allocation This Month</h2>
        <div className="grid grid-cols-3 gap-4">
          {([['Need', percentages.need, '#38bdf8'], ['Want', percentages.want, '#fbbf24'], ['Saving', percentages.saving, '#4ade80']] as const).map(([type, pct, color]) => (
            <div key={type} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color }}>{pct}%</div>
              <div className="text-xs text-[hsl(215,20%,45%)]">{type}</div>
              <div className="mt-2 w-full bg-app-muted border border-app-border/10 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
        <h2 className="font-semibold text-app-fg mb-5">12-Month Spending Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => formatCurrency(Number(v || 0))} />
            <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-app-muted text-xs">{v}</span>} />
            <Line type="monotone" dataKey="need" name="Need" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="want" name="Want" stroke="#fbbf24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saving" name="Saving" stroke="#4ade80" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Bar */}
      <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
        <h2 className="font-semibold text-app-fg mb-5">Category Breakdown</h2>
        {categoryBreakdown.length === 0 ? (
          <p className="text-[hsl(215,20%,35%)] text-sm text-center py-8">No data for this month</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryBreakdown.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="categoryName" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => formatCurrency(Number(v || 0))} />
              <Bar dataKey="amount" name="Spent" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Categories Table */}
      <div className="rounded-2xl border border-app-border bg-app-card animate-fade-in">
        <div className="p-5 border-b border-app-border">
          <h2 className="font-semibold text-app-fg">Top Spending Categories</h2>
        </div>
        <div className="divide-y divide-app-border">
          {topCategories.length === 0 ? (
            <p className="text-[hsl(215,20%,35%)] text-sm text-center py-8">No data this month</p>
          ) : (
            topCategories.map((cat, i) => (
              <div key={cat.categoryId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-app-muted transition-colors">
                <span className="text-[hsl(215,20%,35%)] text-sm font-mono w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-app-fg truncate">{cat.categoryName}</span>
                    <span className={cn('inline-flex px-1.5 py-0.5 rounded-full text-xs border', typeBadge[cat.budgetType])}>{cat.budgetType}</span>
                  </div>
                  <div className="mt-1.5 w-full bg-app-muted border border-app-border/10 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: typeColors[cat.budgetType] }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-app-fg">{formatCurrency(cat.amount)}</p>
                  <p className="text-xs text-[hsl(215,20%,35%)]">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
