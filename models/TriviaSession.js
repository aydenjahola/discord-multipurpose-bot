const mongoose = require("mongoose");

const triviaSessionSchema = new mongoose.Schema({
  token: { type: String, required: true },
  last_updated: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive"], default: "active" }, // Add status field
});

module.exports = mongoose.model("TriviaSession", triviaSessionSchema);
