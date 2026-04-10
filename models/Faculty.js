import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
  id:            { type: String, required: true, unique: true },
  name:          { type: String, required: true },
  dept:          { type: String, default: "" },
  email:         { type: String, default: "" },
  phone:         { type: String, default: "" },
  qualification: { type: String, default: "" },
  password:      { type: String, required: true },
  approved:      { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Faculty", FacultySchema);