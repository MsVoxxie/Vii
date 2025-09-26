const generatePieChart = require('../../functions/helpers/generatePieChart');
const { pollData, pollVoterData } = require('../../models/index');
const { Events, EmbedBuilder, codeBlock, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (!interaction.isStringSelectMenu()) return;

		// Split the custom ID
		const customID = interaction.customId.split('-');
		const pollId = customID[customID.length - 1];
		if (customID[0] !== 'PollSelect') return;

		// Get Values
		const userChoice = interaction.values[0];

		// Retreive data from the database
		const pollDataObject = await pollData.findOne({ guildId: interaction.guild.id, pollId: pollId }).lean();
		if (!pollDataObject) return interaction.reply({ content: 'An error occurred while retrieving data.', flags: MessageFlags.Ephemeral });

		// Get the user's previous vote
		let userVoteData = await pollVoterData.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: pollId }).lean();
		if (!userVoteData) userVoteData = await pollVoterData.create({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: pollId, lastVote: null });

		// Update the database votes
		const updatedSelection = pollDataObject.pollVotes[userChoice] + 1;
		pollDataObject.pollVotes[userChoice] = updatedSelection;

		// If the user has already voted, update their old vote
		if (userVoteData.lastVote !== null) {
			const oldSelection = pollDataObject.pollVotes[userVoteData.lastVote] - 1;
			pollDataObject.pollVotes[userVoteData.lastVote] = oldSelection;
			userVoteData = await pollVoterData.findOneAndUpdate(
				{ userId: interaction.user.id, guildId: interaction.guild.id, pollId: pollId },
				{ lastVote: userChoice },
				{ new: true }
			);
		} else {
			userVoteData = await pollVoterData.findOneAndUpdate(
				{ userId: interaction.user.id, guildId: interaction.guild.id, pollId: pollId },
				{ lastVote: userChoice },
				{ new: true }
			);
		}

		// Update the database
		const newPollDataObject = await pollData.findOneAndUpdate(
			{ guildId: interaction.guild.id, pollId: pollId },
			{
				pollVotes: pollDataObject.pollVotes,
				$addToSet: {
					pollVoters: interaction.user.id,
				},
			},
			{ new: true }
		);

		// Find the embed
		const pollEmbed = interaction.message.embeds[0];
		if (!pollEmbed) return interaction.reply({ content: 'An error occurred while retrieving data.', flags: MessageFlags.Ephemeral });

		// Rebuild Pie Chart
		const pieChart = await generatePieChart(pollDataObject.pollChoices, pollDataObject.pollVotes);

		// Rebuid the embed
		const embedDesc = `${codeBlock(pollDataObject.pollData.description)}\n> There are **${pollDataObject.pollChoices.length}** choices.\n> Total Votes› **${
			newPollDataObject.pollVoters.length
		}**`;
		const updatedEmbed = new EmbedBuilder()
			.setTitle(pollEmbed.title)
			.setDescription(embedDesc)
			.setColor(pollEmbed.color)
			.setFooter({ text: pollEmbed.footer.text, iconURL: pollEmbed.footer.iconURL })
			.setImage(pieChart);

		// Reply and edit the message
		await interaction.reply({ content: 'Your vote has been counted.', flags: MessageFlags.Ephemeral });
		await interaction.message.edit({ embeds: [updatedEmbed] });
	},
};
