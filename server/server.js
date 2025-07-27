const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");
const studyRoutes = require("./routes/study");
const subjectRoutes = require("./routes/subjects");
const pomodoroRoutes = require("./routes/pomodoro");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/exam-planner",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/pomodoro", pomodoroRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Exam Planner API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
