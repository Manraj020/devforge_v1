const Task = require("../models/Task");
const Project = require("../models/Project");
const updateProjectProgress = async (projectId) => {
    const tasks = await Task.find({
        project: projectId
    });

    const totalTasks = tasks.length;

    let progress = 0;

    if (totalTasks > 0) {
        const completedTasks = tasks.filter(
            task => task.completed
        ).length;

        progress = Math.round(
            (completedTasks / totalTasks) * 100
        );
    }

    let status = "Draft";

    if (progress > 0 && progress < 100) {
        status = "In Progress";
    }

    if (progress === 100) {
        status = "Completed";
    }

    await Project.findByIdAndUpdate(projectId, {
        progress,
        status
    });
};
// Create task
const createTask = async (req, res) => {
    try {
        const { title, category, projectId } = req.body;

        // Check that project belongs to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const task = await Task.create({
            title,
            category,
            project: projectId,
            owner: req.user.userId
        });
        await updateProjectProgress(projectId);
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });
    }
};


// Get tasks for a project
const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Make sure project belongs to user
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const tasks = await Task.find({
            project: projectId,
            owner: req.user.userId
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};


// Update task
const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user.userId
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        await updateProjectProgress(task.project);

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};


// Delete task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        await updateProjectProgress(task.project);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};