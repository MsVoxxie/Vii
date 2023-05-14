const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Fetch weather data on a specified region.')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addStringOption((option) => option.setName('location').setDescription('Use Long Location Format').setRequired(true)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get the locale
		let locale = interaction.options.getString('location');
		locale = locale.toLowerCase();
		locale = locale.charAt(0).toUpperCase() + locale.slice(1);

		// Fetch the weather data
		const weatherData = await fetch(`https://wttr.in/${locale}?format=j1`).then((response) => {
			return response.json();
		});
		if (!weatherData) return interaction.reply({ content: 'Unable to fetch weather data.', ephemeral: true });
		const currentConditions = weatherData.current_condition[0];

		// Create the embed
		const embed = new EmbedBuilder()
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
					inline: true,
				},
				{
					name: 'Wind',
					value: `${currentConditions.windspeedMiles}mph / ${currentConditions.windspeedKmph}kph`,
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
