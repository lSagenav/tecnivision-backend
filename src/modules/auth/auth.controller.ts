import type { Request, Response } from "express";
import { adminCookieName } from "../../middleware/auth.js";
import { loginAdmin } from "./auth.service.js";
function cookieOptions() { return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 86400000, path: "/", ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}) }; }
export async function login(req: Request, res: Response) {
  const email = String(req.body?.email || ""); const password = String(req.body?.password || "");
  if (!email.trim() || !password) return res.status(400).json({ error: "Email y contraseña son obligatorios." });
  const result = await loginAdmin(email, password); if (!result) return res.status(401).json({ error: "Credenciales incorrectas." });
  res.cookie(adminCookieName, result.token, cookieOptions()).json({ success: true, admin: result.admin });
}
export function logout(_req: Request, res: Response) { res.clearCookie(adminCookieName, cookieOptions()).json({ success: true }); }
export function me(_req: Request, res: Response) { res.json({ admin: res.locals.admin }); }
