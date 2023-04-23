const Logger = require('../logging/logger');
const { Level } = require('../../models/index');
const grantVoiceLevel = require('./grantVoiceLevel');
const giveRandomXp = require('./giveRandomXp');

module.exports = async (client, min = 5, max = 25) => {
	// Loop over all guilds
	for await (const g of client.guilds.cache) {
		const guild = g[1];
		// Loop over all channels
		const channels = await guild.channels.cache.filter((c) => c.isVoiceBased());
		for await (const c of channels) {
			const channel = c[1];
			// If channel is afk, skip
			if (channel.id === guild.afkChannelId) continue;
			// If channel is empty, skip
			if (channel.members.size === 0) continue;
			// Loop over all members
			for await (const m of channel.members) {
				const member = m[1];
				// Check if member is a bot
				if (member.user.bot) continue;
				// Check if member is in afk channel
				if (member.voice.channel.id === guild.afkChannelId) continue;

				// Calculate the amount of xp to give
				const xpToGive = giveRandomXp(min, max);

				// Update the user's level and xp in the database
				const dbResult = await Level.findOneAndUpdate(
					{ userId: member.user.id, guildId: guild.id },
					{ userId: member.user.id, guildId: guild.id, $inc: { xp: xpToGive } },
					{ upsert: true, new: true }
				);

				// Logger
				if (client.debug) {
					Logger.info(`User ${member.user.tag} has been given ${xpToGive} VoiceXp in guild ${guild.name}`);
				}

				// Check if the user has leveled up
				const hasUserLeveled = grantVoiceLevel(guild, member, dbResult);

				// Return true if the user has leveled up
				return hasUserLeveled;
			}
		}
	}
};
