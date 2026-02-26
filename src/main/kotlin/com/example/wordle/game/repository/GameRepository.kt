package com.example.wordle.game.repository

import com.example.wordle.game.domain.Game
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.util.UUID

interface GameRepository : JpaRepository<Game, UUID> {
    fun findByUserIdAndGameDate(userId: UUID, gameDate: LocalDate): Game?
    fun findAllByUserIdOrderByStartedAtDesc(userId: UUID): List<Game>

    @Query("SELECT g FROM Game g WHERE g.userId = :userId ORDER BY g.startedAt DESC")
    fun findRecentByUserId(userId: UUID): List<Game>
}
