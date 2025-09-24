'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

export default function TeacherClassesPage() {
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
      title="My Classes"
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Management</h3>
          <p className="text-gray-500 mb-4">View and manage your assigned classes</p>
          <p className="text-sm text-gray-400">This feature will be available soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
