package com.example.wordle.security

import com.example.wordle.auth.domain.User
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class JwtTokenProvider(
    @Value("\${app.jwt.expiration-ms:86400000}") private val expirationMs: Long,
    @Qualifier("hmacJwtEncoder") private val jwtEncoder: JwtEncoder,
    @Qualifier("hmacJwtDecoder") private val jwtDecoder: JwtDecoder
) {
    fun generateToken(user: User): String {
        val now = Instant.now()
        val claims = JwtClaimsSet.builder()
            .issuer("cosmic-wordle")
            .issuedAt(now)
            .expiresAt(now.plusMillis(expirationMs))
            .subject(user.id.toString())
            .claim("username", user.username)
            .claim("authorities", listOf(user.role.name))
            .build()
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).tokenValue
    }

    fun getUserId(token: String): UUID {
        val jwt = jwtDecoder.decode(token)
        return UUID.fromString(jwt.subject)
    }

    fun getUsername(token: String): String {
        val jwt = jwtDecoder.decode(token)
        return jwt.getClaim("username")
    }
}
