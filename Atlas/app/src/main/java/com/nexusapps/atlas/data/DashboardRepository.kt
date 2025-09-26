package com.nexusapps.atlas.data

import android.content.Context
import com.nexusapps.atlas.di.ServiceLocator
import com.nexusapps.atlas.network.dto.*

class DashboardRepository(private val context: Context) {
    private val api = ServiceLocator.provideApiService(context)

    suspend fun loadTeacherDashboard(): Result<TeacherDashboardDto> =
        runCatching { api.getTeacherDashboard() }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun loadParentDashboard(studentId: String): Result<ParentDashboardDto> =
        runCatching { api.getParentDashboard(studentId) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun loadAdminDashboard(): Result<AdminDashboardDto> =
        runCatching { api.getAdminDashboard() }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // User Profile
    suspend fun loadUserDetails(): Result<UserDetailsDto> =
        runCatching { api.getProfile() }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) {
                        // Convert UserDto to UserDetailsDto
                        val userDto = resp.data
                        val userDetails = UserDetailsDto(
                            id = userDto.id,
                            email = userDto.email,
                            role = userDto.role,
                            firstName = userDto.firstName,
                            lastName = userDto.lastName,
                            schoolId = userDto.schoolId,
                            profileImageUrl = null
                        )
                        Result.Success(userDetails)
                    } else {
                        Result.Error(resp.message ?: "Failed to load user details")
                    }
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // School Information
    suspend fun loadSchoolInfo(): Result<SchoolInfoDto> =
        runCatching { api.getSchoolProfile() }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load school info")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Classes
    suspend fun loadClasses(page: Int = 1, limit: Int = 20, academicYear: String? = null): Result<PaginatedResponse<ClassDto>> =
        runCatching { api.getClasses(page, limit, academicYear) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success) {
                        val paginatedResponse = PaginatedResponse(
                            items = resp.data,
                            pagination = resp.pagination
                        )
                        Result.Success(paginatedResponse)
                    } else {
                        Result.Error("Failed to load classes")
                    }
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Subjects
    suspend fun loadSubjects(page: Int = 1, limit: Int = 20): Result<PaginatedResponse<SubjectDto>> =
        runCatching { api.getSubjects(page, limit) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success) {
                        val paginatedResponse = PaginatedResponse(
                            items = resp.data,
                            pagination = resp.pagination
                        )
                        Result.Success(paginatedResponse)
                    } else {
                        Result.Error("Failed to load subjects")
                    }
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun loadClassDetails(classId: String): Result<ClassDetailDto> =
        runCatching { api.getClassDetails(classId) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load class details")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Students
    suspend fun loadStudents(classId: String? = null, page: Int = 1, limit: Int = 50): Result<PaginatedResponse<StudentDto>> =
        runCatching { api.getStudents(classId, page, limit) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load students")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Attendance
    suspend fun markAttendance(classId: String, date: String, attendance: List<StudentAttendanceDto>): Result<Unit> =
        runCatching { api.markAttendance(MarkAttendanceRequest(classId, date, attendance)) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success) Result.Success(Unit)
                    else Result.Error(resp.message ?: "Failed to mark attendance")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun loadAttendanceByClass(classId: String, page: Int = 1, limit: Int = 50): Result<PaginatedResponse<AttendanceRecordDto>> =
        runCatching { api.getAttendanceByClass(classId, page, limit) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load attendance")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun loadAttendanceStats(classId: String? = null, studentId: String? = null, period: String? = null): Result<AttendanceStatsDto> =
        runCatching { api.getAttendanceStats(classId, studentId, period) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load attendance stats")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Homework
    suspend fun loadHomework(classId: String? = null, teacherId: String? = null, page: Int = 1, limit: Int = 20): Result<PaginatedResponse<HomeworkDto>> =
        runCatching { api.getHomework(classId, teacherId, page, limit) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load homework")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    suspend fun createHomework(request: CreateHomeworkRequest): Result<HomeworkDto> =
        runCatching { api.createHomework(request) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to create homework")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Timetable
    suspend fun loadTimetable(classId: String? = null, teacherId: String? = null, day: String? = null, page: Int = 1, limit: Int = 20): Result<PaginatedResponse<TimetableSlotDto>> =
        runCatching { api.getTimetable(classId, teacherId, day, page, limit) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load timetable")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )

    // Notifications
    suspend fun loadNotifications(page: Int = 1, limit: Int = 20, type: String? = null): Result<PaginatedResponse<NotificationDto>> =
        runCatching { api.getNotifications(page, limit, type) }
            .fold(
                onSuccess = { resp ->
                    if (resp.success && resp.data != null) Result.Success(resp.data)
                    else Result.Error(resp.message ?: "Failed to load notifications")
                },
                onFailure = { t -> Result.Error(t.message ?: "Network error", t) }
            )
}


