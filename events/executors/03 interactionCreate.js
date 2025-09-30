const { Events, MessageFlags } = require('discord.js');
const { botData } = require('../../models');
const Logger = require('../../functions/logging/logger');
const { errorHandler } = require('../../functions/logging/errorHandler');
const { ViiEmojis } = require('../../images/icons/emojis');

module.exports = {
	name: Events.InteractionCreate,
	runType: 'infinity',
	async execute(client, interaction) {
		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			// Get command, return if no command found.
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) return Logger.error(`No command matching ${interaction.commandName} was found.`);

			try {
				// Check if command is dev only
				if (command.options.devOnly) {
					if (!process.env.DEVELOPERS.includes(interaction.user.id)) {
						return interaction.editReply({ content: 'This command is for developers only.', flags: MessageFlags.Ephemeral });
					}
				}

				// Check if command is disabled
				if (command.options.disabled) {
					return interaction.editReply({ content: 'This command is disabled.', flags: MessageFlags.Ephemeral });
				}

				// Execute Command
				if (interaction.guild) {
					const settings = await client.getGuild(interaction.guild);
					await command.execute(client, interaction, settings, ViiEmojis);
				} else {
					await command.execute(client, interaction);
				}
				await botData.findOneAndUpdate({}, { $inc: { commandsExecuted: 1 } }, { upsert: true });
			} catch (error) {
				await errorHandler(client, interaction, error);
				await botData.findOneAndUpdate({}, { $inc: { commandsFailed: 1 } }, { upsert: true });
			}
		}
	},
};
