import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoute from "../routes/auth.routes.js";
import postRoute from "../routes/post.routes.js";
import { response } from "../utils/helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", express.static(path.join(__dirname, "../uploads/users")));
app.use("/api/posts", express.static(path.join(__dirname, "../uploads/posts")));

app.get("/", (_: Request, res: Response) => {
  res.send("<h1>Welcome to Mini Blog Api</h1>");
});

app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`❌ Error [${status}]:`, err.message);

  return response({
    res,
    status,
    error: err.message || "Internal Server Error",
  });
});

process.on("unhandledRejection", (err: Error) => {
  console.log("💥 Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.log("💥 Uncaught Exception:", err);
  process.exit(1);
});

export default app;
