const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  phone_number: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiry_time: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

const OtpVerificationModel = mongoose.model('OtpVerification', otpVerificationSchema);

module.exports = OtpVerificationModel;
