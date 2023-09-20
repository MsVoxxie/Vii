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
	const mediaRegex = /(?:((?:https|http):\/\/)|(?:\/)).+(?:.mp3|mp4|mov)/i;
	const embeds = [];
	const attachments = [];

	//* Attachments
	if (message.attachments.size) {
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
