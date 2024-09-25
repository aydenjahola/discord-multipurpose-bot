const mongoose = require("mongoose");

const ServerSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, required: true },
  verifiedRoleName: { type: String, required: true },
  verificationChannelId: { type: String, required: true },
  generalChannelId: { type: String, required: true },
  emailDomains: { type: [String], required: true },
});

const ServerSettings = mongoose.model("ServerSettings", ServerSettingsSchema);
module.exports = ServerSettings;
