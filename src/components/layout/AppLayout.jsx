import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import ApiKeyModal from '../common/ApiKeyModal';
import { Monitor, Smartphone, Sliders } from 'lucide-react';

export default function AppLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 'auto' | 'desktop' | 'mobile'
  const [aspectMode, setAspectMode] = useState('auto');

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col antialiased">
      {/* Top Floating Aspect Switcher Bar (Desktop & Mobile comparison toggle) */}
      <div className="bg-white border-b border-surface-200 px-4 py-2 flex items-center justify-between text-xs text-surface-500 z-50">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-surface-700 hidden sm:inline">View Aspect:</span>
          <div className="flex items-center bg-surface-50 p-1 rounded-lg border border-surface-200">
            <button
              onClick={() => setAspectMode('auto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition font-medium text-[11px] ${
                aspectMode === 'auto'
                  ? 'bg-white text-surface-900 shadow-minimal border border-surface-200'
                  : 'text-surface-500 hover:text-surface-800 border border-transparent'
              }`}
            >
              <Sliders className="w-3 h-3 stroke-[1.5]" />
              <span>Auto</span>
            </button>

            <button
              onClick={() => setAspectMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition font-medium text-[11px] ${
                aspectMode === 'desktop'
                  ? 'bg-white text-surface-900 shadow-minimal border border-surface-200'
                  : 'text-surface-500 hover:text-surface-800 border border-transparent'
              }`}
            >
              <Monitor className="w-3 h-3 stroke-[1.5]" />
              <span>Desktop</span>
            </button>

            <button
              onClick={() => setAspectMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition font-medium text-[11px] ${
                aspectMode === 'mobile'
                  ? 'bg-white text-surface-900 shadow-minimal border border-surface-200'
                  : 'text-surface-500 hover:text-surface-800 border border-transparent'
              }`}
            >
              <Smartphone className="w-3 h-3 stroke-[1.5]" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-surface-500 hidden md:flex items-center gap-2">
          {aspectMode === 'mobile' && (
            <span className="text-surface-900 font-medium">
              📱 Simulated Mobile View active with ☰ Hamburger Menu
            </span>
          )}
          {aspectMode === 'desktop' && (
            <span className="text-surface-900 font-medium">
              🖥️ Full Desktop Site View active
            </span>
          )}
          {aspectMode === 'auto' && (
            <span>Responsive: Resize browser window or toggle above</span>
          )}
        </div>
      </div>

      {/* RENDER MODE: MOBILE PHONE FRAME SIMULATOR */}
      {aspectMode === 'mobile' ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-surface-100">
          {/* Smartphone Frame Mockup */}
          <div className="w-full max-w-[400px] h-[820px] bg-white rounded-[42px] border-[10px] border-surface-900 shadow-xl flex flex-col overflow-hidden relative">
            {/* Phone Notch & Speaker Bar */}
            <div className="h-6 bg-white flex items-center justify-center relative shrink-0">
              <div className="w-20 h-3.5 bg-surface-900 rounded-full flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-surface-950" />
                <div className="w-6 h-1 rounded-full bg-surface-700" />
              </div>
            </div>

            {/* Mobile Nav with ☰ Menu */}
            <MobileNav onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Scrollable Mobile Screen Content */}
            <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 text-xs bg-surface-50">
              <Outlet />
            </main>
          </div>
        </div>
      ) : aspectMode === 'desktop' ? (
        /* RENDER MODE: FORCED DESKTOP SITE */
        <div className="flex-1 flex flex-row">
          <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
          <div className="flex-1 flex flex-col min-w-0 pb-8">
            <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
            <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        /* RENDER MODE: AUTO RESPONSIVE (STANDARD CSS BREAKPOINTS) */
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Desktop Sidebar (hidden on small screens) */}
          <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

          {/* Mobile Nav Top & Bottom with ☰ Menu (hidden on lg screens) */}
          <div className="lg:hidden">
            <MobileNav onOpenSettings={() => setIsSettingsOpen(true)} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
            <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      )}

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
