'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, teachersAPI } from '@/lib/api';

interface EditClassPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClassPage({ params }: EditClassPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
    roomNumber: '',
    classTeacherId: '',
    maxStudents: 40,
    isActive: true
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [classId, setClassId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setClassId(resolvedParams.id);
      await Promise.all([
        fetchClassDetails(resolvedParams.id),
        fetchTeachers()
      ]);
    };
    resolveParams();
  }, [params]);

  const fetchClassDetails = async (id: string) => {
    try {
      setFetching(true);
      setError('');
      const response = await classesAPI.getClassDetails(id);
      
      if (response.data.success) {
        const classData = response.data.data;
        setFormData({
          name: classData.name,
          section: classData.section,
          academicYear: classData.academicYear,
          roomNumber: classData.roomNumber || '',
          classTeacherId: classData.classTeacher?.id || '',
          maxStudents: classData.maxStudents,
          isActive: classData.isActive
        });
      } else {
        setError(response.data.message || 'Failed to fetch class details');
      }
    } catch (error: any) {
      console.error('Error fetching class details:', error);
      setError(error.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setFetching(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getTeachers({ page: 1, limit: 100 });
      if (response.data.success) {
        // The API returns data in nested structure: data.teachers
        const teachersData = response.data.data?.teachers || [];
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      setError('Class name is required');
      return;
    }
    
    if (!formData.academicYear.trim()) {
      setError('Academic year is required');
      return;
    }
    
    // Validate academic year format (YYYY-YY)
    const academicYearRegex = /^\d{4}-\d{2}$/;
    if (!academicYearRegex.test(formData.academicYear)) {
      setError('Academic year must be in format YYYY-YY (e.g., 2024-25)');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        name: formData.name.trim(),
        section: formData.section.trim() || undefined,
        academicYear: formData.academicYear.trim(),
        roomNumber: formData.roomNumber.trim() || undefined,
        classTeacherId: formData.classTeacherId || undefined,
        maxStudents: formData.maxStudents,
        isActive: formData.isActive
      };

      const response = await classesAPI.updateClass(classId, payload);
      
      if (response.data.success) {
        alert('Class updated successfully!');
        router.push(`/admin/classes/${classId}`);
      } else {
        setError(response.data.message || 'Failed to update class');
      }
    } catch (error: any) {
      console.error('Error updating class:', error);
      console.error('Error response:', error.response?.data);
      console.error('Form data:', formData);
      
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details.map((detail: any) => 
          `${detail.field}: ${detail.message}`
        ).join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else {
        setError(error.response?.data?.message || 'Failed to update class');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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

  if (error && !formData.name) {
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
      title={`Edit ${formData.name} ${formData.section}`}
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Class Information</CardTitle>
            <CardDescription>
              Update the class details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Class 1, Grade 5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section *
                  </label>
                  <Input
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="e.g., A, B, C"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <Input
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    placeholder="e.g., 2024-25"
                    pattern="\d{4}-\d{2}"
                    title="Format: YYYY-YY (e.g., 2024-25)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <Input
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    placeholder="e.g., Room 101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <Input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                    placeholder="40"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Teacher
                </label>
                <select
                  value={formData.classTeacherId}
                  onChange={(e) => setFormData({...formData, classTeacherId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select class teacher (optional)</option>
                  {Array.isArray(teachers) && teachers.length > 0 ? (
                    teachers.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No teachers available</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if no class teacher assigned
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Class'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/admin/classes/${classId}`)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
