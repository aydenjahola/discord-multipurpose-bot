const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  gamesPlayed: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

module.exports = Leaderboard;
