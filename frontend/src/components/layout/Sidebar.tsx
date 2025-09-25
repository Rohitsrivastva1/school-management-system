'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SidebarProps {
  schoolName?: string;
  userRole?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
    roles: ['admin'],
    teacherHref: '/teacher/dashboard'
  },
  {
    name: 'Students',
    href: '/admin/students',
    icon: '👥',
    roles: ['admin', 'class_teacher'],
    teacherHref: '/teacher/students'
  },
  {
    name: 'Teachers',
    href: '/admin/teachers',
    icon: '👨‍🏫',
    roles: ['admin']
  },
  {
    name: 'Classes',
    href: '/admin/classes',
    icon: '🏫',
    roles: ['admin', 'class_teacher'],
    teacherHref: '/teacher/classes'
  },
  {
    name: 'Attendance',
    href: '/admin/attendance',
    icon: '📅',
    roles: ['admin', 'class_teacher', 'subject_teacher'],
    teacherHref: '/teacher/attendance'
  },
  {
    name: 'Homework',
    href: '/admin/homework',
    icon: '📝',
    roles: ['admin', 'class_teacher', 'subject_teacher'],
    teacherHref: '/teacher/homework'
  },
  {
    name: 'Timetable',
    href: '/admin/timetable',
    icon: '📅',
    roles: ['admin', 'class_teacher', 'subject_teacher'],
    teacherHref: '/teacher/timetable'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: '📈',
    roles: ['admin']
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
    roles: ['admin']
  },
  // Parent-specific navigation
  {
    name: 'Dashboard',
    href: '/parent/dashboard',
    icon: '🏠',
    roles: ['parent']
  },
  {
    name: 'Timetable',
    href: '/parent/timetable',
    icon: '📅',
    roles: ['parent']
  },
  {
    name: 'Attendance',
    href: '/parent/attendance',
    icon: '📊',
    roles: ['parent']
  },
  {
    name: 'Homework',
    href: '/parent/homework',
    icon: '📝',
    roles: ['parent']
  }
];

export default function Sidebar({ schoolName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole || 'admin')
  );

  return (
    <div className={`shadow-xl transition-all duration-300 h-full flex flex-col sidebar-container ${
      isCollapsed ? 'w-16' : 'w-72'
    }`} style={{backgroundColor: 'var(--primary-navy)'}}>
      {/* Header */}
      <div className="p-4 border-b" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-white truncate font-nunito">
                {schoolName || 'School Management'}
              </h2>
              <p className="text-xs text-blue-200 capitalize">
                {userRole?.replace('_', ' ')} Dashboard
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => {
          // Use teacher-specific href for teachers, admin href for admins
          const href = (userRole === 'class_teacher' || userRole === 'subject_teacher') && item.teacherHref 
            ? item.teacherHref 
            : item.href;
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-lg font-semibold'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions - visible to admin only */}
      {!isCollapsed && userRole === 'admin' && (
        <div className="p-4 border-t flex-shrink-0" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link href="/admin/teachers/create">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                <span className="flex items-center"><span className="mr-3 text-lg">👨‍🏫</span> <span className="font-medium">Add Teacher</span></span>
                <span className="opacity-70">→</span>
              </button>
            </Link>
            <Link href="/admin/students/create">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                <span className="flex items-center"><span className="mr-3 text-lg">👥</span> <span className="font-medium">Add Student</span></span>
                <span className="opacity-70">→</span>
              </button>
            </Link>
            <Link href="/admin/classes/create">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                <span className="flex items-center"><span className="mr-3 text-lg">🏫</span> <span className="font-medium">Create Class</span></span>
                <span className="opacity-70">→</span>
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t flex-shrink-0" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
        {!isCollapsed && (
          <div className="text-xs text-blue-200 text-center">
            School Management System
          </div>
        )}
      </div>
    </div>
  );
}
