import express, { Request, Response } from "express";
import { response } from "../utils/helper.js";
import authMiddleware, { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadPostImage } from "../middlewares/upload.js";
import Post from "../models/post.model.js";
import { checkPostAuthor } from "../middlewares/post.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  uploadPostImage.single("image"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, content } = req.body;

      if (!title || !content)
        return response({
          res,
          status: 400,
          error: "Title and Content are required",
        });

      const newPost = new Post({
        author: req.user?.userId,
        title,
        content,
        image: req.file ? `/api/posts/${req.file.filename}` : "",
      });

      await newPost.save();

      const populatedPost = await Post.findById(newPost._id).populate(
        "author",
        "name email image"
      );

      response({
        res,
        status: 201,
        data: populatedPost,
      });
    } catch (error: any) {
      response({
        res,
        status: 500,
        error: "An error occurred while creating the post: " + error.message,
      });
      console.log(error);
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";

    const posts = await Post.find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name email image");

    const total = await Post.countDocuments();

    response({
      res,
      status: 200,
      data: {
        posts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while getting posts: " + error.message,
    });
    console.log(error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email image"
    );

    if (!post) {
      return response({
        res,
        status: 404,
        error: "Post not found",
      });
    }

    response({
      res,
      status: 200,
      data: post,
    });
  } catch (error: any) {
    response({
      res,
      status: 500,
      error: "An error occurred while getting the post: " + error.message,
    });
    console.log(error);
  }
});

router.put(
  "/:id",
  authMiddleware,
  checkPostAuthor,
  uploadPostImage.single("image"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, content } = req.body;

      if (title) req.post.title = title;
      if (content) req.post.content = content;
      if (req.file) req.post.image = `/api/posts/${req.file.filename}`;

      await req.post.save();

      const updatedPost = await Post.findById(req.post._id).populate(
        "author",
        "name email image"
      );

      response({
        res,
        status: 200,
        data: updatedPost,
      });
    } catch (error: any) {
      response({
        res,
        status: 500,
        error: "An error occurred while updating the post: " + error.message,
      });
      console.log(error);
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  checkPostAuthor,
  async (req: AuthRequest, res: Response) => {
    try {
      await req.post.deleteOne();

      response({
        res,
        status: 200,
        data: { message: "Post deleted successfully" },
      });
    } catch (error: any) {
      response({
        res,
        status: 500,
        error: "An error occurred while deleting the post: " + error.message,
      });
      console.log(error);
    }
  }
);

export default router;
