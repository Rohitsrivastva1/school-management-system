package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import com.nexusapps.atlas.data.DashboardRepository
import com.nexusapps.atlas.data.Result
import com.nexusapps.atlas.network.dto.StudentDto
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class ViewStudentsFragment : Fragment() {
    private var job: Job? = null
    private val allStudents = mutableListOf<StudentInfo>()
    private val filteredStudents = mutableListOf<StudentInfo>()
    private var currentFilter = FilterType.ALL
    private lateinit var repository: DashboardRepository
    private var classId: String = "class_10_a" // This should come from navigation arguments

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_view_students, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initialize repository
        repository = DashboardRepository(requireContext())
        
        val backButton: ImageButton = view.findViewById(R.id.back_button)
        val searchInput: EditText = view.findViewById(R.id.search_input)
        val searchButton: ImageButton = view.findViewById(R.id.search_button)
        val filterAllBtn: Button = view.findViewById(R.id.filter_all_btn)
        val filterPresentBtn: Button = view.findViewById(R.id.filter_present_btn)
        val filterAbsentBtn: Button = view.findViewById(R.id.filter_absent_btn)
        val totalCount: TextView = view.findViewById(R.id.total_count)
        val presentCount: TextView = view.findViewById(R.id.present_count)
        val absentCount: TextView = view.findViewById(R.id.absent_count)
        val studentCountText: TextView = view.findViewById(R.id.student_count_text)
        val studentsListContainer: LinearLayout = view.findViewById(R.id.students_list)
        val noStudents: TextView = view.findViewById(R.id.no_students)
        val progress: ProgressBar = view.findViewById(R.id.progress)

        // Setup back button
        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        // Setup search functionality
        searchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                filterStudents(s?.toString() ?: "")
            }
        })

        searchButton.setOnClickListener {
            filterStudents(searchInput.text.toString())
        }

        // Setup filter buttons
        filterAllBtn.setOnClickListener {
            setActiveFilter(FilterType.ALL, filterAllBtn, filterPresentBtn, filterAbsentBtn)
            filterStudents(searchInput.text.toString())
        }

        filterPresentBtn.setOnClickListener {
            setActiveFilter(FilterType.PRESENT, filterAllBtn, filterPresentBtn, filterAbsentBtn)
            filterStudents(searchInput.text.toString())
        }

        filterAbsentBtn.setOnClickListener {
            setActiveFilter(FilterType.ABSENT, filterAllBtn, filterPresentBtn, filterAbsentBtn)
            filterStudents(searchInput.text.toString())
        }

        // Load students data
        loadStudents(studentsListContainer, noStudents, progress, totalCount, presentCount, absentCount, studentCountText)
    }

    private fun loadStudents(
        container: LinearLayout, 
        noDataView: TextView, 
        progress: ProgressBar,
        totalCount: TextView,
        presentCount: TextView,
        absentCount: TextView,
        studentCountText: TextView
    ) {
        progress.visibility = View.VISIBLE
        
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Load students from API
                when (val result = repository.loadStudents(classId)) {
                    is Result.Success -> {
                        val apiStudents = result.data.items
                        
                        allStudents.clear()
                        allStudents.addAll(apiStudents.map { studentDto ->
                            StudentInfo(
                                name = "${studentDto.firstName ?: ""} ${studentDto.lastName ?: ""}".trim(),
                                rollNumber = studentDto.rollNumber ?: "",
                                className = "10-A", // This should come from class data
                                isPresent = true, // This should come from attendance data
                                attendancePercentage = 95 // This should come from attendance stats
                            )
                        })
                        filteredStudents.clear()
                        filteredStudents.addAll(allStudents)
                        
                        updateStatistics(totalCount, presentCount, absentCount, studentCountText)
                        updateStudentsList(container, noDataView)
                    }
                    is Result.Error -> {
                        noDataView.visibility = View.VISIBLE
                        noDataView.text = "Error loading students: ${result.message}"
                    }
                    Result.Loading -> {
                        // Keep loading state
                    }
                }
                
            } catch (e: Exception) {
                noDataView.visibility = View.VISIBLE
                noDataView.text = "Error loading students: ${e.message}"
            } finally {
                progress.visibility = View.GONE
            }
        }
    }

    private fun filterStudents(query: String) {
        filteredStudents.clear()
        
        val filtered = allStudents.filter { student ->
            val matchesSearch = query.isEmpty() || 
                student.name.contains(query, ignoreCase = true) ||
                student.rollNumber.contains(query, ignoreCase = true)
            
            val matchesFilter = when (currentFilter) {
                FilterType.ALL -> true
                FilterType.PRESENT -> student.isPresent
                FilterType.ABSENT -> !student.isPresent
            }
            
            matchesSearch && matchesFilter
        }
        
        filteredStudents.addAll(filtered)
        updateStudentsList(
            view?.findViewById(R.id.students_list),
            view?.findViewById(R.id.no_students)
        )
    }

    private fun setActiveFilter(
        filter: FilterType,
        allBtn: Button,
        presentBtn: Button,
        absentBtn: Button
    ) {
        currentFilter = filter
        
        // Reset all buttons
        allBtn.background = resources.getDrawable(R.drawable.button_outline_background)
        allBtn.setTextColor(resources.getColor(R.color.nav_text_color))
        presentBtn.background = resources.getDrawable(R.drawable.button_outline_background)
        presentBtn.setTextColor(resources.getColor(R.color.nav_text_color))
        absentBtn.background = resources.getDrawable(R.drawable.button_outline_background)
        absentBtn.setTextColor(resources.getColor(R.color.nav_text_color))
        
        // Set active button
        when (filter) {
            FilterType.ALL -> {
                allBtn.background = resources.getDrawable(R.drawable.button_primary_background)
                allBtn.setTextColor(resources.getColor(R.color.white))
            }
            FilterType.PRESENT -> {
                presentBtn.background = resources.getDrawable(R.drawable.button_primary_background)
                presentBtn.setTextColor(resources.getColor(R.color.white))
            }
            FilterType.ABSENT -> {
                absentBtn.background = resources.getDrawable(R.drawable.button_primary_background)
                absentBtn.setTextColor(resources.getColor(R.color.white))
            }
        }
    }

    private fun updateStatistics(
        totalCount: TextView,
        presentCount: TextView,
        absentCount: TextView,
        studentCountText: TextView
    ) {
        val total = allStudents.size
        val present = allStudents.count { it.isPresent }
        val absent = total - present
        
        totalCount.text = total.toString()
        presentCount.text = present.toString()
        absentCount.text = absent.toString()
        studentCountText.text = "$total students"
    }

    private fun updateStudentsList(container: LinearLayout?, noDataView: TextView?) {
        container?.removeAllViews()
        
        if (filteredStudents.isEmpty()) {
            noDataView?.visibility = View.VISIBLE
            noDataView?.text = if (currentFilter == FilterType.ALL) "No students found" else "No ${currentFilter.name.lowercase()} students found"
        } else {
            noDataView?.visibility = View.GONE
            filteredStudents.forEach { student ->
                val studentView = createStudentItemView(student)
                container?.addView(studentView)
            }
        }
    }

    private fun createStudentItemView(student: StudentInfo): View {
        val view = LayoutInflater.from(requireContext()).inflate(R.layout.item_student_info, null)
        
        val studentName: TextView = view.findViewById(R.id.student_name)
        val rollNumber: TextView = view.findViewById(R.id.roll_number)
        val className: TextView = view.findViewById(R.id.class_name)
        val statusText: TextView = view.findViewById(R.id.status_text)
        val attendancePercentage: TextView = view.findViewById(R.id.attendance_percentage)
        
        studentName.text = student.name
        rollNumber.text = "Roll No: ${student.rollNumber}"
        className.text = "Class: ${student.className}"
        statusText.text = if (student.isPresent) "Present" else "Absent"
        statusText.setTextColor(if (student.isPresent) 0xFF059669.toInt() else 0xFFdc2626.toInt())
        attendancePercentage.text = "${student.attendancePercentage}%"
        
        return view
    }

    data class StudentInfo(
        val name: String,
        val rollNumber: String,
        val className: String,
        val isPresent: Boolean,
        val attendancePercentage: Int
    )

    enum class FilterType {
        ALL, PRESENT, ABSENT
    }
}
