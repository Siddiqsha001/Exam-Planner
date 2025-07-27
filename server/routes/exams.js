const express = require("express");
const Exam = require("../models/Exam");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all exams for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.userId })
      .populate("subject", "name color")
      .sort({ date: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create exam
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, subject, date, description } = req.body;

    const exam = new Exam({
      title,
      subject,
      date,
      description,
      user: req.userId,
    });

    await exam.save();

    // Populate subject data before returning
    const populatedExam = await Exam.findById(exam._id).populate(
      "subject",
      "name color"
    );
    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update exam
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete exam
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle exam completion
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.userId });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.isCompleted = !exam.isCompleted;
    await exam.save();

    const populatedExam = await Exam.findById(exam._id).populate(
      "subject",
      "name color"
    );
    res.json(populatedExam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
