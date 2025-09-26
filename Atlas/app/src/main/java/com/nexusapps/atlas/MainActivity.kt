package com.nexusapps.atlas

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.navigation.NavigationView
import android.view.MenuItem
import android.widget.Toast
import android.widget.TextView
import androidx.lifecycle.ViewModelProvider
import com.nexusapps.atlas.ui.navigation.NavigationViewModel
import com.nexusapps.atlas.ui.navigation.MenuManager
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

class MainActivity : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController
    private lateinit var navigationViewModel: NavigationViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        
        drawerLayout = findViewById(R.id.drawer_layout)
        val navView: NavigationView = findViewById(R.id.nav_view)
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Setup navigation with drawer (no ActionBar)
        navView.setupWithNavController(navController)
        
        // Initialize NavigationViewModel
        navigationViewModel = ViewModelProvider(this)[NavigationViewModel::class.java]
        
        // Setup modern navigation styling
        setupModernNavigation(navView)
        
        // Navigation data will be loaded after login
        
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }
    
    private fun setupModernNavigation(navView: NavigationView) {
        navView.setNavigationItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.logout -> {
                    // Handle logout
                    Toast.makeText(this, "Logout - Coming Soon", Toast.LENGTH_SHORT).show()
                    drawerLayout.closeDrawers()
                    true
                }
                else -> {
                    // Let the default navigation handle other items
                    false
                }
            }
        }
    }
    
    private fun loadNavigationData(navView: NavigationView) {
        // Load navigation data from API
        navigationViewModel.loadNavigationData()
        
        // Observe navigation data changes
        CoroutineScope(Dispatchers.Main).launch {
            navigationViewModel.uiState.collect { state ->
                updateNavigationHeader(navView, state)
                updateNavigationMenu(navView, state)
            }
        }
    }
    
    private fun updateNavigationHeader(navView: NavigationView, state: com.nexusapps.atlas.ui.navigation.NavigationUiState) {
        val headerView = navView.getHeaderView(0)
        
        // Update user information
        val userName: TextView = headerView.findViewById(R.id.user_name)
        val userRole: TextView = headerView.findViewById(R.id.user_role)
        val schoolName: TextView = headerView.findViewById(R.id.school_name)
        val schoolDescription: TextView = headerView.findViewById(R.id.school_description)
        
        when {
            state.isLoading -> {
                userName.text = "Loading..."
                userRole.text = "Loading..."
                schoolName.text = "Loading..."
                schoolDescription.text = "Loading..."
            }
            state.error != null -> {
                userName.text = "Error"
                userRole.text = "Failed to load"
                schoolName.text = "School Management System"
                schoolDescription.text = "Please check your connection"
            }
            else -> {
                userName.text = navigationViewModel.getUserDisplayName()
                userRole.text = navigationViewModel.getUserRole()
                schoolName.text = navigationViewModel.getSchoolName()
                schoolDescription.text = navigationViewModel.getSchoolDescription()
            }
        }
    }
    
    private fun updateNavigationMenu(navView: NavigationView, state: com.nexusapps.atlas.ui.navigation.NavigationUiState) {
        if (state.userDetails != null) {
            // Update menu based on user role
            MenuManager.setupMenuForRole(navView.menu, state.userDetails)
        }
    }
    
    fun loadNavigationDataAfterLogin() {
        val navView: NavigationView = findViewById(R.id.nav_view)
        loadNavigationData(navView)
    }
}