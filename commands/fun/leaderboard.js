const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Leaderboard = require("../../models/Leaderboard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays the trivia leaderboard"),

  async execute(interaction, client) {
    const guild = interaction.guild;

    try {
      // Fetch top 10 leaderboard entries sorted by correct answers
      const scores = await Leaderboard.find()
        .sort({ correctAnswers: -1 })
        .limit(10);

      // Fetch display names and avatars for each leaderboard entry
      const leaderboardEntries = await Promise.all(
        scores.map(async (entry, index) => {
          try {
            const member = await guild.members.fetch(entry.userId);
            const displayName = member ? member.displayName : entry.username; // Fallback if member not found
            const avatarUrl = member.user.displayAvatarURL({
              dynamic: true,
              size: 32,
            }); // Get avatar URL

            return {
              position: index + 1,
              name: displayName,
              correctAnswers: entry.correctAnswers,
              gamesPlayed: entry.gamesPlayed,
              avatarUrl: avatarUrl,
            };
          } catch (error) {
            console.error(
              `Error fetching member for userId: ${entry.userId}`,
              error
            );
            return {
              position: index + 1,
              name: entry.username,
              correctAnswers: entry.correctAnswers,
              gamesPlayed: entry.gamesPlayed,
              avatarUrl: null, // No avatar in case of error
            };
          }
        })
      );

      const leaderboardEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Trivia Leaderboard")
        .setTimestamp();

      // Add each leaderboard entry with avatar as a thumbnail
      leaderboardEntries.forEach((entry) => {
        const fieldValue = `${entry.correctAnswers} correct answers in ${entry.gamesPlayed} games`;

        leaderboardEmbed.addFields({
          name: `${entry.position}. ${entry.name}`,
          value: fieldValue,
          inline: false,
        });

        // Use the avatar URL as a thumbnail for each user entry
        leaderboardEmbed.setThumbnail(entry.avatarUrl || null);
      });

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
