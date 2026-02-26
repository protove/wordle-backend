package com.example.wordle.game.service

import com.example.wordle.common.exception.BadRequestException
import com.example.wordle.common.exception.ForbiddenException
import com.example.wordle.common.exception.NotFoundException
import com.example.wordle.game.domain.Game
import com.example.wordle.game.domain.GameGuess
import com.example.wordle.game.domain.GameStatus
import com.example.wordle.game.domain.LetterResult
import com.example.wordle.game.dto.GameResponse
import com.example.wordle.game.dto.GameSummaryResponse
import com.example.wordle.game.dto.GuessResponse
import com.example.wordle.game.repository.GameGuessRepository
import com.example.wordle.game.repository.GameRepository
import com.example.wordle.stats.service.StatsService
import com.example.wordle.word.service.WordService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class GameService(
    private val gameRepository: GameRepository,
    private val gameGuessRepository: GameGuessRepository,
    private val wordService: WordService,
    private val statsService: StatsService
) {
    companion object {
        const val MAX_ATTEMPTS = 6
    }

    @Transactional
    fun startOrGetTodaysGame(userId: UUID): GameResponse {
        val today = LocalDate.now()
        // Return existing game for today if exists
        gameRepository.findByUserIdAndGameDate(userId, today)?.let { game ->
            return GameResponse.from(game, game.status != GameStatus.IN_PROGRESS)
        }
        // Create new game with today's word
        val targetWord = wordService.getTodaysWord()
        val game = gameRepository.save(
            Game(userId = userId, targetWord = targetWord, gameDate = today)
        )
        return GameResponse.from(game)
    }

    @Transactional
    fun submitGuess(userId: UUID, gameId: UUID, guessWord: String): GuessResponse {
        val game = gameRepository.findById(gameId)
            .orElseThrow { NotFoundException("Game not found: $gameId") }

        if (game.userId != userId) throw ForbiddenException("Access denied")
        if (game.status != GameStatus.IN_PROGRESS) throw BadRequestException("Game already finished")
        if (game.attemptsUsed >= MAX_ATTEMPTS) throw BadRequestException("No attempts remaining")

        val upper = guessWord.uppercase().trim()
        if (upper.length != 5) throw BadRequestException("Guess must be exactly 5 letters")
        if (!upper.all { it.isLetter() }) throw BadRequestException("Only letters allowed")
        if (!wordService.isValidWord(upper)) throw BadRequestException("Not in word list")

        val letterResults = WordEvaluator.evaluate(upper, game.targetWord)
        val resultCsv = letterResults.joinToString(",") { it.name }

        game.attemptsUsed++
        val guess = GameGuess(
            game = game,
            guessWord = upper,
            result = resultCsv,
            guessNumber = game.attemptsUsed
        )
        gameGuessRepository.save(guess)
        game.guesses.add(guess)

        val isWon = letterResults.all { it == LetterResult.CORRECT }
        val isLost = !isWon && game.attemptsUsed >= MAX_ATTEMPTS

        if (isWon || isLost) {
            game.status = if (isWon) GameStatus.WON else GameStatus.LOST
            game.endedAt = LocalDateTime.now()
            statsService.recordGame(userId, game.attemptsUsed, isWon)
        }

        gameRepository.save(game)

        return GuessResponse(
            guessNumber = game.attemptsUsed,
            guessWord = upper,
            result = letterResults,
            gameStatus = game.status,
            attemptsRemaining = MAX_ATTEMPTS - game.attemptsUsed,
            targetWord = if (isLost) game.targetWord else null
        )
    }

    @Transactional(readOnly = true)
    fun getGame(userId: UUID, gameId: UUID): GameResponse {
        val game = gameRepository.findById(gameId)
            .orElseThrow { NotFoundException("Game not found: $gameId") }
        if (game.userId != userId) throw ForbiddenException("Access denied")
        return GameResponse.from(game, game.status != GameStatus.IN_PROGRESS)
    }

    @Transactional(readOnly = true)
    fun getGameHistory(userId: UUID): List<GameSummaryResponse> =
        gameRepository.findAllByUserIdOrderByStartedAtDesc(userId).map { game ->
            GameSummaryResponse(
                id = game.id,
                gameDate = game.gameDate,
                status = game.status,
                attemptsUsed = game.attemptsUsed,
                targetWord = game.targetWord
            )
        }
}
