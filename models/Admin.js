import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  name:     { type: String, default: "Administrator" },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Admin", AdminSchema);