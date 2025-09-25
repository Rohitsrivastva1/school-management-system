'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { teachersAPI, subjectsAPI } from '@/lib/api';
import { Teacher, UpdateTeacherPayload } from '@/types';

interface EditTeacherPageProps {
  params: Promise<{
    id: string;
  }>;
}

const editTeacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.string().optional(),
  employeeId: z.string().optional(),
  isClassTeacher: z.boolean().optional(),
  isActive: z.boolean().optional(),
  subjects: z.array(z.string()).optional(),
});

type EditTeacherForm = z.infer<typeof editTeacherSchema>;

export default function EditTeacherPage({ params }: EditTeacherPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [subjects, setSubjects] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const teacherId = resolvedParams.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditTeacherForm>({
    resolver: zodResolver(editTeacherSchema),
  });

  const selectedSubjects = watch('subjects') || [];

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching teacher data for ID:', teacherId);
      await Promise.all([fetchTeacher(), fetchSubjects()]);
      console.log('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacher = async () => {
    try {
      console.log('Fetching teacher with ID:', teacherId);
      const response = await teachersAPI.getTeacherById(teacherId);
      console.log('Teacher API response:', response.data);
      
      if (response.data.success) {
        const teacherData = response.data.data;
        console.log('Teacher data:', teacherData);
        setTeacher(teacherData);
        
        // Reset form with teacher data
        reset({
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          email: teacherData.email,
          phone: teacherData.phone || '',
          qualification: teacherData.teacher?.qualification || '',
          experienceYears: teacherData.teacher?.experienceYears?.toString() || '',
          employeeId: teacherData.teacher?.employeeId || '',
          isClassTeacher: teacherData.teacher?.isClassTeacher || false,
          isActive: teacherData.isActive,
          subjects: teacherData.teacher?.subjects || [],
        });
        console.log('Form reset with teacher data');
      } else {
        throw new Error(response.data.message || 'Failed to fetch teacher');
      }
    } catch (err: unknown) {
      console.error('Error fetching teacher:', err);
      throw err; // Re-throw to be caught by fetchData
    }
  };

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects...');
      const response = await subjectsAPI.getSubjects({ page: 1, limit: 100 });
      console.log('Subjects API response:', response.data);
      if (response.data.success) {
        setSubjects(response.data.data);
        console.log('Subjects set:', response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch subjects');
      }
    } catch (err: unknown) {
      console.error('Error fetching subjects:', err);
      throw err; // Re-throw to be caught by fetchData
    }
  };

  const onSubmit = async (data: EditTeacherForm) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Clean phone number - remove spaces, dashes, parentheses
      const cleanPhone = data.phone ? data.phone.replace(/[\s\-\(\)]/g, '') : '';

      const payload: UpdateTeacherPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: cleanPhone || undefined,
        qualification: data.qualification,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
        employeeId: data.employeeId,
        isClassTeacher: data.isClassTeacher || false,
        isActive: data.isActive,
        subjects: data.subjects,
      };

      const response = await teachersAPI.updateTeacher(teacherId, payload);

      if (response.data.success) {
        router.push(`/admin/teachers/${teacherId}`);
      }
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message || 'Failed to update teacher. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Edit Teacher" 
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

  if (error || (!loading && !teacher)) {
    return (
      <DashboardLayout 
        title="Edit Teacher" 
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
      title="Edit Teacher" 
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Teacher Information</CardTitle>
            <CardDescription>
              Update teacher details and professional information
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    placeholder="Enter first name"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    placeholder="Enter last name"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="teacher@school.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number (e.g., +1234567890)"
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <Input
                    placeholder="e.g., EMP001"
                    {...register('employeeId')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <Input
                    placeholder="e.g., B.Ed, M.A."
                    {...register('qualification')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  {...register('experienceYears')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Subjects
                </label>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`subject-${subject.id}`}
                        checked={selectedSubjects.includes(subject.name)}
                        onChange={(e) => {
                          const subjectName = subject.name;
                          if (e.target.checked) {
                            setValue('subjects', [...selectedSubjects, subjectName]);
                          } else {
                            setValue('subjects', selectedSubjects.filter(s => s !== subjectName));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`subject-${subject.id}`} 
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {subject.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSubjects.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">Selected Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subject, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isClassTeacher"
                    {...register('isClassTeacher')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isClassTeacher" className="text-sm font-medium text-gray-700">
                    This teacher is a class teacher
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Teacher is active
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Teacher'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/admin/teachers/${teacherId}`)}
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
