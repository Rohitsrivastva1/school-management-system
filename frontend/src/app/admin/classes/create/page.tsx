'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, teachersAPI } from '@/lib/api';

export default function CreateClassPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
    roomNumber: '',
    classTeacherId: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getTeachers({ page: 1, limit: 100 });
      console.log('Teachers API response:', response.data); // Debug log
      if (response.data.success) {
        // The API returns data in nested structure: data.teachers
        const teachersData = response.data.data?.teachers || [];
        console.log('Teachers data:', teachersData); // Debug log
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
        maxStudents: 40 // Default value
      };

      const response = await classesAPI.createClass(payload);
      
      if (response.data.success) {
        alert('Class created successfully!');
        router.push('/admin/classes');
      } else {
        setError(response.data.message || 'Failed to create class');
      }
    } catch (error: any) {
      console.error('Error creating class:', error);
      console.error('Error response:', error.response?.data);
      console.error('Form data:', formData);
      
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details.map((detail: any) => 
          `${detail.field}: ${detail.message}`
        ).join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else {
        setError(error.response?.data?.message || 'Failed to create class');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Create New Class" 
      schoolName="GPS School"
      userRole={user?.role}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>
              Create a new class for your school
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
                  Leave empty if no class teacher assigned yet
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
                  {loading ? 'Creating...' : 'Create Class'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
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
