package com.example.wordle.word.service

import com.example.wordle.common.exception.NotFoundException
import com.example.wordle.word.domain.Word
import com.example.wordle.word.dto.WordRequest
import com.example.wordle.word.dto.WordResponse
import com.example.wordle.word.repository.WordRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
class WordService(private val wordRepository: WordRepository) {

    fun getTodaysWord(): String {
        val answers = wordRepository.findAllByIsAnswer(true)
        require(answers.isNotEmpty()) { "No answer words in database" }
        val today = LocalDate.now()
        val index = ((today.year * 366L + today.dayOfYear) % answers.size).toInt()
        return answers[index].word.uppercase()
    }

    fun isValidWord(word: String): Boolean =
        wordRepository.existsByWord(word.uppercase())

    @Transactional(readOnly = true)
    fun getAllWords(isAnswer: Boolean?): List<WordResponse> =
        if (isAnswer != null) wordRepository.findAllByIsAnswer(isAnswer).map(WordResponse::from)
        else wordRepository.findAll().map(WordResponse::from)

    @Transactional
    fun addWord(request: WordRequest): WordResponse {
        val upper = request.word.uppercase()
        if (wordRepository.existsByWord(upper)) {
            return WordResponse.from(wordRepository.findByWord(upper)!!)
        }
        val saved = wordRepository.save(Word(word = upper, isAnswer = request.isAnswer))
        return WordResponse.from(saved)
    }

    @Transactional
    fun deleteWord(wordId: UUID) {
        if (!wordRepository.existsById(wordId)) throw NotFoundException("Word not found: $wordId")
        wordRepository.deleteById(wordId)
    }
}
