'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [schoolName, setSchoolName] = useState<string>('School Management System');

  useEffect(() => {
    // In case we later load school profile here
  }, []);

  return (
    <DashboardLayout
      title="Student Dashboard"
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{color: 'var(--text-dark)'}}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h2>
        <p style={{color: 'var(--text-medium)'}}>
          This is your student dashboard. Content will appear here once configured.
        </p>
      </div>
    </DashboardLayout>
  );
}


