const express = require("express");

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create task
router.post("/", protect, createTask);

// Get tasks for project
router.get("/project/:projectId", protect, getTasks);

// Update task
router.put("/:id", protect, updateTask);

// Delete task
router.delete("/:id", protect, deleteTask);

module.exports = router;