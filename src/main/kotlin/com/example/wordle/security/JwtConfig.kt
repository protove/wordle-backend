package com.example.wordle.security

import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.jwk.OctetSequenceKey
import com.nimbusds.jose.jwk.source.ImmutableJWKSet
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder
import javax.crypto.spec.SecretKeySpec

@Configuration
class JwtConfig(
    @Value("\${app.jwt.secret}") private val jwtSecret: String
) {
    @Bean
    @Qualifier("hmacJwtEncoder")
    fun hmacJwtEncoder(): JwtEncoder {
        val key = OctetSequenceKey.Builder(jwtSecret.toByteArray(Charsets.UTF_8))
            .algorithm(JWSAlgorithm.HS256)
            .build()
        return NimbusJwtEncoder(ImmutableJWKSet(com.nimbusds.jose.jwk.JWKSet(key)))
    }

    @Bean
    @Qualifier("hmacJwtDecoder")
    fun hmacJwtDecoder(): JwtDecoder {
        val secretKey = SecretKeySpec(jwtSecret.toByteArray(Charsets.UTF_8), "HmacSHA256")
        return NimbusJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}
