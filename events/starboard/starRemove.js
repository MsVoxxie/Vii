const { Events } = require('discord.js');
const { starboardData } = require('../../models/index');

module.exports = {
	name: Events.MessageReactionRemove,
	runType: 'infinity',
	async execute(client, reaction, user) {
		// If user is a bot, return.
		if (user.bot) return;

		// Fetch Partials
		if (reaction.message.partial) await reaction.message.fetch();

		// Definitions
		const message = await reaction.message;
		const settings = await client.getGuild(message.guild);
		const starChannel = await message.guild.channels.cache.get(settings.starboardChannelId);
		if (!starChannel) return;
		const starLimit = settings.starboardLimit;
		const starEmoji = settings.starboardEmoji;
		if (reaction.emoji.name !== starEmoji) return;
		const starCount = message.reactions.cache.get(starEmoji)?.count || 0;

		// Check if this message is already a star or not.
		let starDbData = await starboardData.findOneAndUpdate({ guildId: message.guild.id, messageId: message.id }, { $set: { starCount } }, { new: true, upsert: true });

		// Try to fetch the starboard message
		let fetchedStar = null;
		if (starDbData?.starId) {
			fetchedStar = await starChannel.messages.fetch(starDbData.starId).catch(() => null);
		}

		// If below threshold, delete starboard message and DB entry
		if (starDbData.starCount < starLimit) {
			if (fetchedStar) {
				await fetchedStar.delete().catch(() => {});
			}
			await starboardData.deleteOne({ guildId: message.guild.id, messageId: message.id });
		} else if (fetchedStar && fetchedStar.content) {
			await fetchedStar.edit({
				content: `${starEmoji} ${starCount} | ${message.channel.url}`,
			});
		}
		// If fetchedStar is missing or has no content, clean up DB
		else if (!fetchedStar || !fetchedStar.content) {
			await starboardData.deleteOne({ guildId: message.guild.id, messageId: message.id });
		}
	},
};
