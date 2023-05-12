const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Poll Builder')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a poll')),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Create Modal
		const pollModal = new ModalBuilder().setCustomId('PollModal').setTitle('Poll Builder');

		// Add Components to Modal
		const pollTitle = new TextInputBuilder()
			.setCustomId('Poll-Title')
			.setLabel('Poll Title')
			.setPlaceholder('Enter the title of the poll')
			.setStyle(TextInputStyle.Short);

		const pollDescription = new TextInputBuilder()
			.setCustomId('Poll-Description')
			.setLabel('Poll Description')
			.setPlaceholder('Enter the description of the poll')
			.setStyle(TextInputStyle.Short);

		const pollChoices = new TextInputBuilder()
			.setCustomId('Poll-Choices')
			.setLabel('Poll Choices (One per Line, Max 9)')
			.setPlaceholder('Option 1\nOption 2\nOption 3\nOption 4\nOption 5\nOption 6\nOption 7\nOption 8\nOption 9')
            .setMaxLength(200)
			.setStyle(TextInputStyle.Paragraph);

		const pollChannel = new TextInputBuilder()
			.setCustomId('Poll-Channel')
			.setLabel('Poll Channel')
			.setPlaceholder('Channel Id or leave blank for current channel')
            .setRequired(false)
			.setStyle(TextInputStyle.Short);

		// Create Action Rows
		const titleRow = new ActionRowBuilder().addComponents(pollTitle);
		const descriptionRow = new ActionRowBuilder().addComponents(pollDescription);
		const choicesRow = new ActionRowBuilder().addComponents(pollChoices);
		const channelRow = new ActionRowBuilder().addComponents(pollChannel);

		// Add Action Rows to Modal
		pollModal.addComponents(titleRow, descriptionRow, choicesRow, channelRow);

		// Send Modal
		await interaction.showModal(pollModal);
	},
};
