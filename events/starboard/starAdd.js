const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getReplies } = require('../../functions/helpers/msgFuncs');
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
		const buttonList = [];

		// Temporary Definitions
		let starDbData;
		let starredMessage;

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

		//! Handle the reference message if one exists
		if (starMessageData.reference) {
			// Add the reference member to data.
			const tempFetch = await message.guild.members.cache.get(starMessageData.reference.author.id);
			starMessageData.reference.member = tempFetch;

			//* If attachment data, Setup Reference image-based embed.
			if (starMessageData.reference.attachments.size) {
				for await (const attach of starMessageData.reference.attachments) {
					const attachment = attach[1];

					const imgRefEmbed = new EmbedBuilder()
						.setURL(starMessageData.reference.url)
						.setAuthor({
							iconURL: starMessageData.reference.member.displayAvatarURL(),
							name: `Replying to ${starMessageData.reference.member.displayName}`,
						})
						.setTimestamp(starMessageData.reference.createdAt)
						.setImage(attachment.url);
					if (starMessageData.reference.content) imgRefEmbed.setDescription(starMessageData.reference.content);

					embedList.push(imgRefEmbed);
				}
			} else {
				//* If no attachments, Setup Reference text-based embed.
				const textRefEmbed = new EmbedBuilder()
					.setAuthor({
						iconURL: starMessageData.reference.member.displayAvatarURL(),
						name: `Replying to ${starMessageData.reference.member.displayName}`,
					})
					.setTimestamp(starMessageData.reference.createdAt)
					.setDescription(starMessageData.reference.content);

				embedList.push(textRefEmbed);
			}
		}

		//! Handle starred message.
		//* If attachment data, Setup Reference image-based embed.
		if (starMessageData.message.attachments.size) {
			for await (const attach of starMessageData.message.attachments) {
				const attachment = attach[1];

				const imgBaseEmbed = new EmbedBuilder()
					.setURL(starMessageData.message.url)
					.setAuthor({ iconURL: starMessageData.message.member.displayAvatarURL(), name: starMessageData.message.member.displayName })
					.setTimestamp(starMessageData.message.createdAt)
					.setColor(client.colors.starboard)
					.setImage(attachment.url);
				if (starMessageData.message.content) imgBaseEmbed.setDescription(starMessageData.message.content);

				embedList.push(imgBaseEmbed);
			}
		} else {
			//* If no attachments, Setup Reference text-based embed.
			const textBaseEmbed = new EmbedBuilder()
				.setAuthor({ iconURL: starMessageData.message.member.displayAvatarURL(), name: starMessageData.message.member.displayName })
				.setTimestamp(starMessageData.message.createdAt)
				.setColor(client.colors.starboard)
				.setDescription(starMessageData.message.content);

			embedList.push(textBaseEmbed);
		}

		// Build Button Row
		const embedButtons = new ActionRowBuilder();
		embedButtons.addComponents(new ButtonBuilder().setLabel('Original Message').setStyle(ButtonStyle.Link).setURL(message.url));
		if (starMessageData.reference) embedButtons.addComponents(new ButtonBuilder().setLabel('Referenced Message').setStyle(ButtonStyle.Link).setURL(starMessageData.reference.url));

		//! Check if the star threshhold has been met.
		if (starDbData && starDbData.starCount >= starLimit) {
			if (!starDbData.isStarred) {
				//! Send Embeds
				starredMessage = await starChannel.send({
					content: `${starEmoji} ${starCount} | ${message.channel.url}`,
					components: [embedButtons],
					embeds: embedList.map((e) => e),
				});

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
