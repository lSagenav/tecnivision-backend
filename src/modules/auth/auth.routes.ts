import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../../middleware/auth.js";
import { login, logout, me } from "./auth.controller.js";
export const authRouter = Router();
authRouter.post("/login", rateLimit({ windowMs: 15*60*1000, limit: 5, standardHeaders: true, legacyHeaders: false }), login);
authRouter.post("/logout", logout); authRouter.get("/me", requireAdmin, me);
