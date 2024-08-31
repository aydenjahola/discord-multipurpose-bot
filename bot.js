require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const VerificationCode = require("./models/VerificationCode");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const VERIFIED_ROLE_NAME = process.env.VERIFIED_ROLE_NAME; // Role name to assign after verification
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN; // Domain to verify against
const GUILD_ID = process.env.GUILD_ID; // Guild ID to restrict the bot
const VERIFICATION_CHANNEL_NAME = process.env.VERIFICATION_CHANNEL_NAME; // Channel name to restrict the bot

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    // Ensure bot only operates in the designated channel
    const verificationChannel = message.guild.channels.cache.find(
      (channel) => channel.name === VERIFICATION_CHANNEL_NAME
    );

    if (!message.guild || !verificationChannel) {
      console.error("Guild or verification channel not found.");
      return;
    }

    if (message.author.bot || message.channel.id !== verificationChannel.id)
      return;

    if (message.content.startsWith("!verify")) {
      const email = message.content.split(" ")[1];

      if (!email) {
        return verificationChannel.send(
          "Please provide your email address. Usage: `!verify your_email@mail.dcu.ie`"
        );
      }

      const emailDomain = email.split("@")[1];
      if (emailDomain !== EMAIL_DOMAIN) {
        return verificationChannel.send(
          "You must use a valid DCU student email address."
        );
      }

      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) {
        console.error("Guild not found.");
        return;
      }

      const member = guild.members.cache.get(message.author.id);
      if (!member) {
        console.error("Member not found.");
        return;
      }

      const role = guild.roles.cache.find((r) => r.name === VERIFIED_ROLE_NAME);
      if (!role) {
        console.error("Role not found.");
        return;
      }

      if (member.roles.cache.has(role.id)) {
        return verificationChannel.send("You are already verified!");
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #1e90ff;">Your Verification Code</h2>
            <p>Hi there,</p>
            <p>Thank you for requesting verification. Your verification code is:</p>
            <h3 style="background-color: #f4f4f4; padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center; color: #1e90ff;">
              ${verificationCode}
            </h3>
            <p>This code is valid for 10 minutes. Please enter it in the Discord channel using the command <code>!code your_code</code>.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Best regards,<br>Esports Committee</p>
          </body>
        </html>
      `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Esports Verification Code",
          html: emailHtml, // Use HTML content
        });

        await VerificationCode.create({
          userId: message.author.id,
          email: email,
          code: verificationCode,
        });

        verificationChannel.send(
          `**A verification code has been sent to your email.**\n` +
            `Please reply with \`!code your_code\` to verify your account.\n` +
            `**Note:** The code is only valid for **10 minutes**.`
        );
      } catch (err) {
        console.error("Error sending email or saving verification code:", err);
        verificationChannel.send(
          "There was an error sending the verification email."
        );
      }
    }

    if (message.content.startsWith("!code")) {
      const code = message.content.split(" ")[1];

      if (!code) {
        return verificationChannel.send(
          "Please provide the verification code. Usage: `!code your_code`"
        );
      }

      try {
        const verificationEntry = await VerificationCode.findOne({
          userId: message.author.id,
          code,
        });

        if (!verificationEntry) {
          return verificationChannel.send(
            "Invalid or expired verification code. Please try again."
          );
        }

        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
          console.error("Guild not found.");
          return;
        }

        const member = guild.members.cache.get(message.author.id);
        if (!member) {
          console.error("Member not found.");
          return;
        }

        const role = guild.roles.cache.find(
          (r) => r.name === VERIFIED_ROLE_NAME
        );
        if (!role) {
          console.error("Role not found.");
          return;
        }

        if (member.roles.cache.has(role.id)) {
          return verificationChannel.send("You are already verified!");
        }

        await member.roles.add(role);
        verificationChannel.send(
          `Congratulations ${message.author}, you have been verified!`
        );

        // No need to manually delete the verification entry, as it will expire automatically in 10 minutes
      } catch (err) {
        console.error("Error processing verification code:", err);
        verificationChannel.send(
          "There was an error processing your verification. Please try again later."
        );
      }
    }
  } catch (err) {
    console.error("Unhandled error in messageCreate event:", err);
  }
});

client.on("error", (err) => {
  console.error("Client error:", err);
});

client.login(process.env.BOT_TOKEN);
