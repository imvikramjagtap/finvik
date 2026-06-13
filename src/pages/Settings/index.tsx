import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, downloadFile, cn } from '@/lib/utils';
import { storageService } from '@/lib/storage';
import {
  Settings2, Plus, Trash2, Edit2, Check, X, Download, Upload,
  DollarSign, PieChart, CreditCard, Tag, Calendar,
} from 'lucide-react';
import type { Category, PaymentMode } from '@/types';

const settingsSchema = z.object({
  monthlySalary: z.number().min(1, 'Salary must be positive'),
  needPercent: z.number().min(1).max(100),
  wantPercent: z.number().min(1).max(100),
  savingPercent: z.number().min(1).max(100),
  weeklyLimit: z.number().min(0),
}).refine(d => d.needPercent + d.wantPercent + d.savingPercent === 100, {
  message: 'Percentages must sum to 100',
  path: ['needPercent'],
});

type SettingsForm = z.infer<typeof settingsSchema>;

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-violet-400" />
      </div>
      <div>
        <h2 className="font-semibold text-white text-base">{title}</h2>
        <p className="text-xs text-[hsl(215,20%,45%)]">{description}</p>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-app-muted border border-app-border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[hsl(215,20%,30%)]';
const cardCls = 'rounded-2xl border border-app-border bg-app-card p-6 animate-fade-in';

