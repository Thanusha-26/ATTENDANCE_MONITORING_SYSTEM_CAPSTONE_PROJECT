// ─────────────────────────────────────────────────────────────────────
//  seed.js  —  place in backend/ and run:  node seed.js
//  Seeds MongoDB from your CSV files + attendance.json
// ─────────────────────────────────────────────────────────────────────
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Inline schemas (self-contained, no import chain) ──────────────────
const Faculty = mongoose.model("Faculty", new mongoose.Schema({
  id: String, name: String, dept: String, email: String,
  phone: String, qualification: String, password: String,
  approved: { type: Boolean, default: true },
}, { strict: false }));

const Student = mongoose.model("Student", new mongoose.Schema({
  rollNo: String, name: String, dept: String, section: String,
  email: String, phone: String, password: String,
}, { strict: false }));

const Admin = mongoose.model("Admin", new mongoose.Schema({
  id: String, name: String, password: String,
}, { strict: false }));

const Course = mongoose.model("Course", new mongoose.Schema({
  code: String, name: String, dept: String, section: String, credits: Number,
}, { strict: false }));

const FacultySection = mongoose.model("FacultySection", new mongoose.Schema({
  facultyId: String, courseCode: String,
}, { strict: false }));

const Attendance = mongoose.model("Attendance", new mongoose.Schema({
  courseCode: String, date: String, slot: String, facultyId: String,
  records: [{ rollNo: String, status: String }],
}, { strict: false }));

// ── CSV parser ────────────────────────────────────────────────────────
function parseCSV(filename) {
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  File not found: ${filename} — skipping`);
    return [];
  }
  const lines = fs.readFileSync(filepath, "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .filter(l => l.trim());

  // Parse headers — skip blank columns (faculties.csv has double-comma)
  const rawHeaders = lines[0].split(",").map(h => h.trim());
  const headers = rawHeaders.filter(h => h !== "");
  const headerIdx = rawHeaders.map((h, i) => h !== "" ? i : null).filter(i => i !== null);

  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const obj = {};
    headers.forEach((h, j) => {
      const v = vals[headerIdx[j]];
      obj[h] = v !== undefined ? v.trim() : "";
    });
    return obj;
  }).filter(o => Object.values(o).some(v => v !== ""));
}

// ── Seed ──────────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase";
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // Clear all collections
  await Promise.all([
    Faculty.deleteMany({}),
    Student.deleteMany({}),
    Admin.deleteMany({}),
    Course.deleteMany({}),
    FacultySection.deleteMany({}),
    Attendance.deleteMany({}),
  ]);
  console.log("🗑️  Cleared all collections");

  // ── Admins ────────────────────────────────────────────────────────
  const adminRows = parseCSV("admins.csv");
  const admins = adminRows.map(a => ({ id: a.id, name: "Administrator", password: a.password }));
  if (admins.length) {
    await Admin.insertMany(admins);
    console.log(`✅ Seeded ${admins.length} admin(s):`, admins.map(a => a.id).join(", "));
  }

  // ── Courses ───────────────────────────────────────────────────────
  const courseRows = parseCSV("courses.csv");
  const courses = courseRows.map(c => ({
    code:    c.code,
    name:    c.name,
    dept:    c.dept,
    section: c.section,
    credits: Number(c.credits) || 4,
  }));
  if (courses.length) {
    await Course.insertMany(courses);
    console.log(`✅ Seeded ${courses.length} course(s):`, courses.map(c => c.code).join(", "));
  }
  const courseCodes = new Set(courses.map(c => c.code));

  // ── Faculty — all set approved:true ──────────────────────────────
  const facRows = parseCSV("faculties.csv");
  const faculties = facRows.map(f => ({
    id:       f.id,
    name:     f.name,
    dept:     f.dept     || "",
    email:    f.email    || "",
    phone:    f.phone    || "",
    qualification: f.qualification || "",
    password: f.password,
    approved: true,   // ← key fix: all CSV faculty are pre-approved
  }));
  if (faculties.length) {
    await Faculty.insertMany(faculties);
    console.log(`✅ Seeded ${faculties.length} faculty (all approved:true):`,
      faculties.map(f => f.id).join(", "));
  }

  // ── Students ──────────────────────────────────────────────────────
  const stuRows = parseCSV("students.csv");
  const students = stuRows.map(s => ({
    rollNo:   s.rollNo,
    name:     s.name,
    dept:     s.dept    || "",
    section:  s.section || "",
    email:    s.email   || "",
    phone:    s.phone   || "",
    password: s.password,
  }));
  if (students.length) {
    await Student.insertMany(students);
    console.log(`✅ Seeded ${students.length} student(s):`, students.map(s => s.rollNo).join(", "));
  }

  // ── Faculty-Course Assignments ────────────────────────────────────
  const assignRows = parseCSV("assignment.csv");
  const validAssignments = [];
  const skippedAssignments = [];
  assignRows.forEach(a => {
    if (!a.facultyId || !a.courseCode) return;
    if (!courseCodes.has(a.courseCode)) {
      skippedAssignments.push(`${a.facultyId}→${a.courseCode}`);
      return;
    }
    validAssignments.push({ facultyId: a.facultyId, courseCode: a.courseCode });
  });
  if (validAssignments.length) {
    await FacultySection.insertMany(validAssignments);
    console.log(`✅ Seeded ${validAssignments.length} assignment(s):`,
      validAssignments.map(a => `${a.facultyId}→${a.courseCode}`).join(", "));
  }
  if (skippedAssignments.length) {
    console.warn(`⚠️  Skipped ${skippedAssignments.length} invalid assignment(s) (course not found):`,
      skippedAssignments.join(", "));
  }

  // ── Attendance ────────────────────────────────────────────────────
  const attFile = path.join(__dirname, "attendance.json");
  if (fs.existsSync(attFile)) {
    const attData = JSON.parse(fs.readFileSync(attFile, "utf8"));
    await Attendance.insertMany(attData);
    console.log(`✅ Seeded ${attData.length} attendance session(s)`);
  } else {
    console.warn("⚠️  attendance.json not found — skipping");
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────────");
  console.log("Admin login   →  admin01  /  admin123");
  console.log("Faculty login →  F001–F005  /  fac123");
  console.log("Student login →  22CS001–22CS010  /  stu123");
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});