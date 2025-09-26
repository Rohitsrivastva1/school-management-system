package com.nexusapps.atlas.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import androidx.fragment.app.viewModels
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class TeacherDashboardFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_teacher_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val progress: ProgressBar = view.findViewById(R.id.progress)
        val menuButton: ImageButton = view.findViewById(R.id.menu_button)
        val totalClasses: TextView = view.findViewById(R.id.total_classes)
        val totalStudents: TextView = view.findViewById(R.id.total_students)
        val pendingHomework: TextView = view.findViewById(R.id.pending_homework)
        val todaysAttendance: TextView = view.findViewById(R.id.todays_attendance)
        val markAttendanceBtn: Button = view.findViewById(R.id.mark_attendance_btn)
        val assignHomeworkBtn: Button = view.findViewById(R.id.assign_homework_btn)
        val viewStudentsBtn: Button = view.findViewById(R.id.view_students_btn)
        val viewClassesBtn: Button = view.findViewById(R.id.view_classes_btn)
        val activitiesList: LinearLayout = view.findViewById(R.id.activities_list)
        val noActivities: TextView = view.findViewById(R.id.no_activities)

        // Setup menu button to open drawer
        menuButton.setOnClickListener {
            val activity = requireActivity() as com.nexusapps.atlas.MainActivity
            val drawerLayout = activity.findViewById<DrawerLayout>(R.id.drawer_layout)
            drawerLayout.openDrawer(androidx.core.view.GravityCompat.START)
        }

        // Setup quick action buttons
        markAttendanceBtn.setOnClickListener {
            // Navigate to attendance marking
            findNavController().navigate(R.id.markAttendanceFragment)
        }
        
        assignHomeworkBtn.setOnClickListener {
            // Navigate to homework creation
            findNavController().navigate(R.id.createHomeworkFragment)
        }
        
        viewStudentsBtn.setOnClickListener {
            // Navigate to students list
            findNavController().navigate(R.id.viewStudentsFragment)
        }
        
        viewClassesBtn.setOnClickListener {
            // Navigate to classes list
            findNavController().navigate(R.id.classesFragment)
        }

        val viewModel: TeacherDashboardViewModel by viewModels()
        viewModel.load()
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            viewModel.uiState.collect { state ->
                progress.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                
                when {
                    state.isLoading -> {
                        totalClasses.text = "0"
                        totalStudents.text = "0"
                        pendingHomework.text = "0"
                        todaysAttendance.text = "0"
                    }
                    state.error != null -> {
                        totalClasses.text = "Error"
                        totalStudents.text = "Error"
                        pendingHomework.text = "Error"
                        todaysAttendance.text = "Error"
                    }
                    state.data != null -> {
                        totalClasses.text = state.data.todaysClasses.size.toString()
                        totalStudents.text = getTotalStudentsCount().toString() // Get from API
                        pendingHomework.text = state.data.pendingHomework.size.toString()
                        todaysAttendance.text = getTodaysAttendanceCount().toString() // Get from API
                        
                        // Update activities list
                        updateActivitiesList(activitiesList, noActivities, state.data)
                    }
                    else -> {
                        totalClasses.text = "0"
                        totalStudents.text = "0"
                        pendingHomework.text = "0"
                        todaysAttendance.text = "0"
                    }
                }
            }
        }
    }
    
    private fun updateActivitiesList(container: LinearLayout, noDataView: TextView, data: Any) {
        container.removeAllViews()
        
        // Mock activities for now
        val activities = listOf(
            "Math Assignment Due - 2 hours ago",
            "Class 10A attendance completed - 4 hours ago",
            "Parent Meeting scheduled - 1 day ago"
        )
        
        if (activities.isEmpty()) {
            noDataView.visibility = View.VISIBLE
        } else {
            noDataView.visibility = View.GONE
            activities.forEach { activity ->
                val activityView = createActivityItemView(activity)
                container.addView(activityView)
            }
        }
    }
    
    private fun createActivityItemView(activity: String): View {
        val view = LayoutInflater.from(requireContext()).inflate(android.R.layout.simple_list_item_1, null)
        val textView = view.findViewById<TextView>(android.R.id.text1)
        textView.text = activity
        textView.textSize = 14f
        textView.setTextColor(resources.getColor(android.R.color.black, null))
        return view
    }
    
    private fun getTotalStudentsCount(): Int {
        // This would get the total student count from API
        // For now, return a default value
        return 85
    }
    
    private fun getTodaysAttendanceCount(): Int {
        // This would get today's attendance count from API
        // For now, return a default value
        return 78
    }
}


