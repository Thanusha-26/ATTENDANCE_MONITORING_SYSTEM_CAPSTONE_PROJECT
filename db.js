import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase");
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("DB Error:", error);
    process.exit(1);
  }
};