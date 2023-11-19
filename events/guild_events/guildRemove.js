const { Events } = require('discord.js');
const { Guild } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.GuildDelete,
	runType: 'infinity',
	async execute(client, guild) {
		await Guild.findOneAndDelete({ guildId: guild.id }, { guildId: guild.id }, { upsert: true });

		if (client.debug) {
			Logger.info(`Left ${guild.name}`);
			Logger.success(`Successfully deleted database entry for ${guild.name}`);
		}
	},
};
