import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';

const TOUR_SEEN_KEY = 'myfintech_tour_seen';

// Shared driver config
function makeDriver(steps: DriveStep[], onComplete?: () => void) {
  return driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0,0,0,0.6)',
    stagePadding: 8,
    stageRadius: 12,
    allowClose: true,
    popoverClass: 'fintech-popover',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Got it ✓',
    onDestroyed: onComplete,
    steps,
  });
}

// ─────────────────────────────────────────────
// WELCOME TOUR — runs once after onboarding
// ─────────────────────────────────────────────
export function startWelcomeTour() {
  localStorage.setItem(TOUR_SEEN_KEY, 'true');

  const driverObj = makeDriver([
    {
      element: '#driver-add-expense',
      popover: {
        title: '👋 Welcome to FinVik!',
        description:
          'This is your quick add panel. Log a spend in seconds — just answer a few questions one at a time.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#driver-stats-row',
      popover: {
        title: '📊 Your month at a glance',
        description:
          'See your total spend, remaining balance, and transaction count for the current month — always up to date.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#driver-budget-cards',
      popover: {
        title: '🧮 50 / 30 / 20 Budget Tracking',
        description:
          'Three cards track your Needs, Wants, and Savings separately. Color changes to red when you go over budget.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#driver-nav-sidebar',
      popover: {
        title: '🗂 Navigation',
        description:
          'Each tab shows a different view — Analytics for breakdowns, Weekly/Monthly for time-based tracking, Calendar to see spending by day.',
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '#driver-theme-toggle',
      popover: {
        title: '🌙 Light & Dark Mode',
        description: 'Switch between light and dark mode here anytime.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#driver-private-toggle',
      popover: {
        title: '🔒 Private Mode',
        description:
          'Hides all your income and budget figures — great for sharing your screen. Percentages and charts remain visible.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#driver-settings-nav',
      popover: {
        title: '⚙️ Settings',
        description:
          'Update your monthly salary, tweak the budget split, or manage categories and payment methods anytime.',
        side: 'right',
        align: 'start',
      },
    },
  ]);

  driverObj.drive();
}

export function hasSeenTour(): boolean {
  return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
}

// ─────────────────────────────────────────────
// FEATURE TOURS — triggered from Help page
// ─────────────────────────────────────────────

export type TourFeature =
  | 'adding-expense'
  | 'dashboard'
  | 'analytics'
  | 'weekly'
  | 'monthly'
  | 'calendar'
  | 'settings'
  | 'private-mode';

export function startFeatureTour(feature: TourFeature, navigate: (path: string) => void) {
  switch (feature) {
    case 'adding-expense':
      startAddExpenseTour(navigate);
      break;
    case 'dashboard':
      startDashboardTour(navigate);
      break;
    case 'analytics':
      startAnalyticsTour(navigate);
      break;
    case 'weekly':
      startWeeklyTour(navigate);
      break;
    case 'monthly':
      startMonthlyTour(navigate);
      break;
    case 'calendar':
      startCalendarTour(navigate);
      break;
    case 'settings':
      startSettingsTour(navigate);
      break;
    case 'private-mode':
      startPrivateModeTour(navigate);
      break;
  }
}

function startAddExpenseTour(navigate: (path: string) => void) {
  navigate('/');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-add-expense',
        popover: {
          title: '➕ Adding an Expense',
          description:
            'Click here to start adding. The triage wizard walks you through one question at a time.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#driver-expense-amount',
        popover: {
          title: '1️⃣ Enter the Amount',
          description:
            'Type the amount you spent. Press Enter or tap Continue to move to the next step.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-expense-suggestions',
        popover: {
          title: '2️⃣ What was it for?',
          description:
            'Type a description or tap one of the suggestion chips. Chips from recent expenses auto-fill the Category and Payment Mode too!',
          side: 'bottom',
        },
      },
      {
        element: '#driver-add-expense',
        popover: {
          title: '✅ Category → Payment → Save',
          description:
            'After the description, pick a category and payment method. Each tap advances automatically. The whole flow takes under 10 seconds.',
          side: 'right',
        },
      },
    ]).drive();
  }, 400);
}

function startDashboardTour(navigate: (path: string) => void) {
  navigate('/');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-stats-row',
        popover: {
          title: '📊 Stats Row',
          description:
            'Your monthly summary — total spent, remaining balance, transaction count, and your savings goal progress.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-budget-cards',
        popover: {
          title: '💳 Budget Cards',
          description:
            'One card per budget type. The progress bar fills as you spend. It turns red if you go over budget for that category.',
          side: 'top',
        },
      },
      {
        element: '#driver-recent-transactions',
        popover: {
          title: '🧾 Recent Transactions',
          description:
            'Your latest expenses are listed here. Tap any transaction to delete or see its details.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startAnalyticsTour(navigate: (path: string) => void) {
  navigate('/analytics');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-analytics-charts',
        popover: {
          title: '📈 Analytics Overview',
          description:
            'See a visual breakdown of your spending across Needs, Wants, and Savings for the selected month.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-analytics-budget-cards',
        popover: {
          title: '🗂 Budget vs Actual',
          description:
            'Each card compares how much you budgeted vs how much you actually spent, with a percentage used indicator.',
          side: 'top',
        },
      },
      {
        element: '#driver-analytics-category-breakdown',
        popover: {
          title: '🔍 Category Breakdown',
          description:
            'See exactly which categories consumed most of your budget this month.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startWeeklyTour(navigate: (path: string) => void) {
  navigate('/weekly');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-weekly-summary',
        popover: {
          title: '📅 Weekly Tracking',
          description:
            'Each card represents one week of the current month. See how much you spent vs your weekly spending limit.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-weekly-chart',
        popover: {
          title: '📊 Weekly Chart',
          description:
            'A visual bar chart showing weekly spending vs your weekly limit. Bars turn red when you exceed the limit.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startMonthlyTour(navigate: (path: string) => void) {
  navigate('/monthly');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-monthly-score',
        popover: {
          title: '🏆 Budget Score',
          description:
            'A score out of 100 that rates your financial health for the month — based on how well you stuck to your budget, savings, and weekly limits.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-monthly-chart',
        popover: {
          title: '📈 Daily Spend Chart',
          description:
            'A line chart of your spending day by day across the month. Spot spikes and quiet periods at a glance.',
          side: 'top',
        },
      },
      {
        element: '#driver-monthly-breakdown',
        popover: {
          title: '📋 Category Breakdown',
          description:
            'A ranked list of how much you spent per category this month.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startCalendarTour(navigate: (path: string) => void) {
  navigate('/calendar');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-calendar-grid',
        popover: {
          title: '🗓 Calendar View',
          description:
            'Each day shows a dot if you have expenses. The dot color and size indicates how much you spent relative to your daily average.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-calendar-summary',
        popover: {
          title: '📋 Day Summary',
          description:
            'Click any day to see a breakdown of exactly what you spent on that date.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startSettingsTour(navigate: (path: string) => void) {
  navigate('/settings');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-salary-input',
        popover: {
          title: '💰 Monthly Salary',
          description:
            'Update your monthly income here. All budget calculations automatically recalculate.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-budget-rule',
        popover: {
          title: '📐 Budget Rule',
          description:
            'Customize your Needs/Wants/Savings percentage split. Must total 100%.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-settings-categories',
        popover: {
          title: '🏷 Categories',
          description:
            'Add, rename, or delete expense categories here. Each is tagged as a Need, Want, or Saving.',
          side: 'top',
        },
      },
      {
        element: '#driver-settings-payment-modes',
        popover: {
          title: '💳 Payment Methods',
          description:
            'Manage the payment methods available when logging an expense.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}

function startPrivateModeTour(navigate: (path: string) => void) {
  navigate('/');
  setTimeout(() => {
    makeDriver([
      {
        element: '#driver-private-toggle',
        popover: {
          title: '🔒 Private Mode Toggle',
          description:
            'Tap this to activate Private Mode. All absolute income and budget figures are immediately hidden.',
          side: 'top',
        },
      },
      {
        element: '#driver-stats-row',
        popover: {
          title: '🙈 What gets hidden',
          description:
            'Income-derived figures like your salary, budget limits, and remaining balances are replaced with ••••. Percentages and progress bars remain visible.',
          side: 'bottom',
        },
      },
      {
        element: '#driver-theme-toggle',
        popover: {
          title: '✅ Still works normally',
          description:
            'Everything else — adding expenses, navigation, analytics charts — works normally in Private Mode.',
          side: 'top',
        },
      },
    ]).drive();
  }, 400);
}
