const Logger = require('../logging/logger');
const { Level, Guild } = require('../../models/index');
const calculateLevelXp = require('.//calculateLevelXp');
const grantVoiceLevel = require('./grantVoiceLevel');
const giveRandomXp = require('./giveRandomXp');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, min = 5, max = 25) => {
	// Loop over all guilds
	const guilds = await client.guilds.cache;
	for await (const g of guilds) {
		const guild = g[1];

		// Get the guild level channel
		const guildSettings = await Guild.findOne({ guildId: guild.id });
		// Check if the guild has a level channel
		if (!guildSettings.levelChannelId) continue;

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
				if (member?.voice?.channel?.id === guild.afkChannelId) continue;

				// Calculate the amount of xp to give
				const xpToGive = await giveRandomXp(min, max);

				// Update the user's level and xp in the database
				const dbResults = await Level.findOneAndUpdate(
					{ userId: member.user.id, guildId: guild.id },
					{ userId: member.user.id, guildId: guild.id, $inc: { xp: xpToGive } },
					{ upsert: true, new: true }
				);

				// Logger
				if (client.debug) {
					Logger.info(`User ${member.user.tag} has been given ${xpToGive} VoiceXp in guild ${guild.name}`);
				}

				// Check if the user has leveled up
				const didUserLevel = await grantVoiceLevel(client, guild, member, dbResults);

				//? If the user leveled up send a message
				if (didUserLevel.leveled) {
					// Get the guild level channel
					const levelChannel = await guild.channels.cache.get(guildSettings.levelChannelId);
					// Calculate the amount of xp needed to level up
					const xpNeeded = calculateLevelXp(dbResults.level + 1);
					const calcXp = xpNeeded - didUserLevel.xp;

					// Build embed
					const embed = new EmbedBuilder()
						.setTitle('Level Up!')
						.setDescription(`Congratulations ${member}!\nYou have leveled up to level ${dbResults.level + 1}!`)
						.setFooter({ text: `You need ${calcXp} more Xp to level up again!` })
						.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
						.setThumbnail(member.displayAvatarURL({ dynamic: true }))
						.setColor(guildSettings.guildColorHex);

					// Send the level up message
					await levelChannel.send({ embeds: [embed] });
				}
			}
		}
	}
};
