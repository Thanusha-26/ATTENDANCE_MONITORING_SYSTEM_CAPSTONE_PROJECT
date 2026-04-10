import mongoose from "mongoose";

const FacultySectionSchema = new mongoose.Schema({
  facultyId:  { type: String, required: true },
  courseCode: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("FacultySection", FacultySectionSchema);