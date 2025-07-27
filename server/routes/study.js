const express = require("express");
const StudySession = require("../models/StudySession");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all study sessions for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.userId })
      .populate("subject", "name color")
      .populate("exam", "title")
      .sort({ startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create study session
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, subject, exam, startTime, endTime } = req.body;

    const session = new StudySession({
      title,
      subject,
      exam,
      startTime,
      endTime,
      user: req.userId,
    });

    await session.save();

    // Populate data before returning
    const populatedSession = await StudySession.findById(session._id)
      .populate("subject", "name color")
      .populate("exam", "title");

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update study session
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete study session
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    res.json({ message: "Study session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
