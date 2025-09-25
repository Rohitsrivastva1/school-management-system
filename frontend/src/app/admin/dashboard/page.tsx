'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { schoolAPI, dashboardAPI, teachersAPI, classesAPI, usersAPI } from '@/lib/api';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  recentAdmissions: number;
}

interface SchoolProfile {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email: string;
  website?: string;
  logoUrl?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch school profile
      const schoolResponse = await schoolAPI.getProfile();
      if (schoolResponse.data.success) {
        setSchoolProfile(schoolResponse.data.data);
      }

      // Fetch dashboard stats
      try {
        const dashboardResponse = await dashboardAPI.getAdminDashboard();
        if (dashboardResponse.data.success) {
          const overview = dashboardResponse.data.data.overview;
          setStats({
            totalStudents: overview.totalStudents || 0,
            totalTeachers: overview.totalTeachers || 0,
            totalClasses: overview.totalClasses || 0,
            recentAdmissions: overview.recentAdmissions || 0
          });
        }
      } catch (dashboardError) {
        // Fallback: fetch individual stats
        const [teachersResponse, classesResponse, studentsResponse] = await Promise.all([
          teachersAPI.getTeachers({ page: 1, limit: 1 }),
          classesAPI.getClasses({ page: 1, limit: 1 }),
          usersAPI.getStudents({ page: 1, limit: 1 })
        ]);

        setStats({
          totalStudents: studentsResponse.data.pagination?.total || 0,
          totalTeachers: teachersResponse.data.pagination?.total || 0,
          totalClasses: classesResponse.data.pagination?.total || 0,
          recentAdmissions: 0 // This would need a specific endpoint
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        recentAdmissions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-teacher':
        router.push('/admin/teachers/create');
        break;
      case 'add-student':
        router.push('/admin/students/create');
        break;
      case 'create-class':
        router.push('/admin/classes/create');
        break;
      case 'view-reports':
        router.push('/admin/reports');
        break;
      case 'edit-profile':
        router.push('/admin/settings');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Loading..." 
        schoolName={schoolProfile?.name}
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      schoolName={schoolProfile?.name}
      userRole={user?.role}
    >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="h-4 w-4 text-blue-600">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <div className="h-4 w-4 text-green-600">👨‍🏫</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Teaching staff
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <div className="h-4 w-4 text-purple-600">🏫</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Admissions</CardTitle>
              <div className="h-4 w-4 text-orange-600">📈</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentAdmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('add-teacher')}
              >
                👨‍🏫 Add New Teacher
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('add-student')}
              >
                👥 Add New Student
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('create-class')}
              >
                🏫 Create New Class
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('view-reports')}
              >
                📊 View Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Manage your school profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">School Name:</span>
                <span className="text-sm font-medium">{schoolProfile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{schoolProfile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium">{schoolProfile?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="text-sm font-medium">
                  {schoolProfile?.address ? `${schoolProfile.address}, ${schoolProfile.city}` : 'Not set'}
                </span>
              </div>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => handleQuickAction('edit-profile')}
              >
                Edit School Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">School registered successfully</p>
                  <p className="text-xs text-gray-500">A few minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin account created</p>
                  <p className="text-xs text-gray-500">A few minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </DashboardLayout>
  );
}
