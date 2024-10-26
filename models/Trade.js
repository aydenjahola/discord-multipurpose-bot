const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  coins: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" },
});

module.exports = mongoose.model("Trade", tradeSchema);
