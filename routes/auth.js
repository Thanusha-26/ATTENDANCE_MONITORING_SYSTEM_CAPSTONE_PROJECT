import express from "express";
import jwt from "jsonwebtoken";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Admin   from "../models/Admin.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id, password, role } = req.body;
  try {
    let user;
    if      (role === "faculty") user = await Faculty.findOne({ id });
    else if (role === "student") user = await Student.findOne({ rollNo: id });
    else if (role === "admin")   user = await Admin.findOne({ id });
    else return res.status(400).json({ message: "Invalid role" });

    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id || user.rollNo, role },
      process.env.JWT_SECRET || "attendease_secret_2024",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id:      user.id || user.rollNo,
        rollNo:  user.rollNo,
        name:    user.name,
        role,
        dept:    user.dept,
        section: user.section,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;