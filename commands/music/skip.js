const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current song!')
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	async execute(client, interaction, settings) {
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		const queue = await client.distube.getQueue(interaction);
		if (!queue) return interaction.followUp('No media is currently playing!');

		// Defer, Things take time.
		await interaction.deferReply();

		// Check if there is only one song in the queue
		if (queue.songs.length === 1) return interaction.followUp('There is only one song in the queue!');

		// Skip the song
		await client.distube.skip(interaction);

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`**Song Skipped!**`)
			.setDescription(`${interaction.member} skipped the current song.`)
			.setColor(settings.guildColorHex);
		return interaction.followUp({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 60 * 1000);
		});
	},
};
