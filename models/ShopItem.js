const mongoose = require("mongoose");

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  rarity: {
    type: String,
    enum: ["Common", "Rare", "Epic", "Legendary"],
    default: "Common",
  },
});

module.exports = mongoose.model("ShopItem", shopItemSchema);
