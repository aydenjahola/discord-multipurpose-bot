const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserEconomy = require("../../models/UserEconomy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance"),

  async execute(interaction) {
    const { user, guild } = interaction;

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

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${user.username}'s Balance`)
      .setDescription(`You have **${userEconomy.balance}** coins.`)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${user.username}`,
        iconURL: user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [embed] });
  },
};
