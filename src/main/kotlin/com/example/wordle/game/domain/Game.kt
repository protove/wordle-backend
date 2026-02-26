package com.example.wordle.game.domain

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "games",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "game_date"])]
)
class Game(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "target_word", nullable = false, length = 10)
    val targetWord: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: GameStatus = GameStatus.IN_PROGRESS,

    @Column(name = "attempts_used", nullable = false)
    var attemptsUsed: Int = 0,

    @Column(name = "game_date", nullable = false)
    val gameDate: LocalDate = LocalDate.now(),

    @Column(name = "started_at")
    val startedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "ended_at")
    var endedAt: LocalDateTime? = null,

    @OneToMany(mappedBy = "game", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    val guesses: MutableList<GameGuess> = mutableListOf()
)
