package com.nexusapps.atlas.ui.navigation

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nexusapps.atlas.data.DashboardRepository
import com.nexusapps.atlas.data.Result
import com.nexusapps.atlas.network.dto.UserDetailsDto
import com.nexusapps.atlas.network.dto.SchoolInfoDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class NavigationUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val userDetails: UserDetailsDto? = null,
    val schoolInfo: SchoolInfoDto? = null
)

class NavigationViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DashboardRepository(application)
    private val _uiState = MutableStateFlow(NavigationUiState())
    val uiState: StateFlow<NavigationUiState> = _uiState

    fun loadNavigationData() {
        _uiState.value = _uiState.value.copy(isLoading = true)
        
        viewModelScope.launch {
            try {
                // Load user details and school info in parallel
                val userResult = repository.loadUserDetails()
                val schoolResult = repository.loadSchoolInfo()
                
                when {
                    userResult is Result.Success && schoolResult is Result.Success -> {
                        _uiState.value = NavigationUiState(
                            isLoading = false,
                            userDetails = userResult.data,
                            schoolInfo = schoolResult.data
                        )
                    }
                    userResult is Result.Error -> {
                        _uiState.value = NavigationUiState(
                            isLoading = false,
                            error = userResult.message,
                            schoolInfo = if (schoolResult is Result.Success) schoolResult.data else null
                        )
                    }
                    schoolResult is Result.Error -> {
                        _uiState.value = NavigationUiState(
                            isLoading = false,
                            error = schoolResult.message,
                            userDetails = if (userResult is Result.Success) userResult.data else null
                        )
                    }
                    else -> {
                        _uiState.value = NavigationUiState(
                            isLoading = false,
                            error = "Failed to load navigation data"
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.value = NavigationUiState(
                    isLoading = false,
                    error = e.message ?: "Unknown error occurred"
                )
            }
        }
    }

    fun getUserDisplayName(): String {
        val userDetails = _uiState.value.userDetails
        return when {
            !userDetails?.firstName.isNullOrBlank() && !userDetails?.lastName.isNullOrBlank() -> 
                "${userDetails!!.firstName!!} ${userDetails.lastName!!}"
            !userDetails?.firstName.isNullOrBlank() -> userDetails!!.firstName!!
            else -> "User"
        }
    }

    fun getUserRole(): String {
        val userDetails = _uiState.value.userDetails
        return when (userDetails?.role?.lowercase()) {
            "admin" -> "Administrator"
            "class_teacher" -> "Class Teacher"
            "subject_teacher" -> "Subject Teacher"
            "teacher" -> "Teacher"
            "parent" -> "Parent"
            else -> "User"
        }
    }

    fun getSchoolName(): String {
        return _uiState.value.schoolInfo?.name ?: "School Management System"
    }

    fun getSchoolDescription(): String {
        val schoolInfo = _uiState.value.schoolInfo
        return when {
            !schoolInfo?.city.isNullOrBlank() && !schoolInfo?.state.isNullOrBlank() -> 
                "${schoolInfo!!.city!!}, ${schoolInfo.state!!}"
            !schoolInfo?.city.isNullOrBlank() -> schoolInfo!!.city!!
            !schoolInfo?.state.isNullOrBlank() -> schoolInfo!!.state!!
            else -> "School Management System"
        }
    }
}
