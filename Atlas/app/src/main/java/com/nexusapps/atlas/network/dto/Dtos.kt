package com.nexusapps.atlas.network.dto

import com.squareup.moshi.Json

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String? = null,
    val error: String? = null,
    val pagination: Pagination? = null
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)

// Auth
data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val user: UserDto,
    val tokens: TokensDto
)

data class TokensDto(
    val accessToken: String,
    val refreshToken: String
)

data class UserDto(
    val id: String,
    val email: String,
    val role: String,
    val schoolId: String?,
    val firstName: String?,
    val lastName: String?
)

data class UserDetailsDto(
    val id: String,
    val email: String,
    val role: String,
    val firstName: String?,
    val lastName: String?,
    val schoolId: String?,
    val profileImageUrl: String?
)

data class SchoolInfoDto(
    val id: String,
    val name: String,
    val address: String?,
    val city: String?,
    val state: String?,
    val pincode: String?,
    val phone: String?,
    val email: String?,
    val website: String?,
    val logoUrl: String?,
    val domain: String?,
    val academicYearStart: String?,
    val academicYearEnd: String?
)

// Classes
data class ClassDto(
    val id: String,
    val name: String,
    val section: String?,
    val teacher: String?,
    val room: String?,
    val students: Int?
)

// Subjects
data class SubjectDto(
    val id: String,
    val name: String,
    val code: String,
    val description: String?,
    val isActive: Boolean
)

data class ClassDetailDto(
    val id: String,
    val name: String,
    val section: String?,
    val academicYear: String?,
    val classTeacherId: String?
)

// Students
data class StudentDto(
    val id: String,
    val userId: String? = null,
    val classId: String? = null,
    val rollNumber: String? = null,
    val firstName: String? = null,
    val lastName: String? = null
)

// Homework
data class CreateHomeworkRequest(
    val title: String,
    val description: String,
    val dueDate: String,
    val classId: String,
    val subjectId: String,
    val maxMarks: Int? = null,
    val isPublished: Boolean = false
)

// Dashboards
data class TeacherDashboardDto(
    val todaysClasses: List<TimetableSlotDto> = emptyList(),
    val pendingHomework: List<HomeworkDto> = emptyList()
)

data class ParentDashboardDto(
    val attendanceSummary: AttendanceStatsDto?,
    val notifications: List<NotificationDto> = emptyList(),
    val homeworkDue: List<HomeworkDto> = emptyList()
)

data class AdminDashboardDto(
    val overview: AdminOverviewDto?,
    @Json(name = "recentActivities") val recentActivities: Any? = null
)

data class AdminOverviewDto(
    val totalStudents: Int,
    val totalTeachers: Int,
    val totalClasses: Int,
    @Json(name = "attendancePercentage") val attendanceRate: Double? = null,
    val totalParents: Int? = null,
    val period: Int? = null
)

// Optional placeholder for simple activity items if needed later
data class ActivityDto(
    val type: String? = null,
    val message: String? = null,
    val timestamp: String? = null
)

// Attendance
data class MarkAttendanceRequest(
    val classId: String,
    val date: String,
    val attendance: List<StudentAttendanceDto>
)

data class StudentAttendanceDto(
    val studentId: String,
    val status: String,
    val remarks: String?
)

data class AttendanceRecordDto(
    val id: String,
    val studentId: String,
    val date: String,
    val status: String
)

data class AttendanceStatsDto(
    val totalDays: Int,
    val presentDays: Int,
    val absentDays: Int,
    val attendancePercentage: Double
)

// Timetable & Homework & Notifications
data class TimetableSlotDto(
    val id: String?,
    val periodNumber: Int?,
    val startTime: String?,
    val endTime: String?,
    val subject: SubjectRefDto?,
    val teacher: TeacherRefDto?,
    val roomNumber: String?
)

data class SubjectRefDto(
    val id: String,
    val name: String,
    val code: String?
)

data class TeacherRefDto(
    val id: String,
    val firstName: String?,
    val lastName: String?
)

data class HomeworkDto(
    val id: String,
    val classId: String?,
    val teacherId: String?,
    val title: String,
    val description: String?,
    val dueDate: String?
)

data class NotificationDto(
    val id: String,
    val title: String,
    val message: String,
    val type: String?,
    val createdAt: String?
)

// Generic
data class PaginatedResponse<T>(
    val items: List<T> = emptyList(),
    @Json(name = "pagination") val pagination: Pagination?
)

// API Response DTOs that match the actual API structure
data class ClassesApiResponse(
    val success: Boolean,
    val data: List<ClassDto>,
    val pagination: Pagination?
)

data class SubjectsApiResponse(
    val success: Boolean,
    val data: List<SubjectDto>,
    val pagination: Pagination?
)


