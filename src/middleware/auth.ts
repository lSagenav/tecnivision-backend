import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export type AdminPayload = { id: number; email: string; name: string };
export const adminCookieName = "admin-token";
export function jwtSecret() { const s = process.env.JWT_SECRET; if (!s || s.length < 32) throw new Error("JWT_SECRET debe tener mínimo 32 caracteres."); return s; }
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[adminCookieName];
  if (!token) return res.status(401).json({ error: "No autorizado." });
  try { res.locals.admin = jwt.verify(token, jwtSecret()) as AdminPayload; next(); }
  catch { return res.status(401).json({ error: "Sesión inválida o vencida." }); }
}
