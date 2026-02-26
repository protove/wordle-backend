package com.example.wordle.word.dto

import com.example.wordle.word.domain.Word
import java.util.UUID

data class WordResponse(
    val id: UUID,
    val word: String,
    val isAnswer: Boolean
) {
    companion object {
        fun from(word: Word) = WordResponse(word.id, word.word.uppercase(), word.isAnswer)
    }
}
