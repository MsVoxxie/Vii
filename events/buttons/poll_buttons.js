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
		const firstChoice = pollEmbed.fields[0];
		const secondChoice = pollEmbed.fields[1];
		const thirdChoice = pollEmbed.fields?.[2];
		const fourthChoice = pollEmbed.fields?.[3];
		const fifthChoice = pollEmbed.fields?.[4];
		const sixthChoice = pollEmbed.fields?.[5];

		// Update the embed
		switch (customID[1]) {
			case 'C1':
				const newFirstCount = parseInt(firstChoice.value) + 1;
				firstChoice.value = newFirstCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C2':
				const newSecondCount = parseInt(secondChoice.value) + 1;
				secondChoice.value = newSecondCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C3':
				const newThirdCount = parseInt(thirdChoice.value) + 1;
				thirdChoice.value = newThirdCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C4':
				const newFourthCount = parseInt(fourthChoice.value) + 1;
				fourthChoice.value = newFourthCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C5':
				const newFifthCount = parseInt(fifthChoice.value) + 1;
				fifthChoice.value = newFifthCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C6':
				const newSixthCount = parseInt(sixthChoice.value) + 1;
				sixthChoice.value = newSixthCount;

				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
		}
	},
};
