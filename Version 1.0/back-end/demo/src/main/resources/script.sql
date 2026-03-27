CREATE TABLE usuario (
    id       SERIAL PRIMARY KEY,
    nome     TEXT NOT NULL,
    email    TEXT UNIQUE NOT NULL,
    senha    TEXT NOT NULL
);

CREATE TABLE codigo (
    id          SERIAL PRIMARY KEY,
    titulo      TEXT NOT NULL,
    linguagem   TEXT NOT NULL,
    descricao   TEXT,
    codigo      TEXT NOT NULL,
    criado_em   TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);