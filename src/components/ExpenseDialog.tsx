import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Expense } from '@/types';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  description: z.string().min(1, 'Description is required').max(100),
  categoryId: z.string().min(1, 'Category is required'),
  paymentModeId: z.string().min(1, 'Payment mode is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  expense?: Expense;
  onClose: () => void;
}

export function ExpenseDialog({ expense, onClose }: Props) {
  const { addExpense, updateExpense, categories, paymentModes } = useAppStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? { ...expense, amount: String(expense.amount) }
      : { date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      date: data.date,
      amount: Number(data.amount),
      description: data.description,
      categoryId: data.categoryId,
      paymentModeId: data.paymentModeId,
      notes: data.notes,
    };
    if (expense) {
      updateExpense(expense.id, payload);
    } else {
      addExpense(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-app-card border border-app-border rounded-2xl p-6 animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-app-fg text-lg">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-app-muted border border-app-border flex items-center justify-center hover:opacity-80 transition-colors">
            <X className="w-4 h-4 text-[hsl(215,20%,55%)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Date</label>
              <input type="date" {...register('date')}
                className={cn('w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  errors.date ? 'border-red-500/60' : 'border-app-border')} />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Amount (₹)</label>
              <input type="number" placeholder="0" {...register('amount')}
                className={cn('w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[hsl(215,20%,30%)]',
                  errors.amount ? 'border-red-500/60' : 'border-app-border')} />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Description</label>
            <input type="text" placeholder="e.g. Grocery shopping" {...register('description')}
              className={cn('w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[hsl(215,20%,30%)]',
                errors.description ? 'border-red-500/60' : 'border-app-border')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Category</label>
              <select {...register('categoryId')}
                className={cn('w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  errors.categoryId ? 'border-red-500/60' : 'border-app-border')}>
                <option value="" className="bg-app-card text-app-fg">Select...</option>
                {(['Need', 'Want', 'Saving'] as const).map(type => (
                  <optgroup key={type} label={type} className="bg-app-card text-app-fg">
                    {categories.filter(c => c.budgetType === type).map(c => (
                      <option key={c.id} value={c.id} className="bg-app-card text-app-fg">{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Payment Mode</label>
              <select {...register('paymentModeId')}
                className={cn('w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  errors.paymentModeId ? 'border-red-500/60' : 'border-app-border')}>
                <option value="" className="bg-app-card text-app-fg">Select...</option>
                {paymentModes.map(p => (
                  <option key={p.id} value={p.id} className="bg-app-card text-app-fg">{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Notes (optional)</label>
            <textarea {...register('notes')} rows={2} placeholder="Additional notes..."
              className="w-full bg-app-muted border border-app-border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none placeholder:text-[hsl(215,20%,30%)]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-app-border text-[hsl(215,20%,55%)] text-sm font-medium hover:bg-app-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
