import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  description: z.string().min(1, 'Description is required').max(100),
  categoryId: z.string().min(1, 'Category is required'),
  paymentModeId: z.string().min(1, 'Payment mode is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function QuickAddExpense() {
  const { addExpense, categories, paymentModes } = useAppStore();
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today },
  });

  const onSubmit = async (data: FormData) => {
    addExpense({
      date: data.date,
      amount: Number(data.amount),
      description: data.description,
      categoryId: data.categoryId,
      paymentModeId: data.paymentModeId,
      notes: data.notes,
    });
    reset({ date: today });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-violet-400" />
        </div>
        <h2 className="font-semibold text-app-fg text-base">Quick Add Expense</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Row 1: Date + Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Date</label>
            <input
              type="date"
              {...register('date')}
              className={cn(
                'w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all',
                errors.date ? 'border-red-500/60' : 'border-app-border'
              )}
            />
          </div>
          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              {...register('amount')}
              className={cn(
                'w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-[hsl(215,20%,30%)]',
                errors.amount ? 'border-red-500/60' : 'border-app-border'
              )}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Description</label>
          <input
            type="text"
            placeholder="What did you spend on?"
            {...register('description')}
            className={cn(
              'w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-[hsl(215,20%,30%)]',
              errors.description ? 'border-red-500/60' : 'border-app-border'
            )}
          />
        </div>

        {/* Row 3: Category + Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Category</label>
            <select
              {...register('categoryId')}
              className={cn(
                'w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all',
                errors.categoryId ? 'border-red-500/60' : 'border-app-border'
              )}
            >
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
            <select
              {...register('paymentModeId')}
              className={cn(
                'w-full bg-app-muted border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all',
                errors.paymentModeId ? 'border-red-500/60' : 'border-app-border'
              )}
            >
              <option value="" className="bg-app-card text-app-fg">Select...</option>
              {paymentModes.map(p => (
                <option key={p.id} value={p.id} className="bg-app-card text-app-fg">{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
            success
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            '✓ Expense Added!'
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}
