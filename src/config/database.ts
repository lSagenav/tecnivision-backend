import { PrismaMariaDb } from "@prisma/adapter-mariadb";
export function createMariaDbAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL no está configurada.");
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("ssl-mode")?.toLowerCase();
  return new PrismaMariaDb({
    host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password), database: url.pathname.replace("/", ""),
    connectionLimit: Number(url.searchParams.get("connectionLimit") || 5),
    connectTimeout: Number(url.searchParams.get("connectTimeout") || 15000), allowPublicKeyRetrieval: true,
    ssl: sslMode === "required" ? { rejectUnauthorized: false } : undefined,
  }, { useTextProtocol: true });
}
