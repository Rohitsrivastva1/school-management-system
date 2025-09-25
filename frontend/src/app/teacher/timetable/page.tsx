'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { timetableAPI } from '@/lib/api';

interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  academicYear: string;
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
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function TeacherTimetablePage() {
  const { user } = useAuthStore();
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetableByTeacher(user?.id || '');
      
      if (response.data.success) {
        setTimetable(response.data.data);
      } else {
        setError('Failed to load timetable');
      }
    } catch (err: any) {
      console.error('Error fetching timetable:', err);
      setError(err.response?.data?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const currentDay = now.getDay();
    
    // Simple time-based period calculation (adjust based on your school's schedule)
    const periodTimes = [
      { start: 800, end: 900 },   // Period 1: 8:00 - 9:00
      { start: 900, end: 1000 },  // Period 2: 9:00 - 10:00
      { start: 1000, end: 1100 }, // Period 3: 10:00 - 11:00
      { start: 1100, end: 1200 }, // Period 4: 11:00 - 12:00
      { start: 1200, end: 1300 }, // Period 5: 12:00 - 13:00
      { start: 1300, end: 1400 }, // Period 6: 13:00 - 14:00
      { start: 1400, end: 1500 }, // Period 7: 14:00 - 15:00
      { start: 1500, end: 1600 }, // Period 8: 15:00 - 16:00
    ];

    for (let i = 0; i < periodTimes.length; i++) {
      if (currentTime >= periodTimes[i].start && currentTime < periodTimes[i].end) {
        return { period: i + 1, day: currentDay };
      }
    }
    
    return null;
  };

  const currentPeriod = getCurrentPeriod();

  if (loading) {
    return (
      <DashboardLayout 
        title="My Timetable" 
        schoolName="GPS School"
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading timetable...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Timetable" 
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-600">View your teaching schedule for the week</p>
        </div>

        {/* Current Period Indicator */}
        {currentPeriod && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-blue-800 font-medium">
                  Current Period: {currentPeriod.period} on {DAYS[currentPeriod.day]}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {DAYS.slice(1, 8).map((day, dayIndex) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-center">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PERIODS.map((period) => {
                  const entry = timetable[day]?.find(e => e.periodNumber === period);
                  const isCurrentPeriod = currentPeriod && 
                    currentPeriod.day === dayIndex + 1 && 
                    currentPeriod.period === period;
                  
                  return (
                    <div
                      key={period}
                      className={`p-2 rounded text-xs ${
                        entry 
                          ? isCurrentPeriod
                            ? 'bg-green-100 border-2 border-green-400 ring-2 ring-green-300'
                            : 'bg-blue-100 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium">
                        Period {period}
                        {isCurrentPeriod && (
                          <span className="ml-1 text-green-600 font-bold">●</span>
                        )}
                      </div>
                      {entry ? (
                        <div className="mt-1">
                          <div className="font-medium text-blue-800">
                            {entry.subject.name}
                          </div>
                          <div className="text-blue-600">
                            {entry.class.name} - {entry.class.section}
                          </div>
                          <div className="text-blue-600">
                            {entry.startTime} - {entry.endTime}
                          </div>
                          {entry.roomNumber && (
                            <div className="text-blue-600">
                              Room: {entry.roomNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">Free</div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Classes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Object.values(timetable).flat().length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Classes Taught</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(Object.values(timetable).flat().map(e => e.classId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Subjects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(Object.values(timetable).flat().map(e => e.subjectId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
