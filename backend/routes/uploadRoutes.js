const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");
const {
    validateUploadProject,
    uploadFile,
    handleUploadError
} = require("../controllers/uploadController");

const router = express.Router();

router.post(
    "/",
    protect,
    upload.single("file"),
    validateUploadProject,
    uploadFile,
    handleUploadError
);

module.exports = router;