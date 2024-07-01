const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Return the current media queue.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	options: {
		devOnly: false,
		disabled: true,
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
			.setTitle(`**${interaction.guild.name}'s Current Queue**`)
			.setDescription(trim(queue.songs.map((song, id) => `**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join('\n'), 2000))
			.setColor(client.colors.vii);
		return interaction.followUp({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 60 * 1000);
		});
	},
};
