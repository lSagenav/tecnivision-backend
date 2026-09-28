import type { CookieOptions, Request } from "express";

export function authCookieOptions(req: Pick<Request, "secure">): CookieOptions {
  // Render terminates HTTPS at its proxy; Express uses trust proxy to set req.secure.
  const secure = req.secure || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}
