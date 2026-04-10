// backend/models/Assignment.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: String },
  dueDate: { type: Date },
});

export default mongoose.model("Assignment", assignmentSchema);