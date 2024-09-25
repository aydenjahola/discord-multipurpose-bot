require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const ServerSettings = require("./models/ServerSettings");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Function to recursively read commands from subdirectories
function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      // If it's a directory, recurse into it
      loadCommands(filePath);
    } else if (file.endsWith(".js")) {
      // If it's a JavaScript file, load the command
      const command = require(filePath);
      client.commands.set(command.data.name, command);
    }
  }
}

// Load all commands from the commands directory and its subdirectories
loadCommands(path.join(__dirname, "commands"));

client.once("ready", async () => {
  console.log(`\n==============================`);
  console.log(`🤖 Logged in as ${client.user.tag}`);
  console.log(`==============================`);
  console.log(`📋 Registered Commands:\n`);
  client.commands.forEach((command) => {
    console.log(`🔹 /${command.data.name} - ${command.data.description}`);
  });
  console.log(`\n==============================\n`);

  const commands = client.commands.map((cmd) => cmd.data.toJSON());

  // Set bot status and activity
  client.user.setPresence({
    activities: [{ name: "Degenerate Gamers!", type: 3 }],
    status: "online",
  });

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  // Fetching the guild ID from MongoDB
  let GUILD_ID;
  try {
    const serverSettings = await ServerSettings.findOne();
    if (serverSettings) {
      GUILD_ID = serverSettings.guildId;
    } else {
      console.error("No server settings found in MongoDB.");
      return;
    }

    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands,
    });
    console.log("Successfully registered all application commands.");
  } catch (err) {
    console.error("Error registering application commands:", err);
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB", err));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error("Error executing command:", err);
    if (interaction.deferred || interaction.ephemeral) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("Error", (err) => {
  console.error("Client error:", err);
});

client.login(process.env.BOT_TOKEN);
