'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, attendanceAPI, usersAPI, schoolAPI } from '@/lib/api';

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
  const [schoolName, setSchoolName] = useState('GPS School');
  const [error, setError] = useState('');
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [checkingAttendance, setCheckingAttendance] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'class_teacher' && user.role !== 'subject_teacher')) {
      router.push('/login');
      return;
    }
    fetchClasses();
  }, [user, router]);

  // Check for existing attendance when date changes
  useEffect(() => {
    if (selectedClass) {
      checkExistingAttendance(selectedClass.id, attendanceDate);
    }
  }, [attendanceDate, selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [schoolRes, classesRes] = await Promise.all([
        schoolAPI.getProfile(),
        classesAPI.getClasses({ page: 1, limit: 100 })
      ]);

      if (schoolRes.data?.success) {
        setSchoolName(schoolRes.data.data?.name || 'GPS School');
      }

      if (classesRes.data.success) {
        const classesData = classesRes.data.data;

        // Fetch students for each class individually to avoid pagination issues
        const studentsByClass: { [key: string]: Student[] } = {};
        
        // Fetch students for each class
        for (const classItem of classesData) {
          try {
            const studentsRes = await usersAPI.getStudents({ 
              page: 1, 
              limit: 100,
              classId: classItem.id 
            });
            
            if (studentsRes.data.success) {
              studentsByClass[classItem.id] = studentsRes.data.data.map((student: any) => ({
                id: student.id,
                firstName: student.user?.firstName || '',
                lastName: student.user?.lastName || '',
                rollNumber: student.rollNumber || '',
                attendanceStatus: 'present' as const
              }));
            }
          } catch (error) {
            console.error(`Error fetching students for class ${classItem.name}:`, error);
            studentsByClass[classItem.id] = [];
          }
        }

        // Transform classes with their students
        const transformedClasses = classesData.map((classItem: any) => ({
          id: classItem.id,
          name: classItem.name,
          section: classItem.section,
          students: studentsByClass[classItem.id] || []
        }));

        console.log('Loaded classes with students:', transformedClasses);
        setClasses(transformedClasses);
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes and students. Please try again.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAttendance = async (classId: string, date: string) => {
    try {
      setCheckingAttendance(true);
      const response = await attendanceAPI.getAttendanceByClass(classId, { 
        page: 1, 
        limit: 100, 
        date 
      });
      
      if (response.data.success) {
        setExistingAttendance(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      setExistingAttendance([]);
      return [];
    } finally {
      setCheckingAttendance(false);
    }
  };

  const handleClassSelection = async (classItem: Class) => {
    setSelectedClass(classItem);
    setExistingAttendance([]);
    
    // Check if attendance already exists for this date
    const existing = await checkExistingAttendance(classItem.id, attendanceDate);
    
    if (existing.length > 0) {
      // Update student statuses based on existing attendance
      const updatedStudents = classItem.students.map(student => {
        const existingRecord = existing.find(att => att.studentId === student.id);
        return {
          ...student,
          attendanceStatus: existingRecord ? existingRecord.status : 'present'
        };
      });
      
      setSelectedClass({ ...classItem, students: updatedStudents });
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
      
      if (error.response?.status === 409) {
        const confirmUpdate = window.confirm(
          'Attendance has already been marked for this date. Do you want to update it?'
        );
        
        if (confirmUpdate) {
          // TODO: Implement update attendance functionality
          alert('Update functionality will be implemented soon. Please contact admin to update attendance.');
        }
      } else {
        alert(error.response?.data?.message || 'Failed to submit attendance. Please try again.');
      }
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
        schoolName={schoolName}
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
      schoolName={schoolName}
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
                <button 
                  onClick={fetchClasses}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Class Selection - Only show if no class selected */}
        {!selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>Select Class</CardTitle>
              <CardDescription>Choose a class to mark attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                  <p className="text-gray-500 mb-4">There are no classes with students available for attendance marking.</p>
                  <button 
                    onClick={fetchClasses}
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((classItem) => (
                    <Button
                      key={classItem.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => handleClassSelection(classItem)}
                      disabled={checkingAttendance}
                    >
                      <span className="font-semibold">{classItem.name} - {classItem.section}</span>
                      <span className="text-sm text-gray-500">{classItem.students.length} students</span>
                      {checkingAttendance && selectedClass?.id === classItem.id && (
                        <span className="text-xs text-blue-600">Checking attendance...</span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Attendance Form */}
        {selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClass(null)}
                      className="flex items-center gap-2 self-start"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </Button>
                    <span className="text-lg sm:text-xl">Attendance for {selectedClass.name} - {selectedClass.section}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>Mark attendance for each student</span>
                      {existingAttendance.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 self-start">
                          ⚠️ Already marked for {new Date(attendanceDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-0 sm:text-right">
                  <div className="text-sm text-gray-500">Date: {new Date(attendanceDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{selectedClass.students.length} students</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedClass.students.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                    {/* Student Info - Full width on mobile */}
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-700">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-600 font-medium">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    
                    {/* Attendance Buttons - Responsive layout */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-end">
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'present' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`flex-1 sm:flex-none sm:min-w-[80px] font-medium transition-all ${
                          student.attendanceStatus === 'present' 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg ring-2 ring-green-300' 
                            : 'bg-white hover:bg-green-50 text-green-700 border-green-300 hover:border-green-400'
                        }`}
                      >
                        {student.attendanceStatus === 'present' && '✓ '}Present
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'late' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={`flex-1 sm:flex-none sm:min-w-[80px] font-medium transition-all ${
                          student.attendanceStatus === 'late' 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg ring-2 ring-yellow-300' 
                            : 'bg-white hover:bg-yellow-50 text-yellow-700 border-yellow-300 hover:border-yellow-400'
                        }`}
                      >
                        {student.attendanceStatus === 'late' && '✓ '}Late
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendanceStatus === 'absent' ? 'default' : 'outline'}
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`flex-1 sm:flex-none sm:min-w-[80px] font-medium transition-all ${
                          student.attendanceStatus === 'absent' 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg ring-2 ring-red-300' 
                            : 'bg-white hover:bg-red-50 text-red-700 border-red-300 hover:border-red-400'
                        }`}
                      >
                        {student.attendanceStatus === 'absent' && '✓ '}Absent
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Attendance Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <h4 className="font-semibold text-gray-900">Attendance Summary</h4>
                    <div className="text-sm text-gray-600">
                      Total: {selectedClass.students.length} students
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {selectedClass.students.filter(s => s.attendanceStatus === 'present').length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Present</div>
                    </div>
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {selectedClass.students.filter(s => s.attendanceStatus === 'late').length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Late</div>
                    </div>
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {selectedClass.students.filter(s => s.attendanceStatus === 'absent').length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Absent</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmitAttendance}
                    disabled={submitting}
                    className="px-8 py-2 text-lg font-semibold"
                  >
                    {submitting ? 'Submitting...' : 
                     existingAttendance.length > 0 ? 'Update Attendance' : 'Submit Attendance'}
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
