import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// GET all attendance
router.get("/", async (req, res) => {
  try { res.json(await Attendance.find()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST - mark attendance
router.post("/", async (req, res) => {
  try {
    const data = new Attendance(req.body);
    await data.save();
    res.status(201).json({ success: true, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;