const path = require("path");
const express = require("express");
const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
// The existing .env is in the project root, one folder above backend.
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("DevForge API is running");
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`DevForge API listening on port ${PORT}.`);
    });
  } catch (error) {
    const safeMessage = String(error.message).replace(
      /mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi,
      "[MongoDB connection string redacted]"
    );
    console.error("MongoDB connection failed:", safeMessage);
    process.exit(1);
  }
}

startServer();
