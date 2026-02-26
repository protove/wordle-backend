package com.example.wordle.game.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "game_guesses")
class GameGuess(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    val game: Game,

    @Column(name = "guess_word", nullable = false, length = 10)
    val guessWord: String,

    @Column(nullable = false, length = 50)
    val result: String, // CSV: "CORRECT,PRESENT,ABSENT,ABSENT,CORRECT"

    @Column(name = "guess_number", nullable = false)
    val guessNumber: Int,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
