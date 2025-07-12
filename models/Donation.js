// models/Donation.js
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, name: String,
  email: String,
  mobile: String,
  amount: Number,
  paymentId: String,
  status: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model("Donation", donationSchema);
