const { Events } = require('discord.js');
const { Guild } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.GuildCreate,
	runType: 'infinite',
	async execute(guild, client) {
		await Guild.findOneAndUpdate({ guildId: guild.id }, { guildId: guild.id }, { upsert: true });

		if (client.debug) {
			Logger.info(`Joined ${guild.name}`);
			Logger.success(`Successfully created database entry for ${guild.name}`);
		}
	},
};
