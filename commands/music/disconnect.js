const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnect from current voice channel')
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
		const voiceState = await interaction.guild.members.me.voice;
		if (!voiceState.channel) return interaction.reply("I'm not in a voice channel!");

		const queue = await client.distube.getQueue(interaction);
		if (queue) {
			// Stop the song
			await client.distube.stop(interaction);
		}

		await voiceState.disconnect();

		// Build Embed
		const embed = new EmbedBuilder().setTitle(`**Disconnecting!**`).setDescription(`${interaction.member} told me to disconnect.`).setColor(client.colors.vii);
		return interaction.followUp({ embeds: [embed] }).then((m) => {
			setTimeout(() => m.delete(), 60 * 1000);
		});
	},
};
