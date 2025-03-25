import mongoose from "mongoose";

const connectDB = async () => {
  const mongo_url = process.env.MONGO_URI;

  mongoose
    .connect(mongo_url as string)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(() => console.log("❌ MongoDB connection failed"));
};

export default connectDB;
