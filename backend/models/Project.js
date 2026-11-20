const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Draft", "In Progress", "Completed"],
            default: "Draft"
        },
        progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
},

        frontend: {
            type: [String],
            default: []
        },

        backend: {
            type: [String],
            default: []
        },

        database: {
            type: [String],
            default: []
        },

        features: {
            type: [String],
            default: []
        },

        assets: {
            type: [assetSchema],
            default: []
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);