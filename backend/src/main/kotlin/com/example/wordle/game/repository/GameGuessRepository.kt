package com.example.wordle.game.repository

import com.example.wordle.game.domain.GameGuess
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface GameGuessRepository : JpaRepository<GameGuess, UUID> {
    fun findAllByGameIdOrderByGuessNumber(gameId: UUID): List<GameGuess>
}
