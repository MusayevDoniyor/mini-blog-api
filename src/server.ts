import dotenv from "dotenv";
dotenv.config();

import app from "./middlewares/app.js";
import connectDB from "./config/db.js";

connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
