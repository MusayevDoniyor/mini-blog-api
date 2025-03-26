import { Response } from "express";
import { response } from "../utils/helper.js";
import Post from "../models/post.model.js";
import { AuthRequest } from "./auth.middleware.js";

export const checkPostAuthor = async (
  req: AuthRequest,
  res: Response,
  next: Function
) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return response({
        res,
        status: 404,
        error: "Post not found",
      });
    }

    if (post.author.toString() !== req.user?.userId) {
      return response({
        res,
        status: 403,
        error: "You can only modify your own posts",
      });
    }

    req.post = post;
    next();
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while checking post author: " + error.message,
    });
    console.log(error);
  }
};
