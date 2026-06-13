import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/weekly', label: 'Weekly', icon: CalendarDays },
  { path: '/monthly', label: 'Monthly', icon: CalendarRange },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[hsl(222,47%,7%)] border-r border-[hsl(217,33%,14%)] fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[hsl(217,33%,14%)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">My FinTech</p>
            <p className="text-[hsl(215,20%,45%)] text-xs">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-[hsl(215,20%,55%)] hover:bg-[hsl(217,33%,14%)] hover:text-[hsl(213,31%,91%)]'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(217,33%,14%)]">
        <p className="text-[hsl(215,20%,35%)] text-xs text-center">v1.0 · Data stored locally</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(222,47%,7%)] border-t border-[hsl(217,33%,14%)] px-2 py-1 safe-area-bottom">
      <div className="flex justify-around">
        {navItems.slice(0, 6).map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-violet-400'
                  : 'text-[hsl(215,20%,45%)]'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all duration-200',
              isActive ? 'text-violet-400' : 'text-[hsl(215,20%,45%)]'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
