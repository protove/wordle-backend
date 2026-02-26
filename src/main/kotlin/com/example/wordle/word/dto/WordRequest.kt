package com.example.wordle.word.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class WordRequest(
    @field:NotBlank
    @field:Size(min = 5, max = 5, message = "단어는 정확히 5글자여야 합니다")
    @field:Pattern(regexp = "^[A-Za-z]+$", message = "영문자만 허용됩니다")
    val word: String,

    val isAnswer: Boolean = false
)
