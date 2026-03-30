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

CREATE TABLE grupo (
    id          SERIAL PRIMARY KEY,
    nome        TEXT NOT NULL,
    descricao   TEXT,
    cor         TEXT DEFAULT '#00d9ff',
    criado_em   TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE exercicio (
    id          SERIAL PRIMARY KEY,
    numero      TEXT,
    titulo      TEXT NOT NULL,
    enunciado   TEXT,
    entrada     TEXT,
    saida       TEXT,
    dificuldade TEXT DEFAULT 'Fácil',
    linguagem   TEXT,
    status      TEXT DEFAULT 'pendente',
    solucao     TEXT,
    observacoes TEXT,
    criado_em   TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE codigo_grupo (
    codigo_id   INTEGER NOT NULL REFERENCES codigo(id) ON DELETE CASCADE,
    grupo_id    INTEGER NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    PRIMARY KEY (codigo_id, grupo_id)
);