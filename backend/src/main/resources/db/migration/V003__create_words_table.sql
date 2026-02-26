-- 단어 테이블
CREATE TABLE IF NOT EXISTS words (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    word        VARCHAR(10)  NOT NULL,
    is_answer   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX        IF NOT EXISTS idx_words_is_answer ON words(is_answer);
