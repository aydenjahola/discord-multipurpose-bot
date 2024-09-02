const { SlashCommandBuilder } = require("discord.js");
const VerificationCode = require("../models/VerificationCode");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("code")
    .setDescription("Verify your account with a verification code")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Your verification code")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const code = interaction.options.getString("code");

    if (!code) {
      return interaction.reply({
        content: "Please provide the verification code.",
        ephemeral: true,
      });
    }

    try {
      const verificationEntry = await VerificationCode.findOne({
        userId: interaction.user.id,
        code,
      });

      if (!verificationEntry) {
        return interaction.reply({
          content: "Invalid or expired verification code. Please try again.",
          ephemeral: true,
        });
      }

      const guild = client.guilds.cache.get(process.env.GUILD_ID);

      if (!guild) {
        console.error("Guild not found.");
        return interaction.reply({
          content: "Guild not found.",
          ephemeral: true,
        });
      }

      const member = guild.members.cache.get(interaction.user.id);

      if (!member) {
        console.error("Member not found in the guild.");
        return interaction.reply({
          content: "Member not found in the guild.",
          ephemeral: true,
        });
      }

      const role = guild.roles.cache.find(
        (r) => r.name === process.env.VERIFIED_ROLE_NAME
      );

      if (!role) {
        console.error(`Role "${process.env.VERIFIED_ROLE_NAME}" not found.`);
        return interaction.reply({
          content: `Role "${process.env.VERIFIED_ROLE_NAME}" not found.`,
          ephemeral: true,
        });
      }

      if (member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: "You are already verified!",
          ephemeral: true,
        });
      }

      await member.roles.add(role);

      interaction.reply({
        content: `Congratulations ${interaction.user.username}, you have been verified!`,
        ephemeral: true,
      });

      // the verification code is no longer needed, but it will automatically be deleted after 10 minutes
      await VerificationCode.deleteOne({ userId: interaction.user.id, code });
    } catch (err) {
      console.error("Error processing verification code:", err);
      interaction.reply({
        content:
          "There was an error processing your verification. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
