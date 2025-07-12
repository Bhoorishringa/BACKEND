// routes/donationRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getUserDonations,
} = require("../controllers/donationController");
const auth = require("../middleware/authMiddleware");

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/my-donations", auth, getUserDonations);

module.exports = router;
