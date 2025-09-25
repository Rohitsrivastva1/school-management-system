'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { homeworkAPI, schoolAPI, classesAPI } from '@/lib/api';

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isPublished: boolean;
  subject: {
    name: string;
  };
  class: {
    id: string;
    name: string;
    section: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

export default function HomeworkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [filteredHomework, setFilteredHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [schoolName, setSchoolName] = useState('GPS School');
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [homework, selectedClass, startDate, endDate, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [schoolResponse, homeworkResponse, classesResponse] = await Promise.all([
        schoolAPI.getProfile(),
        homeworkAPI.getHomework(),
        classesAPI.getClasses()
      ]);

      if (schoolResponse.data.success) {
        setSchoolName(schoolResponse.data.data.name || 'GPS School');
      }

      if (homeworkResponse.data.success) {
        setHomework(homeworkResponse.data.data || []);
      }

      if (classesResponse.data.success) {
        setClasses(classesResponse.data.data || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching homework data:', err);
      setError('Failed to fetch homework assignments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...homework];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(assignment => assignment.class?.id === selectedClass);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(assignment => new Date(assignment.dueDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(assignment => new Date(assignment.dueDate) <= end);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(term) ||
        assignment.description.toLowerCase().includes(term) ||
        assignment.subject?.name.toLowerCase().includes(term) ||
        assignment.teacher?.firstName.toLowerCase().includes(term) ||
        assignment.teacher?.lastName.toLowerCase().includes(term)
      );
    }

    setFilteredHomework(filtered);
  };

  const clearFilters = () => {
    setSelectedClass('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const handlePublish = async (homeworkId: string) => {
    try {
      const response = await homeworkAPI.publishHomework(homeworkId);
      if (response.data.success) {
        // Refresh the homework list
        fetchData();
        alert('Homework published successfully!');
      } else {
        alert('Failed to publish homework');
      }
    } catch (err: any) {
      console.error('Error publishing homework:', err);
      alert('Failed to publish homework. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Homework" 
        schoolName={schoolName}
        userRole={user?.role}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading homework...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Homework Management" 
      schoolName={schoolName}
      userRole={user?.role}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Homework</h2>
            <p className="text-gray-600">Manage homework assignments and submissions</p>
          </div>
          <Button onClick={() => router.push('/admin/homework/create')}>
            Create Homework
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  placeholder="Search by title, description, subject, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}-{cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {filteredHomework.length} of {homework.length} assignments
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                disabled={selectedClass === 'all' && !startDate && !endDate && !searchTerm}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Homework List */}
        {homework.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No homework assignments</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first homework assignment</p>
            <Button onClick={() => router.push('/admin/homework/create')}>
              Create Homework
            </Button>
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Homework Assignments ({filteredHomework.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHomework.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                        {assignment.title}
                      </CardTitle>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {assignment.subject?.name} • {assignment.class?.name}-{assignment.class?.section}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {assignment.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Teacher: {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/admin/homework/${assignment.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/admin/homework/${assignment.id}/edit`)}
                      >
                        Edit
                      </Button>
                      {!assignment.isPublished && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handlePublish(assignment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
