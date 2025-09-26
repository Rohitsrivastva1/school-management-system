package com.nexusapps.atlas.repository

import com.nexusapps.atlas.network.ApiService
import com.nexusapps.atlas.network.dto.*
import com.nexusapps.atlas.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AtlasRepository {
    private val apiService: ApiService by lazy {
        ApiClient.provideRetrofit().create(ApiService::class.java)
    }

    // Auth
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Login failed")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getProfile(): Result<UserDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getProfile()
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to get profile")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Dashboards
    suspend fun getTeacherDashboard(): Result<TeacherDashboardDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getTeacherDashboard()
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load teacher dashboard")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getParentDashboard(studentId: String): Result<ParentDashboardDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getParentDashboard(studentId)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load parent dashboard")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getAdminDashboard(): Result<AdminDashboardDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getAdminDashboard()
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load admin dashboard")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Classes
    suspend fun getClasses(page: Int = 1, limit: Int = 20, academicYear: String? = null): Result<PaginatedResponse<ClassDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getClasses(page, limit, academicYear)
                if (response.success) {
                    val paginatedResponse = PaginatedResponse(
                        items = response.data,
                        pagination = response.pagination
                    )
                    Result.Success(paginatedResponse)
                } else {
                    Result.Error("Failed to load classes")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getClassDetails(classId: String): Result<ClassDetailDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getClassDetails(classId)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load class details")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Students
    suspend fun getStudents(classId: String? = null, page: Int = 1, limit: Int = 50): Result<PaginatedResponse<StudentDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getStudents(classId, page, limit)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load students")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Attendance
    suspend fun markAttendance(classId: String, date: String, attendance: List<StudentAttendanceDto>): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.markAttendance(MarkAttendanceRequest(classId, date, attendance))
                if (response.success) {
                    Result.Success(Unit)
                } else {
                    Result.Error(response.message ?: "Failed to mark attendance")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getAttendanceByClass(classId: String, page: Int = 1, limit: Int = 50): Result<PaginatedResponse<AttendanceRecordDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getAttendanceByClass(classId, page, limit)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load attendance")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun getAttendanceStats(classId: String? = null, studentId: String? = null, period: String? = null): Result<AttendanceStatsDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getAttendanceStats(classId, studentId, period)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load attendance stats")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Homework
    suspend fun getHomework(classId: String? = null, teacherId: String? = null, page: Int = 1, limit: Int = 20): Result<PaginatedResponse<HomeworkDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getHomework(classId, teacherId, page, limit)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load homework")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    suspend fun createHomework(request: CreateHomeworkRequest): Result<HomeworkDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.createHomework(request)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to create homework")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Timetable
    suspend fun getTimetable(classId: String? = null, teacherId: String? = null, day: String? = null, page: Int = 1, limit: Int = 20): Result<PaginatedResponse<TimetableSlotDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getTimetable(classId, teacherId, day, page, limit)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load timetable")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    // Notifications
    suspend fun getNotifications(page: Int = 1, limit: Int = 20, type: String? = null): Result<PaginatedResponse<NotificationDto>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getNotifications(page, limit, type)
                if (response.success && response.data != null) {
                    Result.Success(response.data)
                } else {
                    Result.Error(response.message ?: "Failed to load notifications")
                }
            } catch (e: Exception) {
                Result.Error(e.message ?: "Network error")
            }
        }
    }
}

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}
