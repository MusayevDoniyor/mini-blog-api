import { Response } from "express";
import { IUser } from "../models/user.model.js";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

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
  const access_token_secret = process.env.ACCESS_SECRET_KEY as string;
  const refresh_token_secret = process.env.REFRESH_SECRET_KEY as string;

  const access_expire_time = process.env.ACCESS_EXPIRE_TIME;
  const refresh_expire_time = process.env.REFRESH_EXPIRE_TIME;

  const access_token = jwt.sign({ userId: user._id }, access_token_secret, {
    expiresIn: access_expire_time,
  } as SignOptions);

  const refresh_token = jwt.sign({ userId: user._id }, refresh_token_secret, {
    expiresIn: refresh_expire_time,
  } as SignOptions);

  return { access_token, refresh_token };
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret as Secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const findDocumentById = async <T>(
  Model: mongoose.Model<T>,
  id: mongoose.Schema.Types.ObjectId | string,
  res: Response,
  errorMessage: string
) => {
  try {
    const document = await Model.findById(id);

    if (!document)
      return response({
        res,
        status: 404,
        error: errorMessage,
      });

    return document;
  } catch (error: any) {
    console.error("❌ Error in findDocumentById:", error.message);
    throw error;
  }
};
