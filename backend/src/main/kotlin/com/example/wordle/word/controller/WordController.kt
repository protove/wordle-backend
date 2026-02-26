package com.example.wordle.word.controller

import com.example.wordle.word.dto.WordRequest
import com.example.wordle.word.dto.WordResponse
import com.example.wordle.word.service.WordService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/words")
class WordController(private val wordService: WordService) {

    @GetMapping
    fun getWords(@RequestParam isAnswer: Boolean? = null): List<WordResponse> =
        wordService.getAllWords(isAnswer)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun addWord(@Valid @RequestBody request: WordRequest): WordResponse =
        wordService.addWord(request)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteWord(@PathVariable id: UUID) = wordService.deleteWord(id)
}
