import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcDailySpend, calcCategoryBreakdown, calcBudgetScore } from '@/lib/calculations/monthly';
import { getCurrentMonth, getMonthLabel, formatCurrency, cn } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const tooltipStyle = {
  contentStyle: { backgroundColor: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,20%)', borderRadius: '8px' },
  labelStyle: { color: 'hsl(213,31%,91%)' },
};

const typeColors = { Need: '#38bdf8', Want: '#fbbf24', Saving: '#4ade80' };
const typeBadge = {
  Need: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  Want: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  Saving: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
};

export default function Monthly() {
  const { expenses, categories, settings } = useAppStore();
  const [month, setMonth] = useState(getCurrentMonth());

  const dailySpend = useMemo(() => calcDailySpend(expenses, month), [expenses, month]);
  const categoryBreakdown = useMemo(() => calcCategoryBreakdown(expenses, categories, month), [expenses, categories, month]);
  const budgetScore = useMemo(() =>
    calcBudgetScore(expenses, categories, settings.salary.monthlySalary, settings.budgetRule, settings.weeklyLimit.amount, month),
    [expenses, categories, settings, month]
  );

  const totalSpent = useMemo(() => dailySpend.reduce((acc, d) => acc + d.amount, 0), [dailySpend]);

  const scoreColor = budgetScore.total >= 75 ? 'text-emerald-400' : budgetScore.total >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreLabel = budgetScore.total >= 75 ? 'Excellent' : budgetScore.total >= 50 ? 'Good' : 'Needs Work';

  // Format daily spend for chart
  const chartData = dailySpend.map(d => ({
    day: parseInt(d.date.split('-')[2]),
    amount: d.amount,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Monthly Analysis</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Total spent: {formatCurrency(totalSpent)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(m => addMonths(m, -1))}
            className="w-8 h-8 rounded-lg bg-[hsl(217,33%,14%)] flex items-center justify-center hover:bg-[hsl(217,33%,20%)] text-[hsl(215,20%,55%)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white min-w-[140px] text-center">{getMonthLabel(month)}</span>
          <button onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg bg-[hsl(217,33%,14%)] flex items-center justify-center hover:bg-[hsl(217,33%,20%)] text-[hsl(215,20%,55%)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Budget Score */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-base">Budget Score</h2>
            <p className="text-xs text-[hsl(215,20%,45%)] mt-0.5">Based on spending habits</p>
          </div>
          <div className="text-right">
            <div className={cn('text-4xl font-bold', scoreColor)}>{budgetScore.total}</div>
            <div className={cn('text-sm font-medium', scoreColor)}>{scoreLabel}</div>
            <div className="text-xs text-[hsl(215,20%,35%)]">/100</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Budget Usage', score: budgetScore.budgetUsedScore, max: 40 },
            { label: 'Savings', score: budgetScore.savingsScore, max: 40 },
            { label: 'Weekly Adherence', score: budgetScore.weeklyAdherenceScore, max: 20 },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[hsl(215,20%,45%)]">{s.label}</span>
                <span className="text-white font-medium">{s.score}/{s.max}</span>
              </div>
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full bg-violet-400 transition-all duration-700" style={{ width: `${(s.score / s.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Spend Chart */}
      <div className="rounded-2xl border border-[hsl(217,33%,17%)] bg-[hsl(222,47%,8%)] p-6 animate-fade-in">
        <h2 className="font-semibold text-white mb-5">Daily Spending</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,14%)" />
            <XAxis dataKey="day" tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} labelFormatter={v => `Day ${v}`} />
            <Area type="monotone" dataKey="amount" name="Spent" stroke="#8b5cf6" strokeWidth={2} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-2xl border border-[hsl(217,33%,17%)] bg-[hsl(222,47%,8%)] animate-fade-in">
        <div className="p-5 border-b border-[hsl(217,33%,14%)]">
          <h2 className="font-semibold text-white">Category Breakdown</h2>
        </div>
        {categoryBreakdown.length === 0 ? (
          <p className="text-[hsl(215,20%,35%)] text-sm text-center py-8">No expenses this month</p>
        ) : (
          <div className="divide-y divide-[hsl(217,33%,11%)]">
            {categoryBreakdown.map(cat => (
              <div key={cat.categoryId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(217,33%,10%)] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-white truncate">{cat.categoryName}</span>
                    <span className={cn('inline-flex px-1.5 py-0.5 rounded-full text-xs border', typeBadge[cat.budgetType])}>{cat.budgetType}</span>
                  </div>
                  <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: typeColors[cat.budgetType] }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{formatCurrency(cat.amount)}</p>
                  <p className="text-xs text-[hsl(215,20%,35%)]">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
