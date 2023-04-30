const { Events } = require('discord.js');
const { pollData } = require('../../models/index');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinite',
	async execute(interaction, client) {
		if (!interaction.isButton()) return;

		// Split the custom ID
		const customID = interaction.customId.split('-');
		if (customID[0] !== 'Poll') return;

		// Get Voters
		const voterList = await pollData.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id });
		if (voterList) return interaction.reply({ content: 'You have already voted on this poll.', ephemeral: true });
		await pollData.create({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id, voted: true });

		// Rebuild the embed
		const pollEmbed = interaction.message.embeds[0];
		if (!pollEmbed) return interaction.reply({ content: 'An error occurred.', ephemeral: true });

		// Get the current values
		const yesVotes = pollEmbed.fields[0];
		const noVotes = pollEmbed.fields[1];

		// Update the embed
		switch (customID[1]) {
			case 'Yes':
				const newYesCount = parseInt(yesVotes.value) + 1;
				yesVotes.value = newYesCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'No':
				const newNoCount = parseInt(noVotes.value) + 1;
				noVotes.value = newNoCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
		}
	},
};
