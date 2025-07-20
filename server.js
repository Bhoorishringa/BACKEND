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
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORRECT CORS SETUP
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-five-jade-64.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // serve uploaded photos

// Routes
app.use("/api/members", membershipRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("🚀 Gaushala Backend is live and working!");
});

// DB Connection
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
  process.exit(1);
});
