const mongoose = require("mongoose");

const triviaQuestionSchema = new mongoose.Schema({
  question: String,
  correct_answer: String,
  incorrect_answers: [String],
  last_served: Date, // Track when the question was last served
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TriviaQuestion", triviaQuestionSchema);
