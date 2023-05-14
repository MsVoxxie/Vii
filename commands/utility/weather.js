const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Fetch weather data on a specified region.')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addStringOption((option) => option.setName('location').setDescription('Use Long Location Format').setRequired(true)),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// API Key
		const apiKey = process.env.WEATHER_API;

		// Get the locale
		const locale = interaction.options.getString('location');

		// Fetch the weather data
		const weatherData = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locale}&aqi=no`).then((response) =>
			response.json()
		);
		if (weatherData.error) return interaction.reply({ content: 'Invalid location provided.', ephemeral: true });

		// Create the embed
		const embed = new EmbedBuilder()
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setTitle(`Current Weather in ${weatherData.location.name}`)
			.setColor(client.colors.vii)
			.addFields(
				{
					name: 'Temperature',
					value: `${weatherData.current.temp_f}°F / ${weatherData.current.temp_c}°C`,
					inline: true,
				},
				{
					name: 'Feels Like',
					value: `${weatherData.current.feelslike_f}°F / ${weatherData.current.feelslike_c}°C`,
					inline: true,
				},
				{
					name: 'Humidity',
					value: `${weatherData.current.humidity}%`,
					inline: true,
				},
				{
					name: 'Wind',
					value: `${weatherData.current.wind_mph} MPH / ${weatherData.current.wind_kph} KPH`,
					inline: true,
				},
				{
					name: 'UV Index',
					value: `${weatherData.current.uv}`,
					inline: true,
				},
				{
					name: 'Cloud Coverage',
					value: `${weatherData.current.cloud}%`,
					inline: true,
				},
				{
					name: 'Precipitation',
					value: `${weatherData.current.precip_in} in / ${weatherData.current.precip_mm} mm`,
					inline: true,
				},
				{
					name: 'Pressure',
					value: `${weatherData.current.pressure_in} in / ${weatherData.current.pressure_mb} mb`,
					inline: true,
				},
				{
					name: 'Visibility',
					value: `${weatherData.current.vis_miles} mi / ${weatherData.current.vis_km} km`,
					inline: true,
				}
			);

		// Send the embed
		await interaction.reply({ embeds: [embed] });
	},
};
