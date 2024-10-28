const mongoose = require("mongoose");

const spyfallLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("SpyfallLocation", spyfallLocationSchema);
