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
	const embeds = [];
	const attachments = [];

	// Attachments
	if (message.attachments.size) {
		for (const attach of message.attachments.values()) {
			const builtEmbed = new EmbedBuilder()
				.setURL(message.url)
				.setColor(embedColor)
				.setImage(attach.url)
				.setTimestamp(message.createdAt)
				.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
			if (message.content) builtEmbed.setDescription(message.content);
			embeds.push(builtEmbed);
			if (attach.contentType?.includes('video')) {
				attachments.push(new AttachmentBuilder(attach.url));
			}
		}
	}
	// Embeds
	else if (message.embeds.length) {
		let imageSet = false;
		for (const embed of message.embeds) {
			const builtEmbed = new EmbedBuilder().setColor(embedColor).setTimestamp(message.createdAt).setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
			if (embed.title) builtEmbed.setTitle(embed.title);
			if (embed.url) builtEmbed.setURL(embed.url);
			if (embed.description) builtEmbed.setDescription(embed.description);
			if (embed.image?.url) builtEmbed.setImage(embed.image.url);
			if (embed.thumbnail?.url && !embed.image?.url) {
				builtEmbed.setImage(embed.thumbnail.url);
				imageSet = true;
			}
			if (embed.thumbnail?.url && !imageSet) builtEmbed.setThumbnail(embed.thumbnail.url);
			embeds.push(builtEmbed);
		}
	}
	// Text-based
	else {
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
