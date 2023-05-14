const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wttr")
    .setDescription("Fetch weather data on a specified region.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  options: {
    devOnly: false,
    disabled: false,
  },
  async execute(client, interaction, settings) {
    const locale = "New+York+City";
    const weatherData = await fetch(`https://wttr.in/${locale}/?v=j1`).then((response) => {return response.json()});
    
    await interaction.reply(
      `Here is weather data for ${locale}:
      \`\`\`json
      ${weatherData}\`\`\``
    );
  },
};
