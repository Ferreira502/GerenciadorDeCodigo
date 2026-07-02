import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const exercicioSchema = z.object({
  numero: z.string().optional().nullable(),
  titulo: z.string().min(1),
  enunciado: z.string().optional().nullable(),
  entrada: z.string().optional().nullable(),
  saida: z.string().optional().nullable(),
  dificuldade: z.string().default("Facil"),
  linguagem: z.string().optional().nullable(),
  status: z.string().default("pendente"),
  solucao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, numero, titulo, enunciado, entrada, saida, dificuldade, linguagem, status,
              solucao, observacoes, criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"
         FROM exercicio
        WHERE usuario_id = $1
        ORDER BY criado_em DESC`,
      [req.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = exercicioSchema.parse(req.body);
    const result = await query(
      `INSERT INTO exercicio
        (numero, titulo, enunciado, entrada, saida, dificuldade, linguagem, status, solucao, observacoes, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, numero, titulo, enunciado, entrada, saida, dificuldade, linguagem, status,
                 solucao, observacoes, criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"`,
      [
        data.numero ?? null,
        data.titulo,
        data.enunciado ?? null,
        data.entrada ?? null,
        data.saida ?? null,
        data.dificuldade,
        data.linguagem ?? null,
        data.status,
        data.solucao ?? null,
        data.observacoes ?? null,
        req.userId
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = exercicioSchema.parse(req.body);
    const result = await query(
      `UPDATE exercicio
          SET numero=$1, titulo=$2, enunciado=$3, entrada=$4, saida=$5, dificuldade=$6,
              linguagem=$7, status=$8, solucao=$9, observacoes=$10, atualizado_em=NOW()
        WHERE id=$11 AND usuario_id=$12
        RETURNING id, numero, titulo, enunciado, entrada, saida, dificuldade, linguagem, status,
                  solucao, observacoes, criado_em AS "criadoEm", atualizado_em AS "atualizadoEm"`,
      [
        data.numero ?? null,
        data.titulo,
        data.enunciado ?? null,
        data.entrada ?? null,
        data.saida ?? null,
        data.dificuldade,
        data.linguagem ?? null,
        data.status,
        data.solucao ?? null,
        data.observacoes ?? null,
        Number(req.params.id),
        req.userId
      ]
    );
    if (!result.rowCount) return res.status(404).json({ erro: "Exercicio nao encontrado" });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await query("DELETE FROM exercicio WHERE id = $1 AND usuario_id = $2", [
      Number(req.params.id),
      req.userId
    ]);
    if (!result.rowCount) return res.status(404).json({ erro: "Exercicio nao encontrado" });
    return res.json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

export default router;
