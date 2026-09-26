import type { ErrorRequestHandler } from "express";
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Error interno del servidor.";
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Error interno del servidor." : message });
};
