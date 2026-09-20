const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        complaintId: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true
        },

        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM"
        },

        block: {
            type: String,
            required: true
        },

        floor: {
            type: String
        },

        room: {
            type: String
        },

        description: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "SUBMITTED",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED",
                "REOPENED",
                "DELAYED"
            ],
            default: "SUBMITTED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Complaint", complaintSchema);