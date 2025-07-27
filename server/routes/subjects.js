const express = require("express");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all subjects for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create subject
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const subject = new Subject({
      name,
      description,
      color,
      user: req.userId,
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update subject
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete subject
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle subject completion
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.isCompleted = !subject.isCompleted;
    await subject.save();

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
