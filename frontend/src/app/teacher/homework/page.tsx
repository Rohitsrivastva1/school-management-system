'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { homeworkAPI } from '@/lib/api';

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isPublished: boolean;
  class: {
    id: string;
    name: string;
    section: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherHomeworkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user || (user.role !== 'class_teacher' && user.role !== 'subject_teacher')) {
      router.push('/login');
      return;
    }
    fetchHomework();
  }, [user, router]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await homeworkAPI.getHomeworkByTeacher(user?.id || '', {
        page: 1,
        limit: 50
      });
      
      if (response.data.success) {
        setHomework(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch homework');
      }
    } catch (err: any) {
      console.error('Error fetching homework:', err);
      setError(err.response?.data?.message || 'Failed to fetch homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishHomework = async (homeworkId: string) => {
    try {
      const response = await homeworkAPI.publishHomework(homeworkId);
      
      if (response.data.success) {
        alert('Homework published successfully!');
        fetchHomework(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to publish homework');
      }
    } catch (err: any) {
      console.error('Error publishing homework:', err);
      alert(err.response?.data?.message || 'Failed to publish homework. Please try again.');
    }
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) {
      return;
    }

    try {
      const response = await homeworkAPI.deleteHomework(homeworkId);
      
      if (response.data.success) {
        alert('Homework deleted successfully!');
        fetchHomework(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete homework');
      }
    } catch (err: any) {
      console.error('Error deleting homework:', err);
      alert(err.response?.data?.message || 'Failed to delete homework. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <DashboardLayout
        title="My Homework"
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading homework...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Homework"
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Homework</h2>
            <p className="text-gray-600">Manage your homework assignments</p>
          </div>
          <Button
            onClick={() => router.push('/teacher/homework/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Homework
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Homework List */}
        {homework.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Homework Yet</h3>
              <p className="text-gray-500 mb-4">Create your first homework assignment</p>
              <Button
                onClick={() => router.push('/teacher/homework/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Homework
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {homework.map((hw) => (
              <Card key={hw.id} className={`${isOverdue(hw.dueDate) ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{hw.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {hw.class.name} - {hw.class.section} • {hw.subject.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hw.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hw.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {isOverdue(hw.dueDate) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hw.description && (
                      <p className="text-gray-600 text-sm">{hw.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Due:</span> {formatDate(hw.dueDate)}
                      </div>
                      <div>
                        <span className="font-medium">Submissions:</span> {hw.submissionCount}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      {!hw.isPublished && (
                        <Button
                          size="sm"
                          onClick={() => handlePublishHomework(hw.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/teacher/homework/${hw.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/teacher/homework/${hw.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteHomework(hw.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
