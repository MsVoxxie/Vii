const { Events } = require('discord.js');
const { Guild } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.GuildCreate,
	runType: 'infinity',
	async execute(client, guild) {
		await Guild.findOneAndUpdate({ guildId: guild.id }, { guildId: guild.id }, { upsert: true });

		if (client.debug) {
			Logger.info(`Joined ${guild.name}`);
			Logger.success(`Successfully created database entry for ${guild.name}`);
		}

		// Cache invites for the guild
		if (!guild || !guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) return;
		guild.invites.fetch().then((invites) => {
			client.invites.set(guild.id, new Map(invites.map((invite) => [invite.code, invite.uses])));
		});
	},
};
