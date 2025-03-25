import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
const usersDir = path.join(uploadsDir, "users");
const postsDir = path.join(uploadsDir, "posts");

// Create directories if they don't exist
[uploadsDir, usersDir, postsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const createStorage = (destination: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename(req, file, cb) {
      cb(
        null,
        file.fieldname + "_" + Date.now() + path.extname(file.originalname)
      );
    },
  });
};

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const fileExtentionFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Only .jpg, .jpeg, .png, .svg files are allowed!"));
  }

  cb(null, true);
};

const createUpload = (destination: string) => {
  return multer({
    storage: createStorage(destination),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"));
      }

      const allowedExtensions = [".jpg", ".jpeg", ".png", ".svg"];
      const ext = path.extname(file.originalname).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Only .jpg, .jpeg, .png, .svg files are allowed!"));
      }

      cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 7, // 7MB
    },
  });
};

export const uploadUserImage = createUpload(usersDir);
export const uploadPostImage = createUpload(postsDir);
