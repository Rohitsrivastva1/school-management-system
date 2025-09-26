package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.nexusapps.atlas.R
import com.nexusapps.atlas.di.ServiceLocator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class TimetableFragment : Fragment() {
    private var job: Job? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_teacher_timetable, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val progress: ProgressBar = view.findViewById(R.id.progress)
        val content: TextView = view.findViewById(R.id.content)
        val api = ServiceLocator.provideApiService(requireContext())

        // Load timetable data
        loadTimetable(api, progress, content)
    }

    private fun loadTimetable(api: com.nexusapps.atlas.network.ApiService, progress: ProgressBar, content: TextView) {
        progress.visibility = View.VISIBLE
        job?.cancel()
        job = CoroutineScope(Dispatchers.Main).launch {
            try {
                val resp = api.getTimetable(
                    classId = null,
                    teacherId = null,
                    day = null,
                    page = 1,
                    limit = 20
                )
                if (resp.success && resp.data != null) {
                    content.text = "Timetable entries: ${resp.data.items.size}"
                } else {
                    content.text = resp.message ?: "Failed to load timetable"
                }
            } catch (t: Throwable) {
                content.text = t.message ?: "Network error"
            } finally {
                progress.visibility = View.GONE
            }
        }
    }
}
