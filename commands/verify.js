const { SlashCommandBuilder } = require("discord.js");
const nodemailer = require("nodemailer");
const VerificationCode = require("../models/VerificationCode");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your account with your DCU email address")
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("Your DCU email address")
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

    const email = interaction.options.getString("email");
    const emailDomain = email.split("@")[1];
    const EMAIL_DOMAINS = process.env.EMAIL_DOMAINS.split(",");

    if (!EMAIL_DOMAINS.includes(emailDomain)) {
      return interaction.reply({
        content: "You must use a valid DCU email address.",
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

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1e90ff;">Your Esports Verification Code</h2>
          <p>Hi there,</p>
          <p>Your Esports verification code is:</p>
          <h3 style="background-color: #f4f4f4; padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center; color: #1e90ff;">
            ${verificationCode}
          </h3>
          <p>This code is valid for 10 minutes. Use it with the command <code>/code your_code</code>.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Best regards,<br>Esports Committee</p>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Esports Verification Code",
        html: emailHtml,
      });

      await VerificationCode.create({
        userId: interaction.user.id,
        email: email,
        code: verificationCode,
      });

      interaction.reply({
        content: `A verification code has been sent to your email. Use \`/code your_code\` to verify your account. The code is valid for 10 minutes.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error sending email or saving verification code:", err);
      interaction.reply({
        content: "There was an error sending the verification email.",
        ephemeral: true,
      });
    }
  },
};
