const mongoose = require("mongoose");

const kickedUserSchema = new mongoose.Schema({
  kickedUserId: { type: String, required: true },
  kickedUserTag: { type: String, required: true },
  kickerId: { type: String, required: true },
  kickerTag: { type: String, required: true },
  reason: { type: String, default: "No reason provided" },
  kickedAt: { type: Date, default: Date.now },
});

const KickedUser = mongoose.model("KickedUser", kickedUserSchema);

module.exports = KickedUser;
