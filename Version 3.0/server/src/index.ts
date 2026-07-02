import "./config/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import authRoutes from "./routes/auth.js";
import codigoRoutes from "./routes/codigos.js";
import grupoRoutes from "./routes/grupos.js";
import exercicioRoutes from "./routes/exercicios.js";

const app = express();
const port = Number(process.env.PORT ?? 8080);
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origem nao permitida"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok", version: "3.0.0" }));
app.use("/api/auth", authRoutes);
app.use("/api/codigos", codigoRoutes);
app.use("/api/grupos", grupoRoutes);
app.use("/api/exercicios", exercicioRoutes);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ erro: "Dados invalidos", detalhes: error.flatten() });
  }

  console.error(error);
  return res.status(500).json({ erro: "Erro interno do servidor" });
});

app.listen(port, () => {
  console.log(`API 3.0 rodando em http://localhost:${port}/api`);
});
