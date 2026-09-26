import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { jwtSecret } from "../../middleware/auth.js";
export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) return null;
  const payload = { id: admin.id, email: admin.email, name: admin.name };
  return { admin: payload, token: jwt.sign(payload, jwtSecret(), { expiresIn: "1d" }) };
}
