const express = require("express");
const StudySession = require("../models/StudySession");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get overall progress for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    // Study Sessions
    const totalSessions = await StudySession.countDocuments({ user: userId });
    const completedSessions = await StudySession.countDocuments({ user: userId, completed: true });
    // Exams
    const totalExams = await Exam.countDocuments({ user: userId });
    const completedExams = await Exam.countDocuments({ user: userId, isCompleted: true });
    // Subjects
    const totalSubjects = await Subject.countDocuments({ user: userId });
    const completedSubjects = await Subject.countDocuments({ user: userId, isCompleted: true });

    res.json({
      studySessions: { total: totalSessions, completed: completedSessions },
      exams: { total: totalExams, completed: completedExams },
      subjects: { total: totalSubjects, completed: completedSubjects },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router; 