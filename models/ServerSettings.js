const mongoose = require("mongoose");

const ServerSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, required: false },
  verifiedRoleName: { type: String, required: false },
  verificationChannelId: { type: String, required: false },
  generalChannelId: { type: String, required: false },
  emailDomains: { type: [String], required: false },
  actionItemsChannelId: { type: String, required: false },
  actionItemsTargetChannelId: { type: String, required: false },
});

const ServerSettings = mongoose.model("ServerSettings", ServerSettingsSchema);

module.exports = ServerSettings;
