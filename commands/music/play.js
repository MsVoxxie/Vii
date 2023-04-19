const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play some media!')
		.addStringOption((option) => option.setName('query').setDescription('Query to search for.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Connect),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You're not in a voice channel!");
		const query = interaction.options.getString('query');

		// Defer, Things take time.
		await interaction.deferReply();

		try {
			client.distube.play(channel, query, {
				member: interaction.member,
				textChannel: interaction.channel,
				interaction,
			});

			const embed = new EmbedBuilder()
				.setColor(settings.guildColorHex)
				.setTitle('**Searching Query**')
				.setDescription(`**Searching»** ${query}`);

			return interaction.followUp({ embeds: [embed], ephemeral: true }).then((m) => {
				setTimeout(() => m.delete(), 60 * 1000);
			});
		} catch (error) {
			return interaction.followUp({ content: 'Something went wrong, Please try again!' }).then((m) => {
				setTimeout(() => m.delete(), 60 * 1000);
			});
		}
	},
};
