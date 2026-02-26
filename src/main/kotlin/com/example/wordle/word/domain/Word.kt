package com.example.wordle.word.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "words")
class Word(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true, length = 10)
    val word: String,

    @Column(name = "is_answer", nullable = false)
    val isAnswer: Boolean = false,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)
