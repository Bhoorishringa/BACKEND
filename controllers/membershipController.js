const axios = require("axios");
const nodemailer = require("nodemailer");
const Member = require("../models/Member");

// In-memory OTP storage (Use Redis or DB in production)
const emailOTPs = {};
const mobileOTPs = {};

// ---------- ✅ Send Mobile OTP via Fast2SMS ----------
const sendMobileOTP = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: "Mobile number required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  mobileOTPs[mobile] = otp;
  console.log("📲 Sending Mobile OTP:", mobile, "OTP:", otp);

  const message = `Your OTP for verification is ${otp}`;
  const data = {
    sender_id: "FSTSMS",
    message,
    language: "english",
    route: "q",
    numbers: mobile,
  };

  try {
    const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", data, {
      headers: {
        authorization: process.env.FAST2SMS_API,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Fast2SMS response:", response.data);

    if (response.data.return === true) {
      res.status(200).json({ success: true, message: "OTP sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Fast2SMS failed", details: response.data });
    }

  } catch (err) {
    console.error("❌ SMS error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
      error: err.response?.data || err.message,
    });
  }
};

const verifyMobileOTP = (req, res) => {
  const { mobile, otp } = req.body;
  if (mobileOTPs[mobile] === otp) {
    delete mobileOTPs[mobile];
    res.json({ success: true, message: "Mobile OTP verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

// ---------- ✅ Send Email OTP ----------
const sendEmailOTP = async (req, res) => {
  const { email } = req.body;

  console.log("📧 Email OTP request received for:", email);

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
    return res.status(500).json({ success: false, message: "Server email config missing" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  emailOTPs[email] = otp;
  console.log(`📧 Sending Email OTP to ${email}: ${otp}`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Email transporter verification failed:", err);
    } else {
      console.log("✅ Email transporter is ready");
    }
  });

  const mailOptions = {
    from: `"Membership Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Email OTP",
    text: `Your OTP is: ${otp}`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", email);
    console.log("📬 Response from Gmail:", result.response);
    res.json({ success: true, message: "Email OTP sent" });
  } catch (error) {
    console.error("❌ Failed to send email OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send email OTP", error });
  }
};

const verifyEmailOTP = (req, res) => {
  const { email, otp } = req.body;
  if (emailOTPs[email] === otp) {
    delete emailOTPs[email];
    res.json({ success: true, message: "Email OTP verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

// ---------- ✅ Submit Membership Form ----------
const submitMembershipForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      motherName,
      dob,
      gender,
      maritalStatus,
      mobile,
      email,
      bloodGroup,
      education,
      profession,
      ideology,
      otherAffiliation,
      contribution,
      corrAddress,
      permAddress,
    } = req.body;

    console.log("📥 Membership form received for:", firstName, lastName);

    const newMember = new Member({
      firstName,
      lastName,
      fatherName,
      motherName,
      dob,
      gender,
      maritalStatus,
      mobile,
      email,
      bloodGroup,
      education,
      profession,
      ideology,
      otherAffiliation,
      contribution,
      corrAddress,
      permAddress,
      photo: req.file ? req.file.filename : null,
    });

    await newMember.save();
    console.log("✅ New member saved:", email);
    res.status(201).json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("❌ Save error in submitMembershipForm:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ---------- ✅ Export ----------
module.exports = {
  sendEmailOTP,
  verifyEmailOTP,
  sendMobileOTP,
  verifyMobileOTP,
  submitMembershipForm,
};
