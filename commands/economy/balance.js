const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserEconomy = require("../../models/UserEconomy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance and claim a bonus for checking daily!"),

  async execute(interaction) {
    const { user, guild } = interaction;
    let userEconomy = await UserEconomy.findOne({
      userId: user.id,
      guildId: guild.id,
    });
    const checkInBonus = 10;

    if (!userEconomy) {
      userEconomy = await UserEconomy.create({
        userId: user.id,
        guildId: guild.id,
      });
    } else {
      userEconomy.balance += checkInBonus;
      await userEconomy.save();
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${user.username}'s Balance`)
      .setDescription(
        `Your balance: **${userEconomy.balance}** coins. (Check-in Bonus: +${checkInBonus} coins)`
      )
      .setFooter({
        text: `Requested by ${user.username}`,
        iconURL: user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
