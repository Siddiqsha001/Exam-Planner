const express = require("express");
const mongoose = require("mongoose");
const PomodoroSession = require("../models/PomodoroSession");
const StudySession = require("../models/StudySession");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all pomodoro sessions for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await PomodoroSession.find({ user: req.userId })
      .populate("studySession", "title")
      .populate("subject", "name color")
      .populate("exam", "title")
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create pomodoro session
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { duration, type, studySession, subject, exam } = req.body;

    const pomodoroSession = new PomodoroSession({
      duration,
      type,
      studySession,
      subject,
      exam,
      user: req.userId,
    });

    await pomodoroSession.save();

    // Populate the session before returning
    const populatedSession = await PomodoroSession.findById(pomodoroSession._id)
      .populate("studySession", "title")
      .populate("subject", "name color")
      .populate("exam", "title");

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get pomodoro statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayStats = await PomodoroSession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          completedAt: { $gte: startOfDay, $lt: endOfDay },
          type: "focus",
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: { $divide: ["$duration", 60] } },
        },
      },
    ]);

    const weeklyStats = await PomodoroSession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          type: "focus",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          sessions: { $sum: 1 },
          minutes: { $sum: { $divide: ["$duration", 60] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      today: todayStats[0] || { totalSessions: 0, totalMinutes: 0 },
      weekly: weeklyStats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
