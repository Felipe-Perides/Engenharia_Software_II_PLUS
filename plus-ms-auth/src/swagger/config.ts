import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Plus MS Auth API",
      version: "1.0.0",
      description: "Microsserviço de autenticação do projeto Plus",
    },
    servers: [{ url: "http://localhost:3001" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src", "routes", "*.ts"),
    path.join(process.cwd(), "dist", "routes", "*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);