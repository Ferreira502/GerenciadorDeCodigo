# ArmazenaCodigo 3.0

Reescrita da Version 2.0 usando React, TypeScript, Node.js e PostgreSQL.

## Estrutura

- `client`: SPA em React + TypeScript + Vite.
- `server`: API Node.js + Express + TypeScript.
- `database`: schema PostgreSQL da versao 3.0.
- `images`: capturas copiadas da Version 2.0.

## Como rodar

1. Crie o banco PostgreSQL:

```sql
CREATE DATABASE armazena_codigo;
```

2. Execute o schema:

```bash
psql -d armazena_codigo -f database/schema.sql
```

3. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` se precisar.

4. Instale dependencias e rode:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:8080/api`

## Rotas da API

- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST /api/codigos`
- `PUT|DELETE /api/codigos/:id`
- `GET|POST /api/grupos`
- `PUT|DELETE /api/grupos/:id`
- `POST /api/codigos/:id/grupos`
- `GET|POST /api/exercicios`
- `PUT|DELETE /api/exercicios/:id`
