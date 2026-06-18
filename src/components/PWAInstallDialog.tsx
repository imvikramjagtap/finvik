import React from 'react';
import { X, Share, PlusSquare, ArrowUpFromLine, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  platform: 'ios' | 'mac-safari' | 'other';
}

export function PWAInstallDialog({ isOpen, onClose, platform }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      {/* Dialog container */}
      <div className="relative w-full max-w-md bg-app-card border border-app-border rounded-2xl p-6 animate-fade-in shadow-2xl overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-xl rounded-full" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-bold text-app-fg text-base">Install FinVik</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-app-muted border border-app-border flex items-center justify-center hover:opacity-80 transition-colors">
            <X className="w-4 h-4 text-[hsl(215,20%,55%)]" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[hsl(215,20%,50%)] leading-relaxed">
            Install <span className="font-semibold text-white">FinVik</span> on your device to enjoy offline tracking, faster loading times, and a dedicated app icon on your home screen.
          </p>

          {platform === 'ios' && (
            <div className="space-y-3 bg-app-muted/40 border border-app-border rounded-xl p-4">
              <p className="text-xs font-semibold text-app-fg uppercase tracking-wider">Instructions for iOS Safari:</p>
              <ol className="space-y-2.5 text-xs text-[hsl(215,20%,45%)] list-decimal list-inside">
                <li className="leading-relaxed">
                  Tap the <span className="inline-flex items-center gap-1 font-medium text-white px-1 py-0.5 rounded bg-app-muted border border-app-border"><Share className="w-3.5 h-3.5 inline text-violet-400" /> Share</span> button at the bottom of the screen.
                </li>
                <li className="leading-relaxed">
                  Scroll down the share menu and select <span className="inline-flex items-center gap-1 font-medium text-white px-1 py-0.5 rounded bg-app-muted border border-app-border"><PlusSquare className="w-3.5 h-3.5 inline text-violet-400" /> Add to Home Screen</span>.
                </li>
                <li className="leading-relaxed">
                  Tap <span className="font-semibold text-violet-400">Add</span> in the top-right corner to complete the installation.
                </li>
              </ol>
            </div>
          )}

          {platform === 'mac-safari' && (
            <div className="space-y-3 bg-app-muted/40 border border-app-border rounded-xl p-4">
              <p className="text-xs font-semibold text-app-fg uppercase tracking-wider">Instructions for macOS Safari:</p>
              <ol className="space-y-2.5 text-xs text-[hsl(215,20%,45%)] list-decimal list-inside">
                <li className="leading-relaxed">
                  Click the <span className="inline-flex items-center gap-1 font-medium text-white px-1 py-0.5 rounded bg-app-muted border border-app-border"><ArrowUpFromLine className="w-3.5 h-3.5 inline text-violet-400" /> Share</span> button in the top-right of your Safari window.
                </li>
                <li className="leading-relaxed">
                  Select <span className="inline-flex items-center gap-1 font-medium text-white px-1 py-0.5 rounded bg-app-muted border border-app-border"><PlusSquare className="w-3.5 h-3.5 inline text-violet-400" /> Add to Dock</span>.
                </li>
                <li className="leading-relaxed">
                  Click <span className="font-semibold text-violet-400">Add</span> in the popup prompt to install FinVik as a Dock app.
                </li>
              </ol>
            </div>
          )}

          {platform === 'other' && (
            <div className="space-y-3 bg-app-muted/40 border border-app-border rounded-xl p-4">
              <p className="text-xs font-semibold text-app-fg uppercase tracking-wider">How to Install:</p>
              <p className="text-xs text-[hsl(215,20%,45%)] leading-relaxed">
                Click the installation icon in your browser's address bar (typically next to the zoom or bookmark icons) or open the browser menu (three dots) and select <span className="font-medium text-white">Install App</span>.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-violet-500/10"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
