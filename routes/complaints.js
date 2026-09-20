const express = require("express");
const Complaint = require("../models/Complaint");
const { requireLogin, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Faculty: submit complaint
router.post("/", requireLogin, requireRole("faculty"), async (req, res) => {
    try {
        const {
            title,
            category,
            priority,
            block,
            floor,
            room,
            description
        } = req.body;

        if (!title || !category || !block || !description) {
            return res.status(400).json({
                success: false,
                message: "Title, category, block and description are required"
            });
        }

        const complaintId = `CMP-${Date.now()}`;

        const complaint = await Complaint.create({
            complaintId,
            title,
            faculty: req.session.user.id,
            category,
            priority: priority || "MEDIUM",
            block,
            floor,
            room,
            description
        });

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            complaint
        });

    } catch (error) {
        console.error("Complaint creation error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to submit complaint"
        });
    }
});


// Faculty: get own complaints
router.get("/my", requireLogin, requireRole("faculty"), async (req, res) => {
    try {
        const complaints = await Complaint.find({
            faculty: req.session.user.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            complaints
        });

    } catch (error) {
        console.error("Fetching faculty complaints error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch complaints"
        });
    }
});


// Admin: get all complaints
router.get("/all", requireLogin, requireRole("admin"), async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("faculty", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            complaints
        });

    } catch (error) {
        console.error("Fetching all complaints error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch complaints"
        });
    }
});

router.put("/:complaintId/status", requireLogin, requireRole("admin"), async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "SUBMITTED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED",
            "REOPENED",
            "DELAYED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid complaint status"
            });
        }

        const complaint = await Complaint.findOneAndUpdate(
            { complaintId: req.params.complaintId },
            { status },
            { new: true }
        ).populate("faculty", "name email");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            message: "Complaint status updated successfully",
            complaint
        });

    } catch (error) {
        console.error("Status update error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update complaint status"
        });
    }
});

module.exports = router;