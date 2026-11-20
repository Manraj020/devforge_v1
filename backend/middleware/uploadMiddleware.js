const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDirectory = path.resolve(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(uploadsDirectory, { recursive: true }, (error) => {
            cb(error, uploadsDirectory);
        });
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;