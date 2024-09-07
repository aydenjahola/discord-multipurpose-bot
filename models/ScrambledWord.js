const mongoose = require("mongoose");

const scrambledWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  scrambled: { type: String, required: true },
  created_at: { type: Date, required: true },
});

module.exports = mongoose.model("ScrambledWord", scrambledWordSchema);
