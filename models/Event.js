const mongoose = require("mongoose");

const Participant = require("./Participant");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["tournamets", "meeting", "giveaway", "other"],
    default: "other",
  },
  location: { type: String, default: "Online" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizerId: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Participant" }],
  recurrence: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
  },
});

module.exports = mongoose.model("Event", eventSchema);
