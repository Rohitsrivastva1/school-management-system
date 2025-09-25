'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  title?: string;
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
}

export default function Header({ 
  title = 'Dashboard', 
  showSidebarToggle = false,
  onSidebarToggle 
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'success', message: 'New student admission approved', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'Attendance reminder for Class 1A', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Teacher meeting scheduled for tomorrow', time: '1 hour ago' },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-400 bg-green-50';
      case 'warning': return 'border-l-yellow-400 bg-yellow-50';
      case 'error': return 'border-l-red-400 bg-red-50';
      default: return 'border-l-blue-400 bg-blue-50';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b" style={{borderColor: 'var(--border-light)'}}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold font-nunito" style={{color: 'var(--text-dark)'}}>
              {title}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a7 7 0 00-14 0v5l-5 5h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`px-4 py-3 border-l-4 ${getNotificationColor(notification.type)}`}>
                        <div className="flex items-start space-x-2">
                          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{backgroundColor: 'var(--primary-navy)'}}>
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium" style={{color: 'var(--text-dark)'}}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs capitalize" style={{color: 'var(--text-light)'}}>
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm font-medium" style={{color: 'var(--text-dark)'}}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs" style={{color: 'var(--text-light)'}}>
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/admin/profile')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                    style={{color: 'var(--text-medium)'}}
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                    style={{color: 'var(--text-medium)'}}
                  >
                    School Settings
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
