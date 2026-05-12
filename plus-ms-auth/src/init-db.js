require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureConnection() {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      console.log(`Tentativa ${attempt}/${maxRetries} de conectar ao banco falhou: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      await sleep(2000);
    }
  }
}

async function createSchema() {
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

async function createSampleUser(email, password, role) {
  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (rows.length > 0) return;

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
    [email, password_hash, role]
  );
}

async function main() {
  console.log("Inicializando database...");
  await ensureConnection();
  await createSchema();

  await createSampleUser("admin@example.com", "Admin123!", "ADMIN");
  await createSampleUser("staff@example.com", "Staff123!", "STAFF");
  await createSampleUser("manager@example.com", "Manager123!", "MANAGER");

  console.log("Database inicializada com sucesso.");
  await pool.end();
}

main().catch((error) => {
  console.error("Erro ao inicializar o banco:", error);
  process.exit(1);
});
