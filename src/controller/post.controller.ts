import { Request, Response } from "express";
import { findDocumentById, response } from "../utils/helper.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import Post from "../models/post.model.js";

// * Create Post
export const createPost = async (req: AuthRequest, res: Response) => {
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

    const populatedPost = await findDocumentById(
      Post,
      newPost._id,
      res,
      "Post not found"
    );

    if (!populatedPost) return;

    await populatedPost.populate("author", "name email image");

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
  }
};

// * Get Posts
export const getPosts = async (req: Request, res: Response) => {
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
  }
};

// * Get Post
export const getPostById = async (req: Request, res: Response) => {
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
  }
};

// * Update Post
export const updatePost = async (req: AuthRequest, res: Response) => {
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
  }
};

// * Delete Post
export const deletePost = async (req: AuthRequest, res: Response) => {
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
  }
};
