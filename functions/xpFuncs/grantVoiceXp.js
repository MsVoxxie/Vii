const Logger = require('../logging/logger');
const { Level } = require('../../models/index');
const grantVoiceLevel = require('./grantVoiceLevel');
const giveRandomXp = require('./giveRandomXp');

module.exports = async (client, min = 5, max = 25) => {
	// Loop over all guilds
	const guilds = await client.guilds.cache;
	for await (const g of guilds) {
		const guild = g[1];
		const channels = await guild.channels.cache.filter((c) => c.isVoiceBased());
		// Loop over all channels
		for await (const c of channels) {
			const channel = c[1];
			// If channel is afk, skip
			if (channel.id === guild.afkChannelId) continue;
			// If channel only has 1 member, skip
			if (channel.members.size <= 1) continue;
			// Loop over all members
			const members = await channel.members;
			for await (const m of members) {
				const member = m[1];
				// Check if member is a bot
				if (member.user.bot) continue;
				// Check if member is in afk channel
				if (member.voice.channel.id === guild.afkChannelId) continue;

				console.log(member.user.tag);

				// Calculate the amount of xp to give
				const xpToGive = await giveRandomXp(min, max);

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
				await grantVoiceLevel(client, guild, member, dbResult);
			}
		}
	}
};
