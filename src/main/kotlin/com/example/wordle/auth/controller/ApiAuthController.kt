package com.example.wordle.auth.controller

import com.example.wordle.auth.dto.LoginRequest
import com.example.wordle.auth.dto.LoginResponse
import com.example.wordle.auth.dto.SignupRequest
import com.example.wordle.auth.dto.SignupResponse
import com.example.wordle.auth.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class ApiAuthController(
    private val authService: AuthService
) {
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    fun signup(@Valid @RequestBody request: SignupRequest): SignupResponse =
        authService.signup(request)

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): LoginResponse =
        authService.login(request)
}