export default function Settings() {
  const {
    settings, saveSettings,
    categories, addCategory, updateCategory, deleteCategory,
    paymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode,
    importData,
    privateMode,
  } = useAppStore();

  // Settings form
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      monthlySalary: settings.salary.monthlySalary,
      needPercent: settings.budgetRule.needPercent,
      wantPercent: settings.budgetRule.wantPercent,
      savingPercent: settings.budgetRule.savingPercent,
      weeklyLimit: settings.weeklyLimit.amount,
    },
  });

  const onSaveSettings = async (data: SettingsForm) => {
    saveSettings({
      salary: { monthlySalary: data.monthlySalary },
      budgetRule: { needPercent: data.needPercent, wantPercent: data.wantPercent, savingPercent: data.savingPercent },
      weeklyLimit: { amount: data.weeklyLimit },
    });
    reset(data);
  };

  // Category management
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<Category['budgetType']>('Need');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatType, setEditCatType] = useState<Category['budgetType']>('Need');

  const [newPmName, setNewPmName] = useState('');
  const [editingPm, setEditingPm] = useState<string | null>(null);
  const [editPmName, setEditPmName] = useState('');

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), budgetType: newCatType });
    setNewCatName('');
  }

  function startEditCat(cat: Category) {
    setEditingCat(cat.id);
    setEditCatName(cat.name);
    setEditCatType(cat.budgetType);
  }

  function saveEditCat(id: string) {
    if (editCatName.trim()) {
      updateCategory(id, { name: editCatName.trim(), budgetType: editCatType });
    }
    setEditingCat(null);
  }

  function handleAddPm() {
    if (!newPmName.trim()) return;
    addPaymentMode({ name: newPmName.trim() });
    setNewPmName('');
  }

  function startEditPm(pm: PaymentMode) {
    setEditingPm(pm.id);
    setEditPmName(pm.name);
  }

  function saveEditPm(id: string) {
    if (editPmName.trim()) updatePaymentMode(id, { name: editPmName.trim() });
    setEditingPm(null);
  }

  // Export/Import
  function handleExportJSON() {
    downloadFile(storageService.exportJSON(), 'myfintech-export.json', 'application/json');
  }
  function handleExportCSV() {
    downloadFile(storageService.exportCSV(), 'myfintech-expenses.csv', 'text/csv');
  }
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string);
        alert('Data imported successfully!');
      } catch {
        alert('Failed to import. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const typeBadge = {
    Need: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    Want: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    Saving: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-app-fg">Settings</h1>
        <p className="text-[hsl(215,20%,45%)] text-sm mt-0.5">Configure your financial setup</p>
      </div>

      {/* Salary & Budget Rule */}
      <div id="driver-salary-input" className={cardCls}>
        <SectionHeader icon={DollarSign} title="Salary & Budget Rule" description="50/30/20 rule configuration" />
        <form onSubmit={handleSubmit(onSaveSettings)} className="space-y-4">
          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Monthly Salary (₹)</label>
            {privateMode ? (
              <div className="flex items-center justify-between w-full bg-app-muted border border-app-border rounded-lg px-3 py-2.5 text-sm text-[hsl(215,20%,45%)]">
                <span>••••••</span>
                <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">Private Mode Active</span>
              </div>
            ) : (
              <>
                <input type="number" {...register('monthlySalary', { valueAsNumber: true })} className={inputCls} />
                {errors.monthlySalary && <p className="text-red-400 text-xs mt-1">{errors.monthlySalary.message}</p>}
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([['needPercent', 'Needs %', '#38bdf8'], ['wantPercent', 'Wants %', '#fbbf24'], ['savingPercent', 'Savings %', '#4ade80']] as const).map(([field, label, color]) => (
              <div key={field}>
                <label className="text-xs mb-1.5 block font-medium" style={{ color }}>{label}</label>
                <input type="number" min={0} max={100} {...register(field, { valueAsNumber: true })} className={inputCls} />
              </div>
            ))}
          </div>
          {errors.needPercent && <p className="text-red-400 text-xs">{errors.needPercent.message}</p>}
          <div>
            <label className="text-xs text-[hsl(215,20%,45%)] mb-1.5 block font-medium">Weekly Spending Limit (₹)</label>
            <input type="number" {...register('weeklyLimit', { valueAsNumber: true })} className={inputCls} />
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              disabled={isSubmitting || !isDirty}>
              Save Settings
            </button>
            {!isDirty && <span className="self-center text-xs text-emerald-400">✓ Saved</span>}
          </div>
        </form>
      </div>

      {/* Categories */}
      <div id="driver-settings-categories" className={cardCls}>
        <SectionHeader icon={Tag} title="Categories" description="Manage expense categories" />

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name..."
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            className={cn(inputCls, 'flex-1')} />
          <select value={newCatType} onChange={e => setNewCatType(e.target.value as Category['budgetType'])}
            className="bg-app-muted border border-app-border rounded-lg px-3 py-2.5 text-sm text-app-fg focus:outline-none focus:ring-2 focus:ring-violet-500/50">
            <option value="Need" className="bg-app-card text-app-fg">Need</option>
            <option value="Want" className="bg-app-card text-app-fg">Want</option>
            <option value="Saving" className="bg-app-card text-app-fg">Saving</option>
          </select>
          <button onClick={handleAddCategory}
            className="px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List grouped by type */}
        {(['Need', 'Want', 'Saving'] as const).map(type => {
          const typeCats = categories.filter(c => c.budgetType === type);
          if (typeCats.length === 0) return null;
          return (
            <div key={type} className="mb-4">
              <p className={cn('text-xs font-semibold mb-2 uppercase tracking-wider', typeBadge[type].split(' ')[1])}>{type}</p>
              <div className="space-y-1.5">
                {typeCats.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-app-muted border border-app-border">
                    {editingCat === cat.id ? (
                      <>
                        <input value={editCatName} onChange={e => setEditCatName(e.target.value)} autoFocus
                          className="flex-1 bg-transparent text-sm text-app-fg focus:outline-none" />
                        <select value={editCatType} onChange={e => setEditCatType(e.target.value as Category['budgetType'])}
                          className="bg-app-card border border-app-border text-xs text-app-fg rounded px-1 py-0.5">
                          <option value="Need">Need</option>
                          <option value="Want">Want</option>
                          <option value="Saving">Saving</option>
                        </select>
                        <button onClick={() => saveEditCat(cat.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingCat(null)} className="text-[hsl(215,20%,45%)] hover:text-app-fg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-app-fg">{cat.name}</span>
                        <button onClick={() => startEditCat(cat)} className="text-[hsl(215,20%,35%)] hover:text-violet-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="text-[hsl(215,20%,35%)] hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modes */}
      <div id="driver-settings-payment-modes" className={cardCls}>
        <SectionHeader icon={CreditCard} title="Payment Modes" description="Manage payment methods" />
        <div className="flex gap-2 mb-4">
          <input value={newPmName} onChange={e => setNewPmName(e.target.value)} placeholder="Payment mode name..."
            onKeyDown={e => e.key === 'Enter' && handleAddPm()}
            className={cn(inputCls, 'flex-1')} />
          <button onClick={handleAddPm}
            className="px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          {paymentModes.map(pm => (
            <div key={pm.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-app-muted border border-app-border">
              {editingPm === pm.id ? (
                <>
                  <input value={editPmName} onChange={e => setEditPmName(e.target.value)} autoFocus
                    className="flex-1 bg-transparent text-sm text-app-fg focus:outline-none" />
                  <button onClick={() => saveEditPm(pm.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingPm(null)} className="text-[hsl(215,20%,45%)] hover:text-app-fg transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-app-fg">{pm.name}</span>
                  <button onClick={() => startEditPm(pm)} className="text-[hsl(215,20%,35%)] hover:text-violet-400 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deletePaymentMode(pm.id)} className="text-[hsl(215,20%,35%)] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export / Import */}
      <div className={cardCls}>
        <SectionHeader icon={Download} title="Data Management" description="Export or import your financial data" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-app-border text-sm text-[hsl(215,20%,65%)] hover:bg-app-muted hover:text-app-fg transition-all">
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-app-border text-sm text-[hsl(215,20%,65%)] hover:bg-app-muted hover:text-app-fg transition-all">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-violet-500/30 text-sm text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>
    </div>
  );
}
