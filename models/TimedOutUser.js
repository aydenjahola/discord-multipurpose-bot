const mongoose = require("mongoose");

const timedOutUserSchema = new mongoose.Schema({
  timedOutUserId: { type: String, required: true },
  timedOutUserTag: { type: String, required: true },
  moderatorId: { type: String, required: true },
  moderatorTag: { type: String, required: true },
  reason: { type: String, default: "No reason provided" },
  timeoutEnd: { type: Date, required: true },
  timedOutAt: { type: Date, default: Date.now },
});

const TimedOutUser = mongoose.model("TimedOutUser", timedOutUserSchema);

module.exports = TimedOutUser;
