package com.nexusapps.atlas.ui.teacher

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import com.nexusapps.atlas.data.DashboardRepository
import com.nexusapps.atlas.data.Result
import com.nexusapps.atlas.network.dto.CreateHomeworkRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class CreateHomeworkFragment : Fragment() {
    private var job: Job? = null
    private var selectedClassId: String? = null
    private var selectedSubjectId: String? = null
    private lateinit var repository: DashboardRepository

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_create_homework, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initialize repository
        repository = DashboardRepository(requireContext())
        
        val titleEditText: EditText = view.findViewById(R.id.title_edit_text)
        val descriptionEditText: EditText = view.findViewById(R.id.description_edit_text)
        val dueDateEditText: EditText = view.findViewById(R.id.due_date_edit_text)
        val maxMarksEditText: EditText = view.findViewById(R.id.max_marks_edit_text)
        val classSpinner: Spinner = view.findViewById(R.id.class_spinner)
        val subjectSpinner: Spinner = view.findViewById(R.id.subject_spinner)
        val publishCheckbox: CheckBox = view.findViewById(R.id.publish_checkbox)
        val submitButton: Button = view.findViewById(R.id.submit_button)
        val cancelButton: Button = view.findViewById(R.id.cancel_button)
        val progress: ProgressBar = view.findViewById(R.id.progress)

        // Setup date picker for due date
        setupDatePicker(dueDateEditText)
        
        // Load real data from API
        loadClassesAndSubjects(classSpinner, subjectSpinner)

        submitButton.setOnClickListener {
            val title = titleEditText.text.toString().trim()
            val description = descriptionEditText.text.toString().trim()
            val dueDate = dueDateEditText.text.toString().trim()
            val maxMarks = maxMarksEditText.text.toString().trim()
            
            if (validateInput(title, description, dueDate)) {
                createHomework(title, description, dueDate, maxMarks, publishCheckbox.isChecked, progress)
            }
        }
        
        cancelButton.setOnClickListener {
            // Navigate back or clear form
            requireActivity().onBackPressed()
        }
    }

    private fun setupDatePicker(dueDateEditText: EditText) {
        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        
        dueDateEditText.setOnClickListener {
            val datePickerDialog = DatePickerDialog(
                requireContext(),
                { _, year, month, dayOfMonth ->
                    calendar.set(year, month, dayOfMonth)
                    dueDateEditText.setText(dateFormat.format(calendar.time))
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )
            
            // Set minimum date to today
            datePickerDialog.datePicker.minDate = System.currentTimeMillis()
            datePickerDialog.show()
        }
        
        // Make it non-focusable so keyboard doesn't appear
        dueDateEditText.isFocusable = false
        dueDateEditText.isClickable = true
    }

    private fun validateInput(title: String, description: String, dueDate: String): Boolean {
        return when {
            title.isEmpty() -> {
                Toast.makeText(requireContext(), "Please enter a title", Toast.LENGTH_SHORT).show()
                false
            }
            description.isEmpty() -> {
                Toast.makeText(requireContext(), "Please enter a description", Toast.LENGTH_SHORT).show()
                false
            }
            dueDate.isEmpty() -> {
                Toast.makeText(requireContext(), "Please select a due date", Toast.LENGTH_SHORT).show()
                false
            }
            selectedClassId == null -> {
                Toast.makeText(requireContext(), "Please select a class", Toast.LENGTH_SHORT).show()
                false
            }
            selectedSubjectId == null -> {
                Toast.makeText(requireContext(), "Please select a subject", Toast.LENGTH_SHORT).show()
                false
            }
            else -> true
        }
    }

    private fun loadClassesAndSubjects(classSpinner: Spinner, subjectSpinner: Spinner) {
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Load classes
                when (val result = repository.loadClasses()) {
                    is Result.Success -> {
                        android.util.Log.d("CreateHomework", "Classes loaded successfully: ${result.data.items.size} items")
                        setupClassSpinner(classSpinner, result.data.items)
                    }
                    is Result.Error -> {
                        android.util.Log.e("CreateHomework", "Failed to load classes: ${result.message}")
                        Toast.makeText(requireContext(), "Failed to load classes: ${result.message}", Toast.LENGTH_SHORT).show()
                        setupClassSpinner(classSpinner, emptyList())
                    }
                    Result.Loading -> {
                        android.util.Log.d("CreateHomework", "Loading classes...")
                    }
                }
                
                // Load subjects
                when (val subjectResult = repository.loadSubjects()) {
                    is Result.Success -> {
                        android.util.Log.d("CreateHomework", "Subjects loaded successfully: ${subjectResult.data.items.size} items")
                        setupSubjectSpinner(subjectSpinner, subjectResult.data.items)
                    }
                    is Result.Error -> {
                        android.util.Log.e("CreateHomework", "Failed to load subjects: ${subjectResult.message}")
                        Toast.makeText(requireContext(), "Failed to load subjects: ${subjectResult.message}", Toast.LENGTH_SHORT).show()
                        setupSubjectSpinner(subjectSpinner, emptyList())
                    }
                    Result.Loading -> {
                        android.util.Log.d("CreateHomework", "Loading subjects...")
                    }
                }
                
            } catch (t: Throwable) {
                android.util.Log.e("CreateHomework", "Exception loading data: ${t.message}", t)
                Toast.makeText(requireContext(), "Failed to load data: ${t.message}", Toast.LENGTH_SHORT).show()
                setupClassSpinner(classSpinner, emptyList())
                setupSubjectSpinner(subjectSpinner, emptyList())
            }
        }
    }

    private fun setupClassSpinner(spinner: Spinner, classes: List<com.nexusapps.atlas.network.dto.ClassDto> = emptyList()) {
        val classNames = mutableListOf("Select Class")
        val classIds = mutableListOf("")
        
        if (classes.isNotEmpty()) {
            android.util.Log.d("CreateHomework", "Using real class data: ${classes.size} classes")
            classes.forEach { classDto ->
                classNames.add("${classDto.name} - ${classDto.section}")
                classIds.add(classDto.id)
                android.util.Log.d("CreateHomework", "Class: ${classDto.name} - ${classDto.section} (ID: ${classDto.id})")
            }
        } else {
            android.util.Log.w("CreateHomework", "Using fallback class data - API failed")
            // Fallback to hardcoded data if API fails
            classNames.addAll(listOf("1st - A", "1st - B", "2nd - A", "2nd - B", "3rd - A"))
            classIds.addAll(listOf("class-1a", "class-1b", "class-2a", "class-2b", "class-3a"))
        }
        
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, classNames)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinner.adapter = adapter
        
        spinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedClassId = if (position > 0) classIds[position] else null
            }
            
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {
                selectedClassId = null
            }
        }
    }
    
    private fun setupSubjectSpinner(spinner: Spinner, subjects: List<com.nexusapps.atlas.network.dto.SubjectDto> = emptyList()) {
        val subjectNames = mutableListOf("Select Subject")
        val subjectIds = mutableListOf("")
        
        if (subjects.isNotEmpty()) {
            android.util.Log.d("CreateHomework", "Using real subject data: ${subjects.size} subjects")
            subjects.forEach { subjectDto ->
                subjectNames.add(subjectDto.name)
                subjectIds.add(subjectDto.id)
                android.util.Log.d("CreateHomework", "Subject: ${subjectDto.name} (ID: ${subjectDto.id})")
            }
        } else {
            android.util.Log.w("CreateHomework", "Using fallback subject data - API failed")
            // Fallback to hardcoded data if API fails
            subjectNames.addAll(listOf("Mathematics", "Science", "English", "Social Studies", "Physical Education"))
            subjectIds.addAll(listOf("subject-math", "subject-science", "subject-english", "subject-social", "subject-pe"))
        }
        
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, subjectNames)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinner.adapter = adapter
        
        spinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedSubjectId = if (position > 0) subjectIds[position] else null
            }
            
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {
                selectedSubjectId = null
            }
        }
    }

    private fun createHomework(
        title: String,
        description: String,
        dueDate: String,
        maxMarks: String,
        isPublished: Boolean,
        progress: ProgressBar
    ) {
        progress.visibility = View.VISIBLE
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                val request = CreateHomeworkRequest(
                    title = title,
                    description = description,
                    dueDate = dueDate,
                    classId = selectedClassId!!,
                    subjectId = selectedSubjectId!!,
                    maxMarks = if (maxMarks.isNotEmpty()) maxMarks.toIntOrNull() else null,
                    isPublished = isPublished
                )
                
                when (val result = repository.createHomework(request)) {
                    is Result.Success -> {
                        Toast.makeText(requireContext(), "Homework created successfully!", Toast.LENGTH_SHORT).show()
                        findNavController().navigateUp()
                    }
                    is Result.Error -> {
                        Toast.makeText(requireContext(), "Failed to create homework: ${result.message}", Toast.LENGTH_SHORT).show()
                    }
                    Result.Loading -> {
                        // Keep loading state
                    }
                }
                
            } catch (t: Throwable) {
                Toast.makeText(requireContext(), "Failed to create homework: ${t.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progress.visibility = View.GONE
            }
        }
    }
}
