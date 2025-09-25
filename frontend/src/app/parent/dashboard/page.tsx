'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { dashboardAPI, schoolAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ParentDashboardPage() {
  const { user } = useAuthStore();
  const [schoolName, setSchoolName] = useState('GPS School');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [schoolRes, dashboardRes] = await Promise.all([
          schoolAPI.getProfile(),
          dashboardAPI.getParentDashboard()
        ]);

        if (schoolRes.data?.success) {
          setSchoolName(schoolRes.data.data?.name || 'GPS School');
        }

        if (dashboardRes.data?.success) {
          const payload = dashboardRes.data.data || {};
          setData(payload);
          setChild((payload.children || [])[0] || null);

          // Compute simple attendance % from last 30 days
          const recent = payload.recentAttendance || [];
          const total = recent.length;
          const present = recent.filter((r: any) => (r.status || '').toLowerCase() === 'present').length;
          setAttendancePct(total > 0 ? Math.round((present / total) * 100) : null);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load parent dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Parent Dashboard" schoolName={schoolName} userRole={user?.role}>
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
    <DashboardLayout title="Parent Dashboard" schoolName={schoolName} userRole={user?.role}>
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">Student</div>
              <div className="text-gray-900 font-semibold">{child?.user?.firstName} {child?.user?.lastName}</div>
              <div className="text-sm text-gray-600">Class</div>
              <div className="text-gray-900">{child?.class ? `${child?.class?.name}-${child?.class?.section}` : '-'}</div>
              <div className="text-sm text-gray-600">Roll</div>
              <div className="text-gray-900">{child?.rollNumber ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">This Month</div>
              <div className="text-gray-900 font-semibold">{attendancePct !== null ? `${attendancePct}%` : '-'}</div>
              <div className="text-sm text-gray-600">This Year</div>
              <div className="text-gray-900">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data?.announcements ?? []).length === 0 ? (
                <div className="text-gray-600 text-sm">No notices</div>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {data?.announcements?.slice(0, 5).map((n: any) => (
                    <li key={n.id}>{n.title || n.message}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Homework for the child */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Homework</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.recentHomework ?? []).length === 0 ? (
              <div className="text-gray-600 text-sm">No homework found</div>
            ) : (
              <div className="divide-y">
                {data.recentHomework.slice(0, 8).map((h: any) => (
                  <div key={h.id} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{h.title}</div>
                      <div className="text-xs text-gray-600 truncate">{h.subject?.name} • {h.class?.name}-{h.class?.section}</div>
                    </div>
                    <div className="text-xs text-gray-700">Due {new Date(h.dueDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}


