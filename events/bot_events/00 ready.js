const moment = require('moment');
const { Events, Collection, PermissionFlagsBits } = require('discord.js');
const { botData } = require('../../models');
const Logger = require('../../functions/logging/logger');

module.exports = {
	name: Events.ClientReady,
	runType: 'single',
	async execute(client) {
		Logger.success(`Ready! Logged in as ${client.user.tag}`);
		client.mongoose.init();

		// Database Entries
		await botData.findOneAndUpdate(
			{},
			{
				clientId: client.user.id,
				startTime: moment().format('MMMM Do YYYY, h:mm A'),
				startTimeUTC: Date.now(),
				$inc: { session: 1 },
			},
			{ upsert: true }
		);

		// Cache invites for all guilds
		client.guilds.cache.forEach(async (guild) => {
			// Check if I have permissions to view invites
			if (!guild || !guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) return;
			const invites = await guild.invites.fetch();
			client.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses])));
		});
	},
};
