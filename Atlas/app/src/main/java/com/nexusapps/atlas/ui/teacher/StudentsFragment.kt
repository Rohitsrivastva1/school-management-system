package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class StudentsFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_students, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val backButton: ImageButton = view.findViewById(R.id.back_button)
        val searchInput: EditText = view.findViewById(R.id.search_input)
        val studentsList: LinearLayout = view.findViewById(R.id.students_list)
        val noStudents: TextView = view.findViewById(R.id.no_students)
        val progress: ProgressBar = view.findViewById(R.id.progress)

        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        // Simple text change listener for EditText
        searchInput.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                searchStudents(s?.toString() ?: "", studentsList, noStudents, progress)
            }
        })

        // Load students data
        loadStudents(studentsList, noStudents, progress)
    }

    private fun loadStudents(container: LinearLayout, noDataView: TextView, progress: ProgressBar) {
        searchStudents("", container, noDataView, progress)
    }

    private fun searchStudents(query: String, container: LinearLayout, noDataView: TextView, progress: ProgressBar) {
        progress.visibility = View.VISIBLE
        
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Simulate API call
                kotlinx.coroutines.delay(500)
                
                // Mock data - in real app, this would come from API
                val allStudents = listOf(
                    StudentData("John Doe", "101", "10-A", "Present", "95%"),
                    StudentData("Jane Smith", "102", "10-A", "Present", "92%"),
                    StudentData("Mike Johnson", "103", "10-A", "Absent", "88%"),
                    StudentData("Sarah Wilson", "104", "10-A", "Present", "96%")
                )
                
                val filteredStudents = if (query.isEmpty()) {
                    allStudents
                } else {
                    allStudents.filter { 
                        it.name.contains(query, ignoreCase = true) || 
                        it.rollNumber.contains(query, ignoreCase = true)
                    }
                }
                
                container.removeAllViews()
                
                if (filteredStudents.isEmpty()) {
                    noDataView.visibility = View.VISIBLE
                    noDataView.text = if (query.isEmpty()) "No students found" else "No students match your search"
                } else {
                    noDataView.visibility = View.GONE
                    filteredStudents.forEach { studentData ->
                        val studentView = createStudentItemView(studentData)
                        container.addView(studentView)
                    }
                }
                
            } catch (e: Exception) {
                noDataView.visibility = View.VISIBLE
                noDataView.text = "Error loading students"
            } finally {
                progress.visibility = View.GONE
            }
        }
    }

    private fun createStudentItemView(studentData: StudentData): View {
        val view = LayoutInflater.from(requireContext()).inflate(R.layout.item_student, null)
        
        // This would be implemented with proper data binding
        // For now, return a simple view
        return view
    }

    data class StudentData(
        val name: String,
        val rollNumber: String,
        val className: String,
        val attendanceStatus: String,
        val attendancePercentage: String
    )
}
