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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GUIlD_ID = process.env.GUILD_ID;

client.commands = new Collection();

const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log(`Logges in as ${client.user.tag}`);

  const commands = client.commands.map((cmd) => cmd.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUIlD_ID), {
      body: commands,
    });
    console.log("Successfully registered application commands.");
  } catch (err) {
    console.error("Error registering application commands:", err);
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("Error", (err) => {
  console.error("Client error:", err);
});

client.login(process.env.BOT_TOKEN);
