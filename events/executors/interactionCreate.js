const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinite',
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand()) return;

		// Get command, return if no command found.
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return Logger.error(`No command matching ${interaction.commandName} was found.`);

		try {
			// Define arguments
			const settings = await client.getGuild(interaction.guild);

			await command.execute(client, interaction, settings);
		} catch (error) {
			interaction.reply('An Error Occurred...')
			Logger.error(`Error executing ${interaction.commandName}`);
			Logger.error(error);
		}
	},
};
