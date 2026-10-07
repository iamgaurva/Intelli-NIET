require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const lostFoundRoutes = require("./routes/LostFound");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const app = express();

const PORT = process.env.PORT || 5000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 4
        }
    })
);
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/lost-found", lostFoundRoutes);
// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Test API
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.session.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
}

module.exports = {
    requireLogin,
    requireRole
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Intelli-NIET server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
    });