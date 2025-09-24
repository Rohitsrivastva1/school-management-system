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
  }
];

export default function Sidebar({ schoolName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole || 'admin')
  );

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {schoolName || 'School Management'}
              </h2>
              <p className="text-xs text-gray-500 capitalize">
                {userRole?.replace('_', ' ')} Dashboard
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? '→' : '←'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          // Use teacher-specific href for teachers, admin href for admins
          const href = (userRole === 'class_teacher' || userRole === 'subject_teacher') && item.teacherHref 
            ? item.teacherHref 
            : item.href;
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
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

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/admin/teachers/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span className="mr-2">👨‍🏫</span>
                Add Teacher
              </Button>
            </Link>
            <Link href="/admin/students/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span className="mr-2">👥</span>
                Add Student
              </Button>
            </Link>
            <Link href="/admin/classes/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span className="mr-2">🏫</span>
                Create Class
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            School Management System
          </div>
        )}
      </div>
    </div>
  );
}
