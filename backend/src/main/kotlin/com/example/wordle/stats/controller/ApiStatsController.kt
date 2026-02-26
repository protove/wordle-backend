package com.example.wordle.stats.controller

import com.example.wordle.stats.dto.GameResultRequest
import com.example.wordle.stats.dto.PlayerStatsResponse
import com.example.wordle.stats.service.StatsService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/stats")
class ApiStatsController(private val statsService: StatsService) {

    @GetMapping
    fun getMyStats(@AuthenticationPrincipal jwt: Jwt): PlayerStatsResponse {
        val userId = UUID.fromString(jwt.subject)
        return PlayerStatsResponse.from(statsService.getStats(userId))
    }

    @PostMapping
    fun recordGameResult(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody body: GameResultRequest
    ) {
        val userId = UUID.fromString(jwt.subject)
        statsService.recordGame(
            userId   = userId,
            guessCnt = body.guessCnt!!,
            win      = body.win!!
        )
    }
}
