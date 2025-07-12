// controllers/donationController.js
const Razorpay = require("razorpay");
const Donation = require("../models/Donation");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // in paisa
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    email,
    mobile,
    amount,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const donation = new Donation({
        name,
        email,
        mobile,
        amount,
        paymentId: razorpay_payment_id,
        status: "Success",
        userId: req.userId || null, // Will be set if user is logged in
      });

      const savedDonation = await donation.save();
      console.log("✅ Donation saved:", savedDonation);

      res.json({ success: true, message: "Payment verified and donation recorded" });
    } catch (err) {
      console.error("❌ Error saving donation:", err);
      res.status(500).json({ success: false, message: "Failed to save donation" });
    }
  } else {
    console.warn("❌ Signature mismatch");
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

// ✅ Authenticated donation history route
exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (err) {
    console.error("❌ Error fetching donations:", err);
    res.status(500).json({ success: false, message: "Failed to fetch donations" });
  }
};
