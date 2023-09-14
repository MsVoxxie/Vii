const { Events, EmbedBuilder } = require('discord.js');
const { getReplies } = require('../../functions/starboard/msgFuncs');
const { starboardData } = require('../../models/index');

module.exports = {
	name: Events.MessageReactionRemove,
	runType: 'infinity',
	async execute(client, reaction, user) {
		// If user is a bot, return.
		if (user.bot) return;

		// Fetch Partials
		if (reaction.message.partial) await reaction.message.fetch();

		//Definitions
		const message = await reaction.message;
		const settings = await client.getGuild(message.guild);
		const starChannel = await message.guild.channels.cache.get(settings.starboardChannelId);
		if (!starChannel) return;
		const starLimit = settings.starboardLimit;
		const starEmoji = settings.starboardEmoji;
		if (reaction.emoji.name !== starEmoji) return;
		const starCount = (await message.reactions.cache.get(starEmoji)?.count) || 0;

		// Temporary Definitions
		let starDbData;

		//! Check if this message is already a star or not.
		const existingStar = await starboardData.findOne({ guildId: message.guild.id, messageId: message.id });

		if (existingStar) {
			starDbData = await starboardData.findOneAndUpdate(
				{ guildId: message.guild.id, messageId: message.id },
				{ $set: { starCount } },
				{ new: true, upsert: true }
			);
		} else {
			starDbData = await starboardData.findOneAndUpdate(
				{ guildId: message.guild.id, messageId: message.id },
				{ $set: { guildId: message.guild.id, messageId: message.id, channelId: message.channel.id, starCount, isStarred: false } },
				{ new: true, upsert: true }
			);
		}

		//! Check if the star threshhold is below requirement
		const fetchedStar = await starChannel.messages.fetch(starDbData.starId).catch((e) => e);
		if (starDbData && starDbData.starCount < starLimit) {
			//! Delete the message
			await fetchedStar.delete();
			await starboardData.deleteOne({ guildId: message.guild.id, messageId: message.id });
		} else {
			if (!fetchedStar.content) return await starboardData.deleteOne({ guildId: message.guild.id, messageId: message.id });
			await fetchedStar.edit({
				content: `${starEmoji} ${starCount} | ${message.channel.url}`,
			});
		}
	},
};
