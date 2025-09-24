'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI } from '@/lib/api';

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classDetails, setClassDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classId, setClassId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setClassId(resolvedParams.id);
      fetchClassDetails(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const fetchClassDetails = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await classesAPI.getClassDetails(id);
      
      if (response.data.success) {
        setClassDetails(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch class details');
      }
    } catch (error: any) {
      console.error('Error fetching class details:', error);
      setError(error.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Loading..." 
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading class details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title="Error" 
        schoolName="GPS School"
        userRole={user?.role}
      >
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <p className="font-medium">Error loading class details</p>
              <p className="text-sm">{error}</p>
              <div className="mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => fetchClassDetails(classId)}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/classes')}
                >
                  Back to Classes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`${classDetails?.name} ${classDetails?.section}`}
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {classDetails?.name} {classDetails?.section}
            </h2>
            <p className="text-gray-600">Academic Year: {classDetails?.academicYear}</p>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/admin/classes/${classId}/edit`)}
            >
              Edit Class
            </Button>
            <Button onClick={() => router.push('/admin/classes')}>
              Back to Classes
            </Button>
          </div>
        </div>

        {/* Class Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Class Name:</span>
                <p className="text-gray-600">{classDetails?.name} {classDetails?.section}</p>
              </div>
              <div>
                <span className="font-medium">Academic Year:</span>
                <p className="text-gray-600">{classDetails?.academicYear}</p>
              </div>
              <div>
                <span className="font-medium">Room Number:</span>
                <p className="text-gray-600">{classDetails?.roomNumber || 'Not assigned'}</p>
              </div>
              <div>
                <span className="font-medium">Max Students:</span>
                <p className="text-gray-600">{classDetails?.maxStudents}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    classDetails?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {classDetails?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              {classDetails?.classTeacher ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-gray-600">
                      {classDetails.classTeacher.firstName} {classDetails.classTeacher.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600">{classDetails.classTeacher.email}</p>
                  </div>
                  {classDetails.classTeacher.phone && (
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-gray-600">{classDetails.classTeacher.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No class teacher assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({classDetails?.students?.length || 0})</CardTitle>
            <CardDescription>
              List of all students in this class
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classDetails?.students?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Roll No.</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Admission No.</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetails.students.map((student: any) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-2">{student.rollNumber}</td>
                        <td className="py-2">
                          {student.user.firstName} {student.user.lastName}
                        </td>
                        <td className="py-2">{student.user.email}</td>
                        <td className="py-2">{student.admissionNumber}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No students enrolled in this class</p>
                <Button 
                  className="mt-2"
                  onClick={() => router.push('/admin/students/create')}
                >
                  Add Students
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timetable */}
        {classDetails?.timetable && classDetails.timetable.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Class Timetable</CardTitle>
              <CardDescription>
                Weekly schedule for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Day</th>
                      <th className="text-left py-2">Period</th>
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Teacher</th>
                      <th className="text-left py-2">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetails.timetable.map((period: any) => (
                      <tr key={period.id} className="border-b">
                        <td className="py-2">{period.dayOfWeek}</td>
                        <td className="py-2">Period {period.periodNumber}</td>
                        <td className="py-2">
                          {period.startTime} - {period.endTime}
                        </td>
                        <td className="py-2">
                          {period.subject?.name} ({period.subject?.code})
                        </td>
                        <td className="py-2">
                          {period.teacher?.firstName} {period.teacher?.lastName}
                        </td>
                        <td className="py-2">{period.roomNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
