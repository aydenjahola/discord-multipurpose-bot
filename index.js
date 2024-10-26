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
const seedShopItems = require("./utils/seedShopItems");

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

async function registerCommands(guildId) {
  const commands = client.commands.map((cmd) => cmd.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
      body: commands,
    });
    console.log(`🔄 Successfully registered commands for guild: ${guildId}`);
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

client.once("ready", async () => {
  console.log(`\n==============================`);
  console.log(`🤖 Logged in as ${client.user.tag}`);
  console.log(`==============================`);

  // Register commands for all existing guilds
  const guilds = client.guilds.cache.map((guild) => guild.id);

  // Seed the shop items
  for (const guildId of guilds) {
    await seedShopItems(guildId); // Pass guildId to seedShopItems
  }

  for (const guildId of guilds) {
    await registerCommands(guildId);
  }

  // Set bot status and activity
  client.user.setPresence({
    activities: [{ name: "Degenerate Gamers!", type: 3 }],
    status: "online",
  });

  console.log(`\n==============================\n`);
});

// Listen for new guild joins and register the guild ID in the database
client.on("guildCreate", async (guild) => {
  try {
    // Create a new entry in the ServerSettings collection with just the guildId
    await ServerSettings.create({ guildId: guild.id });
    console.log(`✅ Registered new server: ${guild.name} (ID: ${guild.id})`);

    // seed items for new guild with guildId
    await seedShopItems(guild.id);

    // Register slash commands for the new guild
    await registerCommands(guild.id);
  } catch (error) {
    console.error("Error registering new server or commands:", error);
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

client.on("error", (err) => {
  console.error("Client error:", err);
});

client.login(process.env.BOT_TOKEN);
