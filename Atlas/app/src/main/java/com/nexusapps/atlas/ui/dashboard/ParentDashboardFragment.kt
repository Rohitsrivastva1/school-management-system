package com.nexusapps.atlas.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.nexusapps.atlas.R
import androidx.fragment.app.viewModels
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class ParentDashboardFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_parent_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val progress: ProgressBar = view.findViewById(R.id.progress)
        val refreshButton: Button = view.findViewById(R.id.refresh_button)
        val studentName: TextView = view.findViewById(R.id.student_name)
        val studentClass: TextView = view.findViewById(R.id.student_class)
        val attendancePercentage: TextView = view.findViewById(R.id.attendance_percentage)
        val homeworkList: LinearLayout = view.findViewById(R.id.homework_list)
        val noHomework: TextView = view.findViewById(R.id.no_homework)
        val announcementsList: LinearLayout = view.findViewById(R.id.announcements_list)
        val noAnnouncements: TextView = view.findViewById(R.id.no_announcements)

        val viewModel: ParentDashboardViewModel by viewModels()
        
        refreshButton.setOnClickListener {
            viewModel.load(studentId = "demo-student-id")
        }
        
        viewModel.load(studentId = "demo-student-id")
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            viewModel.uiState.collect { state ->
                progress.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                
                when {
                    state.isLoading -> {
                        studentName.text = "Loading..."
                        studentClass.text = "Class: Loading..."
                        attendancePercentage.text = "Loading..."
                    }
                    state.error != null -> {
                        studentName.text = "Error loading data"
                        studentClass.text = "Please try again"
                        attendancePercentage.text = "Error"
                    }
                    state.data != null -> {
                        // Update student info - get from user profile or student data
                        val userProfile = getUserProfile() // This would be implemented
                        studentName.text = "${userProfile?.firstName ?: "Student"} ${userProfile?.lastName ?: "Name"}"
                        studentClass.text = "Class: ${getStudentClass()}" // This would be implemented
                        
                        // Update attendance
                        val stats = state.data.attendanceSummary
                        val attendancePct = stats?.attendancePercentage ?: 0.0
                        attendancePercentage.text = "${attendancePct.toInt()}%"
                        
                        // Update homework list
                        updateHomeworkList(homeworkList, noHomework, state.data.homeworkDue)
                        
                        // Update announcements
                        updateAnnouncementsList(announcementsList, noAnnouncements, state.data.notifications)
                    }
                    else -> {
                        studentName.text = "No data available"
                        studentClass.text = "Please refresh"
                        attendancePercentage.text = "N/A"
                    }
                }
            }
        }
    }
    
    private fun updateHomeworkList(container: LinearLayout, noDataView: TextView, homeworkList: List<com.nexusapps.atlas.network.dto.HomeworkDto>?) {
        container.removeAllViews()
        
        if (homeworkList.isNullOrEmpty()) {
            noDataView.visibility = View.VISIBLE
        } else {
            noDataView.visibility = View.GONE
            homeworkList.take(5).forEach { homework ->
                val homeworkView = createHomeworkItemView(homework)
                container.addView(homeworkView)
            }
        }
    }
    
    private fun updateAnnouncementsList(container: LinearLayout, noDataView: TextView, notifications: List<com.nexusapps.atlas.network.dto.NotificationDto>?) {
        container.removeAllViews()
        
        if (notifications.isNullOrEmpty()) {
            noDataView.visibility = View.VISIBLE
        } else {
            noDataView.visibility = View.GONE
            notifications.take(5).forEach { notification ->
                val notificationView = createNotificationItemView(notification)
                container.addView(notificationView)
            }
        }
    }
    
    private fun createHomeworkItemView(homework: com.nexusapps.atlas.network.dto.HomeworkDto): View {
        val view = LayoutInflater.from(requireContext()).inflate(android.R.layout.simple_list_item_2, null)
        val titleView = view.findViewById<TextView>(android.R.id.text1)
        val subtitleView = view.findViewById<TextView>(android.R.id.text2)
        
        titleView.text = homework.title
        subtitleView.text = "Due: ${homework.dueDate ?: "No date"}"
        
        return view
    }
    
    private fun createNotificationItemView(notification: com.nexusapps.atlas.network.dto.NotificationDto): View {
        val view = LayoutInflater.from(requireContext()).inflate(android.R.layout.simple_list_item_1, null)
        val textView = view.findViewById<TextView>(android.R.id.text1)
        
        textView.text = notification.title
        
        return view
    }
    
    private fun getUserProfile(): com.nexusapps.atlas.network.dto.UserDto? {
        // This would get the current user profile from session manager
        // For now, return null to use fallback values
        return null
    }
    
    private fun getStudentClass(): String {
        // This would get the student's class from the API
        // For now, return a default value
        return "10-A"
    }
}


