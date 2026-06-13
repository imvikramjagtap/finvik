import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  PlusCircle,
  Eye,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { startFeatureTour, startWelcomeTour, type TourFeature } from '@/hooks/useTour';

interface FeatureCard {
  feature: TourFeature;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  navigateTo: string;
}

const featureCards: FeatureCard[] = [
  {
    feature: 'adding-expense',
    icon: PlusCircle,
    title: 'Adding an Expense',
    description: 'Learn how the triage wizard works, how to use suggestion chips, and how previous transactions auto-fill the form.',
    color: 'text-violet-400',
    navigateTo: '/',
  },
  {
    feature: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard Overview',
    description: 'Understand your monthly stats row, budget cards, and how to filter and browse your transaction ledger.',
    color: 'text-cyan-400',
    navigateTo: '/',
  },
  {
    feature: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Spending Trends',
    description: 'See how Budget vs Actual cards work, read the 12-month trend chart, and understand the category breakdown.',
    color: 'text-amber-400',
    navigateTo: '/analytics',
  },
  {
    feature: 'weekly',
    icon: CalendarDays,
    title: 'Weekly Tracking',
    description: 'Track weekly spending vs your weekly limit. Understand how over-limit weeks are flagged and tracked.',
    color: 'text-sky-400',
    navigateTo: '/weekly',
  },
  {
    feature: 'monthly',
    icon: CalendarRange,
    title: 'Monthly Review',
    description: 'Learn how your Budget Score is calculated, read the daily chart, and explore the category breakdown list.',
    color: 'text-emerald-400',
    navigateTo: '/monthly',
  },
  {
    feature: 'calendar',
    icon: Calendar,
    title: 'Calendar View',
    description: 'See how each day of the year is colored by spending intensity and how to view expenses per day.',
    color: 'text-rose-400',
    navigateTo: '/calendar',
  },
  {
    feature: 'settings',
    icon: Settings,
    title: 'Settings & Customisation',
    description: 'Update your salary, budget split percentages, weekly limit, categories, and payment methods.',
    color: 'text-orange-400',
    navigateTo: '/settings',
  },
  {
    feature: 'private-mode',
    icon: Eye,
    title: 'Private Mode',
    description: 'Learn what Private Mode hides, what remains visible, and how to quickly toggle it on and off.',
    color: 'text-pink-400',
    navigateTo: '/',
  },
];

export default function Help() {
  const navigate = useNavigate();

  const handleStartTour = (feature: TourFeature, navigateTo: string) => {
    navigate(navigateTo);
    setTimeout(() => startFeatureTour(feature, navigate), 300);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      {/* Hero Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-app-fg">Help & Guides</h1>
        </div>
        <p className="text-sm text-[hsl(215,20%,45%)] max-w-xl">
          Interactive tours for every feature. Click "Start Tour" on any card to launch a focused,
          step-by-step walkthrough — we'll highlight exactly what you need to know.
        </p>
      </div>

      {/* Welcome Tour Card */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-app-fg">Welcome Tour</h2>
              <p className="text-xs text-[hsl(215,20%,45%)] mt-0.5">
                The full first-time orientation tour — covers all major sections in one go. Takes under a minute.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => startWelcomeTour(), 300);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer"
          >
            Start Tour <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feature Tour Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[hsl(215,20%,40%)] mb-4">Feature Tours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map(({ feature, icon: Icon, title, description, color, navigateTo }) => (
            <div
              key={feature}
              className="rounded-2xl border border-app-border bg-app-card p-5 animate-fade-in hover:border-violet-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-app-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-app-fg">{title}</h3>
                    <p className="text-xs text-[hsl(215,20%,45%)] mt-1 leading-relaxed">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTour(feature, navigateTo)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-app-muted border border-app-border hover:border-violet-500/40 hover:bg-app-muted/80 text-app-fg text-xs font-medium transition-all cursor-pointer mt-0.5"
                >
                  Tour <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 animate-fade-in">
        <p className="text-xs text-[hsl(215,20%,45%)] leading-relaxed">
          <span className="font-semibold text-emerald-400">💡 Tip:</span> All your data is stored locally in this browser.
          Clearing browser data will reset everything. Use{' '}
          <span className="font-medium text-app-fg">Settings → Export Data</span> to back up your expenses.
        </p>
      </div>
    </div>
  );
}
