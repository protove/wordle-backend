package com.example.wordle.auth.service

import com.example.wordle.auth.domain.User
import com.example.wordle.auth.dto.LoginRequest
import com.example.wordle.auth.dto.LoginResponse
import com.example.wordle.auth.dto.SignupRequest
import com.example.wordle.auth.dto.SignupResponse
import com.example.wordle.auth.repository.UserRepository
import com.example.wordle.common.exception.DuplicateResourceException
import com.example.wordle.security.JwtTokenProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Transactional
    fun signup(request: SignupRequest): SignupResponse {
        // 중복 검사
        if (userRepository.findByUsername(request.username) != null) {
            throw DuplicateResourceException("이미 존재하는 사용자명입니다")
        }

        if (userRepository.findByEmail(request.email) != null) {
            throw DuplicateResourceException("이미 존재하는 이메일입니다")
        }

        // 사용자 생성
        val user = User(
            username = request.username,
            password = passwordEncoder.encode(request.password),
            email = request.email
        )

        val savedUser = userRepository.save(user)
        val token = jwtTokenProvider.generateToken(savedUser)
        return SignupResponse(
            id = savedUser.id,
            username = savedUser.username,
            email = savedUser.email,
            accessToken = token
        )
    }

    fun login(request: LoginRequest): LoginResponse {
        val user = userRepository.findByUsername(request.username)
            ?: throw BadCredentialsException("잘못된 사용자명 또는 비밀번호입니다")

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw BadCredentialsException("잘못된 사용자명 또는 비밀번호입니다")
        }

        if (!user.isEnabled) {
            throw BadCredentialsException("비활성화된 계정입니다")
        }

        val token = jwtTokenProvider.generateToken(user)
        return LoginResponse(
            accessToken = token,
            userId = user.id,
            username = user.username,
            role = user.role.name
        )
    }
}
