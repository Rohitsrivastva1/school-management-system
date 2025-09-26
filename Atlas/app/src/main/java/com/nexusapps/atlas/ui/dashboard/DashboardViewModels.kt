package com.nexusapps.atlas.ui.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nexusapps.atlas.data.DashboardRepository
import com.nexusapps.atlas.data.Result
import com.nexusapps.atlas.network.dto.AdminDashboardDto
import com.nexusapps.atlas.network.dto.ParentDashboardDto
import com.nexusapps.atlas.network.dto.TeacherDashboardDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class UiState<T>(
    val isLoading: Boolean = false,
    val error: String? = null,
    val data: T? = null
)

class TeacherDashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = DashboardRepository(application)
    private val _uiState = MutableStateFlow(UiState<TeacherDashboardDto>())
    val uiState: StateFlow<UiState<TeacherDashboardDto>> = _uiState

    fun load() {
        _uiState.value = UiState(isLoading = true)
        viewModelScope.launch {
            when (val res = repo.loadTeacherDashboard()) {
                is Result.Success -> _uiState.value = UiState(data = res.data)
                is Result.Error -> _uiState.value = UiState(error = res.message)
                Result.Loading -> _uiState.value = UiState(isLoading = true)
            }
        }
    }
}

class ParentDashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = DashboardRepository(application)
    private val _uiState = MutableStateFlow(UiState<ParentDashboardDto>())
    val uiState: StateFlow<UiState<ParentDashboardDto>> = _uiState

    fun load(studentId: String) {
        _uiState.value = UiState(isLoading = true)
        viewModelScope.launch {
            when (val res = repo.loadParentDashboard(studentId)) {
                is Result.Success -> _uiState.value = UiState(data = res.data)
                is Result.Error -> _uiState.value = UiState(error = res.message)
                Result.Loading -> _uiState.value = UiState(isLoading = true)
            }
        }
    }
}

class AdminDashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = DashboardRepository(application)
    private val _uiState = MutableStateFlow(UiState<AdminDashboardDto>())
    val uiState: StateFlow<UiState<AdminDashboardDto>> = _uiState

    fun load() {
        _uiState.value = UiState(isLoading = true)
        viewModelScope.launch {
            when (val res = repo.loadAdminDashboard()) {
                is Result.Success -> _uiState.value = UiState(data = res.data)
                is Result.Error -> _uiState.value = UiState(error = res.message)
                Result.Loading -> _uiState.value = UiState(isLoading = true)
            }
        }
    }
}


