import React from 'react';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  type: 'Need' | 'Want' | 'Saving';
  budget: number;
  spent: number;
  remaining: number;
  percent: number;
}

const typeConfig = {
  Need: {
    label: 'Needs',
    emoji: '🏠',
    barColor: 'bg-sky-400',
    textColor: 'text-sky-400',
    bgColor: 'need-bg',
  },
  Want: {
    label: 'Wants',
    emoji: '✨',
    barColor: 'bg-amber-400',
    textColor: 'text-amber-400',
    bgColor: 'want-bg',
  },
  Saving: {
    label: 'Savings',
    emoji: '💰',
    barColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
    bgColor: 'saving-bg',
  },
};

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function BudgetCard({ type, budget, spent, remaining, percent }: BudgetCardProps) {
  const config = typeConfig[type];
  const isOverspent = spent > budget;

  return (
    <div className={cn('rounded-2xl p-5 border glass-card hover-glow transition-all duration-300 animate-fade-in', config.bgColor)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <span className={cn('font-semibold text-sm', config.textColor)}>{config.label}</span>
        </div>
        <span className="text-xs text-[hsl(215,20%,45%)] font-medium">
          {Math.round(percent)}% used
        </span>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-white">{formatINR(budget)}</p>
        <p className="text-xs text-[hsl(215,20%,45%)] mt-0.5">monthly budget</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={cn('h-2 rounded-full transition-all duration-700', isOverspent ? 'bg-red-500' : config.barColor)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <div>
          <p className="text-[hsl(215,20%,45%)]">Spent</p>
          <p className={cn('font-semibold mt-0.5', isOverspent ? 'text-red-400' : 'text-white')}>{formatINR(spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-[hsl(215,20%,45%)]">Remaining</p>
          <p className={cn('font-semibold mt-0.5', isOverspent ? 'text-red-400' : config.textColor)}>{formatINR(remaining)}</p>
        </div>
      </div>
    </div>
  );
}
