/**
 * Cria o schema e utilizadores de exemplo antes do servidor subir (Docker / npm run init-db).
 * Idempotente: pode correr várias vezes sem duplicar emails.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureConnection(): Promise<void> {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message || error.name
          : String(error);
      const detail =
        error && typeof error === "object" && "errors" in error
          ? ` ${JSON.stringify((error as NodeJS.ErrnoException & { errors?: unknown[] }).errors)}`
          : "";
      console.log(
        `[init-db] Tentativa ${attempt}/${maxRetries} de conectar ao banco falhou: ${msg}${detail}`
      );
      if (attempt === maxRetries) throw error;
      await sleep(2000);
    }
  }
}

async function createSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF', 'MANAGER')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function createSampleUser(
  email: string,
  password: string,
  role: "ADMIN" | "STAFF" | "MANAGER"
): Promise<void> {
  const { rows } = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  if (rows.length > 0) return;

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
    [email, password_hash, role]
  );
}

async function main(): Promise<void> {
  console.log("[init-db] Inicializando base de dados...");
  await ensureConnection();
  await createSchema();

  await createSampleUser("admin@example.com", "Admin123!", "ADMIN");
  await createSampleUser("staff@example.com", "Staff123!", "STAFF");
  await createSampleUser("manager@example.com", "Manager123!", "MANAGER");

  console.log("[init-db] Base de dados pronta.");
  await pool.end();
}

main().catch((error) => {
  console.error("[init-db] Erro:", error);
  process.exit(1);
});
