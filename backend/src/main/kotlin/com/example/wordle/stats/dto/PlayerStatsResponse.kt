package com.example.wordle.stats.dto

import com.example.wordle.stats.domain.PlayerStats

data class PlayerStatsResponse(
    val gamesPlayed: Int = 0,
    val gamesWon: Int = 0,
    val currentStreak: Int = 0,
    val maxStreak: Int = 0,
    val guessDistribution: List<Int> = List(6) { 0 }   // index 0 = 1 guess, index 5 = 6 guesses
) {
    companion object {
        fun from(stats: PlayerStats): PlayerStatsResponse {
            return PlayerStatsResponse(
                gamesPlayed = stats.games,
                gamesWon = stats.wins,
                currentStreak = stats.curStreak,
                maxStreak = stats.maxStreak,
                guessDistribution = listOf(
                    stats.dist.one,
                    stats.dist.two,
                    stats.dist.three,
                    stats.dist.four,
                    stats.dist.five,
                    stats.dist.six
                )
            )
        }
    }
}
