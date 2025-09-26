package com.nexusapps.atlas.ui.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nexusapps.atlas.data.AuthRepository
import com.nexusapps.atlas.data.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
    val role: String? = null
)

class LoginViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = AuthRepository(application)
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(email: String, password: String) {
        _uiState.value = LoginUiState(isLoading = true)
        viewModelScope.launch {
            when (val res = repo.login(email, password)) {
                is Result.Success -> _uiState.value = LoginUiState(success = true, role = res.data)
                is Result.Error -> _uiState.value = LoginUiState(error = res.message)
                Result.Loading -> _uiState.value = LoginUiState(isLoading = true)
            }
        }
    }
}


