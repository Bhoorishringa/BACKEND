// backend/routes/membershipRoutes.js


const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const membershipController = require('../controllers/membershipController');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Routes
router.post('/send-mobile-otp', membershipController.sendMobileOTP);
router.post('/verify-mobile-otp', membershipController.verifyMobileOTP);
router.post('/send-email-otp', membershipController.sendEmailOTP);
router.post('/verify-email-otp', membershipController.verifyEmailOTP);
router.post('/submit', upload.single('photo'), membershipController.submitMembershipForm);

module.exports = router;
