import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import FacultySection from "./models/FacultySection.js";
import Faculty  from "./models/Faculty.js";
import Student  from "./models/Student.js";
import Admin    from "./models/Admin.js";
import Course   from "./models/Course.js";
import Attendance from "./models/Attendance.js";

import authRoutes       from "./routes/auth.js";
import facultyRoutes    from "./routes/facultyRoutes.js";
import studentRoutes    from "./routes/studentRoutes.js";
import courseRoutes     from "./routes/courseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ── Database ───────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => { console.log("DB Error:", err); process.exit(1); });

// ── Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/faculty",    facultyRoutes);
app.use("/api/students",   studentRoutes);
app.use("/api/courses",    courseRoutes);
app.use("/api/attendance", attendanceRoutes);

// ── Faculty-Course Assignments ─────────────────────────────────────────
// GET all assignments
app.get("/api/assignments", async (req, res) => {
  try { res.json(await FacultySection.find()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - assign faculty to course (upsert: remove old, insert new)
app.post("/api/assignments", async (req, res) => {
  try {
    const { facultyId, courseCode } = req.body;
    if (!facultyId || !courseCode)
      return res.status(400).json({ message: "facultyId and courseCode are required" });
    // Always remove existing assignment for this course first, then save new one
    await FacultySection.deleteOne({ courseCode });
    const doc = new FacultySection({ facultyId, courseCode });
    await doc.save();
    res.status(201).json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE - remove assignment by courseCode
app.delete("/api/assignments/:courseCode", async (req, res) => {
  try {
    await FacultySection.deleteOne({ courseCode: req.params.courseCode });
    res.json({ message: "Removed" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Reset Password (forgot password) ──────────────────────────────────
app.post("/api/reset-password", async (req, res) => {
  const { role, id, newPassword } = req.body;
  if (!role || !id || !newPassword)
    return res.status(400).json({ message: "All fields are required" });
  if (newPassword.length < 4)
    return res.status(400).json({ message: "Password must be at least 4 characters" });
  try {
    let user;
    if      (role === "faculty") user = await Faculty.findOne({ id });
    else if (role === "student") user = await Student.findOne({ rollNo: id });
    else if (role === "admin")   user = await Admin.findOne({ id });
    else return res.status(400).json({ message: "Invalid role" });

    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password reset successfully ✅" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Fetch All (single call loads everything the frontend needs) ────────
app.get("/api/all", async (req, res) => {
  try {
    const [faculties, students, courses, facultySection, attendance] =
      await Promise.all([
        Faculty.find(),
        Student.find(),
        Course.find(),
        FacultySection.find(),
        Attendance.find(),
      ]);
    res.json({ faculties, students, courses, facultySection, attendance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));