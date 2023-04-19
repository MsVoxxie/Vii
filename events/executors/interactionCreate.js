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
			// Check if command is dev only
			if (command.options.devOnly) {
				if (!process.env.DEVELOPERS.includes(interaction.user.id)) {
					return interaction.reply({ content: 'This command is for developers only.', ephemeral: true });
				}
			}

			// Check if command is disabled
			if (command.options.disabled) {
				return interaction.reply({ content: 'This command is disabled.', ephemeral: true });
			}

			// Execute Command
			const settings = await client.getGuild(interaction.guild);
			await command.execute(client, interaction, settings);
			await botData.findOneAndUpdate({}, { $inc: { commandsExecuted: 1 } }, { upsert: true });
		} catch (error) {
			interaction.reply({ content: `An error occurred executing ${interaction.commandName}`, ephemeral: true });
			Logger.error(`Error executing ${interaction.commandName}`);
			Logger.error(error);
			await botData.findOneAndUpdate({}, { $inc: { commandsFailed: 1 } }, { upsert: true });
		}
	},
};
