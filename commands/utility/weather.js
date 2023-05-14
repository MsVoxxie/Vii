const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wttr')
		.setDescription('Fetch weather data on a specified region.')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addStringOption((option) => option.setName('location').setDescription('The location to fetch weather data for.').setRequired(true)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Fetch the weather data
		const locale = interaction.options.getString('location');
		const weatherData = await fetch(`https://wttr.in/${locale}/?v=j1`).then((response) => {
			return response.json();
		});
		const currentConditions = weatherData.current_condition[0];

		// Create the embed
		const embed = new MessageEmbed()
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setTitle(`Current Weather in ${locale}`)
			.setColor(client.colors.vii)
			.addFields(
				{
					name: 'Temperature',
					value: `${currentConditions.temp_F}°F / ${currentConditions.temp_C}°C`,
					inline: true,
				},
				{
					name: 'Feels Like',
					value: `${currentConditions.FeelsLikeF}°F / ${currentConditions.FeelsLikeC}°C`,
					inline: true,
				},
				{
					name: 'Humidity',
					value: `${currentConditions.humidity}%`,
					inline: true,
				},
				{
					name: 'Precipitation',
					value: `${currentConditions.precipInches}in / ${currentConditions.precipMM}mm`,
				},
				{
					name: 'Wind',
					value: `${currentConditions.windspeedMiles}mph / ${currentConditions.windspeedKmph}kmph`,
					inline: true,
				},
				{
					name: 'Wind Direction',
					value: `${currentConditions.winddir16Point}`,
					inline: true,
				}
			);

		// Send the embed
		await interaction.reply({ embeds: [embed] });
	},
};
