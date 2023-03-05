const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinite',
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			Logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			const settings = await client.getGuild(interaction.guild);
			await command.execute(interaction, client, settings);
		} catch (error) {
			Logger.error(`Error executing ${interaction.commandName}`);
			Logger.error(error);
		}
	},
};
