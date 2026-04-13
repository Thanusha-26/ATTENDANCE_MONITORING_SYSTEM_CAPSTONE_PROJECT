import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

// GET all students
router.get("/", async (req, res) => {
  try { res.json(await Student.find()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - add student
router.post("/", async (req, res) => {
  try {
    const s = new Student(req.body);
    await s.save();
    res.status(201).json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Specific sub-routes MUST come before generic /:rollNo ────────────

// PATCH /:rollNo/section  — change section
router.patch("/:rollNo/section", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo },
      { $set: { section: req.body.section } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /:rollNo/password  — change password
router.patch("/:rollNo/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await Student.findOne({ rollNo: req.params.rollNo });
    if (!user)                        return res.status(404).json({ error: "Student not found" });
    if (user.password !== oldPassword) return res.status(400).json({ error: "Wrong current password" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Generic /:rollNo routes come AFTER specific sub-routes ────────────

// PUT /:rollNo  — full update
router.put("/:rollNo", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo }, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /:rollNo  — partial update (profile edit)
router.patch("/:rollNo", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo }, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /:rollNo
router.delete("/:rollNo", async (req, res) => {
  try {
    await Student.findOneAndDelete({ rollNo: req.params.rollNo });
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;