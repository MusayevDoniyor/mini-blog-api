import { Request, Response } from "express";
import {
  findDocumentById,
  generateTokens,
  response,
  verifyToken,
} from "../utils/helper.js";
import User, { IUser } from "../models/user.model.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// * Register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password }: IUser = req.body;

    if (!email || !password || !name)
      return response({
        res,
        status: 400,
        error: "Email, Name and password are required",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response({
        res,
        status: 400,
        error: "User already exists with this email.",
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      image: req.file ? `/api/users/${req.file.filename}` : "",
    });

    await newUser.save();

    const { access_token, refresh_token } = generateTokens(newUser);

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: 45 * 24 * 60 * 60 * 1000,
    });

    response({
      res,
      status: 201,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        access_token,
      },
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while registering the user: " + error.message,
    });
  }
};

// * Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = <IUser>req.body;

    if (!email || !password)
      return response({
        res,
        status: 400,
        error: "Email and password are required",
      });

    const user = await User.findOne({ email });
    if (!user)
      return response({
        res,
        status: 404,
        error: "User not found",
      });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return response({
        res,
        status: 401,
        error: "Invalid password",
      });

    const { access_token, refresh_token } = generateTokens(user);

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: 45 * 24 * 60 * 60 * 1000,
    });

    return response({
      res,
      status: 200,
      data: {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      },
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while logging in: " + error.message,
    });
  }
};

// * Refresh
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return response({
        res,
        status: 401,
        error: "Refresh token not found",
      });
    }

    const refreshSecret = process.env.REFRESH_SECRET_KEY as string;
    const decoded = verifyToken(refreshToken, refreshSecret) as {
      userId: string;
    };

    const user = await findDocumentById(
      User,
      decoded.userId,
      res,
      "User not found"
    );
    if (!user) return;

    const { access_token } = generateTokens(user);

    response({
      res,
      status: 200,
      data: { access_token },
    });
  } catch (error: any) {
    response({
      res,
      status: 401,
      error: "Invalid or expired refresh token",
    });
  }
};

// * Logout
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      maxAge: 0,
    });

    response({
      res,
      status: 200,
      data: { message: "Logged out successfully" },
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while logging out: " + error.message,
    });
  }
};

// * GetProfile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return response({
        res,
        status: 404,
        error: "User not found",
      });
    }

    response({
      res,
      status: 200,
      data: user,
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while getting your profile: " + error.message,
    });
  }
};
