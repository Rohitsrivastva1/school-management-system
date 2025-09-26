package com.nexusapps.atlas.data

import android.content.Context
import com.nexusapps.atlas.di.ServiceLocator
import com.nexusapps.atlas.di.TokenStore
import com.nexusapps.atlas.network.dto.LoginRequest

class AuthRepository(private val context: Context) {
    private val api = ServiceLocator.provideApiService(context)
    private val session = ServiceLocator.provideSessionManager(context)

    suspend fun login(email: String, password: String): Result<String> {
        return try {
            val resp = api.login(LoginRequest(email, password))
            if (resp.success && resp.data != null) {
                session.setTokens(resp.data.tokens.accessToken, resp.data.tokens.refreshToken)
                session.setUserRole(resp.data.user.role)
                TokenStore.accessToken = resp.data.tokens.accessToken
                Result.Success(resp.data.user.role)
            } else {
                Result.Error(resp.message ?: "Login failed")
            }
        } catch (t: Throwable) {
            Result.Error(t.message ?: "Network error", t)
        }
    }
}


