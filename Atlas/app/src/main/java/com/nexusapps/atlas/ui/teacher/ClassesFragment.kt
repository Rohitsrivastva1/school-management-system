package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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

class ClassesFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_classes, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val backButton: ImageButton = view.findViewById(R.id.back_button)
        val classesList: LinearLayout = view.findViewById(R.id.classes_list)
        val noClasses: TextView = view.findViewById(R.id.no_classes)
        val progress: ProgressBar = view.findViewById(R.id.progress)

        backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        // Load classes data
        loadClasses(classesList, noClasses, progress)
    }

    private fun loadClasses(container: LinearLayout, noDataView: TextView, progress: ProgressBar) {
        progress.visibility = View.VISIBLE
        
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                // Simulate API call
                kotlinx.coroutines.delay(1000)
                
                // Mock data - in real app, this would come from API
                val classes = listOf(
                    ClassData("Class 10-A", "Mathematics", "32", "Room 101"),
                    ClassData("Class 10-B", "Science", "28", "Room 102"),
                    ClassData("Class 9-A", "English", "30", "Room 103")
                )
                
                container.removeAllViews()
                
                if (classes.isEmpty()) {
                    noDataView.visibility = View.VISIBLE
                } else {
                    noDataView.visibility = View.GONE
                    classes.forEach { classData ->
                        val classView = createClassItemView(classData)
                        container.addView(classView)
                    }
                }
                
            } catch (e: Exception) {
                noDataView.visibility = View.VISIBLE
                noDataView.text = "Error loading classes"
            } finally {
                progress.visibility = View.GONE
            }
        }
    }

    private fun createClassItemView(classData: ClassData): View {
        val view = LayoutInflater.from(requireContext()).inflate(R.layout.item_class, null)
        
        // This would be implemented with proper data binding
        // For now, return a simple view
        return view
    }

    data class ClassData(
        val name: String,
        val subject: String,
        val studentCount: String,
        val room: String
    )
}