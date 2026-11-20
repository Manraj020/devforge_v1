const fs = require("fs/promises");
const mongoose = require("mongoose");
const multer = require("multer");
const Project = require("../models/Project");

async function removeTemporaryUpload(req) {
    if (!req.file?.path) {
        return;
    }

    try {
        await fs.unlink(req.file.path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Could not remove rejected upload:", error.message);
        }
    }
}

const validateUploadProject = async (req, res, next) => {
    const { projectId } = req.body;

    if (!projectId) {
        await removeTemporaryUpload(req);
        return res.status(400).json({
            success: false,
            message: "Project ID is required"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        await removeTemporaryUpload(req);
        return res.status(400).json({
            success: false,
            message: "Invalid project ID"
        });
    }

    try {
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            await removeTemporaryUpload(req);
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        req.project = project;
        next();
    } catch (error) {
        next(error);
    }
};

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    try {
        const asset = {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: `/uploads/${encodeURIComponent(req.file.filename)}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date()
        };

        req.project.assets.push(asset);
        await req.project.save();

        const savedAsset = req.project.assets[req.project.assets.length - 1];
        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            asset: savedAsset
        });
    } catch (error) {
        await removeTemporaryUpload(req);
        console.error("Could not save uploaded asset metadata:", error.message);
        return res.status(500).json({
            success: false,
            message: "File was uploaded but its project metadata could not be saved"
        });
    }
};

const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "File exceeds the 5 MB upload limit"
            : error.code === "LIMIT_UNEXPECTED_FILE"
                ? "Unexpected file field. Use the 'file' field."
                : "Invalid file upload";

        return res.status(statusCode).json({
            success: false,
            message
        });
    }

    return next(error);
};

module.exports = {
    validateUploadProject,
    uploadFile,
    handleUploadError
};
