const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ShopItem = require("../../models/ShopItem");
const UserEconomy = require("../../models/UserEconomy");
const UserInventory = require("../../models/UserInventory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the shop and buy items")
    .addStringOption((option) =>
      option.setName("item").setDescription("The ID of the item to buy")
    ),

  async execute(interaction) {
    const { user, guild } = interaction;
    const itemId = interaction.options.getString("item");

    if (!itemId) {
      const items = await ShopItem.find();
      const itemDescriptions = items.map(
        (item) => `**${item.itemId}**: ${item.name} - **${item.price}** coins`
      );

      const shopEmbed = new EmbedBuilder()
        .setColor("#00bfff")
        .setTitle("🛒 Shop Items")
        .setDescription(
          itemDescriptions.length > 0
            ? itemDescriptions.join("\n")
            : "No items available at the moment."
        )
        .setFooter({
          text: `Requested in ${guild.name}`,
          iconURL: guild.iconURL() || null,
        });

      await interaction.reply({ embeds: [shopEmbed] });
      return;
    }

    const shopItem = await ShopItem.findOne({ itemId });
    if (!shopItem) {
      const notFoundEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Item Not Found")
        .setDescription("The specified item could not be found in the shop.")
        .setFooter({
          text: `Requested in ${guild.name}`,
          iconURL: guild.iconURL() || null,
        });

      await interaction.reply({ embeds: [notFoundEmbed] });
      return;
    }

    const userEconomy = await UserEconomy.findOne({
      userId: user.id,
      guildId: guild.id,
    });
    if (!userEconomy || userEconomy.balance < shopItem.price) {
      const insufficientFundsEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("💸 Insufficient Funds")
        .setDescription("You don't have enough coins to purchase this item.")
        .setFooter({
          text: `Requested in ${guild.name}`,
          iconURL: guild.iconURL() || null,
        });

      await interaction.reply({ embeds: [insufficientFundsEmbed] });
      return;
    }

    userEconomy.balance -= shopItem.price;
    await userEconomy.save();

    let userInventory = await UserInventory.findOne({
      userId: user.id,
      guildId: guild.id,
      itemId,
    });
    if (userInventory) {
      userInventory.quantity += 1;
    } else {
      userInventory = new UserInventory({
        userId: user.id,
        guildId: guild.id,
        itemId,
        quantity: 1,
      });
    }
    await userInventory.save();

    const successEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("🎉 Purchase Successful")
      .setDescription(
        `You've successfully purchased **${shopItem.name}** for **${shopItem.price}** coins!`
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${user.username}`,
        iconURL: user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [successEmbed] });
  },
};
