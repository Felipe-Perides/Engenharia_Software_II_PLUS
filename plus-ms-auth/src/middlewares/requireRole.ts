import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "./auth";

type Role = AuthPayload["role"];

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Permissão insuficiente" });
      return;
    }

    next();
  };
}