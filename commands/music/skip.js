const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current media!').setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	options: {
		devOnly: false,
		disabled: true,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Checks
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		const queue = await client.distube.getQueue(interaction);
		if (!queue) return interaction.reply('No media is currently playing!');

		// Check if there is only one song in the queue
		if (queue.songs.length === 1) return interaction.followUp('There is only one song in the queue!');

		// Skip the song
		await client.distube.skip(interaction);

		// Build Embed
		const embed = new EmbedBuilder().setTitle(`**Song Skipped!**`).setDescription(`${interaction.member} skipped the current song.`).setColor(client.colors.vii);
		return interaction.followUp({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 60 * 1000);
		});
	},
};
