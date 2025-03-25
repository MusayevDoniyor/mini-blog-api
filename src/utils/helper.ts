import { Response } from "express";
import { IUser } from "../models/user.model.js";
import jwt, { SignOptions, Secret } from "jsonwebtoken";

interface IResponse<T = any> {
  res: Response;
  status: number;
  error?: string;
  data?: T;
}

export const response = <T>({
  res,
  status,
  error,
  data,
}: IResponse<T>): void => {
  const statusMessages: Record<number, string> = {
    200: "Successful",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error",
  };

  console.log(statusMessages[status]);

  res.status(status).json({
    message: error || statusMessages[status] || "Unknown status",
    data: data || null,
    success: !error,
  });
};

export const generateTokens = (user: IUser) => {
  try {
    const access_token_secret = process.env.ACCESS_SECRET_KEY;
    const refresh_token_secret = process.env.REFRESH_SECRET_KEY;

    if (!access_token_secret || !refresh_token_secret) {
      throw new Error("JWT secrets are not configured");
    }

    const access_token = jwt.sign(
      { userId: user._id },
      access_token_secret as Secret,
      { expiresIn: process.env.ACCESS_EXPIRE_TIME || "1h" } as SignOptions
    );

    const refresh_token = jwt.sign(
      { userId: user._id },
      refresh_token_secret as Secret,
      { expiresIn: process.env.REFRESH_EXPIRE_TIME || "7d" } as SignOptions
    );

    return { access_token, refresh_token };
  } catch (error) {
    throw new Error(
      `Token generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret as Secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
