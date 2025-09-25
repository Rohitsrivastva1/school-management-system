'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { homeworkAPI, schoolAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface PageProps {
  params: Promise<{ id: string }>
}

export default function HomeworkDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = use(params);

  const [schoolName, setSchoolName] = useState('GPS School');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [schoolRes, hwRes] = await Promise.all([
          schoolAPI.getProfile(),
          homeworkAPI.getHomeworkById(id)
        ]);

        if (schoolRes.data?.success) {
          setSchoolName(schoolRes.data.data?.name || 'GPS School');
        }

        if (hwRes.data?.success) {
          setAssignment(hwRes.data.data);
        } else {
          setError('Homework not found');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load homework');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Homework Details" schoolName={schoolName} userRole={user?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading homework...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !assignment) {
    return (
      <DashboardLayout title="Homework Details" schoolName={schoolName} userRole={user?.role}>
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19.07A10 10 0 1119.07 4.93 10 10 0 014.93 19.07z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Homework not found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested homework could not be found.'}</p>
          <Button onClick={() => router.push('/admin/homework')}>Back to Homework</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Homework Details" schoolName={schoolName} userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
            <p className="text-gray-600">
              {assignment.subject?.name} • {assignment.class?.name}-{assignment.class?.section}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {assignment.isPublished ? 'Published' : 'Draft'}
            </span>
            <Button variant="outline" onClick={() => router.push(`/admin/homework/${id}/edit`)}>Edit</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
              <p className="text-gray-900 whitespace-pre-wrap">{assignment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Due Date</div>
                <div className="text-gray-900">{new Date(assignment.dueDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Teacher</div>
                <div className="text-gray-900">{assignment.teacher?.firstName} {assignment.teacher?.lastName}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/homework')}>Back</Button>
          <Button onClick={() => router.push(`/admin/homework/${id}/edit`)}>Edit Assignment</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}


