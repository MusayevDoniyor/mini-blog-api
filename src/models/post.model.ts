import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, minlength: 2 },
    content: { type: String, required: true, trim: true, minlength: 5 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
