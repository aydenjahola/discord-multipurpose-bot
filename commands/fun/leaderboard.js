const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Leaderboard = require("../../models/Leaderboard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays the trivia leaderboard"),

  async execute(interaction, client) {
    const guild = interaction.guild;

    try {
      const scores = await Leaderboard.find()
        .sort({ correctAnswers: -1 })
        .limit(10);

      const leaderboardEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Trivia Leaderboard")
        .setDescription(
          scores
            .map(
              (entry, index) =>
                `${index + 1}. ${entry.username}: ${
                  entry.correctAnswers
                } correct answers in ${entry.gamesPlayed} games`
            )
            .join("\n")
        )
        .setTimestamp();

      if (guild.iconURL()) {
        leaderboardEmbed.setFooter({
          text: guild.name,
          iconURL: guild.iconURL(),
        });
      } else {
        leaderboardEmbed.setFooter({
          text: guild.name,
        });
      }

      await interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Error executing leaderboard command:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
