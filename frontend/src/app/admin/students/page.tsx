'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { usersAPI, schoolAPI } from '@/lib/api';

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolName, setSchoolName] = useState('GPS School');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const rowsPerPage = 50;

  useEffect(() => {
    fetchStudents();
    fetchSchoolName();
  }, []);

  const fetchStudents = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await usersAPI.getStudents({ 
        search: searchTerm, 
        page: page, 
        limit: rowsPerPage 
      });
      
      if (response.data.success) {
        setStudents(response.data.data || []);
        setTotalStudents(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err: unknown) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolName = async () => {
    try {
      const response = await schoolAPI.getProfile();
      if (response.data.success) {
        setSchoolName(response.data.data.name || 'GPS School');
      }
    } catch (err) {
      console.error('Error fetching school name:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchStudents(newPage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Students" 
        schoolName={schoolName}
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Students Management" 
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Sticky Header Section */}
        <div className="sticky-header">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
          
            <Button onClick={() => router.push('/admin/students/create')}>
              Add New Student
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, roll number, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => fetchStudents()}>Retry</Button>
          </div>
        ) : students.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Students ({totalStudents} total)</CardTitle>
              <CardDescription>
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalStudents)} of {totalStudents} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto" style={{maxHeight: '600px'}}>
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Roll Number</th>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Class</th>
                      <th className="text-left py-3 px-4 font-semibold">Father's Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Mother's Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student: any) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{student.rollNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{backgroundColor: 'var(--primary-navy)'}}>
                              {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                            </div>
                            <span>{student.user?.firstName} {student.user?.lastName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge-secondary">
                            {student.class?.name} {student.class?.section}
                          </span>
                        </td>
                        <td className="py-3 px-4">{student.fatherName || '-'}</td>
                        <td className="py-3 px-4">{student.motherName || '-'}</td>
                        <td className="py-3 px-4 text-sm">{student.fatherPhone || student.motherPhone || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.isActive 
                              ? 'badge-success' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              className="btn-outline text-xs px-3 py-1"
                              onClick={() => router.push(`/admin/students/${student.id}`)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-secondary text-xs px-3 py-1"
                              onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              currentPage === pageNum
                                ? 'btn-primary text-white'
                                : 'border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first student</p>
            <Button onClick={() => router.push('/admin/students/create')}>
              Add Student
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
