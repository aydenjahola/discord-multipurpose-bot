const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserEconomy = require("../../models/UserEconomy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn coins!"),

  async execute(interaction) {
    const { user, guild } = interaction;
    const workReward = 100;
    const cooldownTime = 60 * 60 * 1000;

    let userEconomy = await UserEconomy.findOne({
      userId: user.id,
      guildId: guild.id,
    });

    if (!userEconomy) {
      userEconomy = await UserEconomy.create({
        userId: user.id,
        guildId: guild.id,
        lastWork: null,
        balance: 0,
      });
    }

    const now = new Date();

    if (userEconomy.lastWork && now - userEconomy.lastWork < cooldownTime) {
      const remainingTime = cooldownTime - (now - userEconomy.lastWork);
      const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));

      const cooldownEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Cooldown")
        .setDescription(
          `You need to wait **${remainingMinutes}** minutes before you can work again.`
        )
        .setFooter({
          text: `Requested in ${guild.name}`,
          iconURL: guild.iconURL() || null,
        });

      await interaction.reply({ embeds: [cooldownEmbed] });
      return;
    }

    userEconomy.balance += workReward;
    userEconomy.lastWork = now;
    await userEconomy.save();

    const successEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Work Success")
      .setDescription(`You worked hard and earned **${workReward}** coins!`)
      .addFields({
        name: "Total Balance",
        value: `${userEconomy.balance} coins`,
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
