const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  definition: { type: String, required: true },
});

module.exports = mongoose.model("Word", wordSchema);
