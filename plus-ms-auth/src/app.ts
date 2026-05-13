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
      "http://localhost:3000",
      "http://localhost:4001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:4001",
    ],
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.redirect("/docs");
});

// swaggerUi.serve is an array of middlewares; spread is required or Express never mounts /docs.
app.use("/docs", ...swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use("/auth", authRouter);