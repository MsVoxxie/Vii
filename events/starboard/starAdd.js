const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getReplies, buildStarEmbed } = require('../../functions/starboard/msgFuncs');
const { starboardData } = require('../../models/index');

module.exports = {
	name: Events.MessageReactionAdd,
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

		// Arrays
		const embedList = [];
		const attachmentList = [];

		// Temporary Definitions
		let starDbData;
		let starredMessage;
		let referenceEmbed;

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

		// Get message data
		const starMessageData = await getReplies(message);

		// Build Embeds
		if (starMessageData.reference) {
			// Add the reference member to data.
			const tempFetch = await message.guild.members.cache.get(starMessageData.reference.author.id);
			starMessageData.reference.member = tempFetch;
			// Build reference embed
			referenceEmbed = await buildStarEmbed(starMessageData.reference, `Replying to ${starMessageData.reference.member.displayName}`);
			referenceEmbed.embeds.forEach((e) => embedList.push(e));
			referenceEmbed.attachments.forEach((a) => attachmentList.push(a));
		}
		// Build base embed
		const baseEmbed = await buildStarEmbed(starMessageData.message, starMessageData.message.member.displayName, client.colors.starboard);
		console.log(baseEmbed);
		baseEmbed.embeds.forEach((e) => embedList.push(e));
		baseEmbed.attachments.forEach((a) => attachmentList.push(a));

		// Build Button Row
		const embedButtons = new ActionRowBuilder();
		embedButtons.addComponents(new ButtonBuilder().setLabel('Original Message').setStyle(ButtonStyle.Link).setURL(message.url));
		if (starMessageData.reference)
			embedButtons.addComponents(
				new ButtonBuilder().setLabel('Referenced Message').setStyle(ButtonStyle.Link).setURL(starMessageData.reference.url)
			);

		//! Check if the star threshhold has been met.
		if (starDbData && starDbData.starCount >= starLimit) {
			if (!starDbData.isStarred) {
				//! Send Embeds
				if (baseEmbed.attachments.length || referenceEmbed.attachments.length) {
					starredMessage = await starChannel.send({
						content: `${starEmoji} ${starCount} | ${message.channel.url}`,
						components: [embedButtons],
						embeds: embedList.map((e) => e),
						files: attachmentList.map((a) => a),
					});
				} else {
					starredMessage = await starChannel.send({
						content: `${starEmoji} ${starCount} | ${message.channel.url}`,
						components: [embedButtons],
						embeds: embedList.map((e) => e),
					});
				}

				starDbData = await starboardData.findOneAndUpdate(
					{ guildId: message.guild.id, messageId: message.id },
					{ $set: { isStarred: true, starId: starredMessage.id } }
				);
			} else if (starDbData.isStarred === true) {
				//! If message is already starred, update it!
				const fetchedStar = await starChannel.messages.fetch(starDbData.starId).catch((e) => e);
				if (!fetchedStar.content) return await starboardData.deleteOne({ guildId: message.guild.id, messageId: message.id });

				fetchedStar.edit({
					content: `${starEmoji} ${starCount} | ${message.channel.url}`,
				});
			}
		}
	},
};
