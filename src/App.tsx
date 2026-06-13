import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, MobileNav } from '@/components/Navigation';
import { useAppStore } from '@/store/useAppStore';
import Dashboard from '@/pages/Dashboard';
import Expenses from '@/pages/Expenses';
import Analytics from '@/pages/Analytics';
import Weekly from '@/pages/Weekly';
import Monthly from '@/pages/Monthly';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';

export default function App() {
  const loadAll = useAppStore(s => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-app-bg text-app-fg">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/weekly" element={<Weekly />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
