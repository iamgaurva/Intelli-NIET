const express = require("express");

const LostFound = require("../models/LostFound");

const {
    requireLogin,
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


/* =========================================
   CREATE LOST / FOUND REPORT
========================================= */

router.post(
    "/",
    requireLogin,
    requireRole("faculty"),
    async (req, res) => {

        try {

            const {
                type,
                itemName,
                description,
                location,
                date,
                imageUrl
            } = req.body;


            /* ==============================
               VALIDATION
            ============================== */

            if (!type) {

                return res.status(400).json({
                    success: false,
                    message: "Item type is required"
                });
            }


            if (!["LOST", "FOUND"].includes(type)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid item type"
                });
            }


            if (!itemName || !itemName.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Item name is required"
                });
            }


            if (!description || !description.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Description is required"
                });
            }


            if (!date) {

                return res.status(400).json({
                    success: false,
                    message: "Date is required"
                });
            }


            /* ==============================
               CREATE UNIQUE ITEM ID
            ============================== */

            const itemId =
                `LF-${Date.now()}-${Math.floor(
                    Math.random() * 1000
                )}`;


            /* ==============================
               CREATE DATABASE RECORD
            ============================== */

            const item =
                await LostFound.create({

                    itemId,

                    type,

                    itemName:
                        itemName.trim(),

                    description:
                        description.trim(),

                    location:
                        location
                            ? location.trim()
                            : "",

                    date,

                    imageUrl:
                        imageUrl || "",

                    reportedBy:
                        req.session.user.id,

                    status:
                        "ACTIVE"
                });


            /* ==============================
               RESPONSE
            ============================== */

            return res.status(201).json({

                success: true,

                message:
                    "Report submitted",

                item
            });


        } catch (error) {

            console.error(
                "Create Lost & Found error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to submit report"
            });
        }
    }
);


/* =========================================
   GET ALL ACTIVE FOUND ITEMS
========================================= */

router.get(
    "/found",
    requireLogin,
    async (req, res) => {

        try {

            const items =
                await LostFound.find({

                    type: "FOUND",

                    status: "ACTIVE"

                })
                    .populate(
                        "reportedBy",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });


            return res.json({

                success: true,

                items
            });


        } catch (error) {

            console.error(
                "Fetch found items error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load found items"
            });
        }
    }
);


/* =========================================
   GET MY LOST REPORTS
========================================= */

router.get(
    "/my",
    requireLogin,
    requireRole("faculty"),
    async (req, res) => {

        try {

            const items =
                await LostFound.find({

                    type: "LOST",

                    reportedBy:
                        req.session.user.id

                })
                    .sort({
                        createdAt: -1
                    });


            return res.json({

                success: true,

                items
            });


        } catch (error) {

            console.error(
                "Fetch my lost reports error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load your lost reports"
            });
        }
    }
);


/* =========================================
   GET MY FOUND REPORTS
========================================= */

router.get(
    "/my-found",
    requireLogin,
    requireRole("faculty"),
    async (req, res) => {

        try {

            const items =
                await LostFound.find({

                    type: "FOUND",

                    reportedBy:
                        req.session.user.id

                })
                    .sort({
                        createdAt: -1
                    });


            return res.json({

                success: true,

                items
            });


        } catch (error) {

            console.error(
                "Fetch my found reports error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load your found reports"
            });
        }
    }
);


/* =========================================
   DELETE REPORT
========================================= */

router.delete(
    "/:itemId",
    requireLogin,
    requireRole("faculty"),
    async (req, res) => {

        try {

            const item =
                await LostFound.findOne({
                    itemId:
                        req.params.itemId
                });


            if (!item) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Report not found"
                });
            }


            /* Faculty can delete only
               their own report */

            if (
                item.reportedBy.toString() !==
                req.session.user.id.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete your own report"
                });
            }


            await LostFound.deleteOne({
                _id: item._id
            });


            return res.json({

                success: true,

                message:
                    "Report deleted successfully"
            });


        } catch (error) {

            console.error(
                "Delete Lost & Found error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete report"
            });
        }
    }
);
module.exports = router;

