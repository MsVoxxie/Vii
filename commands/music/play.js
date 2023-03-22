const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play some media!')
		.addStringOption((option) => option.setName('query').setDescription('Query to search for.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	async execute(client, interaction, settings) {
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		const query = interaction.options.getString('query');

		// Defer, Things take time.
		await interaction.reply({ content: 'Searching...', ephemeral: true });

		try {
			client.distube.play(channel, query, {
				member: interaction.member,
				textChannel: interaction.channel,
				interaction,
			});
			return interaction.editReply({ content: 'Song Queued.', ephemeral: true });
		} catch (error) {
			return interaction.editReply({ content: 'Something went wrong', ephemeral: true });
		}
	},
};
