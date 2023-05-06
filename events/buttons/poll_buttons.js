const { Events } = require('discord.js');
const { pollData, pollVoterData } = require('../../models/index');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (!interaction.isButton()) return;

		// Split the custom ID
		const customID = interaction.customId.split('-');
		const pollId = customID[customID.length - 1];
		if (customID[0] !== 'Poll') return;

		// Get Voters
		const voterList = await pollVoterData.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id });
		if (voterList) return interaction.reply({ content: 'You have already voted on this poll.', ephemeral: true });
		await pollVoterData.create({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id, voted: true });

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

		// Retreive data from the database
		const pollDataObject = await pollData.findOne({ guildId: interaction.guild.id, pollId: pollId });

		// Update the embed
		switch (customID[1]) {
			case 'C1':
				const newFirstCount = pollDataObject.choice1 + 1;
				firstChoice.value = newFirstCount;

				// Update the database
				await pollDataObject.updateOne({ choice1: newFirstCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C2':
				const newSecondCount = pollDataObject.choice2 + 1;
				secondChoice.value = newSecondCount;

				// Update the database
				await pollDataObject.updateOne({ choice2: newSecondCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C3':
				const newThirdCount = pollDataObject.choice3 + 1;
				thirdChoice.value = newThirdCount;

				// Update the database
				await pollDataObject.updateOne({ choice3: newThirdCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C4':
				const newFourthCount = pollDataObject.choice4 + 1;
				fourthChoice.value = newFourthCount;

				// Update the database
				await pollDataObject.updateOne({ choice4: newFourthCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C5':
				const newFifthCount = pollDataObject.choice5 + 1;
				fifthChoice.value = newFifthCount;

				// Update the database
				await pollDataObject.updateOne({ choice5: newFifthCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
			case 'C6':
				const newSixthCount = pollDataObject.choice6 + 1;
				sixthChoice.value = newSixthCount;

				// Update the database
				await pollDataObject.updateOne({ choice6: newSixthCount });

				// Reply and edit the message
				interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
				interaction.message.edit({ embeds: [pollEmbed] });
				break;
		}
	},
};
