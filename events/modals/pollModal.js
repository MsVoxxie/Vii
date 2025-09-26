const { pollData } = require('../../models/index');
const generatePieChart = require('../../functions/helpers/generatePieChart');
const { Events, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, codeBlock, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (!interaction.isModalSubmit()) return;

		// Split the custom ID
		const customID = interaction.customId;
		if (customID !== 'PollModal') return;

		// Get Values
		const pollTitle = interaction.fields.getTextInputValue('Poll-Title');
		const pollDescription = interaction.fields.getTextInputValue('Poll-Description');
		const pollChoiceArray = interaction.fields.getTextInputValue('Poll-Choices');
		const pollChoices = pollChoiceArray.split('\n');
		const pollValues = [];
		const pollChannelData = interaction.fields.getTextInputValue('Poll-Channel') || null;

		// Check that pollChannelData is an id
		if (pollChannelData !== null) {
			if (isNaN(pollChannelData)) return interaction.reply({ content: 'The channel ID you provided is not a valid ID.', flags: MessageFlags.Ephemeral });
		}

		// Get Channel
		const pollChannel = pollChannelData ? await interaction.guild.channels.cache.get(pollChannelData) : interaction.channel;

		// Respond to Interaction to show that it was received
		await interaction.reply({ content: 'Your poll is being created!', flags: MessageFlags.Ephemeral });

		// Generate Pie Chart
		pollChoices.forEach(() => pollValues.push(0));
		const pieChart = await generatePieChart(pollChoices, pollValues);

		// Generate Select Menu
		const pollOptions = pollChoices.map((choice, index) => ({ label: choice, value: index.toString() }));
		const pollSelectMenu = new StringSelectMenuBuilder()
			.setCustomId(`PollSelect-${interaction.id}`)
			.setPlaceholder('Select a choice')
			.setMinValues(1)
			.setMaxValues(1)
			.addOptions(pollOptions);
		const pollSelectMenuRow = new ActionRowBuilder().addComponents(pollSelectMenu);

		// Build Embed
		const pollDesc = `${codeBlock(pollDescription)}\n> There are **${pollChoices.length}** choices.\n> Total Votes› **0**`;
		const pollEmbed = new EmbedBuilder()
			.setTitle(pollTitle)
			.setDescription(pollDesc)
			.setImage(pieChart)
			.setColor(client.colors.vii)
			.setFooter({ text: `Poll created by ${interaction.user.tag}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });

		// Create Poll Database Entry
		await pollData.create({
			guildId: interaction.guild.id,
			pollId: interaction.id,
			pollData: {
				title: pollTitle,
				description: pollDescription,
				channel: pollChannel.id,
			},
			pollChoices: pollChoices,
			pollVotes: pollValues,
		});

		// Send Embed
		await pollChannel.send({ embeds: [pollEmbed], components: [pollSelectMenuRow] });
	},
};
