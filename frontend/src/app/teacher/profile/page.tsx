'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

export default function TeacherProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || (user.role !== 'class_teacher' && user.role !== 'subject_teacher')) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  return (
    <DashboardLayout
      title="My Profile"
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teacher Profile</h3>
          <p className="text-gray-500 mb-4">View and edit your profile information</p>
          <p className="text-sm text-gray-400">This feature will be available soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
