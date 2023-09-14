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
	const { EmbedBuilder } = require('discord.js');
	let embeds = [];

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
		for await (const embed of message.embeds) {
			const builtEmbed = new EmbedBuilder()
				.setURL(embed.data.url)
				.setColor(embedColor)
				.setImage(embed.data.image.url)
				.setTimestamp(message.createdAt)
				.setAuthor({ iconURL: message.member.displayAvatarURL(), name: authorName });
			if (embed.data.description) builtEmbed.setDescription(embed.data.description);
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
	return embeds;
}

module.exports = {
	getReplies,
	buildStarEmbed,
};
