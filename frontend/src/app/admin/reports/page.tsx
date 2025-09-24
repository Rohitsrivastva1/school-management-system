'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

export default function ReportsPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout 
      title="Reports & Analytics" 
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="space-y-6">
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
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Total Teachers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0%</div>
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
