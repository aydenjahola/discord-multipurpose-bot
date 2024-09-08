const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("urban")
    .setDescription("Get the definition from Urban Dictionary")
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("The term to look up")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const term = interaction.options.getString("term");
    const url = `https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${encodeURIComponent(
      term
    )}`;

    const options = {
      method: "GET",
      url: url,
      headers: {
        "X-RapidAPI-Key": "272f95b62amsh3dddd28f7289395p1bd2a9jsna5ee0dd5d9ea", // public API key please dont shout at me, https://rapidapi.com/community/api/urban-dictionary/playground/53aa4f68e4b07e1f4ebeb2b0
        "X-RapidAPI-Host": "mashape-community-urban-dictionary.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      const data = response.data;

      if (data.list.length === 0) {
        return await interaction.reply({
          content: "🚫 No definitions found.",
          ephemeral: true,
        });
      }

      const definition = data.list[0];
      const author = definition.author || "Unknown"; // Default if author info is missing
      const guild = interaction.guild;
      const serverName = guild.name;
      const serverIcon = guild.iconURL();

      const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle(`📚 Definition of: **${definition.word}**`)
        .setDescription(definition.definition)
        .setThumbnail(
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Urban_Dictionary_Logo.svg/1200px-Urban_Dictionary_Logo.svg.png"
        )
        .addFields(
          {
            name: "📖 Example",
            value: definition.example || "No example provided",
            inline: false,
          },
          {
            name: "👍 Votes",
            value: `${definition.thumbs_up} 👍 | ${definition.thumbs_down} 👎`,
            inline: true,
          },
          {
            name: "✍️ Submitted by",
            value: author,
            inline: false,
          }
        )
        .setFooter({
          text: `Powered by Urban Dictionary | ${serverName}`,
          iconURL: serverIcon,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching Urban Dictionary term:", error);
      await interaction.reply({
        content:
          "⚠️ There was an error while fetching the term. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
