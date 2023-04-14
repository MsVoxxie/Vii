const { Events } = require('discord.js');
const { botData } = require('../../models');
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
			await botData.findOneAndUpdate({}, { $inc: { commandsExecuted: 1 } }, { upsert: true });
		} catch (error) {
			try {
				interaction.reply(`An error occurred executing ${interaction.commandName}`);
				Logger.error(`Error executing ${interaction.commandName}`);
				Logger.error(error);
			} catch (error) {
				interaction.followUp(`An error occurred executing ${interaction.commandName}`);
				Logger.error(`Error executing ${interaction.commandName}`);
				Logger.error(error);
			}

			await botData.findOneAndUpdate({}, { $inc: { commandsFailed: 1 } }, { upsert: true });
		}
	},
};
