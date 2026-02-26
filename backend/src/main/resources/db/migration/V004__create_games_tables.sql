-- 게임 테이블
CREATE TABLE IF NOT EXISTS games (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_word  VARCHAR(10) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    attempts_used INT        NOT NULL DEFAULT 0,
    game_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
    started_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at     TIMESTAMP,
    CONSTRAINT uq_game_user_date UNIQUE (user_id, game_date)
);

CREATE INDEX IF NOT EXISTS idx_games_user_id    ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_game_date  ON games(game_date);

-- 추측 테이블
CREATE TABLE IF NOT EXISTS game_guesses (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id      UUID        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    guess_word   VARCHAR(10) NOT NULL,
    result       VARCHAR(50) NOT NULL,
    guess_number INT         NOT NULL,
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_game_guess_number UNIQUE (game_id, guess_number)
);

CREATE INDEX IF NOT EXISTS idx_game_guesses_game_id ON game_guesses(game_id);
