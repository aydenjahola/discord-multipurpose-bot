const mongoose = require("mongoose");

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("ShopItem", shopItemSchema);
