'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { classesAPI, schoolAPI } from '@/lib/api';

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('GPS School');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const rowsPerPage = 50;

  useEffect(() => {
    fetchClasses();
    fetchSchoolName();
  }, []);

  const fetchClasses = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const response = await classesAPI.getClasses({ page: page, limit: rowsPerPage });
      
      if (response.data.success) {
        setClasses(response.data.data);
        setTotalClasses(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError(response.data.message || 'Failed to fetch classes');
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setError(error.response?.data?.message || 'Failed to fetch classes');
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

  const getGradeColor = (gradeName: string) => {
    const grade = parseInt(gradeName);
    if (grade <= 1) return 'grade-1';
    if (grade <= 2) return 'grade-2';
    if (grade <= 3) return 'grade-3';
    if (grade <= 4) return 'grade-4';
    return 'grade-5';
  };

  const getGradeIcon = (gradeName: string) => {
    const grade = parseInt(gradeName);
    if (grade <= 1) return '📘';
    if (grade <= 2) return '📗';
    if (grade <= 3) return '📙';
    if (grade <= 4) return '📕';
    return '📖';
  };

  const filteredClasses = classes.filter((cls: any) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !academicYearFilter || cls.academicYear === academicYearFilter;
    const matchesSection = !sectionFilter || cls.section === sectionFilter;
    
    return matchesSearch && matchesYear && matchesSection;
  });

  const getProgressPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Classes" 
        schoolName={schoolName}
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{borderColor: 'var(--primary-navy)'}}></div>
            <p className="mt-4" style={{color: 'var(--text-medium)'}}>Loading classes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Classes Management" 
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
                Classes & Sections
              </h2>
              <p className="mt-1" style={{color: 'var(--text-medium)'}}>
                Manage your school's classes, sections, and academic structure
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/classes/create')}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Class
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{color: 'var(--text-dark)'}}>
                Search & Filter Classes
              </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-medium)'}}>
                  Search Classes
                </label>
                <input
                  type="text"
                  placeholder="Search by class name, section, or academic year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-medium)'}}>
                  Academic Year
                </label>
                <select
                  value={academicYearFilter}
                  onChange={(e) => setAcademicYearFilter(e.target.value)}
                  className="filter-select w-full"
                >
                  <option value="">All Years</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-medium)'}}>
                  Section
                </label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="filter-select w-full"
                >
                  <option value="">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="notification-error rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Error loading classes</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={fetchClasses}
                className="btn-outline text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Classes List */}
        {!error && (
          <>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto h-32 w-32 rounded-full flex items-center justify-center mb-6" style={{backgroundColor: 'var(--border-light)'}}>
                  <svg className="h-16 w-16" style={{color: 'var(--text-light)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-dark)'}}>
                  No classes found
                </h3>
                <p className="mb-6" style={{color: 'var(--text-medium)'}}>
                  Get started by creating your first class and organizing your school structure
                </p>
                <button
                  onClick={() => router.push('/admin/classes/create')}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Class
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold" style={{color: 'var(--text-dark)'}}>
                    Classes ({totalClasses} total)
                  </h3>
                  <p className="text-sm" style={{color: 'var(--text-light)'}}>
                    Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalClasses)} of {totalClasses} classes
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls: any) => {
                  const progressPercentage = getProgressPercentage(cls.studentCount || 0, cls.maxStudents || 30);
                  
                  return (
                    <div key={cls.id} className={`card hover:shadow-lg transition-all duration-300 ${getGradeColor(cls.name)}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getGradeIcon(cls.name)}</div>
                          <div>
                            <h3 className="text-xl font-bold font-nunito" style={{color: 'var(--text-dark)'}}>
                              {cls.name} {cls.section}
                            </h3>
                            <p className="text-sm" style={{color: 'var(--text-light)'}}>
                              Academic Year: {cls.academicYear}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="badge-primary">
                            {cls.studentCount || 0} students
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {cls.classTeacher && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">👩‍🏫</span>
                            <div className="flex-1">
                              <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                                Class Teacher:
                              </span>
                              <p className="text-sm" style={{color: 'var(--text-light)'}}>
                                {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {cls.roomNumber && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">🏫</span>
                            <div className="flex-1">
                              <span className="text-sm font-medium" style={{color: 'var(--text-medium)'}}>
                                Room:
                              </span>
                              <span className="text-sm ml-1" style={{color: 'var(--text-light)'}}>
                                {cls.roomNumber}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span style={{color: 'var(--text-medium)'}}>Capacity Progress</span>
                            <span style={{color: 'var(--text-light)'}}>
                              {cls.studentCount || 0}/{cls.maxStudents || 30}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${progressPercentage}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t" style={{borderColor: 'var(--border-light)'}}>
                        <button 
                          onClick={() => router.push(`/admin/classes/${cls.id}`)}
                          className="btn-outline flex-1 text-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/classes/${cls.id}/edit`)}
                          className="btn-secondary flex-1 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                              onClick={() => setCurrentPage(pageNum)}
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
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
          onClick={() => router.push('/admin/classes/create')}
          className="fab"
          title="Create New Class"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </DashboardLayout>
  );
}
