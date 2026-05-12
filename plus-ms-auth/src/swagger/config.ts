import swaggerJsdoc from "swagger-jsdoc";

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
  apis: ["**/routes/*.ts", "**/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);