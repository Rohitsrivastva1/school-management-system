package com.nexusapps.atlas.ui.navigation

import android.content.Context
import android.view.Menu
import com.nexusapps.atlas.R
import com.nexusapps.atlas.network.dto.UserDetailsDto

object MenuManager {
    
    fun setupMenuForRole(menu: Menu, userDetails: UserDetailsDto?) {
        val role = userDetails?.role?.lowercase() ?: "teacher"
        
        // Clear existing menu items
        menu.clear()
        
        when (role) {
            "admin" -> setupAdminMenu(menu)
            "class_teacher", "subject_teacher", "teacher" -> setupTeacherMenu(menu)
            "parent" -> setupParentMenu(menu)
            else -> setupDefaultMenu(menu)
        }
    }
    
    private fun setupAdminMenu(menu: Menu) {
        menu.add(0, R.id.teacherDashboardFragment, 0, "Dashboard").setIcon(R.drawable.ic_dashboard)
        menu.add(0, R.id.teacherClassesFragment, 1, "Classes").setIcon(R.drawable.ic_classes)
        menu.add(0, R.id.teacherStudentsFragment, 2, "Students").setIcon(R.drawable.ic_students)
        menu.add(0, R.id.teacherAttendanceFragment, 3, "Attendance").setIcon(R.drawable.ic_attendance)
        menu.add(0, R.id.teacherHomeworkFragment, 4, "Homework").setIcon(R.drawable.ic_homework)
        menu.add(0, R.id.teacherTimetableFragment, 5, "Timetable").setIcon(R.drawable.ic_timetable)
        menu.add(0, R.id.teacherReportsFragment, 6, "Reports").setIcon(R.drawable.ic_reports)
        
        // Divider
        menu.add(0, 0, 7, "").setEnabled(false)
        
        // Settings and Logout
        menu.add(0, R.id.teacherSettingsFragment, 8, "Settings").setIcon(R.drawable.ic_settings)
        menu.add(0, R.id.logout, 9, "Logout").setIcon(R.drawable.ic_logout)
    }
    
    private fun setupTeacherMenu(menu: Menu) {
        menu.add(0, R.id.teacherDashboardFragment, 0, "Dashboard").setIcon(R.drawable.ic_dashboard)
        menu.add(0, R.id.teacherClassesFragment, 1, "Classes").setIcon(R.drawable.ic_classes)
        menu.add(0, R.id.teacherStudentsFragment, 2, "Students").setIcon(R.drawable.ic_students)
        menu.add(0, R.id.teacherAttendanceFragment, 3, "Attendance").setIcon(R.drawable.ic_attendance)
        menu.add(0, R.id.teacherHomeworkFragment, 4, "Homework").setIcon(R.drawable.ic_homework)
        menu.add(0, R.id.teacherTimetableFragment, 5, "Timetable").setIcon(R.drawable.ic_timetable)
        menu.add(0, R.id.teacherReportsFragment, 6, "Reports").setIcon(R.drawable.ic_reports)
        
        // Divider
        menu.add(0, 0, 7, "").setEnabled(false)
        
        // Settings and Logout
        menu.add(0, R.id.teacherSettingsFragment, 8, "Settings").setIcon(R.drawable.ic_settings)
        menu.add(0, R.id.logout, 9, "Logout").setIcon(R.drawable.ic_logout)
    }
    
    private fun setupParentMenu(menu: Menu) {
        menu.add(0, R.id.parentDashboardFragment, 0, "Dashboard").setIcon(R.drawable.ic_dashboard)
        menu.add(0, R.id.teacherAttendanceFragment, 1, "Attendance").setIcon(R.drawable.ic_attendance)
        menu.add(0, R.id.teacherHomeworkFragment, 2, "Homework").setIcon(R.drawable.ic_homework)
        menu.add(0, R.id.teacherTimetableFragment, 3, "Timetable").setIcon(R.drawable.ic_timetable)
        menu.add(0, R.id.teacherReportsFragment, 4, "Reports").setIcon(R.drawable.ic_reports)
        
        // Divider
        menu.add(0, 0, 5, "").setEnabled(false)
        
        // Settings and Logout
        menu.add(0, R.id.teacherSettingsFragment, 6, "Settings").setIcon(R.drawable.ic_settings)
        menu.add(0, R.id.logout, 7, "Logout").setIcon(R.drawable.ic_logout)
    }
    
    private fun setupDefaultMenu(menu: Menu) {
        menu.add(0, R.id.teacherDashboardFragment, 0, "Dashboard").setIcon(R.drawable.ic_dashboard)
        menu.add(0, R.id.teacherSettingsFragment, 1, "Settings").setIcon(R.drawable.ic_settings)
        menu.add(0, R.id.logout, 2, "Logout").setIcon(R.drawable.ic_logout)
    }
}
