const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Return the currently playing media.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	async execute(client, interaction, settings) {
		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
		await interaction.deferReply();
		const queue = await client.distube.getQueue(interaction);
		if (!queue) return interaction.followUp('No media is currently playing!');

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`**Currently playing Media**`)
			.setDescription(trim(queue.songs.map((song) => `[${song.name}](${song.url}) - \`${song.formattedDuration}\``)[0], 2000))
			.setColor(settings.guildColorHex);
		return interaction.followUp({ embeds: [embed] });
	},
};
