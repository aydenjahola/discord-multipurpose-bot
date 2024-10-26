const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ShopItem = require("../../models/ShopItem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse the shop for items with rarity and discounts!"),

  async execute(interaction) {
    const { user, guild } = interaction;
    const discountChance = 0.3;
    const items = await ShopItem.find({ guildId: guild.id });

    if (items.length === 0) {
      const emptyEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Shop")
        .setDescription("No items in the shop currently.")
        .setTimestamp()
        .setFooter({
          text: `Requested by ${user.username}`,
          iconURL: user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [emptyEmbed] });
      return;
    }

    const shopItemsDetails = items.map((item) => {
      const discount = Math.random() < discountChance ? 0.8 : 1;
      const price = Math.floor(item.price * discount);
      const discountText = discount < 1 ? " (Discounted!)" : "";

      return `${item.name} - **${price}** coins${discountText} - Rarity: ${
        item.rarity
      } - Type: ${item.type} - Category: ${item.category || "N/A"}`;
    });

    const shopEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Shop")
      .setDescription(shopItemsDetails.join("\n"))
      .setTimestamp()
      .setFooter({
        text: `Requested by ${user.username}`,
        iconURL: user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [shopEmbed] });
  },
};
