package com.example.wordle.game.service

import com.example.wordle.game.domain.LetterResult

object WordEvaluator {
    fun evaluate(guess: String, target: String): List<LetterResult> {
        require(guess.length == 5 && target.length == 5) { "Words must be 5 letters" }
        val result = Array(5) { LetterResult.ABSENT }
        val targetRemaining = target.toCharArray()

        // Pass 1: correct positions
        for (i in 0..4) {
            if (guess[i] == target[i]) {
                result[i] = LetterResult.CORRECT
                targetRemaining[i] = '\u0000'
            }
        }

        // Pass 2: present in wrong position
        for (i in 0..4) {
            if (result[i] == LetterResult.CORRECT) continue
            val idx = targetRemaining.indexOf(guess[i])
            if (idx != -1) {
                result[i] = LetterResult.PRESENT
                targetRemaining[idx] = '\u0000'
            }
        }

        return result.toList()
    }
}
