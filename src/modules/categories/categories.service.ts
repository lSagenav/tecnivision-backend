import { prisma } from "../../config/prisma.js";
export const listCategories = () => prisma.category.findMany({ orderBy: { name: "asc" } });
