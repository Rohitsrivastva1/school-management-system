package com.nexusapps.atlas.ui.teacher

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R

class AttendanceFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_teacher_attendance, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val markAttendanceButton: Button = view.findViewById(R.id.mark_attendance_button)
        val menuButton: ImageButton = view.findViewById(R.id.menu_button)
        
        // Setup menu button to open drawer
        menuButton.setOnClickListener {
            val activity = requireActivity() as com.nexusapps.atlas.MainActivity
            val drawerLayout = activity.findViewById<DrawerLayout>(R.id.drawer_layout)
            drawerLayout.openDrawer(androidx.core.view.GravityCompat.START)
        }
        
        markAttendanceButton.setOnClickListener {
            findNavController().navigate(R.id.markAttendanceFragment)
        }
    }
}


