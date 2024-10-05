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

    const apiUrl = process.env.TRACKER_API_URL;
    const apiKey = process.env.TRACKER_API_KEY;

    // Use statsType for the main URL
    const url = `https://${apiUrl}/valorant/player/${formattedUsername}/${statsType}`;

    try {
      await interaction.deferReply();

      const response = await axios.get(url, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const data = response.data;

      // Create the embed for player stats
      const statsEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${data.username}'s Valorant Stats`)
        .setDescription(`${data.username}'s **${data.season}** stats`)
        .addFields(
          {
            name: "🏆 Current Rank",
            value: data.current_rank || "N/A",
          },
          {
            name: "🔝 Peak Rank",
            value: `${data.peak_rank || "N/A"}`,
          },
          {
            name: "⏳ Hours Played",
            value: `${data.playtime_hours || 0}h`,
          },
          {
            name: "🎮 Matches Played",
            value: `${data.matches_played || 0}`,
          },
          { name: "🏅 Wins", value: `${data.wins || 0}` },
          {
            name: "📊 Win Percentage",
            value: `${data.win_percentage || 0}%`,
          },
          { name: "⚔️ Kills", value: `${data.kills || 0}` },
          {
            name: "📈 K/D Ratio",
            value: `${data.kd_ratio || 0}`,
          },
          {
            name: "📊 ACS",
            value: `${data.acs || 0}`,
          },
          {
            name: "🎯 Headshot Percentage",
            value: `${data.headshot_percentage || 0}%`,
          }
        );

      // Add the Tracker Score field only if statsType is "current"
      if (statsType === "current") {
        statsEmbed.addFields({
          name: "💯 Tracker Score",
          value: `${data.tracker_score || "N/A"}/1000`,
        });
      }

      const weaponsEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${data.username}'s Top Weapons`)
        .setDescription(`${data.username}'s top weapons stats:`);

      data.top_weapons.forEach((weapon) => {
        weaponsEmbed.addFields({
          name: weapon.name,
          value:
            `Type: ${weapon.weapon_type}\n` +
            `Kills: ${weapon.kills}\n` +
            `Accuracy: ${weapon.accuracy.join(", ")}\n`,
          inline: true,
        });
      });

      const mapsEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${data.username}'s Top Maps`)
        .setDescription(`${data.username}'s top maps stats:`);

      data.top_maps.forEach((map) => {
        mapsEmbed.addFields({
          name: map.name,
          value: `Win Percentage: ${map.win_percentage}%\nMatches: ${map.matches}`,
          inline: true,
        });
      });

      const rolesEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${data.username}'s Roles`)
        .setDescription(`${data.username}'s performance by role:`);

      data.roles.forEach((role) => {
        rolesEmbed.addFields({
          name: role.name,
          value:
            `Win Rate: ${role.win_rate}%\n` +
            `KDA: ${role.kda}\n` +
            `Wins: ${role.wins}\n` +
            `Losses: ${role.losses}\n` +
            `Kills: ${role.kills}\n` +
            `Deaths: ${role.deaths}\n` +
            `Assists: ${role.assists}`,
          inline: true,
        });
      });

      statsEmbed.setTimestamp().setFooter({
        text: "Valorant Stats API made by Ayden",
        iconURL: interaction.guild.iconURL(),
      });

      return interaction.editReply({
        embeds: [statsEmbed, weaponsEmbed, mapsEmbed, rolesEmbed],
      });
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
