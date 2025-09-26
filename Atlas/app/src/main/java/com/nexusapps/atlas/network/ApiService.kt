package com.nexusapps.atlas.network

import com.nexusapps.atlas.network.dto.*
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<LoginResponse>

    @GET("auth/profile")
    suspend fun getProfile(): ApiResponse<UserDto>

    @GET("schools/profile")
    suspend fun getSchoolProfile(): ApiResponse<SchoolInfoDto>

    // Dashboards
    @GET("dashboard/teacher")
    suspend fun getTeacherDashboard(): ApiResponse<TeacherDashboardDto>

    @GET("dashboard/parent")
    suspend fun getParentDashboard(@Query("studentId") studentId: String): ApiResponse<ParentDashboardDto>

    @GET("dashboard/admin")
    suspend fun getAdminDashboard(): ApiResponse<AdminDashboardDto>

    // Classes
    @GET("classes")
    suspend fun getClasses(
        @Query("page") page: Int?,
        @Query("limit") limit: Int?,
        @Query("academicYear") academicYear: String?
    ): ClassesApiResponse

    // Subjects
    @GET("subjects")
    suspend fun getSubjects(
        @Query("page") page: Int?,
        @Query("limit") limit: Int?
    ): SubjectsApiResponse

    @GET("classes/{classId}")
    suspend fun getClassDetails(@Path("classId") classId: String): ApiResponse<ClassDetailDto>

    // Students
    @GET("users/students")
    suspend fun getStudents(
        @Query("classId") classId: String?,
        @Query("page") page: Int?,
        @Query("limit") limit: Int?
    ): ApiResponse<PaginatedResponse<StudentDto>>

    // Attendance
    @POST("attendance/mark")
    suspend fun markAttendance(@Body request: MarkAttendanceRequest): ApiResponse<Unit>

    @GET("attendance/class/{classId}")
    suspend fun getAttendanceByClass(
        @Path("classId") classId: String,
        @Query("page") page: Int?,
        @Query("limit") limit: Int?
    ): ApiResponse<PaginatedResponse<AttendanceRecordDto>>

    @GET("attendance/stats")
    suspend fun getAttendanceStats(
        @Query("classId") classId: String?,
        @Query("studentId") studentId: String?,
        @Query("period") period: String?
    ): ApiResponse<AttendanceStatsDto>

    // Homework
    @GET("homework")
    suspend fun getHomework(
        @Query("classId") classId: String?,
        @Query("teacherId") teacherId: String?,
        @Query("page") page: Int?,
        @Query("limit") limit: Int?
    ): ApiResponse<PaginatedResponse<HomeworkDto>>

    @POST("homework")
    suspend fun createHomework(@Body request: CreateHomeworkRequest): ApiResponse<HomeworkDto>

    // Timetable
    @GET("timetable")
    suspend fun getTimetable(
        @Query("classId") classId: String?,
        @Query("teacherId") teacherId: String?,
        @Query("day") day: String?,
        @Query("page") page: Int?,
        @Query("limit") limit: Int?
    ): ApiResponse<PaginatedResponse<TimetableSlotDto>>

    // Notifications
    @GET("notifications")
    suspend fun getNotifications(
        @Query("page") page: Int?,
        @Query("limit") limit: Int?,
        @Query("type") type: String?
    ): ApiResponse<PaginatedResponse<NotificationDto>>
}


