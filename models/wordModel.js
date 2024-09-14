const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  definition: { type: String, required: true },
  partOfSpeech: { type: String, default: "Unknown" },
  attributionText: { type: String, default: "No attribution" },
  sourceDictionary: { type: String, default: "Unknown source" },
  synonyms: { type: [String], default: [] },
  antonyms: { type: [String], default: [] },
  exampleSentence: { type: String, default: "No examples found" },
  wordnikUrl: { type: String, default: "" },
  attributionUrl: { type: String, default: "" },
});

module.exports = mongoose.model("Word", wordSchema);
