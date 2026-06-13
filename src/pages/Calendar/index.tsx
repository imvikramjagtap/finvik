import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcCalendarHeatmap } from '@/lib/calculations/calendar';
import { formatCurrency, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const levelColors = [
  'bg-app-muted border border-app-border/10',
  'bg-violet-500/20 dark:bg-violet-500/25',
  'bg-violet-500/40 dark:bg-violet-500/45',
  'bg-violet-500/70 dark:bg-violet-500/70',
  'bg-violet-500',
];

interface TooltipState {
  date: string;
  amount: number;
  x: number;
  y: number;
}

export default function Calendar() {
  const { expenses } = useAppStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const calendarDays = useMemo(() => calcCalendarHeatmap(expenses, year), [expenses, year]);

  // Group by week columns (GitHub style)
  // Find first Sunday on or before Jan 1
  const jan1 = new Date(year, 0, 1);
  const startDay = new Date(jan1);
  startDay.setDate(jan1.getDate() - jan1.getDay()); // roll back to Sunday

  const dayMap = new Map(calendarDays.map(d => [d.date, d]));

  // Build week columns
  const weeks: { date: string; level: number; amount: number }[][] = [];
  const current = new Date(startDay);
  while (current.getFullYear() <= year) {
    if (current.getFullYear() === year + 1) break;
    const week: { date: string; level: number; amount: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      const dayData = dayMap.get(dateStr);
      week.push({
        date: dateStr,
        level: current.getFullYear() === year ? (dayData?.level ?? 0) : -1,
        amount: dayData?.amount ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (current.getFullYear() > year) break;
  }

  // Month labels positions
  const monthPositions: { month: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstValidDay = week.find(d => d.level >= 0);
    if (firstValidDay) {
      const m = new Date(firstValidDay.date).getMonth();
      if (m !== lastMonth) {
        monthPositions.push({ month: MONTHS[m], col });
        lastMonth = m;
      }
    }
  });

  const totalSpent = calendarDays.reduce((acc, d) => acc + d.amount, 0);
  const activeDays = calendarDays.filter(d => d.amount > 0).length;
  const maxDay = calendarDays.reduce((max, d) => d.amount > max.amount ? d : max, { date: '', amount: 0 });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">Calendar View</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">GitHub-style spending heatmap</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-app-fg w-16 text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in">
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Total Spent ({year})</p>
          <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Active Days</p>
          <p className="text-lg font-bold text-app-fg">{activeDays}</p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Highest Day</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(maxDay.amount)}</p>
          {maxDay.date && <p className="text-xs text-[hsl(215,20%,35%)] mt-0.5">{maxDay.date}</p>}
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in overflow-x-auto">
        <div className="relative min-w-[600px]">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, col) => {
              const mp = monthPositions.find(m => m.col === col);
              return (
                <div key={col} style={{ width: '14px', marginRight: '2px', flexShrink: 0 }}>
                  {mp && <span className="text-[10px] text-[hsl(215,20%,40%)] whitespace-nowrap">{mp.month}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col" style={{ gap: '2px', marginRight: '4px' }}>
              {DAYS.map((day, i) => (
                <div key={day} style={{ height: '14px', width: '24px' }} className="flex items-center">
                  {i % 2 === 1 && <span className="text-[9px] text-[hsl(215,20%,35%)]">{day}</span>}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex" style={{ gap: '2px' }}>
              {weeks.map((week, col) => (
                <div key={col} className="flex flex-col" style={{ gap: '2px' }}>
                  {week.map((day, row) => (
                    <div
                      key={row}
                      style={{ width: '14px', height: '14px', borderRadius: '2px' }}
                      className={cn(
                        'transition-all duration-150 cursor-default',
                        day.level < 0 ? 'opacity-0' : levelColors[day.level],
                        day.level > 0 && 'hover:opacity-80 cursor-pointer'
                      )}
                      onMouseEnter={(e) => {
                        if (day.level >= 0 && day.date) {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({ date: day.date, amount: day.amount, x: rect.left, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-[hsl(215,20%,35%)]">Less</span>
            {levelColors.map((color, i) => (
              <div key={i} className={cn('rounded-sm', color)} style={{ width: '12px', height: '12px' }} />
            ))}
            <span className="text-[10px] text-[hsl(215,20%,35%)]">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-app-card border border-app-border rounded-lg px-3 py-2 pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 20, top: tooltip.y - 40 }}
        >
          <p className="text-xs text-[hsl(215,20%,55%)]">{tooltip.date}</p>
          <p className="text-sm font-semibold text-app-fg">{tooltip.amount > 0 ? formatCurrency(tooltip.amount) : 'No spend'}</p>
        </div>
      )}
    </div>
  );
}
