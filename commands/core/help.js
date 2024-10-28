const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all available commands"),

  async execute(interaction, client) {
    try {
      const isMod = interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageRoles
      );

      const serverName = interaction.guild.name;
      const generalCommands = [];
      const modCommands = [];

      // Categorize commands
      client.commands.forEach((command) => {
        const commandLine = `/${command.data.name} - ${command.data.description}`;
        if (!command.isModOnly) {
          generalCommands.push(commandLine);
        } else if (isMod) {
          modCommands.push(`${commandLine} (Mods only)`);
        }
      });

      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Available Commands")
        .setDescription(
          "This bot comes from an Open Source project developed by [Ayden](https://github.com/aydenjahola/discord-multipurpose-bot)\n\nHere are all the available commands:"
        )
        .setTimestamp()
        .setFooter({
          text: `${serverName} | Made with ❤️ by Ayden`,
          iconURL: client.user.displayAvatarURL(),
        });

      // Function to split commands into fields under 1024 characters
      const addCommandFields = (embed, commands, title) => {
        let commandChunk = "";
        let chunkCount = 1;

        commands.forEach((command) => {
          // Check if adding this command will exceed the 1024 character limit
          if ((commandChunk + command).length > 1024) {
            // Add current chunk as a new field
            embed.addFields({
              name: `${title} (Part ${chunkCount})`,
              value: commandChunk,
            });
            commandChunk = ""; // Reset chunk for new field
            chunkCount += 1;
          }
          // Append command to the current chunk
          commandChunk += command + "\n";
        });

        // Add any remaining commands in the last chunk
        if (commandChunk) {
          embed.addFields({
            name: `${title} (Part ${chunkCount})`,
            value: commandChunk,
          });
        }
      };

      // Add general commands in fields
      if (generalCommands.length > 0) {
        addCommandFields(helpEmbed, generalCommands, "General Commands");
      }

      // Add mod-only commands in fields, if user is a mod
      if (isMod && modCommands.length > 0) {
        addCommandFields(helpEmbed, modCommands, "Mod-Only Commands");
      }

      // Send the single embed
      await interaction.reply({
        embeds: [helpEmbed],
      });
    } catch (error) {
      console.error("Error executing the help command:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
