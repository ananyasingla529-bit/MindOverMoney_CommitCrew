import React from 'react';
import { NavLink } from 'react-router-dom';
import { Coins, Database, Settings, LogOut, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenSettings }) {
  const { coins, supabaseStatus } = useApp();
  const { user, signOut } = useAuth();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-surface-50 border-b border-surface-200 sticky top-0 z-30">
      {/* Welcome / Mode indicator */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-surface-900 tracking-tight text-lg">
          Mind Over Money
        </span>
        <div className="h-4 w-px bg-surface-300"></div>
        <span className="text-sm text-surface-500 flex items-center gap-1.5 font-medium">
          <User className="w-4 h-4" />
          {user?.email || 'Authenticated session'}
        </span>
      </div>

      {/* Right Action Widgets */}
      <div className="flex items-center gap-4">
        {/* Practice Coins Pill */}
        <NavLink
          to="/learn"
          className="flex items-center gap-2 bg-white border border-surface-200 hover:border-surface-400 text-surface-800 px-4 py-2 rounded-full text-sm font-medium transition shadow-minimal group"
        >
          <Coins className="w-4 h-4 text-gold-500" />
          <span>{coins} Practice Coins</span>
        </NavLink>

        {/* Backend & Database Status Badge */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white hover:bg-surface-100 text-surface-600 border border-surface-200 transition shadow-minimal"
        >
          <Database className="w-4 h-4 text-surface-400" />
          <span>{supabaseStatus === 'connected' ? 'Live' : 'Ready'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-full bg-white border border-surface-200 text-surface-600 hover:text-surface-900 hover:border-surface-300 transition shadow-minimal"
          title="Settings & System Status"
          aria-label="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sign out button */}
        <button
          onClick={() => signOut()}
          className="p-2.5 rounded-full bg-white border border-surface-200 text-surface-600 hover:text-surface-900 hover:border-surface-300 transition shadow-minimal"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
