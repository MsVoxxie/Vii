async function getReplies(message) {
	if (!message) throw new Error('Invalid or no message provided.');

	// Check if theres a message reference
	let referenceMessage = null;
	let error = null;
	if (message.reference) {
		referenceMessage = await message.channel.messages.fetch(message.reference.messageId).catch((e) => {
			referenceMessage = null;
			error = e;
		});
	}
	// Combine Data
	const messageData = { message: message, reference: referenceMessage, error };
	// Send it off
	return messageData;
}

async function buildStarEmbed(message, authorName = 'PLACEHOLDER', embedColor = '1e1f22') {
	if (!message) throw new Error('Invalid or no message provided.');
	const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
	const { Rettiwt } = require('rettiwt-api');
	const twitFetch = new Rettiwt();
	const embeds = [];
	const attachments = [];

	//* Twitter Check
	const twitId = /\/status\/(\d+)/s.exec(message.content);
	if (twitId) {
		await twitFetch.tweet.details(twitId[1]).then(async (res) => {
			for await (const attach of res.media) {
				const attachment = attach;
				const builtEmbed = new EmbedBuilder()
					.setURL(message.url)
					.setColor(embedColor)
					.setImage(attachment.url)
					.setTimestamp(message.createdAt)
					.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
				if (message.content) builtEmbed.setDescription(message.content);
				embeds.push(builtEmbed);
				if (attachment.type.includes('video')) {
					attachments.push(new AttachmentBuilder(attachment.url));
				}
			}
		});
	}
	//* Attachments
	else if (message.attachments.size) {
		for await (const attach of message.attachments) {
			const attachment = attach[1];
			const builtEmbed = new EmbedBuilder()
				.setURL(message.url)
				.setColor(embedColor)
				.setImage(attachment.url)
				.setTimestamp(message.createdAt)
				.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
			if (message.content) builtEmbed.setDescription(message.content);
			embeds.push(builtEmbed);
			if (attachment.contentType.includes('video')) {
				attachments.push(new AttachmentBuilder(attachment.url));
			}
		}
		//* Embeds
	} else if (message.embeds.length) {
		console.log(message.embeds);
		for await (const embed of message.embeds) {
			const builtEmbed = new EmbedBuilder()
				.setURL(embed.data.url)
				.setColor(embedColor)
				.setTimestamp(message.createdAt)
				.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
			if (embed.data.title) builtEmbed.setTitle(embed.data.title);
			if (embed.data.image) builtEmbed.setImage(embed.data.image.url);
			if (embed.data.thumbnail) builtEmbed.setThumbnail(embed.data.thumbnail.url);
			if (embed.data.description) builtEmbed.setDescription(embed.data.description);
			if (embed.data.type === 'video') {
				attachments.push(new AttachmentBuilder(embed.data.url));
			}
			embeds.push(builtEmbed);
		}
		//* Textbased
	} else {
		const builtEmbed = new EmbedBuilder()
			.setURL(message.url)
			.setColor(embedColor)
			.setTimestamp(message.createdAt)
			.setDescription(message.content)
			.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
		embeds.push(builtEmbed);
	}
	return { embeds, attachments };
}

module.exports = {
	getReplies,
	buildStarEmbed,
};
