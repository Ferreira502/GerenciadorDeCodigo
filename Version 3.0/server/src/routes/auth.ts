import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

type UsuarioRow = {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  senha?: string | null;
};

const router = Router();
const authSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(3)
});

router.post("/cadastro", async (req, res, next) => {
  try {
    const data = authSchema.extend({ nome: z.string().min(2) }).parse(req.body);
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const result = await query<UsuarioRow>(
      "INSERT INTO usuario (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, senha_hash",
      [data.nome, data.email, senhaHash]
    );

    const usuario = result.rows[0];
    res.cookie("userId", String(usuario.id), cookieOptions());
    return res.status(201).json({ status: "ok", usuario: publicUser(usuario) });
  } catch (error: unknown) {
    if (isUniqueViolation(error)) return res.status(409).json({ erro: "Email ja cadastrado" });
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = authSchema.parse(req.body);
    const result = await query<UsuarioRow>("SELECT * FROM usuario WHERE email = $1", [data.email]);
    const usuario = result.rows[0];

    if (!usuario || !(await senhaConfere(data.senha, usuario))) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    res.cookie("userId", String(usuario.id), cookieOptions());
    return res.json({ status: "ok", usuario: publicUser(usuario) });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("userId", { path: "/" });
  return res.json({ status: "ok" });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await query<UsuarioRow>("SELECT * FROM usuario WHERE id = $1", [req.userId]);
    const usuario = result.rows[0];
    if (!usuario) return res.status(401).json({});
    return res.json(publicUser(usuario));
  } catch (error) {
    return next(error);
  }
});

function publicUser(usuario: UsuarioRow) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

async function senhaConfere(senhaDigitada: string, usuario: UsuarioRow) {
  if (usuario.senha_hash && await bcrypt.compare(senhaDigitada, usuario.senha_hash)) {
    return true;
  }

  return Boolean(usuario.senha && usuario.senha === senhaDigitada);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    path: "/"
  };
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export default router;
