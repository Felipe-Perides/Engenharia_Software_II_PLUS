import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";

// Mock do módulo de banco — substitui o pool por um objeto fake
vi.mock("../src/db/pool", () => ({
  pool: {
    query: vi.fn(),
  },
}));

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

import { pool } from "../src/db/pool";
import bcrypt from "bcryptjs";

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };
const mockBcrypt = bcrypt as unknown as { compare: ReturnType<typeof vi.fn> };

// Usuário fake que simula o retorno do banco
const fakeUser = {
  id: "user-123",
  email: "admin@plus.com",
  password_hash: "$2a$10$hash",
  role: "ADMIN",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /auth/login", () => {
  it("retorna 400 se email ou password não forem enviados", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obrigatórios/);
  });

  it("retorna 401 se o usuário não existir no banco", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "inexistente@plus.com", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Credenciais inválidas");
  });

  it("retorna 401 se a senha estiver errada", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    mockBcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: fakeUser.email, password: "senhaerrada" });

    expect(res.status).toBe(401);
  });

  it("retorna token e refresh em login bem-sucedido", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    mockBcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: fakeUser.email, password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refresh");
  });
});

describe("POST /auth/refresh", () => {
  it("retorna 400 se refresh token não for enviado", async () => {
    const res = await request(app).post("/auth/refresh").send({});
    expect(res.status).toBe(400);
  });

  it("retorna 401 para refresh token inválido", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .send({ refresh: "token-invalido" });
    expect(res.status).toBe(401);
  });

  it("retorna novo token para refresh válido", async () => {
    // Primeiro faz login para pegar um refresh token real
    mockPool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    mockBcrypt.compare.mockResolvedValueOnce(true);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: fakeUser.email, password: "123456" });

    const { refresh } = loginRes.body;

    const res = await request(app).post("/auth/refresh").send({ refresh });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});

describe("POST /auth/logout", () => {
  it("retorna 401 se não estiver autenticado", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(401);
  });

  it("retorna 204 com token válido", async () => {
    // Faz login para pegar token
    mockPool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    mockBcrypt.compare.mockResolvedValueOnce(true);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: fakeUser.email, password: "123456" });

    const { token } = loginRes.body;

    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});

describe("GET /auth/me", () => {
  it("retorna 401 sem token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("retorna dados do usuário com token válido", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [fakeUser] });
    mockBcrypt.compare.mockResolvedValueOnce(true);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: fakeUser.email, password: "123456" });

    const { token } = loginRes.body;

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(fakeUser.email);
    expect(res.body.role).toBe(fakeUser.role);
  });
});