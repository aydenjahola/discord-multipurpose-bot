const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("csstats")
    .setDescription("Fetches CS2 player stats.")
    .addStringOption((option) =>
      option
        .setName("steam_id")
        .setDescription("The Steam ID to fetch stats for.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const steamId = interaction.options.getString("steam_id");

    const apiUrl = process.env.TRACKER_API_URL;
    const apiKey = process.env.TRACKER_API_KEY;

    const url = `https://${apiUrl}/cs2/player/${steamId}`;

    try {
      await interaction.deferReply();

      // Fetch data from the API
      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const data = response.data;

      const statsEmbed = new EmbedBuilder()
        .setColor("#ff4500")
        .setTitle(`CS2 Stats for Steam ID: ${data.steam_id}`)
        .addFields(
          {
            name: "🏆 Current Rank",
            value: data.current_rank,
          },
          {
            name: "🔝 Peak Rank",
            value: data.peak_rank,
          },
          {
            name: "⏳ Hours Played",
            value: `${data.hours_played}h`,
          },
          {
            name: "🎮 Matches Played",
            value: `${data.matches_played}`,
          },
          {
            name: "🏅 Wins",
            value: `${data.wins}`,
          },
          {
            name: "📊 Win Percentage",
            value: `${data.win_percentage}%`,
          },
          {
            name: "⚔️ Kills",
            value: `${data.kills}`,
          },
          {
            name: "📈 K/D Ratio",
            value: `${data.kd_ratio}`,
          },
          {
            name: "🎯 Headshot Percentage",
            value: `${data.headshot_percentage}%`,
          },
          {
            name: "💯 Tracker Score",
            value: `${data.tracker_score}/1000`,
          }
        )
        .setTimestamp()
        .setFooter({
          text: "CS2 Stats API made by Ayden",
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
