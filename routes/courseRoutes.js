import express from "express";
import Course from "../models/Course.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try { res.json(await Course.find()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - add course
router.post("/", async (req, res) => {
  try {
    const c = new Course(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /:code
router.delete("/:code", async (req, res) => {
  try {
    await Course.findOneAndDelete({ code: req.params.code });
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;