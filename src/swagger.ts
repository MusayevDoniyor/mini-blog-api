import dotenv from "dotenv";
dotenv.config();
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const PORT = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Blog Api",
      version: "1.0.0",
      description: "API documentation for the Mini Blog project",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Post: {
          type: Object,
          properties: {
            id: {
              type: String,
              example: "60d0fe4f5311236168a109ca",
            },
            author: {
              type: Object,
              properties: {
                id: {
                  type: String,
                  example: "60d0fe4f5311236168a109cb",
                },
                name: {
                  type: String,
                  example: "John Doe",
                },
                email: {
                  type: String,
                  example: "john@example.com",
                },
                image: {
                  type: String,
                  example: "/uploads/users/image.jpg",
                },
              },
            },
            title: {
              type: String,
              example: "My First Post",
            },
            content: {
              type: String,
              example: "This is the content of my post.",
            },
            image: {
              type: String,
              example: "/uploads/posts/image.jpg",
            },
            createdAt: {
              type: String,
              format: "date-time",
              example: "2025-04-01T12:34:56.789Z",
            },
            updatedAt: {
              type: String,
              format: "date-time",
              example: "2025-04-01T12:34:56.789Z",
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, "../src/routes/auth.routes.ts"),
    path.join(__dirname, "../src/routes/post.routes.ts"),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log(`Swagger docs available at: http://localhost:${PORT}/api-docs`);
};
