import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const rawUserId = req.cookies.userId;
  const userId = Number(rawUserId);

  if (!rawUserId || Number.isNaN(userId)) {
    return res.status(401).json({ erro: "Nao autenticado" });
  }

  req.userId = userId;
  return next();
}
