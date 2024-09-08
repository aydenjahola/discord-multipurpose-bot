const mongoose = require("mongoose");

const bannedUserSchema = new mongoose.Schema({
  bannedUserId: { type: String, required: true },
  bannedUserTag: { type: String, required: true },
  bannerId: { type: String, required: true },
  bannerTag: { type: String, required: true },
  reason: { type: String, default: "No reason provided" },
  bannedAt: { type: Date, default: Date.now },
});

const BannedUser = mongoose.model("BannedUser", bannedUserSchema);

module.exports = BannedUser;
