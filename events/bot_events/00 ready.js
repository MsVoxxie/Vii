const moment = require('moment');
const { Events, Collection, PermissionFlagsBits } = require('discord.js');
const { botData, giveawaysData } = require('../../models');
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

		// Clamp any absurd lastChance thresholds from older giveaways to avoid negative setTimeout warnings
		try {
			const existing = await giveawaysData.find({ 'lastChance.enabled': true }).lean();
			for (const g of existing) {
				const duration = Math.max(0, (g.endAt ?? 0) - (g.startAt ?? 0));
				const maxThreshold = Math.max(0, Math.min(Math.max(0, duration - 1000), 300000));
				if (Number.isFinite(g?.lastChance?.threshold) && g.lastChance.threshold > maxThreshold) {
					await giveawaysData.updateOne(
						{ _id: g._id },
						{ $set: { 'lastChance.threshold': maxThreshold } }
					);
				}
			}
		} catch (e) {
			// non-critical: ignore migration errors
		}
	},
};
