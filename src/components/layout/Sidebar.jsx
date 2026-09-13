import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Target, 
  BookOpen, 
  Coins, 
  Settings,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onOpenSettings }) {
  const { coins, quizProgress } = useApp();
  const { signOut } = useAuth();

  const navItems = [
    {
      to: '/explore',
      label: 'Explore',
      sublabel: 'Asset Catalog & Filters',
      icon: Compass,
      match: ['/', '/explore']
    },
    {
      to: '/decide',
      label: 'Decide',
      sublabel: 'Guided Decision Coach',
      icon: Target,
      match: ['/decide']
    },
    {
      to: '/learn',
      label: 'Learn & Practice',
      sublabel: 'Quiz & Coin Simulator',
      icon: BookOpen,
      badge: '+50 Coins',
      match: ['/learn']
    }
  ];

  // Calculate beginner investor rank based on quiz answers
  const correctCount = Object.values(quizProgress.answered || {}).filter(a => a.isCorrect).length;
  let level = 'Beginner Scout';
  let progressPct = Math.min(100, Math.round((correctCount / 6) * 100));
  if (correctCount >= 3 && correctCount < 6) level = 'Savvy Apprentice';
  if (correctCount >= 6) level = 'Confident Investor';

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 bg-surface-50 border-r border-surface-200 p-5 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-2 pb-6 border-b border-surface-200">
        <div className="w-10 h-10 rounded-full border border-surface-300 flex items-center justify-center bg-white text-surface-900 font-black text-xl shadow-minimal">
          M
        </div>
        <div>
          <h1 className="font-semibold text-lg tracking-tight text-surface-900 flex items-center gap-1.5">
            Mind Over Money
          </h1>
          <p className="text-xs font-medium text-surface-500">Calm First-Time Investing</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="py-6 space-y-2 flex-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-2">Sections</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium transition-all group ${
                isActive
                  ? 'bg-white text-surface-900 border border-surface-200 shadow-minimal'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/50 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`transition-colors ${
                      isActive
                        ? 'text-surface-900'
                        : 'text-surface-400 group-hover:text-surface-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block leading-tight">{item.label}</span>
                    <span className="text-[11px] text-surface-500 block">{item.sublabel}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 border border-surface-200">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Beginner Progress & Coin Balance Card */}
      <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-minimal space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-surface-900">
            <Coins className="w-4 h-4 stroke-[1.5]" />
            <span className="text-xs font-semibold">Practice Coins</span>
          </div>
          <span className="font-bold text-surface-900 text-sm bg-surface-50 px-2 py-0.5 rounded-md border border-surface-200">
            {coins}
          </span>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-surface-500">{level}</span>
            <span className="text-surface-900 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-1 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer / Settings Modal trigger */}
      <div className="pt-3 border-t border-surface-200 flex items-center justify-between text-xs text-surface-500">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:text-surface-900 hover:bg-surface-100 transition font-medium"
          title="AI and App Settings"
        >
          <Settings className="w-4 h-4 stroke-[1.5]" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition font-medium"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
