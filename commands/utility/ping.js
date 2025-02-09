const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Definitions
		const websocketPing = `${Math.round(client.ws.ping)}ms`;
		const discordPing = `${Date.now() - interaction.createdTimestamp}ms`;

		// Embed
		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.addFields(
				{ name: `<:discord_white:1338246567546851408> Websocket`, value: blockQuote(codeBlock(websocketPing)), inline: true },
				{ name: '<:connection_good:1338246534826950707> Host<>Discord', value: blockQuote(codeBlock(discordPing)), inline: true }
			)
			.setTimestamp();

		await interaction.followUp({ embeds: [embed] });
	},
};
