import express from "express";
import Faculty from "../models/Faculty.js";

const router = express.Router();

// GET all faculty
router.get("/", async (req, res) => {
  try { res.json(await Faculty.find()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - add faculty
router.post("/", async (req, res) => {
  try {
    const f = new Faculty(req.body);
    await f.save();
    res.status(201).json(f);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Specific sub-routes MUST come before generic /:id ────────────────

// PATCH /:id/approve  — approve or unapprove a faculty
router.patch("/:id/approve", async (req, res) => {
  try {
    const updated = await Faculty.findOneAndUpdate(
      { id: req.params.id },
      { $set: { approved: Boolean(req.body.approved) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Faculty not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /:id/password  — change password
router.patch("/:id/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await Faculty.findOne({ id: req.params.id });
    if (!user)                        return res.status(404).json({ error: "Faculty not found" });
    if (user.password !== oldPassword) return res.status(400).json({ error: "Wrong current password" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Generic /:id routes come AFTER specific sub-routes ────────────────

// PUT /:id  — full update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Faculty.findOneAndUpdate(
      { id: req.params.id }, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Faculty not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /:id  — partial update (profile edit)
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Faculty.findOneAndUpdate(
      { id: req.params.id }, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Faculty not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /:id
router.delete("/:id", async (req, res) => {
  try {
    await Faculty.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;