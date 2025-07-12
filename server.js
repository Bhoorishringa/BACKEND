// server.js (Unified Backend)

console.log("🔥 Running unified server.js from:", __dirname);
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const membershipRoutes = require("./routes/membershipRoutes");
const donationRoutes = require("./routes/donationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ ADDED

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // serve uploaded photos

// Routes
app.use("/api/members", membershipRoutes);   // Membership Form
app.use("/api/donate", donationRoutes);       // Donations
app.use("/api/contact", contactRoutes);       // Contact Us
app.use("/api/auth", authRoutes);             // ✅ User Auth (Login/Register)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () =>
    console.log(`🚀 Unified server running on http://localhost:${PORT}`)
  );
})
.catch((err) => {
  console.error("❌ DB Connection error:", err.message);
  process.exit(1); // Stop if DB is not connected
});
