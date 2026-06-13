import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, ArrowLeft, ArrowRight, Loader2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatCurrency } from '@/lib/utils';

type Step = 'AMOUNT' | 'DESCRIPTION' | 'CATEGORY' | 'PAYMENT_MODE' | 'DATE_NOTES';

const STEPS: Step[] = ['AMOUNT', 'DESCRIPTION', 'CATEGORY', 'PAYMENT_MODE', 'DATE_NOTES'];

export function QuickAddExpense() {
  const { addExpense, categories, paymentModes, expenses } = useAppStore();

  // Step states
  const [currentStep, setCurrentStep] = useState<Step>('AMOUNT');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Value states
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggestions for Description
  const recentDescriptions = useMemo(() => {
    const unique = new Set<string>();
    const list: string[] = [];
    for (const exp of expenses) {
      const desc = exp.description.trim();
      if (!unique.has(desc)) {
        unique.add(desc);
        list.push(desc);
      }
      if (list.length >= 4) break;
    }
    return list;
  }, [expenses]);

  const defaultSuggestions = ['Coffee', 'Groceries', 'Food Delivery', 'Uber/Ride', 'Rent/Bills', 'Shopping', 'Dining Out', 'Medicines'];

  const suggestions = useMemo(() => {
    const list = [...recentDescriptions];
    for (const item of defaultSuggestions) {
      if (!list.map(s => s.toLowerCase()).includes(item.toLowerCase()) && list.length < 8) {
        list.push(item);
      }
    }
    return list;
  }, [recentDescriptions]);

  // Refs for auto-focusing
  const amountInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus logic based on step
  useEffect(() => {
    if (currentStep === 'AMOUNT') {
      amountInputRef.current?.focus();
    } else if (currentStep === 'DESCRIPTION') {
      descInputRef.current?.focus();
    }
  }, [currentStep]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  // Validation
  const validateStep = (step: Step): boolean => {
    setErrorMsg(null);
    if (step === 'AMOUNT') {
      const num = Number(amount);
      if (!amount || isNaN(num) || num <= 0) {
        setErrorMsg('Please enter a valid amount greater than 0');
        return false;
      }
    }
    if (step === 'DESCRIPTION') {
      if (!description.trim()) {
        setErrorMsg('Please enter a description');
        return false;
      }
    }
    if (step === 'CATEGORY') {
      if (!selectedCategoryId) {
        setErrorMsg('Please select a category');
        return false;
      }
    }
    if (step === 'PAYMENT_MODE') {
      if (!selectedPaymentModeId) {
        setErrorMsg('Please select a payment mode');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      setDirection('next');
      setCurrentStep(STEPS[nextIdx]);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      setDirection('prev');
      setCurrentStep(STEPS[prevIdx]);
    }
  };

  const handleReset = () => {
    setCurrentStep('AMOUNT');
    setAmount('');
    setDescription('');
    setSelectedCategoryId('');
    setSelectedPaymentModeId('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (!validateStep('AMOUNT') || !validateStep('DESCRIPTION') || !validateStep('CATEGORY') || !validateStep('PAYMENT_MODE')) {
      return;
    }

    setIsSaving(true);
    try {
      addExpense({
        date,
        amount: Number(amount),
        description: description.trim(),
        categoryId: selectedCategoryId,
        paymentModeId: selectedPaymentModeId,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleReset();
      }, 2000);
    } catch (err) {
      setErrorMsg('Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard navigation helpers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === 'DATE_NOTES') {
        handleSave();
      } else {
        handleNext();
      }
    }
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name;
  const selectedPaymentName = paymentModes.find(p => p.id === selectedPaymentModeId)?.name;

  return (
    <div className="rounded-2xl border border-app-border bg-app-card p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {currentStep !== 'AMOUNT' ? (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg bg-app-muted border border-app-border text-app-fg hover:opacity-80 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-violet-400" />
            </div>
          )}
          <span className="text-xs font-semibold text-app-fg uppercase tracking-wider">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
        </div>
        {currentStep !== 'AMOUNT' && (
          <button
            onClick={handleReset}
            className="text-xs text-[hsl(215,20%,45%)] hover:text-red-400 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-app-muted h-1 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Dynamic step view with key-based transition triggers */}
      <div key={currentStep} className="animate-fade-in space-y-4">
        {currentStep === 'AMOUNT' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[hsl(215,20%,45%)]">How much did you spend?</h3>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-3xl font-extrabold text-app-fg opacity-60">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0"
                className="w-full pl-9 pr-4 py-4 text-4xl font-extrabold bg-transparent text-app-fg border-b border-app-border focus:border-violet-500 focus:outline-none transition-all placeholder:text-[hsl(215,20%,25%)]"
              />
            </div>
            <p className="text-xs text-[hsl(215,20%,40%)]">Press Enter or click Next to continue</p>
          </div>
        )}

        {currentStep === 'DESCRIPTION' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[hsl(215,20%,45%)] mb-1">What was it for?</h3>
              <input
                ref={descInputRef}
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Groceries, Coffee, Electric bill"
                className="w-full py-3 text-xl font-semibold bg-transparent text-app-fg border-b border-app-border focus:border-violet-500 focus:outline-none transition-all placeholder:text-[hsl(215,20%,30%)]"
              />
            </div>
            
            {/* Suggestions Chips */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(215,20%,40%)]">Quick Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item: string) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setDescription(item);
                      // Look up previous transaction with exact match (case insensitive)
                      const prevTx = expenses.find(e => e.description.trim().toLowerCase() === item.trim().toLowerCase());
                      if (prevTx) {
                        setSelectedCategoryId(prevTx.categoryId);
                        setSelectedPaymentModeId(prevTx.paymentModeId);
                        setTimeout(() => {
                          setDirection('next');
                          setCurrentStep('DATE_NOTES');
                        }, 150);
                      } else {
                        setTimeout(() => {
                          setDirection('next');
                          setCurrentStep('CATEGORY');
                        }, 150);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-app-muted border border-app-border text-app-fg hover:border-violet-500/50 hover:bg-app-muted/80 transition-all cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {amount && <p className="text-xs text-violet-400 font-medium">Spending: {formatCurrency(Number(amount))}</p>}
          </div>
        )}

        {currentStep === 'CATEGORY' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[hsl(215,20%,45%)]">Which category does it fit?</h3>
            
            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-3">
              {(['Need', 'Want', 'Saving'] as const).map(type => {
                const typeCats = categories.filter(c => c.budgetType === type);
                if (typeCats.length === 0) return null;
                return (
                  <div key={type} className="space-y-1">
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      type === 'Need' ? 'text-sky-400' : type === 'Want' ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {type}s
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {typeCats.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            // Smooth auto-advancing delay
                            setTimeout(() => {
                              setDirection('next');
                              setCurrentStep('PAYMENT_MODE');
                            }, 150);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-semibold transition-all border",
                            selectedCategoryId === cat.id
                              ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20"
                              : "bg-app-muted border-app-border text-app-fg hover:border-violet-500/50 hover:bg-app-muted/80"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'PAYMENT_MODE' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[hsl(215,20%,45%)]">How did you pay?</h3>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {paymentModes.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setSelectedPaymentModeId(pm.id);
                    // Smooth auto-advancing delay
                    setTimeout(() => {
                      setDirection('next');
                      setCurrentStep('DATE_NOTES');
                    }, 150);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border",
                    selectedPaymentModeId === pm.id
                      ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20"
                      : "bg-app-muted border-app-border text-app-fg hover:border-violet-500/50 hover:bg-app-muted/80"
                  )}
                >
                  {pm.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'DATE_NOTES' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[hsl(215,20%,45%)]">Final Details</h3>

            {/* Quick Date Chips */}
            <div className="space-y-2">
              <span className="text-xs text-[hsl(215,20%,45%)] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <div className="flex gap-2">
                {[
                  { label: 'Today', value: new Date().toISOString().split('T')[0] },
                  { label: 'Yesterday', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
                ].map(dOpt => (
                  <button
                    key={dOpt.label}
                    type="button"
                    onClick={() => setDate(dOpt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                      date === dOpt.value
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-app-muted border-app-border text-app-fg"
                    )}
                  >
                    {dOpt.label}
                  </button>
                ))}
                
                {/* Manual date field (Simple text/input, no heavy picker) */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-app-muted border border-app-border rounded-lg px-2 py-1.5 text-xs text-app-fg focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <span className="text-xs text-[hsl(215,20%,45%)] flex items-center gap-1 font-medium">
                <FileText className="w-3.5 h-3.5" /> Notes (optional)
              </span>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add details..."
                className="w-full bg-app-muted border border-app-border rounded-lg px-3 py-2 text-xs text-app-fg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Preview Summary */}
            <div className="p-3 bg-app-muted/40 rounded-xl border border-app-border text-xs space-y-1">
              <p className="text-[hsl(215,20%,45%)]">Summary Preview:</p>
              <p className="text-app-fg font-semibold">
                {formatCurrency(Number(amount))} spent on "{description}"
              </p>
              <p className="text-[hsl(215,20%,50%)]">
                Category: <span className="text-app-fg font-medium">{selectedCategoryName}</span> · Mode: <span className="text-app-fg font-medium">{selectedPaymentName}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <p className="text-red-400 text-xs mt-3 animate-pulse">{errorMsg}</p>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex gap-3 mt-6 pt-2 border-t border-app-border/40">
        {currentStep !== 'DATE_NOTES' ? (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving || success}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
              success
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
              </span>
            ) : (
              'Save Expense'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
