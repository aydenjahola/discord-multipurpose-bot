const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const gameStatusEnum = {
  values: ["ongoing", "ended"],
  message: 'Status must be either "ongoing" or "ended"',
};

const spyfallGameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true, default: uuidv4 },
  guildId: { type: String, required: true },
  location: { type: String, required: true },
  spy: { type: String, required: true },
  players: { type: [String], required: true },
  status: { type: String, enum: gameStatusEnum, default: "ongoing" },
});

module.exports = mongoose.model("SpyfallGame", spyfallGameSchema);
