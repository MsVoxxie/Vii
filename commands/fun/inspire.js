const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Favicons } = require('../../images/favicons/favs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inspire')
		.setDescription("AI Generated 'Inspirational' Quotes.")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Get Quote
		const inspirationalQuote = await fetch('https://inspirobot.me/api?generate=true').then((res) => res.text());

		// Build Embed
		const embed = new EmbedBuilder()
			.setTitle(`Generated for ${interaction.member.displayName}`)
			.setImage(inspirationalQuote)
			.setColor(client.colors.vii)
			.setFooter({ text: 'Inspirobot', iconURL: Favicons.INSPIRO })
			.setTimestamp();

		// Send
		return interaction.followUp({ embeds: [embed] });
	},
};
