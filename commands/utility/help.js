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
        .setDescription("Here are all the available commands:")
        .setTimestamp()
        .setFooter({
          text: `${serverName}`,
          iconURL: client.user.displayAvatarURL(),
        });

      // Add general commands
      client.commands.forEach((command) => {
        if (!command.isModOnly) {
          helpEmbed.addFields({
            name: `/${command.data.name}`,
            value: command.data.description,
            inline: false,
          });
        }
      });

      // Add mod-only commands if the user is a mod
      if (isMod) {
        client.commands.forEach((command) => {
          if (command.isModOnly) {
            helpEmbed.addFields({
              name: `/${command.data.name}`,
              value: command.data.description + " (Mods only)",
              inline: false,
            });
          }
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
