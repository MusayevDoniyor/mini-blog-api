import express, { Request, Response } from "express";
import { generateTokens, response } from "../utils/helper.js";
import User, { IUser } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import authMiddleware, { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadUserImage } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/register",
  uploadUserImage.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password }: IUser = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response({
          res,
          status: 400,
          error: "User already exists with this email.",
        });
      }

      // Create new user
      const newUser = new User({
        name,
        email,
        password,
        image: req.file ? `/api/users/${req.file.filename}` : "",
      });

      await newUser.save();

      response({
        res,
        status: 201,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.image,
        },
      });
    } catch (error: any) {
      response({
        res,
        status: 500,
        error: "An error occurred while registering the user: " + error.message,
      });
      console.log(error);
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
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

    return response({
      res,
      status: 200,
      data: {
        access_token,
        user,
      },
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while logging in: " + error.message,
    });
    console.log(error);
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select("-password");

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
    console.log(error);
  }
});

export default router;
