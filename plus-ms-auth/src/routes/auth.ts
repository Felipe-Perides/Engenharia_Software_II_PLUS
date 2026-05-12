import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { authenticate, AuthPayload } from "../middlewares/auth";

export const authRouter = Router();

const JWT_SECRET = () => process.env.JWT_SECRET || "dev-secret";

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica um usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@plus.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Tokens gerados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refresh:
 *                   type: string
 *       400:
 *         description: Campos obrigatórios ausentes
 *       401:
 *         description: Credenciais inválidas
 */
authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email e password são obrigatórios" });
    return;
  }

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const payload: Omit<AuthPayload, "sub"> & { sub: string } = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET(), { expiresIn: "15m" });
  const refresh = jwt.sign({ sub: user.id }, JWT_SECRET(), { expiresIn: "7d" });

  res.json({ token, refresh });
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renova o access token usando um refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh]
 *             properties:
 *               refresh:
 *                 type: string
 *     responses:
 *       200:
 *         description: Novo access token gerado
 *       400:
 *         description: Refresh token não informado
 *       401:
 *         description: Refresh token inválido ou expirado
 */
authRouter.post("/refresh", (req: Request, res: Response) => {
  const { refresh } = req.body as { refresh?: string };

  if (!refresh) {
    res.status(400).json({ error: "refresh token obrigatório" });
    return;
  }

  try {
    const payload = jwt.verify(refresh, JWT_SECRET()) as { sub: string };
    const token = jwt.sign({ sub: payload.sub }, JWT_SECRET(), {
      expiresIn: "15m",
    });
    res.json({ token });
  } catch {
    res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerra a sessão do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout realizado com sucesso
 */
authRouter.post("/logout", authenticate, (_req: Request, res: Response) => {
  // Stateless: em produção, adicionar o refresh token a uma blocklist no banco
  res.status(204).send();
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna os dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [ADMIN, STAFF, MANAGER]
 *       401:
 *         description: Token não fornecido ou inválido
 */
authRouter.get("/me", authenticate, (req: Request, res: Response) => {
  const { sub, email, role } = req.user!;
  res.json({ id: sub, email, role });
});