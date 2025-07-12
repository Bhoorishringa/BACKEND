const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  flat: String,
  line2: String,
  city: String,
  country: String,
  state: String,
  district: String,
  pin: String,
}, { _id: false });

const memberSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fatherName: String,
  motherName: String,
  dob: Date,
  gender: String,
  maritalStatus: String,
  mobile: String,
  email: String,
  bloodGroup: String,
  education: String,
  profession: String,
  corrAddress: addressSchema,
  permAddress: addressSchema,
  ideology: String,
  otherAffiliation: String,
  contribution: String,
  photo: String // Base64 or cloud URL
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
