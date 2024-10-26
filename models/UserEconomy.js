const mongoose = require("mongoose");

const userEconomySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  balance: { type: Number, default: 200 },
  lastDaily: { type: Date, default: null },
  lastWork: { type: Date, default: null },
  streak: { type: Number, default: 0 },
});

module.exports = mongoose.model("UserEconomy", userEconomySchema);
