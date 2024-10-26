const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserEconomy = require("../../models/UserEconomy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),

  async execute(interaction) {
    const { user, guild } = interaction;
    const dailyReward = 100;
    const oneDay = 24 * 60 * 60 * 1000;

    let userEconomy = await UserEconomy.findOne({
      userId: user.id,
      guildId: guild.id,
    });

    if (!userEconomy) {
      userEconomy = await UserEconomy.create({
        userId: user.id,
        guildId: guild.id,
      });
    }

    const now = new Date();
    if (userEconomy.lastDaily && now - userEconomy.lastDaily < oneDay) {
      const remainingTime =
        new Date(userEconomy.lastDaily.getTime() + oneDay) - now;
      const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Daily Reward Claim")
        .setDescription(
          `You have already claimed your daily reward today. Come back in **${hours}h ${minutes}m ${seconds}s**!`
        )
        .setFooter({
          text: `Requested in ${guild.name}`,
          iconURL: guild.iconURL() || null,
        });

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    userEconomy.balance += dailyReward;
    userEconomy.lastDaily = now;
    await userEconomy.save();

    const successEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Daily Reward Claimed!")
      .setDescription(
        `You claimed your daily reward of **${dailyReward}** coins!`
      )
      .addFields({
        name: "Total Balance",
        value: `You now have **${userEconomy.balance}** coins.`,
        inline: true,
      })
      .setTimestamp()
      .setFooter({
        text: `Requested by ${user.username}`,
        iconURL: user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [successEmbed] });
  },
};
