import React from 'react';
import { X, Sparkles, HelpCircle } from 'lucide-react';
import { startWelcomeTour } from '@/hooks/useTour';

interface Props {
  onClose: () => void;
}

export function TourPromptDialog({ onClose }: Props) {
  const handleStart = () => {
    onClose();
    // Wait slightly to allow the modal to disappear, then trigger welcome tour
    setTimeout(() => {
      startWelcomeTour();
    }, 300);
  };

  const handleDismiss = () => {
    // If they say no/dismiss, mark that they've seen/rejected it so it doesn't prompt again
    localStorage.setItem('myfintech_tour_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleDismiss} />
      <div className="relative w-full max-w-md bg-app-card border border-app-border rounded-2xl p-6 animate-fade-in shadow-2xl overflow-hidden">
        {/* Decorative corner glow matching the premium style */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-xl rounded-full" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-bold text-app-fg text-base">Quick Welcome Tour?</h2>
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 rounded-lg bg-app-muted border border-app-border flex items-center justify-center hover:opacity-80 transition-colors">
            <X className="w-4 h-4 text-[hsl(215,20%,55%)]" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[hsl(215,20%,50%)] leading-relaxed">
            Welcome to <span className="font-semibold text-white">FinVik</span>! Would you like a brief interactive walkthrough of the core features? It takes under a minute.
          </p>

          <div className="p-3 bg-app-muted/50 border border-app-border rounded-xl flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[hsl(215,20%,45%)] leading-relaxed">
              If you skip now, you can always launch this tour later by visiting the <span className="font-medium text-app-fg">Help & Guides</span> section.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl border border-app-border text-[hsl(215,20%,55%)] text-sm font-medium hover:bg-app-muted hover:text-app-fg transition-all cursor-pointer">
              No, thanks
            </button>
            <button type="button" onClick={handleStart}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-500/10">
              Start Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
