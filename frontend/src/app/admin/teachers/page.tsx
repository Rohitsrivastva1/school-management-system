'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { teachersAPI, schoolAPI } from '@/lib/api';
import { Teacher } from '@/types';

export default function TeachersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const [schoolName, setSchoolName] = useState('GPS School');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const rowsPerPage = 50;

  useEffect(() => {
    fetchTeachers();
    fetchSchoolName();
  }, []);

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

  const fetchTeachers = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await teachersAPI.getTeachers({ 
        search: searchTerm,
        page: page,
        limit: rowsPerPage
      });
      
      if (response.data.success) {
        setTeachers(response.data.data.teachers);
        setTotalTeachers(response.data.data.pagination?.total || 0);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err: unknown) {
      setError('Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTeachers(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTeachers(newPage);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      const response = await teachersAPI.deleteTeacher(teacherId);
      if (response.data.success) {
        setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
      }
    } catch (err: unknown) {
      setError('Failed to delete teacher');
      console.error('Error deleting teacher:', err);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (isClassTeacher: boolean) => {
    return isClassTeacher ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Class Teacher
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Subject Teacher
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Teachers" 
        schoolName={schoolName}
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teachers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Teachers Management" 
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Sticky Header Section */}
        <div className="sticky-header">
          {/* Header Actions */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold font-nunito" style={{color: 'var(--text-dark)'}}>
                Teaching Staff
              </h2>
              <p className="mt-1" style={{color: 'var(--text-medium)'}}>
                Manage your school's teachers, their roles, and class assignments
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/teachers/create')}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Teacher
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{color: 'var(--text-dark)'}}>
                Search Teachers
              </h3>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, email, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="btn-outline"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="notification-error rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error loading teachers</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => fetchTeachers()}
                className="btn-outline text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Teachers List */}
        {!error && (
          <>
            {teachers.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-32 w-32 rounded-full flex items-center justify-center mb-6" style={{backgroundColor: 'var(--border-light)'}}>
                  <svg className="h-16 w-16" style={{color: 'var(--text-light)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-dark)'}}>
                  No teachers yet 👨‍🏫
                </h3>
                <p className="mb-6" style={{color: 'var(--text-medium)'}}>
                  Build your teaching team! Click below to add your first teacher and start organizing your school staff.
                </p>
                <button
                  onClick={() => router.push('/admin/teachers/create')}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Teacher Now
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold" style={{color: 'var(--text-dark)'}}>
                    Teachers ({totalTeachers} total)
                  </h3>
                  <p className="text-sm" style={{color: 'var(--text-light)'}}>
                    Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalTeachers)} of {totalTeachers} teachers
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
                  {/* Card Header with Gradient Background */}
                  <div className="relative h-24 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                    <div className="relative p-4 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white/50" 
                               style={{backgroundColor: 'var(--primary-navy)'}}>
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                            teacher.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold font-nunito truncate" style={{color: 'var(--text-dark)'}}>
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          <p className="text-sm truncate" style={{color: 'var(--text-light)'}}>
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {teacher.teacher && getRoleBadge(teacher.teacher.isClassTeacher)}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      {teacher.phone && (
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                            {teacher.phone}
                          </span>
                        </div>
                      )}
                      
                      {teacher.teacher?.employeeId && (
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                            ID: {teacher.teacher.employeeId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Education & Experience */}
                    <div className="space-y-3">
                      {teacher.teacher?.qualification && (
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                            {teacher.teacher.qualification}
                          </span>
                        </div>
                      )}
                      
                      {teacher.teacher?.experienceYears && (
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                            {teacher.teacher.experienceYears} years experience
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {(teacher.teacher as any)?.subjects && (teacher.teacher as any).subjects.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold" style={{color: 'var(--text-dark)'}}>
                            Subjects
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(teacher.teacher as any).subjects.map((subject: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 pb-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Profile
                      </button>
                      <button 
                        onClick={() => router.push(`/admin/teachers/${teacher.id}/edit`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all duration-200 group"
                        style={{backgroundColor: 'var(--primary-navy)'}}
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              </div>
            )}
          </>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => router.push('/admin/teachers/create')}
          className="fab"
          title="Add New Teacher"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </DashboardLayout>
  );
}
