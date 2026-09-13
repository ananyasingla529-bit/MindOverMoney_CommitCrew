import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Compass, 
  Target, 
  BookOpen, 
  Coins, 
  Settings, 
  ChevronRight,
  Layers,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav({ onOpenSettings }) {
  const { coins, quizProgress } = useApp();
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Beginner rank calculation
  const correctCount = Object.values(quizProgress.answered || {}).filter(a => a.isCorrect).length;
  let level = 'Beginner Scout';
  let progressPct = Math.min(100, Math.round((correctCount / 6) * 100));
  if (correctCount >= 3 && correctCount < 6) level = 'Savvy Apprentice';
  if (correctCount >= 6) level = 'Confident Investor';

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-surface-50 border-b border-surface-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger ☰ Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-surface-600 hover:text-surface-900 transition flex items-center gap-1"
            aria-label="Open Mobile Menu (☰)"
            title="Menu (☰)"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Logo */}
          <NavLink to="/explore" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-surface-300 bg-white flex items-center justify-center text-surface-900 font-bold shadow-minimal">
              M
            </div>
            <span className="font-semibold text-sm tracking-tight text-surface-900">Mind Over Money</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {/* Practice Coins Quick Pill */}
          <NavLink
            to="/learn"
            className="flex items-center gap-1.5 bg-white border border-surface-200 text-surface-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-minimal"
          >
            <Coins className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{coins}</span>
          </NavLink>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer Menu Content */}
          <div className="relative w-4/5 max-w-xs bg-surface-50 border-r border-surface-200 h-full flex flex-col justify-between p-5 z-10 shadow-2xl animate-fadeIn">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-surface-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full border border-surface-300 bg-white flex items-center justify-center text-surface-900 font-bold shadow-minimal">
                    M
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-surface-900 leading-none">Mind Over Money</h2>
                    <span className="text-[10px] text-surface-500 font-medium mt-1 inline-block">Mobile Navigation</span>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-5 space-y-2">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-surface-400 px-3 block mb-2">
                  Menu Sections
                </span>

                <NavLink
                  to="/explore"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-white text-surface-900 border border-surface-200 shadow-minimal'
                        : 'text-surface-600 hover:bg-surface-100/50 hover:text-surface-900 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 stroke-[1.5]" />
                    <span>Explore Catalog</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                </NavLink>

                <NavLink
                  to="/decide"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-white text-surface-900 border border-surface-200 shadow-minimal'
                        : 'text-surface-600 hover:bg-surface-100/50 hover:text-surface-900 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 stroke-[1.5]" />
                    <span>AI Coach</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                </NavLink>

                <NavLink
                  to="/learn"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-white text-surface-900 border border-surface-200 shadow-minimal'
                        : 'text-surface-600 hover:bg-surface-100/50 hover:text-surface-900 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 stroke-[1.5]" />
                    <span>Learn & Simulator</span>
                  </div>
                  <span className="text-[10px] bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full border border-surface-200 font-bold">
                    +50 Coins
                  </span>
                </NavLink>

                <NavLink
                  to="/asset/vanguard-sp500-etf"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-white text-surface-900 border border-surface-200 shadow-minimal'
                        : 'text-surface-600 hover:bg-surface-100/50 hover:text-surface-900 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 stroke-[1.5]" />
                    <span>Sample Asset (VOO)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                </NavLink>
              </div>

              {/* Investor Progress Card in Drawer */}
              <div className="p-4 rounded-2xl bg-white border border-surface-200 shadow-minimal space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500 font-medium">Rank</span>
                  <span className="text-surface-900 font-bold">{level}</span>
                </div>
                <div className="w-full h-1 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-surface-500">Practice Coins</span>
                  <span className="font-bold text-surface-900 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 stroke-[1.5]" />
                    {coins}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-surface-200 space-y-2">
              <button
                onClick={() => {
                  closeDrawer();
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-surface-100 text-surface-700 text-sm font-medium transition"
              >
                <Settings className="w-4 h-4 stroke-[1.5]" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => {
                  closeDrawer();
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4 stroke-[1.5]" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Fixed Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-50 border-t border-surface-200 px-2 py-2 flex items-center justify-around pb-safe">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-4 rounded-xl transition ${
              isActive ? 'text-surface-900 font-medium' : 'text-surface-400 hover:text-surface-600'
            }`
          }
        >
          <Compass className="w-5 h-5 mb-1 stroke-[1.5]" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        <NavLink
          to="/decide"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-4 rounded-xl transition ${
              isActive ? 'text-surface-900 font-medium' : 'text-surface-400 hover:text-surface-600'
            }`
          }
        >
          <Target className="w-5 h-5 mb-1 stroke-[1.5]" />
          <span className="text-[10px]">Decide</span>
        </NavLink>

        <NavLink
          to="/learn"
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-4 rounded-xl transition ${
              isActive ? 'text-surface-900 font-medium' : 'text-surface-400 hover:text-surface-600'
            }`
          }
        >
          <div className="relative">
            <BookOpen className="w-5 h-5 mb-1 stroke-[1.5]" />
          </div>
          <span className="text-[10px]">Learn</span>
        </NavLink>

        {/* Quick Menu button in bottom bar too */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center py-1.5 px-4 rounded-xl text-surface-400 hover:text-surface-600 transition"
        >
          <Menu className="w-5 h-5 mb-1 stroke-[1.5]" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </>
  );
}
