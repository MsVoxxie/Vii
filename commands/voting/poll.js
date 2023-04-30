const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { join } = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
		.addStringOption((option) => option.setName('question').setDescription('The question to ask').setRequired(true))
		.addStringOption((option) => option.setName('yestext').setDescription('The text to use for the yes button (Default Yes)').setRequired(false))
		.addStringOption((option) => option.setName('notext').setDescription('The text to use for the no button (Default No)').setRequired(false))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Variables
		const question = interaction.options.getString('question');
		const yesText = interaction.options.getString('yestext') || 'Yes';
		const noText = interaction.options.getString('notext') || 'No';

		// Create the embed

		const pollEmbed = new EmbedBuilder()
			.setDescription(`**Question:**\n${question}`)
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setColor(settings.guildColorHex)
			.addFields([
				{ name: yesText, value: '0', inline: true },
				{ name: noText, value: '0', inline: true },
			]);

		// Send the embed
		const replyObject = await interaction.reply({ embeds: [pollEmbed] });

		// Add Buttons
		const pollButtons = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setLabel(yesText).setCustomId(`Poll-Yes-${replyObject.id}`).setStyle(ButtonStyle.Success),
			new ButtonBuilder().setLabel(noText).setCustomId(`Poll-No-${replyObject.id}`).setStyle(ButtonStyle.Danger)
		);

		// Edit the embed
		await interaction.editReply({ components: [pollButtons] });
	},
};
