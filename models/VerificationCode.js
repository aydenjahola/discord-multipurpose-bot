const mongoose = require("mongoose");

const VerificationCodeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, expires: "10m", default: Date.now }, // Code expires in 10 minutes
});

module.exports = mongoose.model("VerificationCode", VerificationCodeSchema);
