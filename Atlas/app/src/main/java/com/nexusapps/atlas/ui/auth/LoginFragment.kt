package com.nexusapps.atlas.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.fragment.app.viewModels
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.nexusapps.atlas.R
import com.nexusapps.atlas.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class LoginFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_login, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val emailInput: EditText = view.findViewById(R.id.input_email)
        val passwordInput: EditText = view.findViewById(R.id.input_password)
        val buttonLogin: Button = view.findViewById(R.id.button_login)
        val progress: ProgressBar = view.findViewById(R.id.progress_login)
        val viewModel: LoginViewModel by viewModels()

        buttonLogin.setOnClickListener {
            val email = emailInput.text?.toString()?.trim().orEmpty()
            val password = passwordInput.text?.toString()?.trim().orEmpty()
            if (email.isEmpty() || password.length < 8) {
                Toast.makeText(requireContext(), "Enter valid credentials", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            progress.visibility = View.VISIBLE
            buttonLogin.isEnabled = false
            viewLifecycleOwner.lifecycleScope.launch {
                viewModel.login(email, password)
            }
        }

        var navigated = false
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    progress.visibility = if (state.isLoading) View.VISIBLE else View.GONE
                    buttonLogin.isEnabled = !state.isLoading
                    if (state.error != null) {
                        Toast.makeText(requireContext(), state.error, Toast.LENGTH_SHORT).show()
                    }
                    if (state.success && !navigated) {
                        navigated = true
                        progress.visibility = View.GONE
                        buttonLogin.isEnabled = true
                        
                        // Load navigation data after successful login
                        (requireActivity() as? MainActivity)?.loadNavigationDataAfterLogin()
                        
                        when (state.role) {
                            "admin" -> if (findNavController().currentDestination?.id == R.id.loginFragment) findNavController().navigate(R.id.adminDashboardFragment)
                            "class_teacher", "subject_teacher", "teacher" -> if (findNavController().currentDestination?.id == R.id.loginFragment) findNavController().navigate(R.id.teacherDashboardFragment)
                            "parent" -> if (findNavController().currentDestination?.id == R.id.loginFragment) findNavController().navigate(R.id.parentDashboardFragment)
                            else -> if (findNavController().currentDestination?.id == R.id.loginFragment) findNavController().navigate(R.id.teacherDashboardFragment)
                        }
                    }
                }
            }
        }
    }
}


