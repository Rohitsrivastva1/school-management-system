'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { teachersAPI } from '@/lib/api';
import { Teacher } from '@/types';

interface TeacherDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const teacherId = resolvedParams.id;

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching teacher with ID:', teacherId);
      const response = await teachersAPI.getTeacherById(teacherId);
      console.log('Teacher response:', response);
      
      if (response.data.success) {
        setTeacher(response.data.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching teacher:', err);
      
      // Handle different types of errors
      if ((err as any)?.code === 'NETWORK_ERROR' || (err as any)?.message === 'Network Error') {
        setError('Unable to connect to the server. Please check if the backend server is running.');
      } else if ((err as any)?.response?.status === 404) {
        setError('Teacher not found. The requested teacher does not exist.');
      } else if ((err as any)?.response?.status === 401) {
        setError('Unauthorized. Please log in again.');
      } else {
        setError('Failed to fetch teacher details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (isClassTeacher: boolean) => {
    return isClassTeacher ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        Class Teacher
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Subject Teacher
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Teacher Details" 
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teacher details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !teacher) {
    return (
      <DashboardLayout 
        title="Teacher Details" 
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teacher not found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested teacher could not be found.'}</p>
          <Button onClick={() => router.push('/admin/teachers')}>
            Back to Teachers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Teacher Details" 
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {teacher.firstName} {teacher.lastName}
            </h2>
            <p className="text-gray-600">Teacher profile and information</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/teachers/${teacherId}/edit`)}
            >
              Edit Teacher
            </Button>
            <Button onClick={() => router.push('/admin/teachers')}>
              Back to Teachers
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teacher Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <p className="text-sm text-gray-900">{teacher.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <p className="text-sm text-gray-900">{teacher.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{teacher.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900">{teacher.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {teacher.teacher && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <p className="text-sm text-gray-900">
                        {teacher.teacher.employeeId || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification
                      </label>
                      <p className="text-sm text-gray-900">
                        {teacher.teacher.qualification || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <p className="text-sm text-gray-900">
                        {teacher.teacher.experienceYears 
                          ? `${teacher.teacher.experienceYears} years`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <div className="mt-1">
                        {getRoleBadge(teacher.teacher.isClassTeacher)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(teacher.isActive)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joined Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/admin/teachers/${teacherId}/edit`)}
                >
                  ✏️ Edit Teacher
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/admin/classes?teacher=${teacherId}`)}
                >
                  🏫 View Classes
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/admin/attendance?teacher=${teacherId}`)}
                >
                  📅 View Attendance
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/admin/homework?teacher=${teacherId}`)}
                >
                  📝 View Homework
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Classes Assigned</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Students Taught</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Homework Assigned</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
