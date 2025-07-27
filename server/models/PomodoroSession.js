const mongoose = require("mongoose");

const pomodoroSessionSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
      default: 1500, // 25 minutes in seconds
    },
    type: {
      type: String,
      enum: ["focus", "break"],
      default: "focus",
    },
    studySession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudySession",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PomodoroSession", pomodoroSessionSchema);
