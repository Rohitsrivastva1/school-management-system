import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth API
export const authAPI = {
  registerSchool: (data: any) => api.post<ApiResponse<any>>('/auth/school/register', data),
  login: (data: { email: string; password: string }) => 
    api.post<ApiResponse<any>>('/auth/login', data),
  refreshToken: (refreshToken: string) => 
    api.post<ApiResponse<any>>('/auth/refresh', { refreshToken }),
  logout: () => api.post<ApiResponse<any>>('/auth/logout'),
  getProfile: () => api.get<ApiResponse<any>>('/auth/profile'),
  updateProfile: (data: any) => api.put<ApiResponse<any>>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<any>>('/auth/change-password', data),
};

// School API
export const schoolAPI = {
  getProfile: () => api.get<ApiResponse<any>>('/schools/profile'),
  updateProfile: (data: any) => api.put<ApiResponse<any>>('/schools/profile', data),
  getStats: () => api.get<ApiResponse<any>>('/schools/stats'),
};

// Teachers API
export const teachersAPI = {
  getTeachers: (params?: any) => api.get<ApiResponse<any>>('/teachers', { params }),
  createTeacher: (data: any) => api.post<ApiResponse<any>>('/teachers', data),
  getTeacherById: (id: string) => api.get<ApiResponse<any>>(`/teachers/${id}`),
  updateTeacher: (id: string, data: any) => api.put<ApiResponse<any>>(`/teachers/${id}`, data),
  deleteTeacher: (id: string) => api.delete<ApiResponse<any>>(`/teachers/${id}`),
  getTeacherStats: () => api.get<ApiResponse<any>>('/teachers/stats'),
};

// Users API
export const usersAPI = {
  getStudents: (params?: any) => api.get<ApiResponse<any>>('/users/students', { params }),
  bulkUploadStudents: (data: FormData) => api.post<ApiResponse<any>>('/users/students/bulk', data),
};

// Classes API
export const classesAPI = {
  getClasses: (params?: any) => api.get<ApiResponse<any>>('/classes', { params }),
  getClassDetails: (id: string) => api.get<ApiResponse<any>>(`/classes/${id}`),
  createClass: (data: any) => api.post<ApiResponse<any>>('/classes', data),
  updateClass: (id: string, data: any) => api.put<ApiResponse<any>>(`/classes/${id}`, data),
  deleteClass: (id: string) => api.delete<ApiResponse<any>>(`/classes/${id}`),
};

// Timetable API
export const timetableAPI = {
  getTimetable: (params?: any) => api.get<ApiResponse<any>>('/timetable', { params }),
  createTimetable: (data: any) => api.post<ApiResponse<any>>('/timetable', data),
  updateTimetable: (id: string, data: any) => api.put<ApiResponse<any>>(`/timetable/${id}`, data),
  deleteTimetable: (id: string) => api.delete<ApiResponse<any>>(`/timetable/${id}`),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (data: any) => api.post<ApiResponse<any>>('/attendance/mark', data),
  getAttendanceByClass: (classId: string, params?: any) => api.get<ApiResponse<any>>(`/attendance/class/${classId}`, { params }),
  getAttendanceByStudent: (studentId: string, params?: any) => api.get<ApiResponse<any>>(`/attendance/student/${studentId}`, { params }),
  getAttendanceStats: (params?: any) => api.get<ApiResponse<any>>('/attendance/stats', { params }),
  updateAttendance: (attendanceId: string, data: any) => api.put<ApiResponse<any>>(`/attendance/${attendanceId}`, data),
  deleteAttendance: (attendanceId: string) => api.delete<ApiResponse<any>>(`/attendance/${attendanceId}`),
};

// Homework API
export const homeworkAPI = {
  getHomework: (params?: any) => api.get<ApiResponse<any>>('/homework', { params }),
  getHomeworkById: (homeworkId: string) => api.get<ApiResponse<any>>(`/homework/${homeworkId}`),
  getHomeworkByClass: (classId: string, params?: any) => api.get<ApiResponse<any>>(`/homework/class/${classId}`, { params }),
  getHomeworkByTeacher: (teacherId: string, params?: any) => api.get<ApiResponse<any>>(`/homework/teacher/${teacherId}`, { params }),
  createHomework: (data: any) => api.post<ApiResponse<any>>('/homework', data),
  updateHomework: (id: string, data: any) => api.put<ApiResponse<any>>(`/homework/${id}`, data),
  deleteHomework: (id: string) => api.delete<ApiResponse<any>>(`/homework/${id}`),
  publishHomework: (id: string) => api.patch<ApiResponse<any>>(`/homework/${id}/publish`),
  getHomeworkStats: (params?: any) => api.get<ApiResponse<any>>('/homework/stats', { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any) => api.get<ApiResponse<any>>('/notifications', { params }),
  sendNotification: (data: any) => api.post<ApiResponse<any>>('/notifications', data),
  markAsRead: (id: string) => api.put<ApiResponse<any>>(`/notifications/${id}`),
};

// Q&A API
export const qaAPI = {
  getQAMessages: (params?: any) => api.get<ApiResponse<any>>('/qa', { params }),
  sendQAMessage: (data: any) => api.post<ApiResponse<any>>('/qa', data),
  replyToQA: (id: string, data: any) => api.put<ApiResponse<any>>(`/qa/${id}/reply`, data),
};

// Complaints API
export const complaintsAPI = {
  getComplaints: (params?: any) => api.get<ApiResponse<any>>('/complaints', { params }),
  createComplaint: (data: any) => api.post<ApiResponse<any>>('/complaints', data),
  updateComplaint: (id: string, data: any) => api.put<ApiResponse<any>>(`/complaints/${id}`, data),
};

// Dashboard API
export const dashboardAPI = {
  getAdminDashboard: () => api.get<ApiResponse<any>>('/dashboard/admin'),
  getTeacherDashboard: () => api.get<ApiResponse<any>>('/dashboard/teacher'),
  getParentDashboard: (studentId?: string) => 
    api.get<ApiResponse<any>>('/dashboard/parent', { params: { studentId } }),
  getStudentDashboard: () => api.get<ApiResponse<any>>('/dashboard/student'),
};

// Analytics API
export const analyticsAPI = {
  getAttendanceAnalytics: (params?: any) => api.get<ApiResponse<any>>('/analytics/attendance', { params }),
  getPerformanceAnalytics: (params?: any) => api.get<ApiResponse<any>>('/analytics/performance', { params }),
  getClassAnalytics: (params?: any) => api.get<ApiResponse<any>>('/analytics/class', { params }),
  getTeacherAnalytics: (params?: any) => api.get<ApiResponse<any>>('/analytics/teacher', { params }),
  getStudentAnalytics: (params?: any) => api.get<ApiResponse<any>>('/analytics/student', { params }),
  getSchoolAnalytics: () => api.get<ApiResponse<any>>('/analytics/school'),
};

// Files API
export const filesAPI = {
  uploadFile: (data: FormData) => api.post<ApiResponse<any>>('/files/upload', data),
  getFile: (fileId: string) => api.get<ApiResponse<any>>(`/files/${fileId}`),
  deleteFile: (fileId: string) => api.delete<ApiResponse<any>>(`/files/${fileId}`),
  getFileStats: () => api.get<ApiResponse<any>>('/files/stats/overview'),
};

export default api;
