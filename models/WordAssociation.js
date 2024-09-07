const mongoose = require("mongoose");

const wordAssociationSchema = new mongoose.Schema({
  word: { type: String, required: true },
  associatedWords: [{ type: String }],
  last_updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WordAssociation", wordAssociationSchema);
