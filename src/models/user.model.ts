import mongoose from "mongoose";
import { validateEmail, validatePassword } from "../utils/validations.js";
import bcrypt from "bcrypt";

export interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: Function;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      minlength: 5,
      trim: true,
      validate: [
        validateEmail,
        "The email address is incorrect. Enter a valid one",
      ],
    },

    password: {
      type: String,
      required: [true, "User password is required"],
      minlength: 8,
      validate: [
        validatePassword,
        "Invalid password. It must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., @, $, !, %, *)",
      ],
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
