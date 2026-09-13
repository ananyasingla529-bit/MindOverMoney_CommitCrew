import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import ApiKeyModal from '../common/ApiKeyModal';

export default function AppLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col antialiased">
      {/* Standard Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Desktop Sidebar (hidden on small screens) */}
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Mobile Nav with ☰ Menu (hidden on lg screens) */}
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

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
