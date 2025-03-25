import { NextFunction, Request, Response } from "express";
import { response, verifyToken } from "../utils/helper.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
  post?: any;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
      return response({
        res,
        status: 401,
        error: "Invalid token format",
      });
    }

    const token = authorizationHeader.split(" ")[1];
    const secret = process.env.ACCESS_SECRET_KEY;

    if (!secret) {
      return response({
        res,
        status: 500,
        error: "Server configuration error",
      });
    }

    const decoded = verifyToken(token, secret);
    req.user = decoded as { userId: string };
    next();
  } catch (error) {
    return response({
      res,
      status: 401,
      error: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

export default authMiddleware;
