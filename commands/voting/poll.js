const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pollData } = require('../../models/index')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
		.addStringOption((option) => option.setName('question').setDescription('The question to ask').setRequired(true))
		.addStringOption((option) => option.setName('choice1').setDescription('The text to use for the first button (Default Yes)').setRequired(false) )
		.addStringOption((option) => option.setName('choice2').setDescription('The text to use for the second button (Default No)').setRequired(false) )
		.addStringOption((option) => option.setName('choice3').setDescription('The text to use for the third button (Default None)').setRequired(false) )
		.addStringOption((option) => option.setName('choice4').setDescription('The text to use for the fourth button (Default None)').setRequired(false) )
		.addStringOption((option) => option.setName('choice5').setDescription('The text to use for the fifth button (Default None)').setRequired(false) )
		.addStringOption((option) => option.setName('choice6').setDescription('The text to use for the sixth button (Default None)').setRequired(false) )
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Variables
		const question = interaction.options.getString('question');
		const choice1 = interaction.options.getString('choice1') || 'Yes';
		const choice2 = interaction.options.getString('choice2') || 'No';
		const choice3 = interaction.options.getString('choice3') || null;
		const choice4 = interaction.options.getString('choice4') || null;
		const choice5 = interaction.options.getString('choice5') || null;
		const choice6 = interaction.options.getString('choice6') || null;

		// Create the embed
		const pollEmbed = new EmbedBuilder()
			.setDescription(`**Question:**\n${question}`)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setFooter({ text: 'All votes are anonymous.' })
			.setColor(client.colors.vii);

		// Add the fields
		if (choice1) pollEmbed.addFields({ name: choice1, value: '0', inline: true });
		if (choice2) pollEmbed.addFields({ name: choice2, value: '0', inline: true });
		if (choice3) pollEmbed.addFields({ name: choice3, value: '0', inline: true });
		if (choice4) pollEmbed.addFields({ name: choice4, value: '0', inline: true });
		if (choice5) pollEmbed.addFields({ name: choice5, value: '0', inline: true });
		if (choice6) pollEmbed.addFields({ name: choice6, value: '0', inline: true });

		// Send the embed
		const replyObject = await interaction.reply({ embeds: [pollEmbed] });

		// Add Buttons
		const firstButtons = new ActionRowBuilder();
		const secondButtons = new ActionRowBuilder();
		
		if (choice1) firstButtons.addComponents(new ButtonBuilder().setLabel(choice1).setCustomId(`Poll-C1-${replyObject.id}`).setStyle(ButtonStyle.Success));
		if (choice2) firstButtons.addComponents(new ButtonBuilder().setLabel(choice2).setCustomId(`Poll-C2-${replyObject.id}`).setStyle(ButtonStyle.Success));
		if (choice3) firstButtons.addComponents(new ButtonBuilder().setLabel(choice3).setCustomId(`Poll-C3-${replyObject.id}`).setStyle(ButtonStyle.Success));
		if (choice4) secondButtons.addComponents(new ButtonBuilder().setLabel(choice4).setCustomId(`Poll-C4-${replyObject.id}`).setStyle(ButtonStyle.Success));
		if (choice5) secondButtons.addComponents(new ButtonBuilder().setLabel(choice5).setCustomId(`Poll-C5-${replyObject.id}`).setStyle(ButtonStyle.Success));
		if (choice6) secondButtons.addComponents(new ButtonBuilder().setLabel(choice6).setCustomId(`Poll-C6-${replyObject.id}`).setStyle(ButtonStyle.Success));

		// Try and figure out which rows to send
		const actionRows = [];
		if (firstButtons.components.length > 0) actionRows.push(firstButtons);
		if (secondButtons.components.length > 0) actionRows.push(secondButtons);

		await interaction.editReply({ components: actionRows });

		// Add the poll to the database
		await pollData.create({ guildId: interaction.guild.id, pollId: replyObject.id });
	},
};
