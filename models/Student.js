import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  rollNo:   { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  dept:     { type: String, default: "" },
  section:  { type: String, default: "" },
  email:    { type: String, default: "" },
  phone:    { type: String, default: "" },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Student", StudentSchema);