const mongoose = require("mongoose");

const userInventorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  itemId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("UserInventory", userInventorySchema);
