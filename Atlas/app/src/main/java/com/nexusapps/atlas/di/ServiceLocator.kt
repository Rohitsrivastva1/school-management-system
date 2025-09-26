package com.nexusapps.atlas.di

import android.content.Context
import com.nexusapps.atlas.data.SessionManager
import com.nexusapps.atlas.network.ApiClient
import com.nexusapps.atlas.network.ApiService
import retrofit2.create

object ServiceLocator {
    @Volatile private var sessionManager: SessionManager? = null
    @Volatile private var apiService: ApiService? = null

    fun provideSessionManager(context: Context): SessionManager {
        val existing = sessionManager
        if (existing != null) return existing
        val created = SessionManager(context.applicationContext)
        sessionManager = created
        return created
    }

    fun provideApiService(context: Context): ApiService {
        val existing = apiService
        if (existing != null) return existing
        val retrofit = ApiClient.provideRetrofit(tokenProvider = { TokenStore.accessToken })
        val created: ApiService = retrofit.create()
        apiService = created
        return created
    }
}


