import { Router } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { query, pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

type CodigoRow = {
  id: number;
  titulo: string;
  linguagem: string;
  descricao: string | null;
  codigo: string;
  criado_em: string;
  atualizado_em: string;
  grupos: number[] | null;
};

const router = Router();
const codigoSchema = z.object({
  titulo: z.string().min(1),
  linguagem: z.string().min(1),
  descricao: z.string().optional().nullable(),
  codigo: z.string().min(1),
  grupos: z.array(z.number()).default([])
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await query<CodigoRow>(
      `SELECT c.*,
              COALESCE(array_agg(cg.grupo_id) FILTER (WHERE cg.grupo_id IS NOT NULL), '{}') AS grupos
         FROM codigo c
         LEFT JOIN codigo_grupo cg ON cg.codigo_id = c.id
        WHERE c.usuario_id = $1
        GROUP BY c.id
        ORDER BY c.criado_em DESC`,
      [req.userId]
    );
    return res.json(result.rows.map(mapCodigo));
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const data = codigoSchema.parse(req.body);
    await client.query("BEGIN");
    const result = await client.query<CodigoRow>(
      `INSERT INTO codigo (titulo, linguagem, descricao, codigo, usuario_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.titulo, data.linguagem, data.descricao ?? null, data.codigo, req.userId]
    );

    const codigo = result.rows[0];
    await syncGrupos(client, codigo.id, data.grupos);
    await client.query("COMMIT");
    return res.status(201).json(await getCodigo(codigo.id, req.userId!));
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.put("/:id", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const data = codigoSchema.parse(req.body);
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE codigo
          SET titulo = $1, linguagem = $2, descricao = $3, codigo = $4, atualizado_em = NOW()
        WHERE id = $5 AND usuario_id = $6`,
      [data.titulo, data.linguagem, data.descricao ?? null, data.codigo, id, req.userId]
    );

    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ erro: "Codigo nao encontrado" });
    }

    await syncGrupos(client, id, data.grupos);
    await client.query("COMMIT");
    return res.json(await getCodigo(id, req.userId!));
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM codigo WHERE id = $1 AND usuario_id = $2", [
      Number(req.params.id),
      req.userId
    ]);
    if (!result.rowCount) return res.status(404).json({ erro: "Codigo nao encontrado" });
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/grupos", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const grupos = z.array(z.number()).parse(req.body);
    await client.query("BEGIN");
    const owner = await client.query("SELECT id FROM codigo WHERE id = $1 AND usuario_id = $2", [id, req.userId]);
    if (!owner.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ erro: "Codigo nao encontrado" });
    }
    await syncGrupos(client, id, grupos);
    await client.query("COMMIT");
    return res.json({ status: "ok" });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

async function getCodigo(id: number, userId: number) {
  const result = await query<CodigoRow>(
    `SELECT c.*,
            COALESCE(array_agg(cg.grupo_id) FILTER (WHERE cg.grupo_id IS NOT NULL), '{}') AS grupos
       FROM codigo c
       LEFT JOIN codigo_grupo cg ON cg.codigo_id = c.id
      WHERE c.id = $1 AND c.usuario_id = $2
      GROUP BY c.id`,
    [id, userId]
  );
  return mapCodigo(result.rows[0]);
}

async function syncGrupos(client: PoolClient, codigoId: number, grupos: number[]) {
  await client.query("DELETE FROM codigo_grupo WHERE codigo_id = $1", [codigoId]);
  for (const grupoId of grupos) {
    await client.query(
      "INSERT INTO codigo_grupo (codigo_id, grupo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [codigoId, grupoId]
    );
  }
}

function mapCodigo(row: CodigoRow) {
  return {
    id: row.id,
    titulo: row.titulo,
    linguagem: row.linguagem,
    descricao: row.descricao,
    codigo: row.codigo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    grupos: row.grupos ?? []
  };
}

export default router;
