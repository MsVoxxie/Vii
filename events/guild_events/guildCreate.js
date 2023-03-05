const { Events } = require('discord.js');
const { Guild } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.GuildCreate,
	runType: 'infinite',
	async execute(guild, client) {
		Logger.info(`Joined ${guild.name}`);
		await Guild.findOneAndUpdate( { guildId: guild.id }, { guildId: guild.id, }, { upsert: true, } );
		Logger.success(`Successfully created database entry for ${guild.name}`);
	},
};
