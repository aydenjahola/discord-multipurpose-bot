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
    // Ensure command is only used in the specified verification channel
    const verificationChannelName = process.env.VERIFICATION_CHANNEL_NAME;
    if (interaction.channel.name !== verificationChannelName) {
      return interaction.reply({
        content: `This command can only be used in the #${verificationChannelName} channel.`,
        ephemeral: true,
      });
    }

    const code = interaction.options.getString("code");

    if (!code) {
      return interaction.reply({
        content:
          "Please provide the verification code sent to your email address.",
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
          content: "The guild could not be found.",
          ephemeral: true,
        });
      }

      const member = guild.members.cache.get(interaction.user.id);

      if (!member) {
        console.error("Member not found in the guild.");
        return interaction.reply({
          content: "You are not a member of the guild.",
          ephemeral: true,
        });
      }

      const role = guild.roles.cache.find(
        (r) => r.name === process.env.VERIFIED_ROLE_NAME
      );

      if (!role) {
        console.error(`Role "${process.env.VERIFIED_ROLE_NAME}" not found.`);
        return interaction.reply({
          content: `The role "${process.env.VERIFIED_ROLE_NAME}" could not be found.`,
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
      await VerificationCode.deleteOne({ userId: interaction.user.id, code });

      // Get the admin log channel
      const adminLogChannel = client.channels.cache.get(
        process.env.ADMIN_LOG_CHANNEL_ID
      );

      if (adminLogChannel) {
        // Send the log message
        await adminLogChannel.send({
          content: `🎉 **Verification Success**\nUser: <@${interaction.user.id}> (${interaction.user.tag})\nRole: ${role.name}`,
        });
      } else {
        console.error("Admin log channel not found.");
      }

      return interaction.reply({
        content: `Congratulations <@${interaction.user.id}>, you have been verified!`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error processing verification code:", err);
      return interaction.reply({
        content:
          "There was an error processing your verification. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
