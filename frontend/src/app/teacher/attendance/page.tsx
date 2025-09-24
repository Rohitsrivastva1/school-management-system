'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, attendanceAPI } from '@/lib/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  attendanceStatus: 'present' | 'absent' | 'late';
}

interface Class {
  id: string;
  name: string;
  section: string;
  students: Student[];
}

export default function TeacherAttendancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'class_teacher' && user.role !== 'subject_teacher')) {
      router.push('/login');
      return;
    }
    fetchClasses();
  }, [user, router]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getClasses({ page: 1, limit: 100 });
      
      if (response.data.success) {
        // Transform the API response to match our interface
        const transformedClasses = response.data.data.map((classItem: any) => ({
          id: classItem.id,
          name: classItem.name,
          section: classItem.section,
          students: classItem.students?.map((student: any) => ({
            id: student.id,
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            rollNumber: student.rollNumber,
            attendanceStatus: 'present' as const // Default status
          })) || []
        }));
        
        setClasses(transformedClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Fallback to mock data if API fails
      setClasses([
        {
          id: '1',
          name: 'Class 10',
          section: 'A',
          students: [
            { id: '1', firstName: 'John', lastName: 'Doe', rollNumber: '001', attendanceStatus: 'present' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', rollNumber: '002', attendanceStatus: 'present' },
            { id: '3', firstName: 'Mike', lastName: 'Johnson', rollNumber: '003', attendanceStatus: 'absent' },
            { id: '4', firstName: 'Sarah', lastName: 'Wilson', rollNumber: '004', attendanceStatus: 'late' },
          ]
        },
        {
          id: '2',
          name: 'Class 9',
          section: 'B',
          students: [
            { id: '5', firstName: 'Alex', lastName: 'Brown', rollNumber: '001', attendanceStatus: 'present' },
            { id: '6', firstName: 'Emma', lastName: 'Davis', rollNumber: '002', attendanceStatus: 'present' },
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!selectedClass) return;
    
    const updatedStudents = selectedClass.students.map(student =>
      student.id === studentId ? { ...student, attendanceStatus: status } : student
    );
    
    setSelectedClass({ ...selectedClass, students: updatedStudents });
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) return;
    
    try {
      setSubmitting(true);
      
      const attendanceData = selectedClass.students.map(student => ({
        studentId: student.id,
        status: student.attendanceStatus,
        remarks: null
      }));

      const payload = {
        classId: selectedClass.id,
        date: attendanceDate,
        attendanceData
      };

      const response = await attendanceAPI.markAttendance(payload);
      
      if (response.data.success) {
        alert('Attendance marked successfully!');
        // Reset the form
        setSelectedClass(null);
      } else {
        throw new Error(response.data.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      alert(error.response?.data?.message || 'Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Mark Attendance"
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading classes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mark Attendance"
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-gray-600">Record student attendance for your classes</p>
          </div>
        </div>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>Choose a class to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <Button
                  key={classItem.id}
                  variant={selectedClass?.id === classItem.id ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setSelectedClass(classItem)}
                >
                  <span className="font-semibold">{classItem.name} - {classItem.section}</span>
                  <span className="text-sm text-gray-500">{classItem.students.length} students</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Form */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance for {selectedClass.name} - {selectedClass.section}</CardTitle>
              <CardDescription>Mark attendance for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedClass.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'present' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'late' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'absent' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmitAttendance}
                    disabled={submitting}
                    className="px-8"
                  >
                    {submitting ? 'Submitting...' : 'Submit Attendance'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
