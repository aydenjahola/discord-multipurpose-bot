const { SlashCommandBuilder } = require("discord.js");
const Word = require("../../models/wordModel");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dictionary")
    .setDescription("Look up a word in the dictionary.")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word to look up")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("Whether the response should be ephemeral")
        .setRequired(false)
    ),
  async execute(interaction) {
    const word = interaction.options.getString("word").toLowerCase();
    const isEphemeral = interaction.options.getBoolean("ephemeral") || false;

    // Try to find the word in the database
    let result = await Word.findOne({ word });

    if (result) {
      // If the word is found in the database
      await interaction.reply({
        content: `**${result.word}**: ${result.definition}`,
        ephemeral: isEphemeral,
      });
    } else {
      // Fetch the word definition from an API if not found in the database
      try {
        const response = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const data = response.data;

        if (
          data &&
          data[0] &&
          data[0].meanings &&
          data[0].meanings[0] &&
          data[0].meanings[0].definitions &&
          data[0].meanings[0].definitions[0]
        ) {
          const definition = data[0].meanings[0].definitions[0].definition;

          // Save the new word and definition in the database
          await Word.create({ word, definition });

          await interaction.reply({
            content: `**${word}**: ${definition}`,
            ephemeral: isEphemeral,
          });
        } else {
          await interaction.reply({
            content: `Sorry, I couldn't find a definition for **${word}**.`,
            ephemeral: isEphemeral,
          });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `An error occurred while fetching the definition for **${word}**.`,
          ephemeral: isEphemeral,
        });
      }
    }
  },
};
