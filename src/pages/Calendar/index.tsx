import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcCalendarHeatmap } from '@/lib/calculations/calendar';
import { formatCurrency, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const levelColors = [
  'bg-app-muted border border-app-border/10',
  'bg-violet-500/20 dark:bg-violet-500/25',
  'bg-violet-500/40 dark:bg-violet-500/45',
  'bg-violet-500/70 dark:bg-violet-500/70',
  'bg-violet-500',
];

const levelTextColors = [
  'text-app-fg',
  'text-violet-800 dark:text-violet-200',
  'text-violet-950 dark:text-violet-100',
  'text-white',
  'text-white',
];

interface TooltipState {
  date: string;
  amount: number;
  x: number;
  y: number;
}

export default function Calendar() {
  const { expenses, categories, paymentModes } = useAppStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Initialize width immediately to prevent initial layout rendering of desktop viewport size
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calendarDays = useMemo(() => calcCalendarHeatmap(expenses, year), [expenses, year]);
  const dayMap = new Map(calendarDays.map(d => [d.date, d]));

  // Sync year with selected date's year when it changes manually in header
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    if (selectedDate) {
      const parts = selectedDate.split('-');
      setSelectedDate(`${newYear}-${parts[1]}-${parts[2]}`);
    }
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        handleYearChange(year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        handleYearChange(year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Group by week columns (GitHub style) for desktop yearly heatmap
  const jan1 = new Date(year, 0, 1);
  const startDay = new Date(jan1);
  startDay.setDate(jan1.getDate() - jan1.getDay()); // roll back to Sunday

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

  // Month labels positions for yearly view
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

  // Get days in selected month and year for mobile monthly view
  const monthDays = useMemo(() => {
    const days: { date: string; dayNum: number; level: number; amount: number }[] = [];
    const date = new Date(year, selectedMonth, 1);
    while (date.getMonth() === selectedMonth) {
      const dateStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayData = dayMap.get(dateStr);
      days.push({
        date: dateStr,
        dayNum: date.getDate(),
        level: dayData?.level ?? 0,
        amount: dayData?.amount ?? 0,
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, selectedMonth, dayMap]);

  // First day offset (0-6)
  const firstDayOffset = useMemo(() => {
    return new Date(year, selectedMonth, 1).getDay();
  }, [year, selectedMonth]);

  // Find expenses on the selected date
  const selectedDateExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter(e => e.date === selectedDate);
  }, [selectedDate, expenses]);

  const totalSpent = calendarDays.reduce((acc, d) => acc + d.amount, 0);
  const activeDays = calendarDays.filter(d => d.amount > 0).length;
  const maxDay = calendarDays.reduce((max, d) => d.amount > max.amount ? d : max, { date: '', amount: 0 });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in w-full max-w-full">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">Calendar View</h1>
          <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Track and inspect daily spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleYearChange(year - 1)}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-app-fg w-16 text-center">{year}</span>
          <button onClick={() => handleYearChange(year + 1)}
            className="w-8 h-8 rounded-lg bg-app-muted flex items-center justify-center hover:opacity-80 border border-app-border text-[hsl(215,20%,55%)] transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 animate-fade-in w-full max-w-full">
        <div className="rounded-2xl p-4 border border-app-border bg-app-card min-w-0">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Total Spent ({year})</p>
          <p className="text-base md:text-lg font-bold text-violet-600 dark:text-violet-400 truncate">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card min-w-0">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Active Days</p>
          <p className="text-base md:text-lg font-bold text-app-fg">{activeDays}</p>
        </div>
        <div className="rounded-2xl p-4 border border-app-border bg-app-card min-w-0">
          <p className="text-xs text-[hsl(215,20%,45%)] mb-1">Highest Day</p>
          <p className="text-base md:text-lg font-bold text-amber-600 dark:text-amber-400 truncate">{formatCurrency(maxDay.amount)}</p>
          {maxDay.date && <p className="text-[10px] text-[hsl(215,20%,35%)] mt-0.5 hidden md:block">{maxDay.date}</p>}
        </div>
      </div>

      {/* HEATMAP: Desktop view ONLY */}
      {!isMobile && (
        <div id="driver-calendar-grid" className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in overflow-x-auto w-full max-w-full">
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
                    {week.map((day, row) => {
                      const isSelected = selectedDate === day.date;
                      return (
                        <div
                          key={row}
                          style={{ width: '14px', height: '14px', borderRadius: '2px' }}
                          className={cn(
                            'transition-all duration-150 cursor-default border border-transparent',
                            day.level < 0 ? 'opacity-0' : levelColors[day.level],
                            day.level >= 0 && 'hover:opacity-80 cursor-pointer',
                            isSelected && 'ring-2 ring-white dark:ring-violet-300 scale-110 z-10'
                          )}
                          onMouseEnter={(e) => {
                            if (day.level >= 0 && day.date) {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setTooltip({ date: day.date, amount: day.amount, x: rect.left, y: rect.top });
                            }
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={() => {
                            if (day.level >= 0 && day.date) {
                              setSelectedDate(day.date);
                            }
                          }}
                        />
                      );
                    })}
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
      )}

      {/* MONTHLY CALENDAR: Mobile view ONLY */}
      {isMobile && (
        <div className="space-y-4 animate-fade-in w-full max-w-full overflow-hidden">
          {/* Month Selector Header */}
          <div className="flex items-center justify-between p-2 bg-app-card border border-app-border rounded-2xl w-full">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-app-muted border border-app-border text-app-fg hover:opacity-80 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-app-fg">{MONTHS[selectedMonth]} {year}</span>
            <button onClick={handleNextMonth} className="p-2 rounded-xl bg-app-muted border border-app-border text-app-fg hover:opacity-80 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Month Pills */}
          <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none w-full max-w-full">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(idx)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex-shrink-0",
                  selectedMonth === idx
                    ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20"
                    : "bg-app-card border-app-border text-[hsl(215,20%,45%)] hover:text-app-fg"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="rounded-2xl border border-app-border bg-app-card p-4 space-y-3 shadow-md w-full max-w-full">
            {/* Weekdays Headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center w-full">
              {DAYS.map(day => (
                <span key={day} className="text-[10px] font-bold text-[hsl(215,20%,40%)] uppercase tracking-wide truncate w-full min-w-0">
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 w-full">
              {/* First day offsets */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`offset-${i}`} className="aspect-square opacity-0 w-full" />
              ))}

              {/* Days in Month */}
              {monthDays.map(day => {
                const isSelected = selectedDate === day.date;
                const isToday = new Date().toISOString().slice(0, 10) === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "w-full min-w-0 p-0 aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 border",
                      levelColors[day.level],
                      isSelected 
                        ? "border-violet-400 ring-2 ring-violet-500/30 scale-105 z-10 bg-violet-600/20" 
                        : isToday 
                          ? "border-cyan-500/50" 
                          : "border-app-border/10",
                      "hover:opacity-85 cursor-pointer"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold",
                      levelTextColors[day.level]
                    )}>
                      {day.dayNum}
                    </span>
                    {day.amount > 0 && (
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full absolute bottom-1.5",
                        day.level >= 3 ? "bg-white" : "bg-violet-500"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Legend */}
            <div className="flex items-center gap-1.5 pt-2 justify-end text-[9px] text-[hsl(215,20%,35%)] border-t border-app-border/40 w-full">
              <span>Less</span>
              {levelColors.map((color, i) => (
                <div key={i} className={cn('rounded-sm', color)} style={{ width: '10px', height: '10px' }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Expenses Details (Visible on both mobile & desktop) */}
      <div className="rounded-2xl border border-app-border bg-app-card p-4 md:p-6 animate-fade-in space-y-4 shadow-md w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-app-border/40 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-app-fg text-sm truncate">Activity Details</h3>
              <p className="text-xs text-[hsl(215,20%,50%)] truncate">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No date selected'}
              </p>
            </div>
          </div>
          {selectedDateExpenses.length > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 self-start sm:self-auto flex-shrink-0">
              Spent: {formatCurrency(selectedDateExpenses.reduce((sum, e) => sum + e.amount, 0))}
            </span>
          )}
        </div>

        {selectedDateExpenses.length > 0 ? (
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 w-full">
            {selectedDateExpenses.map(expense => {
              const category = categories.find(c => c.id === expense.categoryId);
              const pMode = paymentModes.find(p => p.id === expense.paymentModeId);
              return (
                <div key={expense.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-app-muted/30 border border-app-border/40 hover:border-app-border/80 transition-colors w-full">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <p className="text-xs font-semibold text-app-fg leading-tight break-words">{expense.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {category && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0",
                          category.budgetType === 'Need' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          category.budgetType === 'Want' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        )}>
                          {category.name}
                        </span>
                      )}
                      {pMode && (
                        <span className="text-[9px] font-medium text-[hsl(215,20%,45%)] bg-app-muted px-1.5 py-0.5 rounded border border-app-border/50 flex-shrink-0">
                          {pMode.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-app-fg flex-shrink-0">{formatCurrency(expense.amount)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2 bg-app-muted/10 border border-dashed border-app-border/50 rounded-xl w-full">
            <p className="text-xs text-[hsl(215,20%,45%)] font-medium">No expenses recorded on this day.</p>
            <p className="text-[10px] text-[hsl(215,20%,35%)]">Try selecting another day or add a new transaction!</p>
          </div>
        )}
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
