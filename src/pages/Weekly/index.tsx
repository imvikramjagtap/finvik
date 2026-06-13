import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcWeeklySummaries, calcWeeklyTrendForYear } from '@/lib/calculations/weekly';
import { getCurrentMonth, getMonthLabel, formatCurrency, cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const tooltipStyle = {
  contentStyle: { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

export default function Weekly() {
  const { expenses, settings } = useAppStore();
  const [month, setMonth] = useState(getCurrentMonth());
  const weeklyLimit = settings.weeklyLimit.amount;

  const weeklySummaries = useMemo(() =>
    calcWeeklySummaries(expenses, month, weeklyLimit),
    [expenses, month, weeklyLimit]
  );

  const yearTrend = useMemo(() =>
    calcWeeklyTrendForYear(expenses, new Date().getFullYear(), weeklyLimit),
    [expenses, weeklyLimit]
  );

  const adherentCount = weeklySummaries.filter(w => !w.isOverspent).length;
  const totalSpent = weeklySummaries.reduce((acc, w) => acc + w.spent, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">Weekly Analysis</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Limit: {formatCurrency(weeklyLimit)}/week</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(m => addMonths(m, -1))}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-app-fg min-w-[120px] text-center">{getMonthLabel(month)}</span>
          <button onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Within Limit', value: `${adherentCount}/${weeklySummaries.length} weeks`, color: 'text-emerald-500 dark:text-emerald-400' },
          { label: 'Avg/Week', value: formatCurrency(weeklySummaries.length ? Math.round(totalSpent / weeklySummaries.length) : 0), color: 'text-app-fg' },
          { label: 'Over Limit', value: `${weeklySummaries.length - adherentCount} weeks`, color: weeklySummaries.some(w => w.isOverspent) ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-app-border bg-app-card animate-fade-in">
            <p className="text-xs text-[hsl(215,20%,45%)] mb-1">{s.label}</p>
            <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly Summary Table */}
      <div id="driver-weekly-summary" className="rounded-2xl border border-app-border bg-app-card overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-app-border">
          <h2 className="font-semibold text-app-fg">Weekly Summary</h2>
        </div>
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border">
                {['Week', 'Period', 'Spent', 'Limit', '%', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[hsl(215,20%,40%)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklySummaries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[hsl(215,20%,35%)] text-sm">No data for this month</td></tr>
              ) : weeklySummaries.map(w => (
                <tr key={w.week} className="border-b border-app-border hover:bg-app-muted transition-colors">
                  <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,55%)] font-medium">W{w.week}</td>
                  <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,45%)] whitespace-nowrap">{w.label}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('text-sm font-semibold', w.isOverspent ? 'text-red-500 dark:text-red-400' : 'text-app-fg')}>{formatCurrency(w.spent)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[hsl(215,20%,45%)]">{formatCurrency(w.limit)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-app-muted border border-app-border/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(w.percentage, 100)}%`, backgroundColor: w.isOverspent ? '#f87171' : '#4ade80' }} />
                      </div>
                      <span className={cn('text-xs font-medium', w.isOverspent ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400')}>{w.percentage.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                      w.isOverspent
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}>
                      {w.isOverspent ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {w.isOverspent ? 'Over' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-app-border">
          {weeklySummaries.length === 0 ? (
            <p className="px-4 py-8 text-center text-[hsl(215,20%,35%)] text-sm">No data for this month</p>
          ) : (
            weeklySummaries.map(w => (
              <div key={w.week} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-app-fg">Week {w.week}</span>
                    <span className="text-xs text-[hsl(215,20%,45%)] ml-2">({w.label})</span>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                    w.isOverspent
                      ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20')}>
                    {w.isOverspent ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {w.isOverspent ? 'Over' : 'OK'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Spent: <span className={cn('font-semibold', w.isOverspent ? 'text-red-500 dark:text-red-400' : 'text-app-fg')}>{formatCurrency(w.spent)}</span></span>
                  <span className="text-[hsl(215,20%,45%)]">Limit: <span className="font-semibold text-app-fg">{formatCurrency(w.limit)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-app-muted border border-app-border/10 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(w.percentage, 100)}%`, backgroundColor: w.isOverspent ? '#ef4444' : '#10b981' }} />
                  </div>
                  <span className={cn('text-xs font-bold', w.isOverspent ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400')}>{w.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
        <h2 className="font-semibold text-app-fg mb-5">Year-to-Date Weekly Trend</h2>
        {yearTrend.length === 0 ? (
          <p className="text-[hsl(215,20%,35%)] text-sm text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `W${v}`} />
              <YAxis tick={{ fill: 'hsl(215,20%,45%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => formatCurrency(Number(v || 0))} />
              <ReferenceLine y={weeklyLimit} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Limit', fill: '#f59e0b', fontSize: 11 }} />
              <Bar dataKey="spent" name="Spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
