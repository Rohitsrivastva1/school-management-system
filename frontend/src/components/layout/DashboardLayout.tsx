'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  schoolName?: string;
  userRole?: string;
}

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard',
  schoolName,
  userRole 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background-light)'}}>
      {/* Fixed Sidebar */}
      <div className={`fixed-sidebar ${
        sidebarOpen ? 'open' : ''
      } lg:translate-x-0`}>
        <Sidebar 
          schoolName={schoolName}
          userRole={userRole}
        />
      </div>

      {/* Main content area */}
      <div className="content-with-sidebar min-h-screen flex flex-col">
        {/* Fixed Header */}
        <div className="fixed-header">
          <Header 
            title={title}
            showSidebarToggle={true}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Scrollable Page content */}
        <main className="scrollable-content p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
