'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { analyticsAPI, schoolAPI } from '@/lib/api';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [schoolName, setSchoolName] = useState('Loading...');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    averageAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    // run calls independently so one failure doesn't nuke the other
    const schoolReq = schoolAPI.getProfile()
      .then(r => r.data?.data)
      .catch(err => {
        console.error('School profile error:', err?.response?.status, err?.response?.data);
        throw err;
      });

    const analyticsReq = analyticsAPI.getSchoolAnalytics({ period: 30 }) // safe default
      .then(r => r.data?.data)
      .catch(err => {
        console.error('School analytics error:', err?.response?.status, err?.response?.data);
        throw err;
      });

    try {
      const [school, analytics] = await Promise.all([schoolReq, analyticsReq]);
      if (school) setSchoolName(school.name || 'School');

      if (analytics) {
        setStats({
          totalStudents: analytics.overviewStats?.[0]?.total_students || 0,
          totalTeachers: analytics.overviewStats?.[0]?.total_teachers || 0,
          totalClasses: analytics.overviewStats?.[0]?.total_classes || 0,
          averageAttendance: analytics.attendanceOverview?.[0]?.overall_attendance_percentage || 0,
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Reports & Analytics" 
        schoolName="Loading..."
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Reports</CardTitle>
              <CardDescription>
                Generate student-related reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                📊 Student Attendance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📈 Academic Performance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📋 Student List Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teacher Reports</CardTitle>
              <CardDescription>
                Generate teacher-related reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                👨‍🏫 Teacher Performance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📅 Teacher Attendance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📚 Subject-wise Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Reports</CardTitle>
              <CardDescription>
                Generate school-wide reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                🏫 Class-wise Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📊 Overall Statistics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📈 Growth Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
            <CardDescription>
              Overview of your school's key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalTeachers}</div>
                <div className="text-sm text-gray-600">Total Teachers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalClasses}</div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.averageAttendance)}%</div>
                <div className="text-sm text-gray-600">Average Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Your recently generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Student Attendance Report</div>
                  <div className="text-sm text-gray-500">Generated 2 hours ago</div>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Academic Performance Report</div>
                  <div className="text-sm text-gray-500">Generated 1 day ago</div>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
              <div className="text-center py-8 text-gray-500">
                No recent reports found. Generate your first report above.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
