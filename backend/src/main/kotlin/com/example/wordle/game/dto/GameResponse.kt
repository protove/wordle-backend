package com.example.wordle.game.dto

import com.example.wordle.game.domain.Game
import com.example.wordle.game.domain.GameStatus
import com.example.wordle.game.domain.LetterResult
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class GuessDetail(
    val guessNumber: Int,
    val guessWord: String,
    val result: List<LetterResult>
)

data class GameResponse(
    val id: UUID,
    val userId: UUID,
    val gameDate: LocalDate,
    val status: GameStatus,
    val attemptsUsed: Int,
    val maxAttempts: Int = 6,
    val guesses: List<GuessDetail>,
    val targetWord: String?, // revealed only when game ends
    val startedAt: LocalDateTime,
    val endedAt: LocalDateTime?
) {
    companion object {
        fun from(game: Game, revealWord: Boolean = false): GameResponse {
            val guessDetails = game.guesses
                .sortedBy { it.guessNumber }
                .map { guess ->
                    GuessDetail(
                        guessNumber = guess.guessNumber,
                        guessWord = guess.guessWord,
                        result = guess.result.split(",").map { LetterResult.valueOf(it) }
                    )
                }
            return GameResponse(
                id = game.id,
                userId = game.userId,
                gameDate = game.gameDate,
                status = game.status,
                attemptsUsed = game.attemptsUsed,
                guesses = guessDetails,
                targetWord = if (revealWord || game.status != GameStatus.IN_PROGRESS) game.targetWord else null,
                startedAt = game.startedAt,
                endedAt = game.endedAt
            )
        }
    }
}

data class GuessRequest(
    val word: String
)

data class GuessResponse(
    val guessNumber: Int,
    val guessWord: String,
    val result: List<LetterResult>,
    val gameStatus: GameStatus,
    val attemptsRemaining: Int,
    val targetWord: String? // revealed on game end (lost)
)

data class GameSummaryResponse(
    val id: UUID,
    val gameDate: LocalDate,
    val status: GameStatus,
    val attemptsUsed: Int,
    val targetWord: String
)
