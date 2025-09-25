'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usersAPI, schoolAPI, classesAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface PageProps {
  params: Promise<{ id: string }>
}

const editStudentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherPhone: z.string().optional(),
  fatherEmail: z.string().email().optional().or(z.literal('')),
  motherEmail: z.string().email().optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  transportMode: z.string().optional(),
  busRoute: z.string().optional(),
  emergencyContact: z.string().optional(),
  isActive: z.boolean().optional(),
});

type EditStudentForm = z.infer<typeof editStudentSchema>;

export default function EditStudentPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = use(params);

  const [student, setStudent] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolName, setSchoolName] = useState('GPS School');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditStudentForm>({
    resolver: zodResolver(editStudentSchema),
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [schoolRes, studentRes, classesRes] = await Promise.all([
        schoolAPI.getProfile(),
        usersAPI.getStudentById(id),
        classesAPI.getClasses()
      ]);

      if (schoolRes.data?.success) {
        setSchoolName(schoolRes.data.data?.name || 'GPS School');
      }

      if (studentRes.data?.success) {
        const studentData = studentRes.data.data;
        setStudent(studentData);
        
        // Reset form with student data
        reset({
          firstName: studentData.user?.firstName || '',
          lastName: studentData.user?.lastName || '',
          email: studentData.user?.email || '',
          phone: studentData.user?.phone || '',
          dateOfBirth: studentData.user?.dateOfBirth ? new Date(studentData.user.dateOfBirth).toISOString().split('T')[0] : '',
          gender: studentData.user?.gender || '',
          fatherName: studentData.fatherName || '',
          motherName: studentData.motherName || '',
          fatherPhone: studentData.fatherPhone || '',
          motherPhone: studentData.motherPhone || '',
          fatherEmail: studentData.fatherEmail || '',
          motherEmail: studentData.motherEmail || '',
          bloodGroup: studentData.bloodGroup || '',
          transportMode: studentData.transportMode || '',
          busRoute: studentData.busRoute || '',
          emergencyContact: studentData.emergencyContact || '',
          isActive: studentData.isActive,
        });
      } else {
        setError('Student not found');
      }

      if (classesRes.data?.success) {
        setClasses(classesRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      setError(err?.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditStudentForm) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Clean phone numbers
      const cleanPhone = data.phone ? data.phone.replace(/[\s\-\(\)]/g, '') : '';
      const cleanFatherPhone = data.fatherPhone ? data.fatherPhone.replace(/[\s\-\(\)]/g, '') : '';
      const cleanMotherPhone = data.motherPhone ? data.motherPhone.replace(/[\s\-\(\)]/g, '') : '';
      const cleanEmergencyContact = data.emergencyContact ? data.emergencyContact.replace(/[\s\-\(\)]/g, '') : '';

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: cleanPhone || undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
        gender: data.gender || undefined,
        fatherName: data.fatherName || undefined,
        motherName: data.motherName || undefined,
        fatherPhone: cleanFatherPhone || undefined,
        motherPhone: cleanMotherPhone || undefined,
        fatherEmail: data.fatherEmail || undefined,
        motherEmail: data.motherEmail || undefined,
        bloodGroup: data.bloodGroup || undefined,
        transportMode: data.transportMode || undefined,
        busRoute: data.busRoute || undefined,
        emergencyContact: cleanEmergencyContact || undefined,
        isActive: data.isActive,
      };

      const response = await usersAPI.updateStudent(id, payload);

      if (response.data.success) {
        router.push(`/admin/students/${id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Student" schoolName={schoolName} userRole={user?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout title="Edit Student" schoolName={schoolName} userRole={user?.role}>
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19.07A10 10 0 1119.07 4.93 10 10 0 014.93 19.07z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student not found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested student could not be found.'}</p>
          <Button onClick={() => router.push('/admin/students')}>Back to Students</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Student" schoolName={schoolName} userRole={user?.role}>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="student@school.com"
                      className="break-all"
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
                      placeholder="Enter phone number"
                      {...register('phone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      {...register('dateOfBirth')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <Select value={watch('gender')} onValueChange={(value) => setValue('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name
                    </label>
                    <Input
                      placeholder="Enter father's name"
                      {...register('fatherName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Name
                    </label>
                    <Input
                      placeholder="Enter mother's name"
                      {...register('motherName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Phone
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter father's phone"
                      {...register('fatherPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Phone
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter mother's phone"
                      {...register('motherPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Email
                    </label>
                    <Input
                      type="email"
                      placeholder="father@email.com"
                      className="break-all"
                      {...register('fatherEmail')}
                    />
                    {errors.fatherEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.fatherEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Email
                    </label>
                    <Input
                      type="email"
                      placeholder="mother@email.com"
                      className="break-all"
                      {...register('motherEmail')}
                    />
                    {errors.motherEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.motherEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <Select value={watch('bloodGroup')} onValueChange={(value) => setValue('bloodGroup', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Mode
                    </label>
                    <Select value={watch('transportMode')} onValueChange={(value) => setValue('transportMode', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="School Bus">School Bus</SelectItem>
                        <SelectItem value="Private Vehicle">Private Vehicle</SelectItem>
                        <SelectItem value="Walking">Walking</SelectItem>
                        <SelectItem value="Bicycle">Bicycle</SelectItem>
                        <SelectItem value="Public Transport">Public Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bus Route
                    </label>
                    <Input
                      placeholder="Enter bus route"
                      {...register('busRoute')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter emergency contact"
                      {...register('emergencyContact')}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Student is active
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Student'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/admin/students/${id}`)}
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
