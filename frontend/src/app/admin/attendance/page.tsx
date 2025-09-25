'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { attendanceAPI, schoolAPI, usersAPI } from '@/lib/api';

export default function AttendancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] = useState('');
  const [viewMode, setViewMode] = useState('daily'); // daily, monthly, yearly, student
  const [schoolName, setSchoolName] = useState('Loading...');
  const [attendanceStats, setAttendanceStats] = useState({
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  });
  const [monthlyStats, setMonthlyStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendanceRate: 0
  });
  const [yearlyStats, setYearlyStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendanceRate: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedMonth, selectedYear, selectedStudent, viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [schoolResponse, studentsResponse] = await Promise.all([
        schoolAPI.getProfile(),
        usersAPI.getStudents({ limit: 100 })
      ]);

      if (schoolResponse.data.success) {
        setSchoolName(schoolResponse.data.data.name || 'School');
      }

      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data || []);
      }

      // Fetch attendance data based on view mode
      if (viewMode === 'daily') {
        const statsResponse = await attendanceAPI.getAttendanceStats({ date: selectedDate });
        if (statsResponse.data.success) {
          const data = statsResponse.data.data;
          setAttendanceStats({
            presentToday: data.presentToday || 0,
            absentToday: data.absentToday || 0,
            lateToday: data.lateToday || 0,
            attendanceRate: data.attendanceRate || 0
          });
        }
      } else if (viewMode === 'monthly') {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        const statsResponse = await attendanceAPI.getAttendanceStats({ 
          startDate, 
          endDate 
        });
        if (statsResponse.data.success) {
          const data = statsResponse.data.data;
          setMonthlyStats({
            totalDays: data.totalDays || 0,
            presentDays: data.presentDays || 0,
            absentDays: data.absentDays || 0,
            attendanceRate: data.attendanceRate || 0
          });
        }
      } else if (viewMode === 'yearly') {
        const startDate = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
        const statsResponse = await attendanceAPI.getAttendanceStats({ 
          startDate, 
          endDate 
        });
        if (statsResponse.data.success) {
          const data = statsResponse.data.data;
          setYearlyStats({
            totalDays: data.totalDays || 0,
            presentDays: data.presentDays || 0,
            absentDays: data.absentDays || 0,
            attendanceRate: data.attendanceRate || 0
          });
        }
      } else if (viewMode === 'student' && selectedStudent) {
        const studentResponse = await attendanceAPI.getAttendanceByStudent(selectedStudent, {
          startDate: new Date(selectedYear, 0, 1).toISOString().split('T')[0],
          endDate: new Date(selectedYear, 11, 31).toISOString().split('T')[0]
        });
        if (studentResponse.data.success) {
          setAttendance(studentResponse.data.data || []);
        }
      }
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Attendance" 
        schoolName="Loading..."
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Attendance Management" 
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
            <p className="text-gray-600">Track and manage student attendance with multiple views</p>
          </div>
          <Button onClick={() => router.push('/admin/attendance/mark')}>
            Mark Attendance
          </Button>
        </div>

        {/* View Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>View Options</CardTitle>
            <CardDescription>Choose how you want to view attendance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily View</SelectItem>
                  <SelectItem value="monthly">Monthly View</SelectItem>
                  <SelectItem value="yearly">Yearly View</SelectItem>
                  <SelectItem value="student">Student View</SelectItem>
                </SelectContent>
              </Select>

              {viewMode === 'daily' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Date:</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}

              {viewMode === 'monthly' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Month:</label>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'yearly' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Year:</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'student' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Student:</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.user?.firstName} {student.user?.lastName} - {student.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {viewMode === 'daily' && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{attendanceStats.presentToday}</div>
                    <div className="text-sm text-gray-600">Present Today</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{attendanceStats.absentToday}</div>
                    <div className="text-sm text-gray-600">Absent Today</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{attendanceStats.lateToday}</div>
                    <div className="text-sm text-gray-600">Late Today</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.round(attendanceStats.attendanceRate)}%</div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === 'monthly' && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{monthlyStats.totalDays}</div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{monthlyStats.presentDays}</div>
                    <div className="text-sm text-gray-600">Present Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{monthlyStats.absentDays}</div>
                    <div className="text-sm text-gray-600">Absent Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{Math.round(monthlyStats.attendanceRate)}%</div>
                    <div className="text-sm text-gray-600">Monthly Rate</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === 'yearly' && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{yearlyStats.totalDays}</div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{yearlyStats.presentDays}</div>
                    <div className="text-sm text-gray-600">Present Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{yearlyStats.absentDays}</div>
                    <div className="text-sm text-gray-600">Absent Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{Math.round(yearlyStats.attendanceRate)}%</div>
                    <div className="text-sm text-gray-600">Yearly Rate</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === 'student' && selectedStudent && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{attendance.length}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {attendance.filter((record: any) => record.status === 'present').length}
                    </div>
                    <div className="text-sm text-gray-600">Present Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {attendance.filter((record: any) => record.status === 'absent').length}
                    </div>
                    <div className="text-sm text-gray-600">Absent Days</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {attendance.length > 0 
                        ? Math.round((attendance.filter((record: any) => record.status === 'present').length / attendance.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Student Rate</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === 'daily' && `Attendance Records - ${new Date(selectedDate).toLocaleDateString()}`}
              {viewMode === 'monthly' && `Monthly Attendance - ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
              {viewMode === 'yearly' && `Yearly Attendance - ${selectedYear}`}
              {viewMode === 'student' && selectedStudent && `Student Attendance - ${students.find((s: any) => s.id === selectedStudent)?.user?.firstName} ${students.find((s: any) => s.id === selectedStudent)?.user?.lastName}`}
            </CardTitle>
            <CardDescription>
              {viewMode === 'daily' && 'Daily attendance overview'}
              {viewMode === 'monthly' && 'Monthly attendance summary'}
              {viewMode === 'yearly' && 'Yearly attendance summary'}
              {viewMode === 'student' && 'Individual student attendance history'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'student' && selectedStudent && attendance.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Class</th>
                        <th className="text-left py-3 px-4 font-semibold">Remarks</th>
                        <th className="text-left py-3 px-4 font-semibold">Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record: any) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{record.class?.name} {record.class?.section}</td>
                          <td className="py-3 px-4">{record.remarks || '-'}</td>
                          <td className="py-3 px-4">{record.marker?.firstName} {record.marker?.lastName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {viewMode === 'student' && !selectedStudent 
                    ? 'Select a student to view attendance records'
                    : 'No attendance records found'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {viewMode === 'student' && !selectedStudent
                    ? 'Choose a student from the dropdown above'
                    : 'Start by marking attendance for the selected period'
                  }
                </p>
                {viewMode !== 'student' && (
                  <Button onClick={() => router.push('/admin/attendance/mark')}>
                    Mark Attendance
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
