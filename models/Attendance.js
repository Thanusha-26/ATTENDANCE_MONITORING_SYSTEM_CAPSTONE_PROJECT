import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  date:       { type: String, required: true },
  slot:       { type: String, required: true },
  facultyId:  { type: String, required: true },
  records: [{
    rollNo: { type: String },
    status: { type: String, enum: ["present", "absent"], default: "present" },
  }],
}, { timestamps: true });

export default mongoose.model("Attendance", AttendanceSchema);