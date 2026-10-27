const Project = require("../models/Project");

// Create a new project
const createProject = async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            frontend,
            backend,
            database,
            features
        } = req.body;

        const project = await Project.create({
            name,
            description,
            type,
            frontend,
            backend,
            database,
            features,
            owner: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        });
    }
};


// Get all projects of logged-in user
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.userId
        });

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};


// Get a single project of logged-in user
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch project",
            error: error.message
        });
    }
};


// Update a project of logged-in user
const updateProject = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
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

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message
        });
    }
};


// Delete a project of logged-in user
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete project",
            error: error.message
        });
    }
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};