const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Return the currently playing media.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Checks
		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
		const queue = await client.distube.getQueue(interaction);
		if (!queue) return interaction.followUp('No media is currently playing!');

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`**Currently playing Media**`)
			.setDescription(trim(queue.songs.map((song) => `[${song.name}](${song.url}) - \`${song.formattedDuration}\``)[0], 2000))
			.setColor(client.colors.vii);
		return interaction.followUp({ embeds: [embed] });
	},
};
