import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./routes/auth";
import { swaggerSpec } from "./swagger/config";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000", // plus-shell
      "http://localhost:4001", // plus-mfe-auth
    ],
    credentials: true,
  })
);

// Documentação Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use("/auth", authRouter);