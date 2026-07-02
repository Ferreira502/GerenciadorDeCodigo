CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL PRIMARY KEY,
    nome        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    senha_hash  TEXT NOT NULL,
    criado_em   TIMESTAMP DEFAULT NOW()
);

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS senha_hash TEXT;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
          FROM information_schema.columns
         WHERE table_name = 'usuario'
           AND column_name = 'senha'
    ) THEN
        ALTER TABLE usuario ALTER COLUMN senha DROP NOT NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS codigo (
    id          SERIAL PRIMARY KEY,
    titulo      TEXT NOT NULL,
    linguagem   TEXT NOT NULL,
    descricao   TEXT,
    codigo      TEXT NOT NULL,
    criado_em   TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grupo (
    id          SERIAL PRIMARY KEY,
    nome        TEXT NOT NULL,
    descricao   TEXT,
    cor         TEXT DEFAULT '#00d9ff',
    criado_em   TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercicio (
    id          SERIAL PRIMARY KEY,
    numero      TEXT,
    titulo      TEXT NOT NULL,
    enunciado   TEXT,
    entrada     TEXT,
    saida       TEXT,
    dificuldade TEXT DEFAULT 'Facil',
    linguagem   TEXT,
    status      TEXT DEFAULT 'pendente',
    solucao     TEXT,
    observacoes TEXT,
    criado_em   TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS codigo_grupo (
    codigo_id   INTEGER NOT NULL REFERENCES codigo(id) ON DELETE CASCADE,
    grupo_id    INTEGER NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    PRIMARY KEY (codigo_id, grupo_id)
);

CREATE INDEX IF NOT EXISTS idx_codigo_usuario ON codigo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_grupo_usuario ON grupo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_exercicio_usuario ON exercicio(usuario_id);