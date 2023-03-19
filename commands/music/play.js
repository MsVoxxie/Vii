const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song!')
		.addStringOption((option) => option.setName('uri').setDescription('URI of the song to play!').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	async execute(client, interaction, settings) {
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		const uri = interaction.options.getString('uri');

		// Defer, Things take time.
		await interaction.deferReply();

		try {
			const { track } = await client.player.play(channel, uri, {
				nodeOptions: {
					metadata: interaction,
				},
			});
			return interaction.followUp(`**${track.title}** has been added to queue!`);
		} catch (e) {
			return interaction.followUp('Something went wrong.');
		}
	},
};
