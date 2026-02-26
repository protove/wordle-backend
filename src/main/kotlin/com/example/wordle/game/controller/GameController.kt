package com.example.wordle.game.controller

import com.example.wordle.game.dto.GameResponse
import com.example.wordle.game.dto.GameSummaryResponse
import com.example.wordle.game.dto.GuessRequest
import com.example.wordle.game.dto.GuessResponse
import com.example.wordle.game.service.GameService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/games")
class GameController(private val gameService: GameService) {

    private fun userId(jwt: Jwt): UUID = UUID.fromString(jwt.subject)

    /** GET /api/games/today - start or get today's game */
    @GetMapping("/today")
    fun getTodaysGame(@AuthenticationPrincipal jwt: Jwt): GameResponse =
        gameService.startOrGetTodaysGame(userId(jwt))

    /** GET /api/games/{id} - get specific game */
    @GetMapping("/{id}")
    fun getGame(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID
    ): GameResponse = gameService.getGame(userId(jwt), id)

    /** GET /api/games - game history */
    @GetMapping
    fun getHistory(@AuthenticationPrincipal jwt: Jwt): List<GameSummaryResponse> =
        gameService.getGameHistory(userId(jwt))

    /** POST /api/games/{id}/guesses - submit guess */
    @PostMapping("/{id}/guesses")
    @ResponseStatus(HttpStatus.CREATED)
    fun submitGuess(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID,
        @RequestBody request: GuessRequest
    ): GuessResponse = gameService.submitGuess(userId(jwt), id, request.word)
}
