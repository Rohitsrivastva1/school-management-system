package com.nexusapps.atlas.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import androidx.fragment.app.viewModels
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class AdminDashboardFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_admin_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val progress: ProgressBar = view.findViewById(R.id.progress)
        val totalStudents: TextView = view.findViewById(R.id.total_students)
        val totalTeachers: TextView = view.findViewById(R.id.total_teachers)
        val totalClasses: TextView = view.findViewById(R.id.total_classes)
        val recentAdmissions: TextView = view.findViewById(R.id.recent_admissions)
        val schoolName: TextView = view.findViewById(R.id.school_name)
        val schoolEmail: TextView = view.findViewById(R.id.school_email)
        val schoolPhone: TextView = view.findViewById(R.id.school_phone)
        val addTeacherBtn: Button = view.findViewById(R.id.add_teacher_btn)
        val addStudentBtn: Button = view.findViewById(R.id.add_student_btn)
        val createClassBtn: Button = view.findViewById(R.id.create_class_btn)
        val viewReportsBtn: Button = view.findViewById(R.id.view_reports_btn)
        val editProfileBtn: Button = view.findViewById(R.id.edit_profile_btn)

        // Setup quick action buttons
        addTeacherBtn.setOnClickListener {
            // Navigate to add teacher - placeholder for now
            Toast.makeText(requireContext(), "Add Teacher - Coming Soon", Toast.LENGTH_SHORT).show()
        }
        
        addStudentBtn.setOnClickListener {
            // Navigate to add student - placeholder for now
            Toast.makeText(requireContext(), "Add Student - Coming Soon", Toast.LENGTH_SHORT).show()
        }
        
        createClassBtn.setOnClickListener {
            // Navigate to create class - placeholder for now
            Toast.makeText(requireContext(), "Create Class - Coming Soon", Toast.LENGTH_SHORT).show()
        }
        
        viewReportsBtn.setOnClickListener {
            // Navigate to reports - placeholder for now
            Toast.makeText(requireContext(), "View Reports - Coming Soon", Toast.LENGTH_SHORT).show()
        }
        
        editProfileBtn.setOnClickListener {
            // Navigate to edit profile - placeholder for now
            Toast.makeText(requireContext(), "Edit Profile - Coming Soon", Toast.LENGTH_SHORT).show()
        }

        val viewModel: AdminDashboardViewModel by viewModels()
        viewModel.load()
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            viewModel.uiState.collect { state ->
                progress.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                
                when {
                    state.isLoading -> {
                        totalStudents.text = "0"
                        totalTeachers.text = "0"
                        totalClasses.text = "0"
                        recentAdmissions.text = "0"
                        schoolName.text = "Loading..."
                        schoolEmail.text = "Loading..."
                        schoolPhone.text = "Loading..."
                    }
                    state.error != null -> {
                        totalStudents.text = "Error"
                        totalTeachers.text = "Error"
                        totalClasses.text = "Error"
                        recentAdmissions.text = "Error"
                        schoolName.text = "Error loading"
                        schoolEmail.text = "Error loading"
                        schoolPhone.text = "Error loading"
                    }
                    state.data?.overview != null -> {
                        val ov = state.data.overview
                        totalStudents.text = ov.totalStudents.toString()
                        totalTeachers.text = ov.totalTeachers.toString()
                        totalClasses.text = ov.totalClasses.toString()
                        recentAdmissions.text = "0" // This would come from API
                        
                        // Mock school info for now
                        schoolName.text = "GPS School"
                        schoolEmail.text = "admin@gpsschool.edu"
                        schoolPhone.text = "+1 (555) 123-4567"
                    }
                    else -> {
                        totalStudents.text = "0"
                        totalTeachers.text = "0"
                        totalClasses.text = "0"
                        recentAdmissions.text = "0"
                        schoolName.text = "No data"
                        schoolEmail.text = "No data"
                        schoolPhone.text = "No data"
                    }
                }
            }
        }
    }
}


