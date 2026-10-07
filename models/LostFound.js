const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
    {
        itemId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        type: {
            type: String,
            enum: ["LOST", "FOUND"],
            required: true,
            index: true
        },

        itemName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            default: "",
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        imageUrl: {
            type: String,
            default: ""
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "CLAIMED", "CLOSED"],
            default: "ACTIVE",
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "LostFound",
    lostFoundSchema
);