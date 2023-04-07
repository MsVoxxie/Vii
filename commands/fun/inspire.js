const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inspire')
		.setDescription("AI Generated 'Inspirational' Quotes.")
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	async execute(client, interaction, settings) {

        // Defer, Things take time.
		await interaction.deferReply();

        // Get Quote
		const inspirationalQuote = await fetch('https://inspirobot.me/api?generate=true').then((res) => res.text());

        // Send
		return interaction.followUp({ content: inspirationalQuote });
	},
};
