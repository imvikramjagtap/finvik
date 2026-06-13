import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_MODES,
  DEFAULT_SETTINGS
} from '@/lib/storage';
import {
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  DollarSign,
  PieChart,
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Category, PaymentMode, AppSettings } from '@/types';

type Step = 'WELCOME' | 'SALARY' | 'BUDGET_RULE' | 'CATEGORIES' | 'PAYMENT_MODES' | 'WEEKLY_LIMIT' | 'ALL_SET';

const STEPS: Step[] = ['WELCOME', 'SALARY', 'BUDGET_RULE', 'CATEGORIES', 'PAYMENT_MODES', 'WEEKLY_LIMIT', 'ALL_SET'];

export default function OnboardingFlow() {
  const { saveSettings, completeOnboarding } = useAppStore();

  const [currentStep, setCurrentStep] = useState<Step>('WELCOME');
  
  // Confirmed configuration states
  const [salary, setSalary] = useState<number>(DEFAULT_SETTINGS.salary.monthlySalary);
  
  // Rule configs
  const [ruleType, setRuleType] = useState<'50-30-20' | '60-25-15' | '70-20-10' | 'custom'>('50-30-20');
  const [needPercent, setNeedPercent] = useState<number>(50);
  const [wantPercent, setWantPercent] = useState<number>(30);
  const [savingPercent, setSavingPercent] = useState<number>(20);

  // Category list selection
  const [categories, setCategories] = useState<Category[]>(
    DEFAULT_CATEGORIES.map(c => ({ ...c }))
  );
  const [deselectedCategories, setDeselectedCategories] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'Need' | 'Want' | 'Saving'>('Need');

  // Payment modes selection
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>(
    DEFAULT_PAYMENT_MODES.map(p => ({ ...p }))
  );
  const [deselectedPaymentModes, setDeselectedPaymentModes] = useState<string[]>([]);
  const [newPmName, setNewPmName] = useState('');

  // Weekly spending limit
  const [weeklyLimit, setWeeklyLimit] = useState<number>(DEFAULT_SETTINGS.weeklyLimit.amount);

  // Dynamic values
  const salaryInputRef = useRef<HTMLInputElement>(null);
  const limitInputRef = useRef<HTMLInputElement>(null);

  // Focus triggers
  useEffect(() => {
    if (currentStep === 'SALARY') {
      salaryInputRef.current?.focus();
    } else if (currentStep === 'WEEKLY_LIMIT') {
      limitInputRef.current?.focus();
    }
  }, [currentStep]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progressPercent = ((stepIndex) / (STEPS.length - 1)) * 100;

  // Preset Budget Rules handling
  const handlePresetSelect = (preset: '50-30-20' | '60-25-15' | '70-20-10' | 'custom') => {
    setRuleType(preset);
    if (preset === '50-30-20') {
      setNeedPercent(50);
      setWantPercent(30);
      setSavingPercent(20);
    } else if (preset === '60-25-15') {
      setNeedPercent(60);
      setWantPercent(25);
      setSavingPercent(15);
    } else if (preset === '70-20-10') {
      setNeedPercent(70);
      setWantPercent(20);
      setSavingPercent(10);
    }
  };

  const isRuleValid = needPercent + wantPercent + savingPercent === 100;

  // Next / Back navigation
  const handleNext = () => {
    if (currentStep === 'SALARY' && (salary <= 0 || isNaN(salary))) return;
    if (currentStep === 'BUDGET_RULE' && !isRuleValid) return;
    if (currentStep === 'WEEKLY_LIMIT' && (weeklyLimit < 0 || isNaN(weeklyLimit))) return;

    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      setCurrentStep(STEPS[nextIdx]);
    }
  };

  const handleBack = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(STEPS[prevIdx]);
    }
  };

  const handleSkip = () => {
    // Save defaults and complete onboarding
    completeOnboarding();
  };

  // Add category handler
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `cat_custom_${Date.now()}`;
    setCategories(prev => [...prev, { id: newId, name: newCatName.trim(), budgetType: newCatType }]);
    setNewCatName('');
  };

  // Add payment mode handler
  const handleAddPm = () => {
    if (!newPmName.trim()) return;
    const newId = `pm_custom_${Date.now()}`;
    setPaymentModes(prev => [...prev, { id: newId, name: newPmName.trim() }]);
    setNewPmName('');
  };

  // Save the onboarding data
  const handleFinish = () => {
    const finalSettings: AppSettings = {
      salary: { monthlySalary: salary },
      budgetRule: { needPercent, wantPercent, savingPercent },
      weeklyLimit: { amount: weeklyLimit }
    };
    
    // Save confirmed settings
    saveSettings(finalSettings);

    // Save final categories and payment modes
    const activeCategories = categories.filter(c => !deselectedCategories.includes(c.id));
    const activePaymentModes = paymentModes.filter(p => !deselectedPaymentModes.includes(p.id));

    localStorage.setItem('myfintech_categories', JSON.stringify(activeCategories));
    localStorage.setItem('myfintech_payment_modes', JSON.stringify(activePaymentModes));

    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 bg-app-bg text-app-fg flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
        {currentStep !== 'WELCOME' && currentStep !== 'ALL_SET' ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-[hsl(215,20%,45%)] hover:text-app-fg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : (
          <div className="w-4" />
        )}

        {currentStep !== 'ALL_SET' ? (
          <button
            onClick={handleSkip}
            className="text-xs text-[hsl(215,20%,45%)] hover:text-red-400 transition-colors"
          >
            Skip setup
          </button>
        ) : null}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-8 md:py-12">
        <div key={currentStep} className="animate-fade-in space-y-6">
          
          {/* STEP 1: WELCOME */}
          {currentStep === 'WELCOME' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
                <Wallet className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Welcome to <span className="gradient-text">FinVik</span>
                </h1>
                <p className="text-sm text-[hsl(215,20%,50%)] max-w-md mx-auto">
                  A clean, lightweight expense manager focused on the 50/30/20 budget framework. No spreadsheets, no complex setup.
                </p>
              </div>
              <div className="p-4 bg-app-card border border-app-border rounded-2xl flex items-start gap-3 text-left">
                <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[hsl(215,20%,45%)] leading-relaxed">
                  <strong>Completely Private:</strong> All your data is stored locally in your browser. We never send your financial details to any server.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SALARY */}
          {currentStep === 'SALARY' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                  <DollarSign className="w-3.5 h-3.5" /> step 1 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Monthly salary</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Enter your monthly income to automatically calculate your Need/Want/Saving budget allocations.
                </p>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-4xl font-extrabold text-app-fg opacity-60">₹</span>
                <input
                  ref={salaryInputRef}
                  type="number"
                  value={salary || ''}
                  onChange={e => setSalary(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-4 text-4xl font-extrabold bg-transparent text-app-fg border-b border-app-border focus:border-violet-500 focus:outline-none transition-all placeholder:text-[hsl(215,20%,25%)]"
                />
              </div>
              <p className="text-[10px] text-[hsl(215,20%,40%)]">You can change this anytime from settings.</p>
            </div>
          )}

          {/* STEP 3: BUDGET RULE */}
          {currentStep === 'BUDGET_RULE' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                  <PieChart className="w-3.5 h-3.5" /> step 2 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Budget Allocation</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Choose how your salary is split. The 50/30/20 framework is recommended.
                </p>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: '50-30-20', label: '50/30/20 Rule', desc: 'Standard Balanced' },
                  { id: '60-25-15', label: '60/25/15 Rule', desc: 'High Needs' },
                  { id: '70-20-10', label: '70/20/10 Rule', desc: 'Aggressive Bills' },
                  { id: 'custom', label: 'Custom split', desc: 'Design your own' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePresetSelect(opt.id as any)}
                    className={cn(
                      "p-4 rounded-xl text-left border transition-all cursor-pointer",
                      ruleType === opt.id
                        ? "bg-violet-600/10 border-violet-500 text-white"
                        : "bg-app-card border-app-border text-[hsl(215,20%,65%)] hover:bg-app-muted"
                    )}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-[10px] text-[hsl(215,20%,45%)] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Numeric Split Editor */}
              <div className="bg-app-card p-4 rounded-2xl border border-app-border space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Needs (%)</label>
                    <input
                      type="number"
                      disabled={ruleType !== 'custom'}
                      value={needPercent}
                      onChange={e => setNeedPercent(Number(e.target.value))}
                      className="w-full bg-app-muted border border-app-border rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-80"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Wants (%)</label>
                    <input
                      type="number"
                      disabled={ruleType !== 'custom'}
                      value={wantPercent}
                      onChange={e => setWantPercent(Number(e.target.value))}
                      className="w-full bg-app-muted border border-app-border rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-80"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Savings (%)</label>
                    <input
                      type="number"
                      disabled={ruleType !== 'custom'}
                      value={savingPercent}
                      onChange={e => setSavingPercent(Number(e.target.value))}
                      className="w-full bg-app-muted border border-app-border rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-80"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[hsl(215,20%,45%)]">Total splits sum:</span>
                  <span className={cn("font-bold", isRuleValid ? "text-emerald-400" : "text-red-400")}>
                    {needPercent + wantPercent + savingPercent}% {isRuleValid ? '✓' : '(must equal 100%)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CATEGORIES */}
          {currentStep === 'CATEGORIES' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                  <PieChart className="w-3.5 h-3.5" /> step 3 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Categories</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Confirm the categories you want to keep. Tap to deselect any you don't need.
                </p>
              </div>

              {/* Grouped category cloud */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {(['Need', 'Want', 'Saving'] as const).map(type => {
                  const typeCats = categories.filter(c => c.budgetType === type);
                  return (
                    <div key={type} className="space-y-1.5">
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        type === 'Need' ? 'text-sky-400' : type === 'Want' ? 'text-amber-400' : 'text-emerald-400'
                      )}>
                        {type}s
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {typeCats.map(cat => {
                          const isSelected = !deselectedCategories.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setDeselectedCategories(prev =>
                                  isSelected
                                    ? [...prev, cat.id]
                                    : prev.filter(id => id !== cat.id)
                                );
                              }}
                              className={cn(
                                "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1",
                                isSelected
                                  ? "bg-violet-600/10 border-violet-500/40 text-violet-300"
                                  : "bg-transparent border-app-border text-[hsl(215,20%,35%)] hover:bg-app-muted/20"
                              )}
                            >
                              {cat.name}
                              {!isSelected && <span className="opacity-40">✕</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add category inline */}
              <div className="flex gap-2 p-2 bg-app-card border border-app-border rounded-xl">
                <input
                  type="text"
                  placeholder="Create custom category..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-app-fg focus:outline-none placeholder:text-[hsl(215,20%,30%)]"
                />
                <select
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as any)}
                  className="bg-app-muted border border-app-border rounded px-1.5 py-0.5 text-[10px] text-app-fg"
                >
                  <option value="Need">Need</option>
                  <option value="Want">Want</option>
                  <option value="Saving">Saving</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT MODES */}
          {currentStep === 'PAYMENT_MODES' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                  <CreditCard className="w-3.5 h-3.5" /> step 4 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Payment methods</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Confirm your payment methods. Deselect any or add custom methods.
                </p>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto py-2">
                {paymentModes.map(pm => {
                  const isSelected = !deselectedPaymentModes.includes(pm.id);
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setDeselectedPaymentModes(prev =>
                          isSelected
                            ? [...prev, pm.id]
                            : prev.filter(id => id !== pm.id)
                        );
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                        isSelected
                          ? "bg-violet-600/10 border-violet-500/40 text-violet-300"
                          : "bg-transparent border-app-border text-[hsl(215,20%,35%)] hover:bg-app-muted/20"
                      )}
                    >
                      {pm.name}
                      {!isSelected && <span className="opacity-40 ml-1">✕</span>}
                    </button>
                  );
                })}
              </div>

              {/* Add payment mode inline */}
              <div className="flex gap-2 p-2 bg-app-card border border-app-border rounded-xl">
                <input
                  type="text"
                  placeholder="Create custom payment method..."
                  value={newPmName}
                  onChange={e => setNewPmName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPm()}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-app-fg focus:outline-none placeholder:text-[hsl(215,20%,30%)]"
                />
                <button
                  type="button"
                  onClick={handleAddPm}
                  className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: WEEKLY LIMIT */}
          {currentStep === 'WEEKLY_LIMIT' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
                  <DollarSign className="w-3.5 h-3.5" /> step 5 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Weekly Spending limit</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Set a weekly spending target to receive real-time warnings when you overspend.
                </p>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-4xl font-extrabold text-app-fg opacity-60">₹</span>
                <input
                  ref={limitInputRef}
                  type="number"
                  value={weeklyLimit || ''}
                  onChange={e => setWeeklyLimit(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-4 text-4xl font-extrabold bg-transparent text-app-fg border-b border-app-border focus:border-violet-500 focus:outline-none transition-all placeholder:text-[hsl(215,20%,25%)]"
                />
              </div>
              <p className="text-[10px] text-[hsl(215,20%,40%)]">A standard starting recommendation is around 10-15% of salary.</p>
            </div>
          )}

          {/* STEP 7: ALL SET */}
          {currentStep === 'ALL_SET' && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Setup completed!</h2>
                <p className="text-xs text-[hsl(215,20%,45%)]">
                  Your FinVik account is configured and ready to roll.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-app-card border border-app-border p-5 rounded-2xl text-left text-xs space-y-2.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[hsl(215,20%,45%)]">Monthly income:</span>
                  <span className="text-app-fg font-semibold">{formatCurrency(salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(215,20%,45%)]">Budget distribution:</span>
                  <span className="text-app-fg font-semibold">{needPercent}/{wantPercent}/{savingPercent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(215,20%,45%)]">Active Categories:</span>
                  <span className="text-app-fg font-semibold">
                    {categories.length - deselectedCategories.length} selected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(215,20%,45%)]">Payment modes:</span>
                  <span className="text-app-fg font-semibold">
                    {paymentModes.length - deselectedPaymentModes.length} modes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(215,20%,45%)]">Weekly limit:</span>
                  <span className="text-app-fg font-semibold">{formatCurrency(weeklyLimit)}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Area: Progress & CTA buttons */}
      <div className="max-w-xl mx-auto w-full space-y-4">
        
        {/* Progress Dots Indicator */}
        {currentStep !== 'WELCOME' && currentStep !== 'ALL_SET' ? (
          <div className="flex justify-center items-center gap-1.5 py-2">
            {STEPS.slice(1, -1).map((s, idx) => {
              const active = STEPS.indexOf(s) <= stepIndex;
              return (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    active ? "bg-violet-500 w-4" : "bg-app-muted w-1.5"
                  )}
                />
              );
            })}
          </div>
        ) : null}

        {currentStep === 'WELCOME' ? (
          <button
            onClick={() => setCurrentStep('SALARY')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25 cursor-pointer"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
        ) : currentStep === 'ALL_SET' ? (
          <button
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25 cursor-pointer"
          >
            Enter Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 'SALARY' && (salary <= 0 || isNaN(salary))) ||
              (currentStep === 'BUDGET_RULE' && !isRuleValid) ||
              (currentStep === 'WEEKLY_LIMIT' && (weeklyLimit < 0 || isNaN(weeklyLimit)))
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
