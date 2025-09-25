'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usersAPI, schoolAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface PageProps {
  params: Promise<{ id: string }>
}

export default function StudentDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = use(params);

  const [schoolName, setSchoolName] = useState('GPS School');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [schoolRes, studentRes] = await Promise.all([
          schoolAPI.getProfile(),
          usersAPI.getStudentById(id)
        ]);

        if (schoolRes.data?.success) {
          setSchoolName(schoolRes.data.data?.name || 'GPS School');
        }

        if (studentRes.data?.success) {
          setStudent(studentRes.data.data);
        } else {
          setError('Student not found');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load student');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Student Details" schoolName={schoolName} userRole={user?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout title="Student Details" schoolName={schoolName} userRole={user?.role}>
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
    <DashboardLayout title="Student Details" schoolName={schoolName} userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {student.user?.firstName} {student.user?.lastName}
            </h2>
            <p className="text-gray-600">
              {student.class?.name}-{student.class?.section} • Roll: {student.rollNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
            <Button variant="outline" onClick={() => router.push(`/admin/students/${id}/edit`)}>Edit</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">First Name</div>
                  <div className="text-gray-900">{student.user?.firstName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Last Name</div>
                  <div className="text-gray-900">{student.user?.lastName}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Email</div>
                  <div className="text-gray-900 break-all text-sm bg-gray-50 p-2 rounded border">{student.user?.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Phone</div>
                  <div className="text-gray-900">{student.user?.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Date of Birth</div>
                  <div className="text-gray-900">
                    {student.user?.dateOfBirth ? new Date(student.user.dateOfBirth).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Gender</div>
                  <div className="text-gray-900 capitalize">{student.user?.gender || '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Roll Number</div>
                  <div className="text-gray-900">{student.rollNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Admission Number</div>
                  <div className="text-gray-900">{student.admissionNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Class</div>
                  <div className="text-gray-900">{student.class?.name}-{student.class?.section}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Admission Date</div>
                  <div className="text-gray-900">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Father's Name</div>
                  <div className="text-gray-900">{student.fatherName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Mother's Name</div>
                  <div className="text-gray-900">{student.motherName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Father's Phone</div>
                  <div className="text-gray-900">{student.fatherPhone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Mother's Phone</div>
                  <div className="text-gray-900">{student.motherPhone || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Father's Email</div>
                  <div className="text-gray-900 break-all text-sm bg-gray-50 p-2 rounded border">{student.fatherEmail || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Mother's Email</div>
                  <div className="text-gray-900 break-all text-sm bg-gray-50 p-2 rounded border">{student.motherEmail || '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Blood Group</div>
                  <div className="text-gray-900">{student.bloodGroup || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Transport Mode</div>
                  <div className="text-gray-900">{student.transportMode || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Bus Route</div>
                  <div className="text-gray-900">{student.busRoute || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Emergency Contact</div>
                  <div className="text-gray-900">{student.emergencyContact || '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/students')}>Back</Button>
          <Button onClick={() => router.push(`/admin/students/${id}/edit`)}>Edit Student</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
