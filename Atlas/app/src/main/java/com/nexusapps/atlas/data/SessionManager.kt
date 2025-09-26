package com.nexusapps.atlas.data

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "session_prefs")

class SessionManager(private val context: Context) {
    companion object Keys {
        val KEY_ACCESS_TOKEN: Preferences.Key<String> = stringPreferencesKey("access_token")
        val KEY_REFRESH_TOKEN: Preferences.Key<String> = stringPreferencesKey("refresh_token")
        val KEY_USER_ROLE: Preferences.Key<String> = stringPreferencesKey("user_role")
        val KEY_STUDENT_ID: Preferences.Key<String> = stringPreferencesKey("student_id")
    }

    val accessTokenFlow: Flow<String?> = context.dataStore.data.map { it[KEY_ACCESS_TOKEN] }
    val refreshTokenFlow: Flow<String?> = context.dataStore.data.map { it[KEY_REFRESH_TOKEN] }
    val userRoleFlow: Flow<String?> = context.dataStore.data.map { it[KEY_USER_ROLE] }
    val studentIdFlow: Flow<String?> = context.dataStore.data.map { it[KEY_STUDENT_ID] }

    suspend fun setTokens(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            prefs[KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun setUserRole(role: String) {
        context.dataStore.edit { it[KEY_USER_ROLE] = role }
    }

    suspend fun setStudentId(studentId: String) {
        context.dataStore.edit { it[KEY_STUDENT_ID] = studentId }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun getAccessTokenOnce(): String? = accessTokenFlow.firstOrNull()
}

