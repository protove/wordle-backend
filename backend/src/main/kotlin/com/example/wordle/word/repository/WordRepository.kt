package com.example.wordle.word.repository

import com.example.wordle.word.domain.Word
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface WordRepository : JpaRepository<Word, UUID> {
    fun findAllByIsAnswer(isAnswer: Boolean): List<Word>
    fun existsByWord(word: String): Boolean
    fun findByWord(word: String): Word?
}
