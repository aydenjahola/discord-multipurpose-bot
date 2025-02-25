const mongoose = require("mongoose");

const quotaUsageSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  monthYear: {
    type: String,
    default: () => new Date().toISOString().substr(0, 7),
  },
  quotaUsed: { type: Number, default: 0 },
  quotaLimit: { type: Number, default: 100 }, // Set your desired limit
});

const QuotaUsage = mongoose.model("QuotaUsage", quotaUsageSchema);
module.exports = QuotaUsage;
