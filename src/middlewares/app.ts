import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoute from "../routes/auth.routes.js";
import postRoute from "../routes/post.routes.js";
import winston from "winston";
import { response } from "../utils/helper.js";
import { setupSwagger } from "../swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log" }),
  ],
});

setupSwagger(app);

app.use(
  "/api/users",
  express.static(path.join(__dirname, "../uploads/users"), { maxAge: "1d" })
);
app.use(
  "/api/posts",
  express.static(path.join(__dirname, "../uploads/posts"), { maxAge: "1d" })
);

app.get("/", (_: Request, res: Response) => {
  res.send("<h1>Welcome to Mini Blog Api</h1>");
});

// ! TEST ERROR
app.post("/test-error", (req: Request, res: Response) => {
  throw new Error("Test error triggered");
});

const fakeAsyncOperation = async () => {
  throw new Error("Unhandled promise rejection example");
};

// fakeAsyncOperation(); // ! TEST ERROR 2

app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;

  logger.error(`[${status}] ${err.message}`, {
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  response({
    res,
    status,
    error: err.message || "Internal Server Error",
  });
});

const shutdown = (err: Error | null) => {
  console.log("Shutting down gracefully...");
  if (err) logger.error("💥 Unhandled error during shutdown:", err);
  process.exit(1);
};

process.on("unhandledRejection", shutdown);
process.on("uncaughtException", shutdown);

export default app;
