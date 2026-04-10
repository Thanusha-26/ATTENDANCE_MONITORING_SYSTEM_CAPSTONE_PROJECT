import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  code:    { type: String, required: true, unique: true },
  name:    { type: String, required: true },
  dept:    { type: String, default: "" },
  section: { type: String, default: "" },
  credits: { type: Number, default: 4 },
}, { timestamps: true });

export default mongoose.model("Course", CourseSchema);