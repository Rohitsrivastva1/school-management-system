'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, homeworkAPI } from '@/lib/api';

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
}

const homeworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.string().optional(),
});

type HomeworkForm = z.infer<typeof homeworkSchema>;

export default function CreateHomeworkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HomeworkForm>({
    resolver: zodResolver(homeworkSchema),
  });

  const selectedClassId = watch('classId');

  useEffect(() => {
    if (!user || (user.role !== 'class_teacher' && user.role !== 'subject_teacher')) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch classes
      const classesResponse = await classesAPI.getClasses({ page: 1, limit: 100 });
      if (classesResponse.data.success) {
        const transformedClasses = classesResponse.data.data.map((classItem: any) => ({
          id: classItem.id,
          name: classItem.name,
          section: classItem.section
        }));
        setClasses(transformedClasses);
      }
      
      // TODO: Add subjects API endpoint
      // For now, use mock data
      setSubjects([
        { id: '1', name: 'Mathematics' },
        { id: '2', name: 'Science' },
        { id: '3', name: 'English' },
        { id: '4', name: 'Social Studies' },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setClasses([
        { id: '1', name: 'Class 10', section: 'A' },
        { id: '2', name: 'Class 9', section: 'B' },
        { id: '3', name: 'Class 8', section: 'A' },
      ]);
      
      setSubjects([
        { id: '1', name: 'Mathematics' },
        { id: '2', name: 'Science' },
        { id: '3', name: 'English' },
        { id: '4', name: 'Social Studies' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HomeworkForm) => {
    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        classId: data.classId,
        subjectId: data.subjectId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        attachments: null // TODO: Handle file uploads
      };

      const response = await homeworkAPI.createHomework(payload);
      
      if (response.data.success) {
        alert('Homework created successfully!');
        router.push('/teacher/dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to create homework');
      }
    } catch (err: any) {
      console.error('Error creating homework:', err);
      setError(
        err.response?.data?.message || 'Failed to create homework. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Create Homework"
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Create Homework"
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Homework</CardTitle>
            <CardDescription>
              Assign homework to your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  placeholder="Enter homework title"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    {...register('classId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.section}
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="text-sm text-red-600 mt-1">{errors.classId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    {...register('subjectId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.subjectId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter homework description and requirements"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <Input
                    type="datetime-local"
                    {...register('dueDate')}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Marks
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    {...register('maxMarks')}
                  />
                </div>
              </div>


              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Homework'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/teacher/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
