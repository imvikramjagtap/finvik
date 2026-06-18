import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  TrendingUp,
  Sun,
  Moon,
  Eye,
  EyeOff,
  HelpCircle,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { PWAInstallDialog } from '@/components/PWAInstallDialog';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/weekly', label: 'Weekly', icon: CalendarDays },
  { path: '/monthly', label: 'Monthly', icon: CalendarRange },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/help', label: 'Help & Guides', icon: HelpCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { theme, toggleTheme, privateMode, togglePrivateMode } = useAppStore();
  const { shouldShowInstallButton, platform, triggerInstall } = usePWAInstall();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInstallClick = async () => {
    if (platform === 'other') {
      const success = await triggerInstall();
      if (!success) {
        setIsDialogOpen(true);
      }
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-app-card border-r border-app-border fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-app-fg text-sm">FinVik</p>
            <p className="text-[hsl(215,20%,45%)] text-xs">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav id="driver-nav-sidebar" className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            id={path === '/settings' ? 'driver-settings-nav' : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group border-none',
                isActive
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300'
                  : 'text-[hsl(215,20%,55%)] hover:bg-app-muted hover:text-app-fg'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Toggles */}
      <div className="px-4 py-3 border-t border-app-border space-y-2">
        <button
          id="driver-theme-toggle"
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-app-fg hover:bg-app-muted transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-app-muted border border-app-border text-[hsl(215,20%,45%)]">
            Theme
          </span>
        </button>

        <button
          id="driver-private-toggle"
          onClick={togglePrivateMode}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-app-fg hover:bg-app-muted transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3">
            {privateMode ? <EyeOff className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4 text-emerald-500" />}
            <span>{privateMode ? 'Private Mode' : 'Public Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-app-muted border border-app-border text-[hsl(215,20%,45%)]">
            {privateMode ? 'Hidden' : 'Visible'}
          </span>
        </button>

        {shouldShowInstallButton && (
          <button
            onClick={handleInstallClick}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-violet-600/10"
          >
            <span className="flex items-center gap-3">
              <Download className="w-4 h-4 text-violet-200" />
              <span>Install App</span>
            </span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-app-border text-center space-y-2">
        <p className="text-[hsl(215,20%,35%)] text-xs">v1.0 · Data stored locally</p>
        <p className="text-[hsl(215,20%,40%)] text-xs flex items-center justify-center gap-1">
          Built by <a href="https://vikramjagtap.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">Vikram Jagtap</a>
        </p>
      </div>

      <PWAInstallDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} platform={platform} />
    </aside>
  );
}

export function MobileNav() {
  const { theme, toggleTheme, privateMode, togglePrivateMode } = useAppStore();
  const { shouldShowInstallButton, platform, triggerInstall } = usePWAInstall();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInstallClick = async () => {
    if (platform === 'other') {
      const success = await triggerInstall();
      if (!success) {
        setIsDialogOpen(true);
      }
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-app-card border-b border-app-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-app-fg text-sm">FinVik</span>
        </div>
        <div className="flex items-center gap-2">
          {shouldShowInstallButton && (
            <button
              onClick={handleInstallClick}
              className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Install app"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          )}
          <button
            onClick={togglePrivateMode}
            className="w-9 h-9 rounded-lg bg-app-muted border border-app-border flex items-center justify-center text-app-fg hover:opacity-85 transition-colors cursor-pointer"
            aria-label="Toggle private mode"
          >
            {privateMode ? <EyeOff className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4 text-emerald-500" />}
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-app-muted border border-app-border flex items-center justify-center text-app-fg hover:opacity-85 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-app-card border-t border-app-border px-1 py-1 safe-area-bottom w-full">
        <div className="grid grid-cols-6 w-full">
          {navItems.slice(0, 5).map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all duration-200 min-w-0 text-center',
                  isActive
                    ? 'text-violet-500 dark:text-violet-400 font-semibold'
                    : 'text-[hsl(215,20%,45%)]'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-medium truncate w-full px-1">{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all duration-200 min-w-0 text-center',
                isActive ? 'text-violet-500 dark:text-violet-400 font-semibold' : 'text-[hsl(215,20%,45%)]'
              )
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-medium truncate w-full px-1">Settings</span>
          </NavLink>
        </div>
      </nav>

      <PWAInstallDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} platform={platform} />
    </>
  );
}
