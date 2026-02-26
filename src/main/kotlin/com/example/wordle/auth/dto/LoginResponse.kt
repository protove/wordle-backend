package com.example.wordle.auth.dto

import java.util.UUID

data class LoginResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
    val userId: UUID,
    val username: String,
    val role: String,
    val expiresIn: Long = 86400
)
