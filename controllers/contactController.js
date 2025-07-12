const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

const submitContactForm = async (req, res) => {
  try {
    console.log("📨 Received contact form submission:", req.body);

    const { firstName, lastName, email, mobile, subject, message } = req.body;

    // Field validation
    if (!firstName || !lastName || !email || !mobile || !subject || !message) {
      console.warn("❌ Missing required fields:", req.body);
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create contact entry
    const contact = new Contact({ firstName, lastName, email, mobile, subject, message });

    // Try saving to MongoDB
    try {
      await contact.save();
      console.log("✅ Contact saved to MongoDB");
    } catch (saveErr) {
      console.error("❌ Error saving to MongoDB:", saveErr);
      return res.status(500).json({ message: "Failed to save contact data." });
    }

    // Check if email env vars are loaded
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS is missing from .env");
      return res.status(500).json({ message: "Email configuration is missing." });
    }

    // Configure email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter
    transporter.verify((err, success) => {
      if (err) {
        console.error("❌ SMTP transport verification failed:", err);
      } else {
        console.log("✅ SMTP server is ready to take messages");
      }
    });

    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${firstName} ${lastName}`,
      text: `
Subject: ${subject}
Message: ${message}
Name: ${firstName} ${lastName}
Email: ${email}
Mobile: ${mobile}
      `,
    };

    // Send email
    try {
      const emailResult = await transporter.sendMail(mailOptions);
      console.log("📧 Email sent:", emailResult.response);
    } catch (emailErr) {
      console.error("❌ Error sending email:", emailErr);
      return res.status(500).json({ message: "Message saved but failed to send email." });
    }

    // Success response
    return res.status(200).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Unexpected error in contactController:", error);
    return res.status(500).json({ message: "Error sending message. Please try again later." });
  }
};

module.exports = { submitContactForm };
