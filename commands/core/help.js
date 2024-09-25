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
      // Check if the user has the Manage Roles permission
      const isMod = interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageRoles
      );

      const serverName = interaction.guild.name;

      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Available Commands")
        .setDescription(
          "This bot comes from an Open Source project developed by [Ayden](https://github.com/aydenjahola/discord-multipurpose-bot)\n\nHere are all the available commands:"
        )
        .setTimestamp()
        .setFooter({
          text: `${serverName} || Made with ❤️ by Ayden`,
          iconURL: client.user.displayAvatarURL(),
        });

      // Group commands into general and mod-only
      const generalCommands = [];
      const modCommands = [];

      client.commands.forEach((command) => {
        const commandLine = `/${command.data.name} - ${command.data.description}`;
        if (!command.isModOnly) {
          generalCommands.push(commandLine);
        } else if (isMod) {
          modCommands.push(`${commandLine} (Mods only)`);
        }
      });

      helpEmbed.addFields({
        name: `General Commands (${generalCommands.length} available)`,
        value:
          generalCommands.length > 0
            ? generalCommands.join("\n")
            : "No general commands available.",
        inline: false,
      });

      if (isMod) {
        helpEmbed.addFields({
          name: `Mod-Only Commands (${modCommands.length} available)`,
          value:
            modCommands.length > 0
              ? modCommands.join("\n")
              : "No mod-only commands available.",
          inline: false,
        });
      }

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
