'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'class_teacher':
      case 'subject_teacher':
        router.push('/teacher/dashboard');
        break;
      case 'student':
        router.push('/student/dashboard');
        break;
      case 'parent':
        router.push('/parent/dashboard');
        break;
      default:
        router.push('/login');
    }
  }, [user, isAuthenticated, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
