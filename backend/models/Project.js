const mongoose = require("mongoose");

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