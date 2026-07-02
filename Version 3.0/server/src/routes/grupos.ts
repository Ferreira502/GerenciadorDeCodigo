import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const grupoSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  cor: z.string().default("#00d9ff")
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, nome, descricao, cor, criado_em AS \"criadoEm\" FROM grupo WHERE usuario_id = $1 ORDER BY criado_em DESC",
      [req.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = grupoSchema.parse(req.body);
    const result = await query(
      `INSERT INTO grupo (nome, descricao, cor, usuario_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, descricao, cor, criado_em AS "criadoEm"`,
      [data.nome, data.descricao ?? null, data.cor, req.userId]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = grupoSchema.parse(req.body);
    const result = await query(
      `UPDATE grupo
          SET nome = $1, descricao = $2, cor = $3
        WHERE id = $4 AND usuario_id = $5
        RETURNING id, nome, descricao, cor, criado_em AS "criadoEm"`,
      [data.nome, data.descricao ?? null, data.cor, Number(req.params.id), req.userId]
    );
    if (!result.rowCount) return res.status(404).json({ erro: "Grupo nao encontrado" });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM grupo WHERE id = $1 AND usuario_id = $2", [
      Number(req.params.id),
      req.userId
    ]);
    if (!result.rowCount) return res.status(404).json({ erro: "Grupo nao encontrado" });
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

export default router;
