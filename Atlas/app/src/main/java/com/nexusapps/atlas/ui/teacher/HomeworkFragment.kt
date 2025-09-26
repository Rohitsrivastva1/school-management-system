package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import com.nexusapps.atlas.di.ServiceLocator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class HomeworkFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_teacher_homework, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val progress: ProgressBar = view.findViewById(R.id.progress)
        val content: TextView = view.findViewById(R.id.content)
        val createHomeworkButton: Button = view.findViewById(R.id.create_homework_button)
        val api = ServiceLocator.provideApiService(requireContext())

        createHomeworkButton.setOnClickListener {
            findNavController().navigate(R.id.createHomeworkFragment)
        }

        // Load homework data
        loadHomework(api, progress, content)
    }

    private fun loadHomework(api: com.nexusapps.atlas.network.ApiService, progress: ProgressBar, content: TextView) {
        progress.visibility = View.VISIBLE
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                val resp = api.getHomework(
                    classId = null,
                    teacherId = null,
                    page = 1,
                    limit = 10
                )
                if (resp.success && resp.data != null) {
                    content.text = "Homework assignments: ${resp.data.items.size}"
                } else {
                    content.text = resp.message ?: "Failed to load homework"
                }
            } catch (t: Throwable) {
                content.text = t.message ?: "Network error"
            } finally {
                progress.visibility = View.GONE
            }
        }
    }
}
