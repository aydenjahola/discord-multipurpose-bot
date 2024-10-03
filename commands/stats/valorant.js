const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("valstats")
    .setDescription("Fetches Valorant player stats.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription(
          "The Valorant username to fetch stats for (e.g., Shitter#1234)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("stats_type")
        .setDescription("Type of stats to fetch")
        .addChoices(
          { name: "Current Act Stats", value: "current" },
          { name: "All Acts Stats", value: "all" }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    const statsType = interaction.options.getString("stats_type");

    // Convert the username by replacing "#" with "%23"
    const formattedUsername = username.replace("#", "%23");
    const apiKeyUrl = process.env.TRACKER_API_URL;
    const apiKey = process.env.TRACKER_API_KEY;

    const url = `https://${apiKeyUrl}/valorant/player/${formattedUsername}/${statsType}`;

    try {
      await interaction.deferReply();

      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const data = response.data;

      const statsEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${data.username}'s Valorant Stats`)
        .setDescription(`${data.username}'s **${data.season}** stats`)
        .addFields(
          {
            name: "🏆 Current Rank",
            value: data.current_rank,
          },
          {
            name: "🔝 Peak Rank",
            value: `${data.peak_rank} (${data.peak_rank_episode})`,
          },
          {
            name: "⏳ Hours Played",
            value: `${data.hours_played}h`,
          },
          {
            name: "🎮 Matches Played",
            value: `${data.matches_played}`,
          },
          { name: "🏅 Wins", value: `${data.wins}` },
          {
            name: "📊 Win Percentage",
            value: `${data.win_percentage}%`,
          },
          { name: "⚔️ Kills", value: `${data.kills}` },
          {
            name: "📈 K/D Ratio",
            value: `${data.kd_ratio}`,
          },
          {
            name: "📊 ACS",
            value: `${data.acs}`,
          },
          {
            name: "🎯 Headshot Percentage",
            value: `${data.headshot_percentage}%`,
          }
        );

      // Add the Tracker Score field only if statsType is "current"
      if (statsType === "current") {
        statsEmbed.addFields({
          name: "💯 Tracker Score",
          value: `${data.tracker_score}/1000`,
        });
      }

      statsEmbed.setTimestamp().setFooter({
        text: "Valorant Stats API made by Ayden",
        iconURL: interaction.guild.iconURL(),
      });

      return interaction.editReply({ embeds: [statsEmbed] });
    } catch (error) {
      console.error("Error fetching player stats:", error);
      if (error.response) {
        return interaction.editReply(
          `Error: ${error.response.data.message || error.response.statusText}`
        );
      } else {
        return interaction.editReply(
          "An error occurred while fetching player stats."
        );
      }
    }
  },
};
