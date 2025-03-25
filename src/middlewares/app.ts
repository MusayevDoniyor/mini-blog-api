import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.get("/", (_: Request, res: Response) => {
  res.send("<h1>Welcome to Mini Blog Api</h1>");
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.message);

  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

export default app;
