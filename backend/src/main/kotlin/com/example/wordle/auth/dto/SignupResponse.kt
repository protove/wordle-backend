package com.example.wordle.auth.dto

import java.util.UUID

data class SignupResponse(
    val id: UUID,
    val username: String,
    val email: String,
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long = 86400,
    val message: String = "회원가입이 완료되었습니다"
)
