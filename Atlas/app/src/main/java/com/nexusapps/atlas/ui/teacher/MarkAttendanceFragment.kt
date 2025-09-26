package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
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
import com.nexusapps.atlas.network.dto.StudentAttendanceDto
import com.nexusapps.atlas.network.dto.MarkAttendanceRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MarkAttendanceFragment : Fragment() {
    private var job: Job? = null
    private val studentsList = mutableListOf<StudentAttendance>()
    private var totalStudents = 0
    private var presentCount = 0
    private var absentCount = 0
    private lateinit var repository: DashboardRepository
    private var classId: String = "class_10_a" // This should come from navigation arguments

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_mark_attendance, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initialize repository
        repository = DashboardRepository(requireContext())
        
        val backButton: ImageButton = view.findViewById(R.id.back_button)
        val currentDate: TextView = view.findViewById(R.id.current_date)
        val totalStudentsCount: TextView = view.findViewById(R.id.total_students_count)
        val presentCount: TextView = view.findViewById(R.id.present_count)
        val absentCount: TextView = view.findViewById(R.id.absent_count)
        val markAllPresentBtn: Button = view.findViewById(R.id.mark_all_present_btn)
        val markAllAbsentBtn: Button = view.findViewById(R.id.mark_all_absent_btn)
        val studentsListContainer: LinearLayout = view.findViewById(R.id.students_list)
        val noStudents: TextView = view.findViewById(R.id.no_students)
        val saveAttendanceBtn: Button = view.findViewById(R.id.save_attendance_btn)
        val progress: ProgressBar = view.findViewById(R.id.progress)

        // Setup back button
        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        // Set current date
        val dateFormat = SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault())
        currentDate.text = dateFormat.format(Date())

        // Setup quick action buttons
        markAllPresentBtn.setOnClickListener {
            markAllStudents(true)
            updateUI()
        }

        markAllAbsentBtn.setOnClickListener {
            markAllStudents(false)
            updateUI()
        }

        // Setup save button
        saveAttendanceBtn.setOnClickListener {
            saveAttendance()
        }

        // Load students data
        loadStudents(studentsListContainer, noStudents, progress)
    }

    private fun loadStudents(container: LinearLayout, noDataView: TextView, progress: ProgressBar) {
        progress.visibility = View.VISIBLE
        
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Load students from API
                when (val result = repository.loadStudents(classId)) {
                    is Result.Success -> {
                        val apiStudents = result.data.items
                        
                        studentsList.clear()
                        studentsList.addAll(apiStudents.map { studentDto ->
                            StudentAttendance(
                                name = "${studentDto.firstName ?: ""} ${studentDto.lastName ?: ""}".trim(),
                                rollNumber = studentDto.rollNumber ?: "",
                                isPresent = true, // Default to present
                                studentId = studentDto.id
                            )
                        })
                        totalStudents = studentsList.size
                        
                        container.removeAllViews()
                        
                        if (studentsList.isEmpty()) {
                            noDataView.visibility = View.VISIBLE
                            noDataView.text = "No students found for this class"
                        } else {
                            noDataView.visibility = View.GONE
                            studentsList.forEach { student ->
                                val studentView = createStudentItemView(student)
                                container.addView(studentView)
                            }
                        }
                        
                        updateCounts()
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

    private fun createStudentItemView(student: StudentAttendance): View {
        val view = LayoutInflater.from(requireContext()).inflate(R.layout.item_student_attendance, null)
        
        val studentName: TextView = view.findViewById(R.id.student_name)
        val rollNumber: TextView = view.findViewById(R.id.roll_number)
        val attendanceSwitch: Switch = view.findViewById(R.id.attendance_switch)
        val statusText: TextView = view.findViewById(R.id.status_text)
        
        studentName.text = student.name
        rollNumber.text = "Roll No: ${student.rollNumber}"
        attendanceSwitch.isChecked = student.isPresent
        statusText.text = if (student.isPresent) "Present" else "Absent"
        statusText.setTextColor(if (student.isPresent) 0xFF059669.toInt() else 0xFFdc2626.toInt())
        
        attendanceSwitch.setOnCheckedChangeListener { _, isChecked ->
            student.isPresent = isChecked
            statusText.text = if (isChecked) "Present" else "Absent"
            statusText.setTextColor(if (isChecked) 0xFF059669.toInt() else 0xFFdc2626.toInt())
            updateCounts()
        }
        
        return view
    }

    private fun markAllStudents(isPresent: Boolean) {
        studentsList.forEach { student ->
            student.isPresent = isPresent
        }
        updateUI()
    }

    private fun updateUI() {
        // Update all student views
        val container = view?.findViewById<LinearLayout>(R.id.students_list)
        container?.removeAllViews()
        studentsList.forEach { student ->
            val studentView = createStudentItemView(student)
            container?.addView(studentView)
        }
        updateCounts()
    }

    private fun updateCounts() {
        presentCount = studentsList.count { it.isPresent }
        absentCount = totalStudents - presentCount
        
        view?.findViewById<TextView>(R.id.total_students_count)?.text = totalStudents.toString()
        view?.findViewById<TextView>(R.id.present_count)?.text = presentCount.toString()
        view?.findViewById<TextView>(R.id.absent_count)?.text = absentCount.toString()
    }

    private fun saveAttendance() {
        val progress = view?.findViewById<ProgressBar>(R.id.progress)
        val saveBtn = view?.findViewById<Button>(R.id.save_attendance_btn)
        
        progress?.visibility = View.VISIBLE
        saveBtn?.isEnabled = false
        
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Prepare attendance data
                val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val currentDate = dateFormat.format(Date())
                
                val attendanceData = studentsList.map { student ->
                    StudentAttendanceDto(
                        studentId = student.studentId,
                        status = if (student.isPresent) "present" else "absent",
                        remarks = null
                    )
                }
                
                // Save to API
                when (val result = repository.markAttendance(classId, currentDate, attendanceData)) {
                    is Result.Success -> {
                        Toast.makeText(requireContext(), "Attendance saved successfully!", Toast.LENGTH_SHORT).show()
                        findNavController().navigateUp()
                    }
                    is Result.Error -> {
                        Toast.makeText(requireContext(), "Error saving attendance: ${result.message}", Toast.LENGTH_SHORT).show()
                    }
                    Result.Loading -> {
                        // Keep loading state
                    }
                }
                
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error saving attendance: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progress?.visibility = View.GONE
                saveBtn?.isEnabled = true
            }
        }
    }

    data class StudentAttendance(
        var name: String,
        val rollNumber: String,
        var isPresent: Boolean,
        val studentId: String
    )
}